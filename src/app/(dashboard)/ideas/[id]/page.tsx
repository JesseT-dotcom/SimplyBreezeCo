import { createClient } from '@/lib/supabase/server'
import { notFound, redirect } from 'next/navigation'
import IdeaDetailClient from '@/components/dashboard/IdeaDetailClient'
import type { ProductIdea } from '@/lib/types'

export default async function IdeaDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data } = await supabase
    .from('product_ideas')
    .select('*, resource_outlines(*), seo_data(*)')
    .eq('id', id)
    .eq('created_by', user.id)
    .single()

  if (!data) notFound()

  return <IdeaDetailClient idea={data as ProductIdea} />
}
