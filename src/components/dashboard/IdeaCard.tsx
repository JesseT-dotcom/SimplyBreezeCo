'use client'

import { useState } from 'react'
import Link from 'next/link'
import type { ProductIdea, IdeaStatus } from '@/lib/types'

function relativeDate(dateStr: string): string {
  const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000)
  if (diff < 60) return 'just now'
  if (diff < 3600) return `${Math.floor(diff / 60)} minutes ago`
  if (diff < 86400) return `${Math.floor(diff / 3600)} hours ago`
  if (diff < 604800) return `${Math.floor(diff / 86400)} days ago`
  if (diff < 2592000) return `${Math.floor(diff / 604800)} weeks ago`
  return `${Math.floor(diff / 2592000)} months ago`
}

const STATUS_STYLE: Record<IdeaStatus, { bg: string; color: string; label: string }> = {
  idea:        { bg: '#d8e6d9', color: '#2a3d2b', label: 'Idea' },
  in_progress: { bg: '#faeeda', color: '#633806', label: 'In progress' },
  listed:      { bg: '#d0e8d1', color: '#1a4d1c', label: 'Listed' },
  archived:    { bg: '#e8e6e1', color: '#5a5a58', label: 'Archived' },
}

export default function IdeaCard({ idea }: { idea: ProductIdea }) {
  const [hovered, setHovered] = useState(false)
  const status = STATUS_STYLE[idea.status]

  return (
    <Link
      href={`/ideas/${idea.id}`}
      style={{
        display: 'block',
        textDecoration: 'none',
        border: '1px solid #d8e0d9',
        borderRadius: '12px',
        padding: '16px',
        backgroundColor: '#fff',
        cursor: 'pointer',
        boxShadow: hovered ? '0 2px 8px rgba(0,0,0,0.07)' : 'none',
        transform: hovered ? 'translateY(-2px)' : 'translateY(0)',
        transition: 'box-shadow 0.15s, transform 0.15s',
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <p style={{
        fontFamily: "'Playfair Display', serif",
        fontSize: '15px',
        fontWeight: 500,
        color: 'var(--sb-charcoal)',
        margin: '0 0 8px 0',
        display: '-webkit-box',
        WebkitLineClamp: 2,
        WebkitBoxOrient: 'vertical',
        overflow: 'hidden',
      }}>
        {idea.title}
      </p>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '8px' }}>
        <span style={{ fontSize: '12px', padding: '3px 10px', borderRadius: '9999px', backgroundColor: 'var(--sb-sage-light)', color: '#2a3d2b' }}>
          {idea.product_type}
        </span>
        <span style={{ fontSize: '12px', padding: '3px 10px', borderRadius: '9999px', backgroundColor: '#d0e8d1', color: '#2a4d2c' }}>
          {idea.suggested_price}
        </span>
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '12px' }}>
        {idea.age_group && (
          <span style={{ fontSize: '11px', padding: '2px 8px', borderRadius: '9999px', backgroundColor: '#f0eee8', color: '#5a5a58' }}>
            {idea.age_group}
          </span>
        )}
        {idea.curriculum_areas?.[0] && (
          <span style={{ fontSize: '11px', padding: '2px 8px', borderRadius: '9999px', backgroundColor: '#f0eee8', color: '#5a5a58' }}>
            {idea.curriculum_areas[0]}
          </span>
        )}
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '12px', borderTop: '1px solid #f0eee8' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ fontSize: '12px', padding: '3px 10px', borderRadius: '9999px', backgroundColor: status.bg, color: status.color }}>
            {status.label}
          </span>
          {(idea.etsy_uploaded_at || idea.tpt_uploaded_at) && (
            <div style={{ display: 'flex', gap: '3px' }}>
              {idea.etsy_uploaded_at && (
                <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '18px', height: '18px', borderRadius: '4px', backgroundColor: '#D4A5A5', color: '#5a2020', fontSize: '10px', fontWeight: 700 }}>E</span>
              )}
              {idea.tpt_uploaded_at && (
                <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '18px', height: '18px', borderRadius: '4px', backgroundColor: '#B5C9B7', color: '#1a2e1b', fontSize: '10px', fontWeight: 700 }}>T</span>
              )}
            </div>
          )}
        </div>
        <span style={{ fontSize: '12px', color: 'var(--sb-charcoal)', opacity: 0.5 }}>
          {relativeDate(idea.created_at)}
        </span>
      </div>
    </Link>
  )
}
