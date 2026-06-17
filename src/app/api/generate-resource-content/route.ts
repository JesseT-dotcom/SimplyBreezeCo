// -- ALTER TABLE product_ideas ADD COLUMN IF NOT EXISTS resource_content JSONB;

import Anthropic from '@anthropic-ai/sdk'
import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import type { ResourceTheme } from '@/lib/types'

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

const SYSTEM_PROMPT = `You are a curriculum content writer for SimplyBreeze, an Australian early childhood education (ECE) resource brand. You create dramatic play pack and flashcard content for children aged 0–6 years.

Generate a complete resource content scaffold for each theme specified. Return ONLY a valid JSON array — no preamble, no explanation, no code fences, just the raw JSON array:

[
  {
    "theme_name": "Café",
    "cards": [
      { "label": "Barista", "description": "child wearing striped apron operating an espresso machine at a timber café counter" }
    ],
    "eylf_outcomes": [
      {
        "outcome": "EYLF Outcome 4.1 – Children develop dispositions for learning such as curiosity, cooperation, confidence, creativity, commitment, enthusiasm, persistence and imagination",
        "explanation": "Café role-play encourages children to experiment with new roles like barista or customer, persist through multi-step tasks like taking and fulfilling orders, and build confidence in their own play narratives."
      }
    ],
    "how_to_use": "Set up a café corner with the role cards displayed for children to choose from. Children select a card and take on that role in play — swap cards between rounds to give everyone a turn at different jobs. Laminate for durability and add a small basket of prop cards for extra play prompts.",
    "supporting_text": [
      { "item_type": "Menu item", "content": "Flat White – $5.50" },
      { "item_type": "Menu item", "content": "Babyccino – $2.00" },
      { "item_type": "Order pad heading", "content": "Today's Order" },
      { "item_type": "Order pad line", "content": "Item: _____________" }
    ]
  }
]

Content rules:
- card label: 1–3 words maximum, exactly what would be printed on the flashcard — a role, action, object, or scene name (e.g. "Barista", "Take Order", "Croissant", "Pack Bag")
- card description: one sentence, 8–15 words, written as a Canva Elements search reference — vivid, concrete, and specific enough to find a matching illustration (e.g. "child in apron placing croissant into paper bag at counter")
- eylf_outcomes: name the specific outcome number and full title, then write a concrete one-sentence explanation tied directly to this play theme — not generic
- how_to_use: 3–4 practical sentences in a warm educator tone, specific to the theme, written for an Australian early childhood educator or parent
- supporting_text: only include when the theme has dramatic play props beyond cards — menus, price tags, receipts, order pads, product labels, signage. Use AUD pricing. If no supporting text is needed, return []
- Generate exactly the number of cards specified — no more, no fewer`

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await request.json()
    const {
      ideaId, title, description, ageGroup, productType,
      themes, cardsPerTheme, inclusions,
      regenerateIndex,
    } = body

    if (!Array.isArray(themes) || themes.length === 0) {
      return NextResponse.json({ error: 'At least one theme is required' }, { status: 400 })
    }

    const { data: idea } = await supabase
      .from('product_ideas')
      .select('id, resource_content')
      .eq('id', ideaId)
      .eq('created_by', user.id)
      .single()
    if (!idea) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    // When regenerating a single theme, only send that theme to Claude
    const themesToGenerate: string[] =
      typeof regenerateIndex === 'number' ? [themes[regenerateIndex]] : themes

    const userPrompt = [
      `Resource title: ${title}`,
      `Product type: ${productType}`,
      `Age group: ${ageGroup}`,
      description ? `Description: ${description}` : null,
      inclusions ? `Specific inclusions required: ${inclusions}` : null,
      '',
      `Generate content for ${themesToGenerate.length === 1 ? 'this theme' : 'each of these themes'}: ${themesToGenerate.join(', ')}`,
      `Cards per theme: exactly ${cardsPerTheme}`,
    ].filter(s => s !== null).join('\n')

    const msg = await anthropic.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 8096,
      system: SYSTEM_PROMPT,
      messages: [{ role: 'user', content: userPrompt }],
    })

    const block = msg.content[0]
    if (block.type !== 'text') throw new Error('Unexpected response from Claude')

    let jsonText = block.text.trim()
    if (jsonText.startsWith('```')) {
      jsonText = jsonText.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '').trim()
    }
    const generated = JSON.parse(jsonText) as ResourceTheme[]

    // Merge single-theme regen into existing content; otherwise replace all
    let finalContent: ResourceTheme[]
    if (typeof regenerateIndex === 'number') {
      const existing: ResourceTheme[] = Array.isArray(idea.resource_content)
        ? (idea.resource_content as ResourceTheme[])
        : []
      finalContent = [...existing]
      finalContent[regenerateIndex] = generated[0]
    } else {
      finalContent = generated
    }

    const { error: updateError } = await supabase
      .from('product_ideas')
      .update({ resource_content: finalContent })
      .eq('id', ideaId)
    if (updateError) throw new Error(`Failed to save: ${updateError.message}`)

    return Response.json(finalContent)
  } catch (err) {
    return Response.json(
      { error: err instanceof Error ? err.message : 'Generation failed' },
      { status: 500 }
    )
  }
}
