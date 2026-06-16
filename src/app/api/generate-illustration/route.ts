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

    const msg = await anthropic.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 512,
      system: `You are an illustration prompt writer for SimplyBreeze, an early childhood education resource brand. Given details about an educational resource, write a single Ideogram-ready illustration prompt that follows the SimplyBreeze visual style exactly. Output only the prompt text — no explanation, no preamble, no quotes.\n\nSimplyBreeze style: ${SIMPLYBREEZE_STYLE}`,
      messages: [{ role: 'user', content: userPrompt }],
    })

    const block = msg.content[0]
    if (block.type !== 'text') throw new Error('Unexpected response from Claude')
    const promptText = block.text.trim()

    const ideogramRes = await fetch('https://api.ideogram.ai/generate', {
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
    })

    if (!ideogramRes.ok) {
      const err = await ideogramRes.text()
      throw new Error(`Ideogram API error ${ideogramRes.status}: ${err}`)
    }

    const ideogramData = await ideogramRes.json()
    const imageUrl: string = ideogramData?.data?.[0]?.url ?? ''

    const supabase = supabaseServiceClient()
    const { data, error } = await supabase
      .from('illustration_prompts')
      .insert({
        prompt_text: promptText,
        style_notes: SIMPLYBREEZE_STYLE,
        image_url: imageUrl,
        status: 'draft',
        ...(resourceId ? { resource_id: resourceId } : {}),
      })
      .select('id')
      .single()

    if (error) throw new Error(`Supabase insert error: ${error.message}`)

    return Response.json({ id: data.id, imageUrl, promptText })
  } catch (err) {
    return Response.json(
      { error: err instanceof Error ? err.message : 'Generation failed' },
      { status: 500 }
    )
  }
}
