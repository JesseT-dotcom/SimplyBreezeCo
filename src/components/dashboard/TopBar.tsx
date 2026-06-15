'use client'

import { usePathname } from 'next/navigation'

function getPageTitle(pathname: string): string {
  if (pathname === '/') return 'Dashboard'
  if (pathname === '/generate') return 'Generate'
  if (pathname === '/ideas') return 'Ideas'
  if (pathname.startsWith('/ideas/')) return 'Idea details'
  return 'Dashboard'
}

export default function TopBar({ userEmail }: { userEmail: string }) {
  const pathname = usePathname()
  const title = getPageTitle(pathname)
  const avatarLetter = userEmail.charAt(0).toUpperCase()

  return (
    <header style={{
      height: '56px',
      backgroundColor: '#ffffff',
      borderBottom: '1px solid #d8e0d9',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 24px',
      flexShrink: 0,
    }}>
      <h2 style={{
        fontFamily: "'Playfair Display', serif",
        fontSize: '20px',
        fontWeight: 500,
        margin: 0,
        color: 'var(--sb-charcoal)',
      }}>
        {title}
      </h2>

      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <span
          className="hidden md:block"
          style={{ fontSize: '14px', color: 'var(--sb-charcoal)', opacity: 0.6 }}
        >
          {userEmail}
        </span>
        <div style={{
          width: '32px',
          height: '32px',
          borderRadius: '50%',
          backgroundColor: 'var(--sb-sage)',
          color: 'var(--sb-sage-dark)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '14px',
          fontWeight: 500,
          flexShrink: 0,
        }}>
          {avatarLetter}
        </div>
      </div>
    </header>
  )
}
