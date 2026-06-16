'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, Sparkles, BookOpen, CalendarDays } from 'lucide-react'

const navItems = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/generate', label: 'Generate', icon: Sparkles },
  { href: '/ideas', label: 'Ideas', icon: BookOpen },
  { href: '/calendar', label: 'Calendar', icon: CalendarDays },
]

export default function MobileNav() {
  const pathname = usePathname()

  return (
    <nav
      className="md:hidden"
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        height: '60px',
        backgroundColor: '#ffffff',
        borderTop: '1px solid #d8e0d9',
        display: 'flex',
        zIndex: 50,
      }}
    >
      {navItems.map(({ href, label, icon: Icon }) => {
        const isActive = pathname === href
        return (
          <Link
            key={href}
            href={href}
            style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '4px',
              textDecoration: 'none',
              color: isActive ? 'var(--sb-sage-dark)' : '#888',
            }}
          >
            <Icon size={20} />
            <span style={{ fontSize: '11px', fontWeight: isActive ? 500 : 400 }}>{label}</span>
          </Link>
        )
      })}
    </nav>
  )
}
