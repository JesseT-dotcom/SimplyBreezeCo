import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import IdeasListClient from '@/components/dashboard/IdeasListClient'
import type { ProductIdea } from '@/lib/types'

export default async function IdeasPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data } = await supabase
    .from('product_ideas')
    .select('*')
    .eq('created_by', user.id)
    .order('created_at', { ascending: false })

  const ideas: ProductIdea[] = data ?? []

  return (
    <div>
      <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: '28px', fontWeight: 500, margin: '0 0 4px 0', color: 'var(--sb-charcoal)' }}>
        Your ideas
      </h1>
      <p style={{ fontSize: '14px', color: 'var(--sb-charcoal)', opacity: 0.6, margin: '0 0 24px 0' }}>
        All product ideas you&apos;ve saved
      </p>
      <IdeasListClient ideas={ideas} />
    </div>
  )
}
