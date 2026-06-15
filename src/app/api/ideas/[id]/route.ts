import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { z } from 'zod'

type RouteContext = { params: Promise<{ id: string }> }

async function getAuthedUserAndIdea(id: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }), supabase, user: null }

  const { data: idea } = await supabase
    .from('product_ideas')
    .select('id, created_by')
    .eq('id', id)
    .eq('created_by', user.id)
    .single()

  if (!idea) return { error: NextResponse.json({ error: 'Not found' }, { status: 404 }), supabase, user }
  return { error: null, supabase, user }
}

export async function GET(_req: Request, { params }: RouteContext) {
  const { id } = await params
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { data, error } = await supabase
      .from('product_ideas')
      .select('*, resource_outlines(*), seo_data(*)')
      .eq('id', id)
      .eq('created_by', user.id)
      .single()

    if (error || !data) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    return NextResponse.json(data)
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Failed to fetch' }, { status: 500 })
  }
}

const patchSchema = z.object({
  status: z.enum(['idea', 'in_progress', 'listed', 'archived']).optional(),
  notes: z.string().optional(),
})

export async function PATCH(req: Request, { params }: RouteContext) {
  const { id } = await params
  try {
    const { error: authError, supabase } = await getAuthedUserAndIdea(id)
    if (authError) return authError

    const body = await req.json()
    const parsed = patchSchema.safeParse(body)
    if (!parsed.success) return NextResponse.json({ error: 'Invalid request' }, { status: 400 })

    const { data, error } = await supabase
      .from('product_ideas')
      .update({ ...parsed.data, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json(data)
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Update failed' }, { status: 500 })
  }
}

export async function DELETE(_req: Request, { params }: RouteContext) {
  const { id } = await params
  try {
    const { error: authError, supabase } = await getAuthedUserAndIdea(id)
    if (authError) return authError

    const { error } = await supabase.from('product_ideas').delete().eq('id', id)
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ success: true })
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Delete failed' }, { status: 500 })
  }
}
