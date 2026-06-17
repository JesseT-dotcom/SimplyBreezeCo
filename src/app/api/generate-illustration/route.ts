// -- ALTER TABLE illustration_prompts ADD COLUMN IF NOT EXISTS canva_keywords TEXT[];

import Anthropic from '@anthropic-ai/sdk'
import { createClient } from '@supabase/supabase-js'

const SIMPLYBREEZE_STYLE =
  'Soft watercolour-style illustration, rounded friendly shapes, warm muted tones of sage green, dusty rose and warm linen, minimal detail, clean white background, suitable for early childhood education resources, inclusive diverse characters, gentle and nurturing visual tone, no text or labels in the image'

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

function supabaseServiceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { title, ageGroup, learningObjective, characters, sceneContext, resourceId } = body

    const userPrompt = [
      title && `Resource title: ${title}`,
      ageGroup && `Age group: ${ageGroup}`,
      learningObjective && `Learning objective: ${learningObjective}`,
      characters && `Characters: ${characters}`,
      sceneContext && `Scene context: ${sceneContext}`,
    ]
      .filter(Boolean)
      .join('\n')

    // Generate the Ideogram prompt first (needed for both calls)
    const promptMsg = await anthropic.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 512,
      system: `You are an illustration prompt writer for SimplyBreeze, an early childhood education resource brand. Given details about an educational resource, write a single Ideogram-ready illustration prompt that follows the SimplyBreeze visual style exactly. Output only the prompt text — no explanation, no preamble, no quotes.\n\nSimplyBreeze style: ${SIMPLYBREEZE_STYLE}`,
      messages: [{ role: 'user', content: userPrompt }],
    })

    const promptBlock = promptMsg.content[0]
    if (promptBlock.type !== 'text') throw new Error('Unexpected response from Claude')
    const promptText = promptBlock.text.trim()

    // Run Ideogram image generation and Canva keywords in parallel
    const [ideogramRes, keywordsMsg] = await Promise.all([
      fetch('https://api.ideogram.ai/generate', {
        method: 'POST',
        headers: {
          'Api-Key': process.env.IDEOGRAM_API_KEY!,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          image_request: {
            prompt: promptText,
            model: 'V_2',
            aspect_ratio: 'ASPECT_1_1',
            magic_prompt_option: 'OFF',
          },
        }),
      }),
      anthropic.messages.create({
        model: 'claude-sonnet-4-6',
        max_tokens: 512,
        system: `You are a design assistant for SimplyBreeze, an Australian early childhood education resource brand. Given details about an educational resource, generate a list of 8–12 Canva Elements search terms that Bree can type directly into Canva's element search bar to find suitable illustrations, icons, and graphics for her resource design.

Terms should be:
- Short, 2–4 words each, written exactly as someone would type them into a search bar
- Specific to the theme and product type — not generic
- Cover the full range needed: character/people illustrations, object/prop icons, background or scene elements, and decorative accents
- Mix illustration styles and icon styles (e.g. "barista character illustration", "coffee cup flat icon", "café counter clipart", "child apron cartoon")

Return ONLY a valid JSON array of strings — no preamble, no explanation, no code fences, just the raw JSON array: ["term one", "term two", ...]`,
        messages: [{ role: 'user', content: userPrompt }],
      }),
    ])

    if (!ideogramRes.ok) {
      const err = await ideogramRes.text()
      throw new Error(`Ideogram API error ${ideogramRes.status}: ${err}`)
    }

    const ideogramData = await ideogramRes.json()
    const imageUrl: string = ideogramData?.data?.[0]?.url ?? ''

    // Parse keywords
    const kwBlock = keywordsMsg.content[0]
    let canvaKeywords: string[] = []
    if (kwBlock.type === 'text') {
      try {
        let kwText = kwBlock.text.trim()
        if (kwText.startsWith('```')) {
          kwText = kwText.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '').trim()
        }
        const parsed = JSON.parse(kwText)
        if (Array.isArray(parsed)) canvaKeywords = parsed.filter(k => typeof k === 'string')
      } catch { /* keywords are best-effort */ }
    }

    const supabase = supabaseServiceClient()
    const { data, error } = await supabase
      .from('illustration_prompts')
      .insert({
        prompt_text: promptText,
        style_notes: SIMPLYBREEZE_STYLE,
        image_url: imageUrl,
        status: 'draft',
        canva_keywords: canvaKeywords,
        ...(resourceId ? { resource_id: resourceId } : {}),
      })
      .select('id')
      .single()

    if (error) throw new Error(`Supabase insert error: ${error.message}`)

    return Response.json({ id: data.id, imageUrl, promptText, canvaKeywords })
  } catch (err) {
    return Response.json(
      { error: err instanceof Error ? err.message : 'Generation failed' },
      { status: 500 }
    )
  }
}
