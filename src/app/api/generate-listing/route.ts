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
    const { ideaId, title, description, ageGroup, productType, curriculumAreas } = body

    const { data: idea } = await supabase
      .from('product_ideas')
      .select('id')
      .eq('id', ideaId)
      .eq('created_by', user.id)
      .single()
    if (!idea) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    const userPrompt = [
      `Title: ${title}`,
      `Product type: ${productType}`,
      `Age group: ${ageGroup}`,
      Array.isArray(curriculumAreas) && curriculumAreas.length > 0
        ? `Curriculum areas: ${curriculumAreas.join(', ')}`
        : null,
      description ? `Description: ${description}` : null,
    ].filter(Boolean).join('\n')

    const msg = await anthropic.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 1024,
      system: `You are a marketplace listing copywriter for SimplyBreeze, an Australian early childhood education (ECE) resource brand. Resources are sold as digital downloads on Etsy and Teachers Pay Teachers (TPT).

Generate marketplace listing copy for the resource described. Return ONLY a valid JSON object — no preamble, no explanation, no code fences, just the raw JSON:

{
  "listing_title": "max 60 characters, SEO-optimised, lead with the strongest search keyword",
  "description": "150-200 words, warm professional educator tone, reference relevant EYLF outcomes where appropriate, written for Australian and New Zealand early childhood educators",
  "etsy_tags": ["tag1", "tag2", "tag3", "tag4", "tag5"],
  "tpt_tags": ["tag1", "tag2", "tag3", "tag4", "tag5"],
  "suggested_price": "$X.XX AUD"
}

Etsy tags: 5 AU/NZ-relevant search terms, max 20 characters each, lowercase, no hyphens.
TPT tags: 5 search terms using common TPT teacher language.`,
      messages: [{ role: 'user', content: userPrompt }],
    })

    const block = msg.content[0]
    if (block.type !== 'text') throw new Error('Unexpected response from Claude')

    let jsonText = block.text.trim()
    if (jsonText.startsWith('```')) {
      jsonText = jsonText.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '').trim()
    }
    const listing = JSON.parse(jsonText)

    const { error: updateError } = await supabase
      .from('product_ideas')
      .update({ listing_copy: listing })
      .eq('id', ideaId)
    if (updateError) throw new Error(`Failed to save: ${updateError.message}`)

    return Response.json(listing)
  } catch (err) {
    return Response.json(
      { error: err instanceof Error ? err.message : 'Generation failed' },
      { status: 500 }
    )
  }
}
