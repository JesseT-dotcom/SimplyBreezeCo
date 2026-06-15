import Anthropic from '@anthropic-ai/sdk'
import { z } from 'zod'
import { NextResponse } from 'next/server'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

const schema = z.object({
  ageGroup: z.string(),
  curriculumAreas: z.array(z.string()),
  theme: z.string(),
  seasonalHook: z.string().optional(),
  numIdeas: z.number().min(1).max(5),
})

function extractText(msg: Anthropic.Message): string {
  const block = msg.content[0]
  if (block.type !== 'text') return ''
  return block.text.replace(/```json|```/g, '').trim()
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const parsed = schema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
    }

    const { ageGroup, curriculumAreas, theme, seasonalHook, numIdeas } = parsed.data

    const context = `Age group: ${ageGroup} | Curriculum: ${curriculumAreas.join(', ')} | Theme: ${theme}${seasonalHook ? ' | Seasonal: ' + seasonalHook : ''}`

    const [ideasMsg, outlineMsg, seoMsg] = await Promise.all([
      client.messages.create({
        model: 'claude-sonnet-4-6',
        max_tokens: 1500,
        messages: [{
          role: 'user',
          content: `You are Bree, the friendly voice of SimplyBreeze — an AU/NZ early childhood education resource brand. Generate ${numIdeas} specific, sellable ECE resource product ideas for Teachers Pay Teachers (AU/NZ market).

Context: ${context}

Respond ONLY with a valid JSON array, no markdown, no backticks:
[{"title":"exact product title","type":"e.g. Flashcard Set / Activity Pack / Worksheets","price":"suggested AUD price e.g. $3.50","description":"2 sentence TPT listing description, benefits-led, AU/NZ friendly","hook":"one short sentence: why this sells","tags":["tag1","tag2","tag3","tag4","tag5"]}]`,
        }],
      }),
      client.messages.create({
        model: 'claude-sonnet-4-6',
        max_tokens: 1500,
        messages: [{
          role: 'user',
          content: `You are an experienced ECE educator creating a detailed resource pack outline for SimplyBreeze (AU/NZ ECE brand).

Context: ${context}

Respond ONLY with valid JSON, no markdown, no backticks:
{"packTitle":"full title","learningOutcomes":["outcome 1","outcome 2","outcome 3"],"eylf":["EYLF outcome 1","EYLF outcome 2"],"activities":[{"name":"Activity name","description":"brief description","materials":"key materials"}],"printables":["printable 1","printable 2"],"differentiationTips":"1-2 sentences"}`,
        }],
      }),
      client.messages.create({
        model: 'claude-sonnet-4-6',
        max_tokens: 1500,
        messages: [{
          role: 'user',
          content: `You are an SEO expert for Teachers Pay Teachers (AU/NZ market).

Context: ${context}

Respond ONLY with valid JSON, no markdown, no backticks:
{"primaryKeyword":"best keyword phrase","titleFormula":"optimised TPT title formula","keywords":[{"keyword":"phrase","intent":"buyer","competition":"low","auNzRelevance":"high"}],"descriptionOpener":"first sentence of optimised TPT description"}`,
        }],
      }),
    ])

    let ideas = null
    let outline = null
    let seo = null
    const errors: string[] = []

    try { ideas = JSON.parse(extractText(ideasMsg)) } catch { errors.push('Failed to parse ideas') }
    try { outline = JSON.parse(extractText(outlineMsg)) } catch { errors.push('Failed to parse outline') }
    try { seo = JSON.parse(extractText(seoMsg)) } catch { errors.push('Failed to parse SEO data') }

    return NextResponse.json({
      ideas,
      outline,
      seo,
      ...(errors.length > 0 && { error: errors.join('; ') }),
    })

  } catch (err) {
    return NextResponse.json({
      ideas: null,
      outline: null,
      seo: null,
      error: err instanceof Error ? err.message : 'Generation failed',
    })
  }
}
