'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import type { CalendarIdea, IdeaStatus } from '@/lib/types'

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]
const DAY_HEADERS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

const STATUS_CHIP: Record<IdeaStatus, { bg: string; color: string }> = {
  idea:        { bg: '#B5C9B7', color: '#2a3d2b' },
  in_progress: { bg: '#D4A5A5', color: '#633806' },
  listed:      { bg: '#7FAF83', color: '#1a4d1c' },
  archived:    { bg: '#e8e6e1', color: '#5a5a58' },
}

export default function CalendarClient({ ideas }: { ideas: CalendarIdea[] }) {
  const now = new Date()
  const [year, setYear] = useState(now.getFullYear())
  const [month, setMonth] = useState(now.getMonth())

  const todayStr = useMemo(() => {
    const d = new Date()
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
  }, [])

  function prevMonth() {
    if (month === 0) { setYear(y => y - 1); setMonth(11) }
    else setMonth(m => m - 1)
  }
  function nextMonth() {
    if (month === 11) { setYear(y => y + 1); setMonth(0) }
    else setMonth(m => m + 1)
  }

  const cells = useMemo(() => {
    const firstDay = new Date(year, month, 1).getDay() // 0=Sun
    const startOffset = (firstDay + 6) % 7 // Mon=0 … Sun=6
    const daysInMonth = new Date(year, month + 1, 0).getDate()
    const daysInPrevMonth = new Date(year, month, 0).getDate()

    const result: { day: number; isCurrentMonth: boolean; dateStr: string | null }[] = []

    for (let i = startOffset - 1; i >= 0; i--) {
      result.push({ day: daysInPrevMonth - i, isCurrentMonth: false, dateStr: null })
    }
    for (let d = 1; d <= daysInMonth; d++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`
      result.push({ day: d, isCurrentMonth: true, dateStr })
    }
    const rem = result.length % 7
    if (rem !== 0) {
      for (let d = 1; d <= 7 - rem; d++) {
        result.push({ day: d, isCurrentMonth: false, dateStr: null })
      }
    }
    return result
  }, [year, month])

  const ideasByDate = useMemo(() => {
    const map = new Map<string, CalendarIdea[]>()
    for (const idea of ideas) {
      const d = idea.target_launch_date
      if (!map.has(d)) map.set(d, [])
      map.get(d)!.push(idea)
    }
    return map
  }, [ideas])

  return (
    <div>
      {/* Legend */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px', flexWrap: 'wrap' }}>
        <span style={{ fontSize: '12px', color: 'var(--sb-charcoal)', opacity: 0.5 }}>Live on:</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '16px', height: '16px', borderRadius: '3px', backgroundColor: '#D4A5A5', color: '#5a2020', fontSize: '9px', fontWeight: 700 }}>E</span>
          <span style={{ fontSize: '12px', color: 'var(--sb-charcoal)', opacity: 0.65 }}>Etsy</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '16px', height: '16px', borderRadius: '3px', backgroundColor: '#B5C9B7', color: '#1a2e1b', fontSize: '9px', fontWeight: 700 }}>T</span>
          <span style={{ fontSize: '12px', color: 'var(--sb-charcoal)', opacity: 0.65 }}>TPT</span>
        </div>
      </div>

      {/* Month navigation */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
        <button
          onClick={prevMonth}
          aria-label="Previous month"
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            width: '32px', height: '32px',
            borderRadius: '6px', border: '1px solid #d8e0d9',
            backgroundColor: '#fff', cursor: 'pointer', color: 'var(--sb-charcoal)',
          }}
          onMouseEnter={e => e.currentTarget.style.backgroundColor = 'var(--sb-sage-light)'}
          onMouseLeave={e => e.currentTarget.style.backgroundColor = '#fff'}
        >
          <ChevronLeft size={16} />
        </button>

        <h2 style={{
          fontFamily: "'Playfair Display', serif",
          fontSize: '20px', fontWeight: 500,
          color: 'var(--sb-charcoal)', margin: 0,
          minWidth: '200px', textAlign: 'center',
        }}>
          {MONTHS[month]} {year}
        </h2>

        <button
          onClick={nextMonth}
          aria-label="Next month"
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            width: '32px', height: '32px',
            borderRadius: '6px', border: '1px solid #d8e0d9',
            backgroundColor: '#fff', cursor: 'pointer', color: 'var(--sb-charcoal)',
          }}
          onMouseEnter={e => e.currentTarget.style.backgroundColor = 'var(--sb-sage-light)'}
          onMouseLeave={e => e.currentTarget.style.backgroundColor = '#fff'}
        >
          <ChevronRight size={16} />
        </button>
      </div>

      {/* Calendar grid */}
      <div style={{
        backgroundColor: '#FAF8F5',
        borderRadius: '12px',
        border: '1px solid #d8e0d9',
        overflow: 'hidden',
        boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
      }}>
        {/* Day-of-week headers */}
        <div className="grid grid-cols-7">
          {DAY_HEADERS.map(d => (
            <div key={d} style={{
              padding: '10px 12px 8px',
              textAlign: 'center',
              fontSize: '11px', fontWeight: 600,
              letterSpacing: '0.06em', textTransform: 'uppercase',
              color: 'var(--sb-charcoal)', opacity: 0.45,
              borderBottom: '1px solid #d8e0d9',
            }}>
              {d}
            </div>
          ))}
        </div>

        {/* Day cells */}
        <div className="grid grid-cols-7">
          {cells.map((cell, idx) => {
            const isToday = cell.isCurrentMonth && cell.dateStr === todayStr
            const dayIdeas = cell.dateStr ? (ideasByDate.get(cell.dateStr) ?? []) : []
            const shown = dayIdeas.slice(0, 2)
            const extra = dayIdeas.length - 2

            const isLastRow = idx >= cells.length - 7
            const isLastCol = idx % 7 === 6

            return (
              <div
                key={idx}
                style={{
                  minHeight: '96px',
                  padding: '8px',
                  backgroundColor: isToday ? '#EDE8DF' : '#FAF8F5',
                  borderRight: !isLastCol ? '1px solid #e8e4dc' : undefined,
                  borderBottom: !isLastRow ? '1px solid #e8e4dc' : undefined,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '3px',
                }}
              >
                {/* Day number + today dot */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '2px' }}>
                  <span style={{
                    fontSize: '13px',
                    fontWeight: cell.isCurrentMonth ? 500 : 400,
                    color: cell.isCurrentMonth ? 'var(--sb-charcoal)' : '#c0bab4',
                    lineHeight: 1,
                  }}>
                    {cell.day}
                  </span>
                  {isToday && (
                    <span style={{
                      width: '5px', height: '5px', borderRadius: '50%',
                      backgroundColor: 'var(--sb-sage-dark)', display: 'inline-block',
                    }} />
                  )}
                </div>

                {/* Chips — only shown for current-month days */}
                {cell.isCurrentMonth && shown.map(idea => {
                  const { bg, color } = STATUS_CHIP[idea.status]
                  return (
                    <Link
                      key={idea.id}
                      href={`/ideas/${idea.id}`}
                      title={`${idea.product_type} · ${idea.age_group}`}
                      style={{
                        display: 'flex', alignItems: 'center', gap: '3px',
                        backgroundColor: bg, color,
                        borderRadius: '9999px',
                        padding: '2px 6px',
                        fontSize: '11px', fontWeight: 500,
                        overflow: 'hidden',
                        textDecoration: 'none',
                        maxWidth: '100%',
                      }}
                    >
                      {idea.hasIllustration && (
                        <span style={{ fontSize: '9px', flexShrink: 0 }}>📷</span>
                      )}
                      <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>
                        {idea.title}
                      </span>
                      {idea.etsyUploaded && (
                        <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '13px', height: '13px', borderRadius: '2px', backgroundColor: '#D4A5A5', color: '#5a2020', fontSize: '8px', fontWeight: 700, flexShrink: 0 }}>E</span>
                      )}
                      {idea.tptUploaded && (
                        <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '13px', height: '13px', borderRadius: '2px', backgroundColor: '#B5C9B7', color: '#1a2e1b', fontSize: '8px', fontWeight: 700, flexShrink: 0 }}>T</span>
                      )}
                    </Link>
                  )
                })}

                {extra > 0 && (
                  <span style={{ fontSize: '10px', color: 'var(--sb-charcoal)', opacity: 0.5, paddingLeft: '2px' }}>
                    +{extra} more
                  </span>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
