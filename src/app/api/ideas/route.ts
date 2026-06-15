import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { z } from 'zod'

const activitySchema = z.object({
  name: z.string(),
  description: z.string(),
  materials: z.string(),
})

const keywordSchema = z.object({
  keyword: z.string(),
  intent: z.enum(['buyer', 'browser']),
  competition: z.enum(['low', 'medium', 'high']),
  auNzRelevance: z.enum(['high', 'medium']),
})

const saveSchema = z.object({
  idea: z.object({
    title: z.string(),
    type: z.string(),
    price: z.string(),
    description: z.string(),
    hook: z.string(),
    tags: z.array(z.string()),
  }),
  outline: z.object({
    packTitle: z.string(),
    learningOutcomes: z.array(z.string()),
    eylf: z.array(z.string()),
    activities: z.array(activitySchema),
    printables: z.array(z.string()),
    differentiationTips: z.string(),
  }),
  seo: z.object({
    primaryKeyword: z.string(),
    titleFormula: z.string(),
    keywords: z.array(keywordSchema),
    descriptionOpener: z.string(),
  }),
  ageGroup: z.string().optional(),
  curriculumAreas: z.array(z.string()).optional(),
  theme: z.string().optional(),
  seasonalHook: z.string().optional(),
})

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const parsed = saveSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid request', details: parsed.error }, { status: 400 })
    }

    const { idea, outline, seo, ageGroup, curriculumAreas, theme, seasonalHook } = parsed.data

    const { data: productIdea, error: ideaError } = await supabase
      .from('product_ideas')
      .insert({
        created_by: user.id,
        title: idea.title,
        product_type: idea.type,
        suggested_price: idea.price,
        description: idea.description,
        hook: idea.hook,
        tpt_tags: idea.tags,
        status: 'idea',
        age_group: ageGroup ?? '',
        curriculum_areas: curriculumAreas ?? [],
        theme: theme ?? '',
        seasonal_hook: seasonalHook ?? null,
      })
      .select('id')
      .single()

    if (ideaError || !productIdea) {
      return NextResponse.json({ error: ideaError?.message ?? 'Failed to save idea' }, { status: 500 })
    }

    await Promise.all([
      supabase.from('resource_outlines').insert({
        product_idea_id: productIdea.id,
        pack_title: outline.packTitle,
        learning_outcomes: outline.learningOutcomes,
        eylf_links: outline.eylf,
        activities: outline.activities,
        printables: outline.printables,
        differentiation_tips: outline.differentiationTips,
      }),
      supabase.from('seo_data').insert({
        product_idea_id: productIdea.id,
        primary_keyword: seo.primaryKeyword,
        title_formula: seo.titleFormula,
        keywords: seo.keywords,
        description_opener: seo.descriptionOpener,
      }),
    ])

    return NextResponse.json({ id: productIdea.id, success: true })

  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Failed to save idea' },
      { status: 500 }
    )
  }
}

export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data, error } = await supabase
      .from('product_ideas')
      .select('*')
      .eq('created_by', user.id)
      .order('created_at', { ascending: false })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ ideas: data })

  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Failed to fetch ideas' },
      { status: 500 }
    )
  }
}
