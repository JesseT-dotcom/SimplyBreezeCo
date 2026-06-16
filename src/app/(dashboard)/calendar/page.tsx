import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import CalendarClient from '@/components/dashboard/CalendarClient'
import type { CalendarIdea, IdeaStatus } from '@/lib/types'

export default async function CalendarPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: ideas } = await supabase
    .from('product_ideas')
    .select('id, title, status, product_type, age_group, target_launch_date')
    .eq('created_by', user.id)
    .not('target_launch_date', 'is', null)
    .order('target_launch_date', { ascending: true })

  const ideaIds = (ideas ?? []).map(i => i.id as string)

  let illustratedSet = new Set<string>()
  if (ideaIds.length > 0) {
    const { data: illus } = await supabase
      .from('illustration_prompts')
      .select('resource_id')
      .in('resource_id', ideaIds)
      .not('image_url', 'is', null)
    illustratedSet = new Set(
      (illus ?? []).map(i => i.resource_id as string).filter(Boolean)
    )
  }

  const calendarIdeas: CalendarIdea[] = (ideas ?? []).map(idea => ({
    id: idea.id as string,
    title: idea.title as string,
    status: idea.status as IdeaStatus,
    product_type: idea.product_type as string,
    age_group: idea.age_group as string,
    target_launch_date: idea.target_launch_date as string,
    hasIllustration: illustratedSet.has(idea.id as string),
  }))

  return (
    <div>
      <h1 style={{
        fontFamily: "'Playfair Display', serif",
        fontSize: '28px', fontWeight: 500,
        margin: '0 0 4px 0', color: 'var(--sb-charcoal)',
      }}>
        Content Calendar
      </h1>
      <p style={{ fontSize: '14px', color: 'var(--sb-charcoal)', opacity: 0.6, margin: '0 0 24px 0' }}>
        Plan your resource launch dates
      </p>
      <CalendarClient ideas={calendarIdeas} />
    </div>
  )
}
