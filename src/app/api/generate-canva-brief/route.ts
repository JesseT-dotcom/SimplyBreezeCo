// -- ALTER TABLE product_ideas ADD COLUMN IF NOT EXISTS canva_brief JSONB;

import Anthropic from '@anthropic-ai/sdk'
import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await request.json()
    const { ideaId, title, description, age_group, product_type, curriculum_area } = body

    const { data: idea } = await supabase
      .from('product_ideas')
      .select('id')
      .eq('id', ideaId)
      .eq('created_by', user.id)
      .single()
    if (!idea) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    const userPrompt = [
      `Title: ${title}`,
      `Product type: ${product_type}`,
      `Age group: ${age_group}`,
      curriculum_area ? `Curriculum area: ${curriculum_area}` : null,
      description ? `Description: ${description}` : null,
    ].filter(Boolean).join('\n')

    const msg = await anthropic.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 1024,
      system: `You are a graphic design director for SimplyBreeze, an Australian early childhood education (ECE) resource brand. Resources are sold as digital downloads on Etsy and TPT.

Generate a complete Canva cover design brief for the resource described. Return ONLY a valid JSON object — no preamble, no explanation, no code fences, just the raw JSON:

{
  "cover_title": "punchy cover title text, max 8 words",
  "subtitle": "optional subtitle or tagline, max 12 words",
  "colour_palette": "which SimplyBreeze brand colours to use and where — always choose from: dusty sage #B5C9B7, warm linen #EDE8DF, dusty rose #D4A5A5, soft charcoal #3D3D3D, off-white cream #FAF8F5",
  "font_suggestions": "heading font style and body font style — describe the feel, e.g. rounded sans-serif, friendly and modern",
  "layout_notes": "2-3 sentences on layout direction — where to place title, illustration, any borders or frames",
  "illustration_notes": "description of what illustration or graphic element would suit the cover",
  "mood": "3 adjectives describing the visual tone",
  "size_spec": "A4 portrait (210 x 297mm) — standard AU/NZ resource format"
}

Brand palette: dusty sage #B5C9B7, warm linen #EDE8DF, dusty rose #D4A5A5, soft charcoal #3D3D3D, off-white cream #FAF8F5.
Visual style: soft watercolour feel, rounded friendly shapes, warm muted tones, clean and uncluttered, nurturing and professional.`,
      messages: [{ role: 'user', content: userPrompt }],
    })

    const block = msg.content[0]
    if (block.type !== 'text') throw new Error('Unexpected response from Claude')

    let jsonText = block.text.trim()
    if (jsonText.startsWith('```')) {
      jsonText = jsonText.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '').trim()
    }
    const brief = JSON.parse(jsonText)

    const { error: updateError } = await supabase
      .from('product_ideas')
      .update({ canva_brief: brief })
      .eq('id', ideaId)
    if (updateError) throw new Error(`Failed to save: ${updateError.message}`)

    return Response.json(brief)
  } catch (err) {
    return Response.json(
      { error: err instanceof Error ? err.message : 'Generation failed' },
      { status: 500 }
    )
  }
}
