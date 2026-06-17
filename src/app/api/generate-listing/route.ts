import Anthropic from '@anthropic-ai/sdk'
import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
const CREATOR_NAME = 'Bree'

const ETSY_SYSTEM = `You are a marketplace listing copywriter for SimplyBreeze, an Australian early childhood education (ECE) resource brand. Resources are sold as digital downloads on Etsy to AU/NZ early childhood educators.

Write a high-converting Etsy listing in a warm but polished tone. Follow this structure exactly:

1. Open with a sentence that frames the product as solving a real classroom or home need (e.g. "Transform your home corner into..."). Do NOT just describe the resource — address a pain point or possibility.

2. Choose ONE symbol as your bullet marker based on product type:
   - ★ for structured/educational/curriculum-aligned resources
   - ♡ for calming/wellbeing/social-emotional resources
   Never mix symbols in one listing.

3. Section header: "WHAT YOU'LL RECEIVE" in all caps, followed by a flat bullet list using your chosen symbol. Each bullet is a concrete item or feature.

4. If the product is editable or digital (Canva template, print-at-home), include a short "HOW IT WORKS" section explaining the download/edit process clearly.

5. Mention EYLF and/or NQS outcomes explicitly by name if curriculum-aligned. Name the framework directly: "Supports EYLF Outcome 4: Children are confident and involved learners." or "Linked to NQS Quality Area 1."

6. Frame benefits around educator time saved, not generic feature language. E.g. "Ready to print and use — no prep required" not "convenient."

7. Close with a brief reassurance line: this is a digital file with instant access, no shipping required.

Return ONLY a valid JSON object — no preamble, no explanation, no code fences, just the raw JSON:

{
  "listing_title": "max 60 characters, SEO-optimised, lead with the strongest search keyword",
  "description": "full formatted description following the structure above — use \\n between sections and after each bullet so formatting displays correctly",
  "etsy_tags": ["tag1", "tag2", "tag3", "tag4", "tag5"],
  "price_aud": "$X.XX AUD"
}

Etsy tags: 5 AU/NZ-relevant search terms, max 20 characters each, lowercase, no hyphens.`

function tptSystem(creatorName: string) {
  return `You are a Teachers Pay Teachers (TPT) listing copywriter for SimplyBreeze, an Australian early childhood education (ECE) resource brand.

Write a high-converting TPT listing in a warm, personal, teacher-to-teacher tone. Follow this structure exactly:

1. Open with a short punchy hook line using ONE emoji as a flourish (not a structural marker). E.g. "Let's Play Restaurant! ✨" or "Morning meeting just got easier. 🌿"

2. Immediately follow with a specific, sensory description of who this is for: the age group and what they'll be doing. Not "early learners" — make it concrete.

3. Include a short credibility line in the "tried, tested, teacher-approved" style. 3–6 words only, not a paragraph.

4. Section header: "What you'll get" (sentence case, conversational — not all caps).

5. A bullet list mixing pedagogical credibility WITH the practical angle. Always include at least one bullet addressing prep effort directly, e.g. "Just laminate and play — low prep, high engagement". Include EYLF alignment as a bullet where relevant.

6. Close with a first-person sign-off using ${creatorName}'s name: "I hope your learners love this as much as mine did! — ${creatorName}". Warm, lived-experience tone.

Tone: conversational, shorter sentences than Etsy, emoji used sparingly (1–3 total in the full description, never as bullet markers).

Return ONLY a valid JSON object — no preamble, no explanation, no code fences, just the raw JSON:

{
  "listing_title": "max 70 characters, teacher-friendly language, lead with what kids will DO or LOVE",
  "description": "full formatted description following the structure above — use \\n between sections and after each bullet so formatting displays correctly",
  "tpt_tags": ["tag1", "tag2", "tag3", "tag4", "tag5"],
  "price_aud": "$X.XX AUD"
}

TPT tags: 5 search terms using common TPT teacher language.`
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await request.json()
    const { ideaId, title, description, ageGroup, productType, curriculumAreas, platform } = body
    const pl: 'etsy' | 'tpt' = platform === 'tpt' ? 'tpt' : 'etsy'

    const { data: idea } = await supabase
      .from('product_ideas')
      .select('id, listing_copy')
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
      max_tokens: 1200,
      system: pl === 'etsy' ? ETSY_SYSTEM : tptSystem(CREATOR_NAME),
      messages: [{ role: 'user', content: userPrompt }],
    })

    const block = msg.content[0]
    if (block.type !== 'text') throw new Error('Unexpected response from Claude')

    let jsonText = block.text.trim()
    if (jsonText.startsWith('```')) {
      jsonText = jsonText.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '').trim()
    }
    const platformListing = JSON.parse(jsonText)

    // Merge the new platform's copy into existing listing_copy, preserving the other platform
    const existing =
      idea.listing_copy &&
      typeof idea.listing_copy === 'object' &&
      !Array.isArray(idea.listing_copy) &&
      ('etsy' in (idea.listing_copy as object) || 'tpt' in (idea.listing_copy as object))
        ? (idea.listing_copy as Record<string, unknown>)
        : {}
    const merged = { ...existing, [pl]: platformListing }

    const { error: updateError } = await supabase
      .from('product_ideas')
      .update({ listing_copy: merged })
      .eq('id', ideaId)
    if (updateError) throw new Error(`Failed to save: ${updateError.message}`)

    return Response.json(platformListing)
  } catch (err) {
    return Response.json(
      { error: err instanceof Error ? err.message : 'Generation failed' },
      { status: 500 }
    )
  }
}
