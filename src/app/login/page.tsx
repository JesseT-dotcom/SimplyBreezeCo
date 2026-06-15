'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    const supabase = createClient()
    const { error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      router.push('/')
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: 'var(--sb-cream)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '16px',
    }}>
      <div style={{
        backgroundColor: '#ffffff',
        border: '1px solid #d8e0d9',
        borderRadius: '12px',
        padding: '32px',
        width: '100%',
        maxWidth: '400px',
      }}>
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <h1 style={{
            fontFamily: "'Playfair Display', serif",
            color: 'var(--sb-sage-dark)',
            fontSize: '32px',
            fontWeight: 600,
            margin: 0,
          }}>
            SimplyBreeze
          </h1>
          <p style={{
            color: 'var(--sb-charcoal)',
            fontSize: '14px',
            opacity: 0.7,
            marginTop: '6px',
          }}>
            Content Dashboard
          </p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <input
            type="email"
            placeholder="Email"
            required
            value={email}
            onChange={e => setEmail(e.target.value)}
            style={{
              border: '1px solid #d8e0d9',
              borderRadius: '6px',
              padding: '10px 12px',
              fontSize: '14px',
              outline: 'none',
              color: 'var(--sb-charcoal)',
              width: '100%',
              boxSizing: 'border-box',
            }}
            onFocus={e => e.currentTarget.style.boxShadow = '0 0 0 2px var(--sb-sage)'}
            onBlur={e => e.currentTarget.style.boxShadow = 'none'}
          />

          <input
            type="password"
            placeholder="Password"
            required
            value={password}
            onChange={e => setPassword(e.target.value)}
            style={{
              border: '1px solid #d8e0d9',
              borderRadius: '6px',
              padding: '10px 12px',
              fontSize: '14px',
              outline: 'none',
              color: 'var(--sb-charcoal)',
              width: '100%',
              boxSizing: 'border-box',
            }}
            onFocus={e => e.currentTarget.style.boxShadow = '0 0 0 2px var(--sb-sage)'}
            onBlur={e => e.currentTarget.style.boxShadow = 'none'}
          />

          <button
            type="submit"
            disabled={loading}
            style={{
              backgroundColor: 'var(--sb-sage)',
              color: '#1a2e1b',
              border: 'none',
              borderRadius: '8px',
              padding: '11px',
              fontSize: '15px',
              fontWeight: 600,
              cursor: loading ? 'not-allowed' : 'pointer',
              width: '100%',
              opacity: loading ? 0.7 : 1,
              transition: 'background-color 0.15s',
            }}
            onMouseEnter={e => { if (!loading) e.currentTarget.style.backgroundColor = 'var(--sb-sage-dark)' }}
            onMouseLeave={e => { if (!loading) e.currentTarget.style.backgroundColor = 'var(--sb-sage)' }}
          >
            {loading ? 'Signing in…' : 'Sign in'}
          </button>

          {error && (
            <p style={{ color: '#c0392b', fontSize: '13px', margin: 0, textAlign: 'center' }}>
              {error}
            </p>
          )}
        </form>

        <p style={{ textAlign: 'center', fontSize: '13px', color: 'var(--sb-charcoal)', opacity: 0.7, marginTop: '20px', marginBottom: 0 }}>
          Don&apos;t have an account?{' '}
          <Link href="/signup" style={{ color: 'var(--sb-sage-dark)', fontWeight: 600, textDecoration: 'none' }}>
            Sign up
          </Link>
        </p>
      </div>
    </div>
  )
}
