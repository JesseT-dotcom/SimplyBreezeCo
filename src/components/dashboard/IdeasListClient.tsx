'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Search, Sparkles } from 'lucide-react'
import IdeaCard from './IdeaCard'
import type { ProductIdea, IdeaStatus } from '@/lib/types'

type StatusFilter = 'all' | IdeaStatus

const STATUS_OPTIONS: { value: StatusFilter; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'idea', label: 'Idea' },
  { value: 'in_progress', label: 'In progress' },
  { value: 'listed', label: 'Listed' },
  { value: 'archived', label: 'Archived' },
]

export default function IdeasListClient({ ideas }: { ideas: ProductIdea[] }) {
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')
  const [searchQuery, setSearchQuery] = useState('')

  const filtered = ideas.filter(idea => {
    const matchesStatus = statusFilter === 'all' || idea.status === statusFilter
    const matchesSearch = idea.title.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesStatus && matchesSearch
  })

  if (ideas.length === 0) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '64px 0', textAlign: 'center' }}>
        <Sparkles size={40} style={{ color: 'var(--sb-sage)', marginBottom: '16px' }} />
        <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: '20px', fontWeight: 500, margin: '0 0 8px 0', color: 'var(--sb-charcoal)' }}>
          No ideas yet
        </h2>
        <p style={{ fontSize: '14px', color: 'var(--sb-charcoal)', opacity: 0.6, margin: '0 0 20px 0' }}>
          Generate your first ECE resource idea to get started
        </p>
        <Link
          href="/generate"
          style={{
            backgroundColor: 'var(--sb-sage)',
            color: '#1a2e1b',
            padding: '10px 20px',
            borderRadius: '8px',
            textDecoration: 'none',
            fontSize: '14px',
            fontWeight: 500,
          }}
        >
          Generate ideas →
        </Link>
      </div>
    )
  }

  return (
    <div>
      <div style={{ display: 'flex', gap: '12px', marginBottom: '24px', flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
          {STATUS_OPTIONS.map(opt => {
            const active = statusFilter === opt.value
            return (
              <button
                key={opt.value}
                onClick={() => setStatusFilter(opt.value)}
                style={{
                  padding: '6px 14px',
                  borderRadius: '9999px',
                  fontSize: '13px',
                  cursor: 'pointer',
                  border: active ? '1px solid var(--sb-sage-dark)' : '1px solid #c0d0c1',
                  backgroundColor: active ? 'var(--sb-sage)' : 'var(--sb-sage-light)',
                  color: active ? '#1a2e1b' : '#2a3d2b',
                  fontWeight: active ? 500 : 400,
                  transition: 'all 0.15s',
                }}
              >
                {opt.label}
              </button>
            )
          })}
        </div>

        <div style={{ flex: 1, minWidth: '200px', position: 'relative' }}>
          <Search size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#aaa' }} />
          <input
            type="text"
            placeholder="Search by title..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              boxSizing: 'border-box',
              padding: '8px 12px 8px 30px',
              border: '1px solid #d8e0d9',
              borderRadius: '8px',
              fontSize: '13px',
              outline: 'none',
              color: 'var(--sb-charcoal)',
              backgroundColor: '#fff',
            }}
            onFocus={e => e.currentTarget.style.boxShadow = '0 0 0 2px var(--sb-sage)'}
            onBlur={e => e.currentTarget.style.boxShadow = 'none'}
          />
        </div>
      </div>

      {filtered.length === 0 ? (
        <p style={{ fontSize: '14px', color: 'var(--sb-charcoal)', opacity: 0.5, textAlign: 'center', padding: '40px 0' }}>
          No ideas match your filters.
        </p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(idea => <IdeaCard key={idea.id} idea={idea} />)}
        </div>
      )}
    </div>
  )
}
