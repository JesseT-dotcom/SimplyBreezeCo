'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { LayoutDashboard, Sparkles, BookOpen } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

interface NavItem {
  href: string
  label: string
  icon: React.ReactNode
}

const navItems: NavItem[] = [
  { href: '/', label: 'Dashboard', icon: <LayoutDashboard size={18} /> },
  { href: '/generate', label: 'Generate', icon: <Sparkles size={18} /> },
  { href: '/ideas', label: 'Ideas', icon: <BookOpen size={18} /> },
]

export default function Sidebar({ userEmail }: { userEmail: string }) {
  const pathname = usePathname()
  const router = useRouter()

  async function handleSignOut() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <aside style={{
      width: '240px',
      backgroundColor: '#ffffff',
      borderRight: '1px solid #d8e0d9',
      height: '100vh',
      position: 'sticky',
      top: 0,
      display: 'flex',
      flexDirection: 'column',
    }}>
      <div style={{ padding: '24px' }}>
        <span style={{
          fontFamily: "'Playfair Display', serif",
          fontSize: '18px',
          fontWeight: 500,
          color: 'var(--sb-sage-dark)',
        }}>
          SimplyBreeze
        </span>
      </div>

      <nav style={{ display: 'flex', flexDirection: 'column', gap: '4px', padding: '0 8px' }}>
        {navItems.map(({ href, label, icon }) => {
          const isActive = pathname === href
          return (
            <Link
              key={href}
              href={href}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '12px 16px',
                borderRadius: '6px',
                fontSize: '14px',
                textDecoration: 'none',
                fontWeight: isActive ? 500 : 400,
                color: isActive ? 'var(--sb-charcoal)' : '#888',
                backgroundColor: isActive ? 'var(--sb-sage-light)' : 'transparent',
                borderLeft: isActive ? '3px solid var(--sb-sage-dark)' : '3px solid transparent',
                transition: 'background-color 0.1s',
              }}
              onMouseEnter={e => { if (!isActive) e.currentTarget.style.backgroundColor = '#f5f3ee' }}
              onMouseLeave={e => { if (!isActive) e.currentTarget.style.backgroundColor = 'transparent' }}
            >
              {icon}
              {label}
            </Link>
          )
        })}
      </nav>

      <div style={{
        marginTop: 'auto',
        padding: '16px 24px',
        borderTop: '1px solid #d8e0d9',
      }}>
        <p style={{
          fontSize: '12px',
          color: 'var(--sb-charcoal)',
          opacity: 0.6,
          margin: '0 0 8px 0',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        }}>
          {userEmail}
        </p>
        <button
          onClick={handleSignOut}
          style={{
            background: 'none',
            border: 'none',
            padding: 0,
            fontSize: '13px',
            color: '#a52d2d',
            cursor: 'pointer',
            textAlign: 'left',
          }}
          onMouseEnter={e => e.currentTarget.style.textDecoration = 'underline'}
          onMouseLeave={e => e.currentTarget.style.textDecoration = 'none'}
        >
          Sign out
        </button>
      </div>
    </aside>
  )
}
