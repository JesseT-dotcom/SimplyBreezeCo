import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Sidebar from '@/components/dashboard/Sidebar'
import TopBar from '@/components/dashboard/TopBar'
import MobileNav from '@/components/dashboard/MobileNav'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const userEmail = user.email ?? ''

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <div style={{ display: 'none' }} className="md:block" aria-hidden="true">
        <Sidebar userEmail={userEmail} />
      </div>
      <div className="md:hidden" style={{ display: 'block' }}>
        <Sidebar userEmail={userEmail} />
      </div>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        <TopBar userEmail={userEmail} />
        <main style={{ flex: 1, padding: '24px', paddingBottom: '80px' }} className="md:pb-6">
          {children}
        </main>
      </div>

      <MobileNav />
    </div>
  )
}
