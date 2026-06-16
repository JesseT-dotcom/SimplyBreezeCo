'use client'

import { useState, useRef } from 'react'
import Link from 'next/link'
import { Check, ImageIcon, Loader2, Calendar, Copy, FileText, Palette } from 'lucide-react'
import toast from 'react-hot-toast'
import type { ProductIdea, IdeaStatus, ListingCopy, CanvaBrief } from '@/lib/types'

type IllusResult = { id: string; imageUrl: string; promptText: string }

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)
  async function handle() {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch { /* clipboard unavailable */ }
  }
  return (
    <button
      onClick={handle}
      style={{
        display: 'flex', alignItems: 'center', gap: '4px',
        padding: '4px 10px', borderRadius: '6px',
        border: '1px solid #d8e0d9',
        backgroundColor: copied ? 'var(--sb-sage-light)' : '#fff',
        color: copied ? 'var(--sb-sage-dark)' : '#888',
        fontSize: '12px', fontWeight: 500, cursor: 'pointer',
        fontFamily: 'Inter, sans-serif', flexShrink: 0,
      }}
    >
      {copied ? <Check size={12} /> : <Copy size={12} />}
      {copied ? 'Copied' : 'Copy'}
    </button>
  )
}

const STATUS_STYLE: Record<IdeaStatus, { bg: string; color: string; label: string }> = {
  idea:        { bg: '#d8e6d9', color: '#2a3d2b', label: 'Idea' },
  in_progress: { bg: '#faeeda', color: '#633806', label: 'In progress' },
  listed:      { bg: '#d0e8d1', color: '#1a4d1c', label: 'Listed' },
  archived:    { bg: '#e8e6e1', color: '#5a5a58', label: 'Archived' },
}

const SECTION_LABEL: React.CSSProperties = {
  fontSize: '11px',
  fontWeight: 500,
  textTransform: 'uppercase',
  letterSpacing: '0.08em',
  color: 'var(--sb-charcoal)',
  opacity: 0.55,
  display: 'block',
  marginBottom: '6px',
}

const CARD: React.CSSProperties = {
  backgroundColor: '#fff',
  border: '1px solid #d8e0d9',
  borderRadius: '12px',
  padding: '24px',
}

function competitionStyle(c: string): React.CSSProperties {
  if (c === 'low') return { backgroundColor: '#d0e8d1', color: '#2a4d2c' }
  if (c === 'medium') return { backgroundColor: '#faeeda', color: '#633806' }
  return { backgroundColor: '#fce8e8', color: '#7f1d1d' }
}

export default function IdeaDetailClient({ idea }: { idea: ProductIdea }) {
  const [status, setStatus] = useState<IdeaStatus>(idea.status)
  const [notes, setNotes] = useState(idea.notes ?? '')
  const [notesSaving, setNotesSaving] = useState(false)
  const [notesSaved, setNotesSaved] = useState(false)
  const savedNotesRef = useRef(idea.notes ?? '')

  const [launchDate, setLaunchDate] = useState(idea.target_launch_date ?? '')

  const [illus, setIllus] = useState<IllusResult | null>(null)
  const [illusLoading, setIllusLoading] = useState(false)
  const [illusError, setIllusError] = useState<string | null>(null)

  const [listing, setListing] = useState<ListingCopy | null>(idea.listing_copy ?? null)
  const [listingLoading, setListingLoading] = useState(false)
  const [listingError, setListingError] = useState<string | null>(null)

  const [canvaBrief, setCanvaBrief] = useState<CanvaBrief | null>(idea.canva_brief ?? null)
  const [canvaLoading, setCanvaLoading] = useState(false)
  const [canvaError, setCanvaError] = useState<string | null>(null)

  const outline = idea.resource_outlines?.[0]
  const seo = idea.seo_data?.[0]
  const currentStatus = STATUS_STYLE[status]

  async function handleStatusChange(newStatus: IdeaStatus) {
    const prev = status
    setStatus(newStatus)
    try {
      const res = await fetch(`/api/ideas/${idea.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      })
      if (!res.ok) throw new Error()
      toast.success('Status updated')
    } catch {
      setStatus(prev)
      toast.error('Failed to update status')
    }
  }

  async function handleLaunchDateChange(newDate: string) {
    const prev = launchDate
    setLaunchDate(newDate)
    try {
      const res = await fetch(`/api/ideas/${idea.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ target_launch_date: newDate || null }),
      })
      if (!res.ok) throw new Error()
      toast.success(newDate ? 'Launch date set' : 'Launch date cleared')
    } catch {
      setLaunchDate(prev)
      toast.error('Failed to update launch date')
    }
  }

  async function handleGenerateIllustration() {
    setIllusLoading(true)
    setIllusError(null)
    try {
      const res = await fetch('/api/generate-illustration', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: idea.title,
          ageGroup: idea.age_group ?? '3–5 yrs',
          learningObjective: idea.description,
          sceneContext: idea.product_type,
          resourceId: idea.id,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Generation failed')
      setIllus(data)
    } catch (err) {
      setIllusError(err instanceof Error ? err.message : 'Generation failed')
    } finally {
      setIllusLoading(false)
    }
  }

  async function handleGenerateListing() {
    setListingLoading(true)
    setListingError(null)
    try {
      const res = await fetch('/api/generate-listing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ideaId: idea.id,
          title: idea.title,
          description: idea.description,
          ageGroup: idea.age_group,
          productType: idea.product_type,
          curriculumAreas: idea.curriculum_areas,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Generation failed')
      setListing(data)
    } catch (err) {
      setListingError(err instanceof Error ? err.message : 'Generation failed')
    } finally {
      setListingLoading(false)
    }
  }

  async function handleGenerateCanvaBrief() {
    setCanvaLoading(true)
    setCanvaError(null)
    try {
      const res = await fetch('/api/generate-canva-brief', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ideaId: idea.id,
          title: idea.title,
          description: idea.description,
          age_group: idea.age_group,
          product_type: idea.product_type,
          curriculum_area: idea.curriculum_areas?.join(', '),
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Generation failed')
      setCanvaBrief(data)
    } catch (err) {
      setCanvaError(err instanceof Error ? err.message : 'Generation failed')
    } finally {
      setCanvaLoading(false)
    }
  }

  async function handleNotesBlur() {
    if (notes === savedNotesRef.current) return
    setNotesSaving(true)
    try {
      const res = await fetch(`/api/ideas/${idea.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notes }),
      })
      if (!res.ok) throw new Error()
      savedNotesRef.current = notes
      setNotesSaved(true)
      setTimeout(() => setNotesSaved(false), 2000)
    } catch {
      toast.error('Failed to save notes')
    } finally {
      setNotesSaving(false)
    }
  }

  return (
    <div>
      {/* Header */}
      <div>
        <Link href="/ideas" style={{ fontSize: '13px', color: 'var(--sb-charcoal)', opacity: 0.6, textDecoration: 'none' }}
          onMouseEnter={e => { e.currentTarget.style.color = 'var(--sb-sage-dark)'; e.currentTarget.style.opacity = '1' }}
          onMouseLeave={e => { e.currentTarget.style.color = 'var(--sb-charcoal)'; e.currentTarget.style.opacity = '0.6' }}
        >
          ← Back to ideas
        </Link>

        <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: '28px', fontWeight: 500, margin: '8px 0 14px 0', color: 'var(--sb-charcoal)' }}>
          {idea.title}
        </h1>

        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '10px' }}>
          <select
            value={status}
            onChange={e => handleStatusChange(e.target.value as IdeaStatus)}
            style={{
              padding: '4px 10px',
              borderRadius: '9999px',
              fontSize: '13px',
              fontWeight: 500,
              border: '1px solid transparent',
              backgroundColor: currentStatus.bg,
              color: currentStatus.color,
              cursor: 'pointer',
              outline: 'none',
            }}
          >
            <option value="idea">Idea</option>
            <option value="in_progress">In progress</option>
            <option value="listed">Listed</option>
            <option value="archived">Archived</option>
          </select>

          <span style={{ fontSize: '13px', padding: '4px 10px', borderRadius: '9999px', backgroundColor: '#d0e8d1', color: '#2a4d2c' }}>
            {idea.suggested_price}
          </span>
          <span style={{ fontSize: '13px', padding: '4px 10px', borderRadius: '9999px', backgroundColor: 'var(--sb-sage-light)', color: '#2a3d2b' }}>
            {idea.product_type}
          </span>
          <span style={{ fontSize: '13px', color: 'var(--sb-charcoal)', opacity: 0.5 }}>
            {new Date(idea.created_at).toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: 'numeric' })}
          </span>

          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '5px',
            padding: '3px 10px',
            borderRadius: '9999px',
            border: '1px solid #d8e0d9',
            backgroundColor: launchDate ? 'var(--sb-linen)' : 'transparent',
          }}>
            <Calendar size={12} style={{ color: 'var(--sb-charcoal)', opacity: 0.5, flexShrink: 0 }} />
            <input
              type="date"
              value={launchDate}
              onChange={e => handleLaunchDateChange(e.target.value)}
              style={{
                fontSize: '13px',
                border: 'none',
                background: 'transparent',
                color: launchDate ? 'var(--sb-charcoal)' : '#aaa',
                cursor: 'pointer',
                outline: 'none',
                fontFamily: 'Inter, sans-serif',
                padding: 0,
              }}
            />
          </div>
        </div>
      </div>

      {/* Three column grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6" style={{ marginTop: '32px' }}>

        {/* Column 1 — Product details */}
        <div style={CARD}>
          <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: '18px', fontWeight: 500, margin: '0 0 20px 0', color: 'var(--sb-charcoal)' }}>
            Product details
          </h2>

          <div style={{ marginBottom: '16px' }}>
            <span style={SECTION_LABEL}>Description</span>
            <p style={{ fontSize: '14px', lineHeight: 1.6, color: 'var(--sb-charcoal)', margin: 0 }}>{idea.description}</p>
          </div>

          <div style={{ marginBottom: '16px' }}>
            <span style={SECTION_LABEL}>Hook</span>
            <p style={{ fontSize: '14px', fontStyle: 'italic', color: 'var(--sb-charcoal)', opacity: 0.75, margin: 0 }}>
              &ldquo;{idea.hook}&rdquo;
            </p>
          </div>

          <div style={{ marginBottom: '16px' }}>
            <span style={SECTION_LABEL}>TPT tags</span>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
              {idea.tpt_tags.map(tag => (
                <span key={tag} style={{ fontSize: '11px', padding: '2px 8px', borderRadius: '9999px', backgroundColor: '#f0eee8', color: '#5a5a58' }}>
                  {tag}
                </span>
              ))}
            </div>
          </div>

          <div style={{ borderTop: '1px solid #f0eee8', margin: '16px 0' }} />

          <div>
            <span style={SECTION_LABEL}>Your notes</span>
            <textarea
              value={notes}
              onChange={e => setNotes(e.target.value)}
              onBlur={handleNotesBlur}
              rows={4}
              placeholder="Add your notes here..."
              style={{
                width: '100%',
                boxSizing: 'border-box',
                border: '1px solid #d8e0d9',
                borderRadius: '6px',
                padding: '8px',
                fontSize: '13px',
                resize: 'vertical',
                outline: 'none',
                color: 'var(--sb-charcoal)',
                fontFamily: 'Inter, sans-serif',
              }}
              onFocus={e => e.currentTarget.style.boxShadow = '0 0 0 2px var(--sb-sage)'}
            />
            <p style={{ fontSize: '12px', margin: '4px 0 0 0', color: notesSaved ? 'var(--sb-sage-dark)' : 'var(--sb-charcoal)', opacity: notesSaving || notesSaved ? 1 : 0, minHeight: '18px' }}>
              {notesSaving ? 'Saving…' : notesSaved ? 'Saved ✓' : ''}
            </p>
          </div>
        </div>

        {/* Column 2 — Resource outline */}
        <div style={CARD}>
          <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: '18px', fontWeight: 500, margin: '0 0 20px 0', color: 'var(--sb-charcoal)' }}>
            Resource outline
          </h2>

          {outline ? (
            <div>
              <p style={{ fontFamily: "'Playfair Display', serif", fontSize: '15px', fontWeight: 500, margin: '0 0 16px 0', color: 'var(--sb-charcoal)' }}>
                {outline.pack_title}
              </p>

              <div style={{ marginBottom: '16px' }}>
                <span style={SECTION_LABEL}>Learning outcomes</span>
                <ol style={{ margin: 0, paddingLeft: '18px' }}>
                  {outline.learning_outcomes.map((o, i) => (
                    <li key={i} style={{ fontSize: '13px', lineHeight: 1.6, color: 'var(--sb-charcoal)', marginBottom: '2px' }}>{o}</li>
                  ))}
                </ol>
              </div>

              <div style={{ marginBottom: '16px' }}>
                <span style={SECTION_LABEL}>EYLF links</span>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                  {outline.eylf_links.map((e, i) => (
                    <span key={i} style={{ fontSize: '11px', padding: '2px 8px', borderRadius: '9999px', backgroundColor: 'var(--sb-sage-light)', color: '#2a3d2b' }}>
                      {e}
                    </span>
                  ))}
                </div>
              </div>

              <div style={{ marginBottom: '16px' }}>
                <span style={SECTION_LABEL}>Activities</span>
                {outline.activities.map((a, i) => (
                  <div key={i} style={{ paddingBottom: '10px', marginBottom: '10px', borderBottom: i < outline.activities.length - 1 ? '1px solid #f5f3ee' : 'none' }}>
                    <p style={{ fontSize: '13px', fontWeight: 500, margin: '0 0 2px 0', color: 'var(--sb-charcoal)' }}>{a.name}</p>
                    <p style={{ fontSize: '12px', color: 'var(--sb-charcoal)', opacity: 0.7, margin: '0 0 2px 0' }}>{a.description}</p>
                    <p style={{ fontSize: '11px', fontStyle: 'italic', color: 'var(--sb-charcoal)', opacity: 0.5, margin: 0 }}>Materials: {a.materials}</p>
                  </div>
                ))}
              </div>

              <div style={{ marginBottom: '16px' }}>
                <span style={SECTION_LABEL}>Printables</span>
                <ul style={{ margin: 0, paddingLeft: '18px' }}>
                  {outline.printables.map((p, i) => (
                    <li key={i} style={{ fontSize: '13px', lineHeight: 1.6, color: 'var(--sb-charcoal)' }}>{p}</li>
                  ))}
                </ul>
              </div>

              <div>
                <span style={SECTION_LABEL}>Differentiation</span>
                <div style={{ backgroundColor: '#f5f3ee', borderRadius: '6px', padding: '10px', fontSize: '12px', lineHeight: 1.6, color: 'var(--sb-charcoal)' }}>
                  {outline.differentiation_tips}
                </div>
              </div>
            </div>
          ) : (
            <div>
              <p style={{ fontSize: '14px', color: 'var(--sb-charcoal)', opacity: 0.5, margin: '0 0 4px 0' }}>No outline saved</p>
              <p style={{ fontSize: '13px', color: 'var(--sb-charcoal)', opacity: 0.4, margin: 0 }}>Generate a new idea to include an outline.</p>
            </div>
          )}
        </div>

        {/* Column 3 — SEO */}
        <div style={CARD}>
          <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: '18px', fontWeight: 500, margin: '0 0 20px 0', color: 'var(--sb-charcoal)' }}>
            SEO &amp; keywords
          </h2>

          {seo ? (
            <div>
              <div style={{ marginBottom: '16px' }}>
                <span style={SECTION_LABEL}>Primary keyword</span>
                <p style={{ fontSize: '14px', fontWeight: 500, color: 'var(--sb-sage-dark)', margin: 0 }}>{seo.primary_keyword}</p>
              </div>

              <div style={{ marginBottom: '16px' }}>
                <span style={SECTION_LABEL}>Title formula</span>
                <p style={{ fontSize: '12px', fontStyle: 'italic', color: 'var(--sb-charcoal)', opacity: 0.7, margin: 0 }}>{seo.title_formula}</p>
              </div>

              <div style={{ marginBottom: '16px' }}>
                <span style={{ ...SECTION_LABEL, marginBottom: '8px' }}>Keywords</span>
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
                    <thead>
                      <tr>
                        {['Keyword', 'Intent', 'Competition', 'AU/NZ'].map(h => (
                          <th key={h} style={{ textAlign: 'left', padding: '4px 6px', color: 'var(--sb-charcoal)', opacity: 0.5, fontWeight: 500, whiteSpace: 'nowrap' }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {seo.keywords.map((kw, i) => (
                        <tr key={i} style={{ borderTop: '1px solid #f0eee8' }}>
                          <td style={{ padding: '6px', color: 'var(--sb-charcoal)' }}>{kw.keyword}</td>
                          <td style={{ padding: '6px' }}>
                            <span style={{
                              fontSize: '11px', padding: '2px 6px', borderRadius: '9999px',
                              backgroundColor: kw.intent === 'buyer' ? 'var(--sb-sage)' : 'transparent',
                              color: kw.intent === 'buyer' ? '#1a2e1b' : '#2a4d2c',
                              border: kw.intent === 'buyer' ? 'none' : '1px solid var(--sb-sage)',
                            }}>
                              {kw.intent}
                            </span>
                          </td>
                          <td style={{ padding: '6px' }}>
                            <span style={{ fontSize: '11px', padding: '2px 6px', borderRadius: '9999px', ...competitionStyle(kw.competition) }}>
                              {kw.competition}
                            </span>
                          </td>
                          <td style={{ padding: '6px', textAlign: 'center' }}>
                            {kw.auNzRelevance === 'high'
                              ? <Check size={13} style={{ color: 'var(--sb-sage-dark)' }} />
                              : <span style={{ color: '#bbb' }}>—</span>
                            }
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div>
                <span style={SECTION_LABEL}>Description opener</span>
                <blockquote style={{ borderLeft: '3px solid var(--sb-sage)', paddingLeft: '12px', margin: 0, fontSize: '12px', fontStyle: 'italic', lineHeight: 1.6, color: 'var(--sb-charcoal)', opacity: 0.8 }}>
                  {seo.description_opener}
                </blockquote>
              </div>
            </div>
          ) : (
            <div>
              <p style={{ fontSize: '14px', color: 'var(--sb-charcoal)', opacity: 0.5, margin: '0 0 4px 0' }}>No SEO data saved</p>
              <p style={{ fontSize: '13px', color: 'var(--sb-charcoal)', opacity: 0.4, margin: 0 }}>Generate a new idea to include SEO data.</p>
            </div>
          )}
        </div>
      </div>

      {/* Illustration panel */}
      <div style={{ ...CARD, marginTop: '24px' }}>
        {/* Panel header */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '16px', marginBottom: '20px' }}>
          <div>
            <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: '18px', fontWeight: 500, margin: '0 0 4px 0', color: 'var(--sb-charcoal)' }}>
              Illustration
            </h2>
            <p style={{ fontSize: '13px', color: 'var(--sb-charcoal)', opacity: 0.55, margin: 0 }}>
              Generate a SimplyBreeze-style illustration for this resource
            </p>
          </div>
          <button
            onClick={illus ? () => { setIllus(null); handleGenerateIllustration() } : handleGenerateIllustration}
            disabled={illusLoading}
            style={{
              flexShrink: 0,
              backgroundColor: illusLoading ? 'var(--sb-sage-light)' : 'var(--sb-sage)',
              color: '#1a2e1b',
              border: 'none',
              borderRadius: '8px',
              padding: '8px 16px',
              fontSize: '13px',
              fontWeight: 500,
              cursor: illusLoading ? 'default' : 'pointer',
              fontFamily: 'Inter, sans-serif',
              whiteSpace: 'nowrap',
            }}
          >
            {illus ? 'Generate another' : 'Generate illustration'}
          </button>
        </div>

        {/* Error bar */}
        {illusError && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '12px',
            backgroundColor: 'var(--sb-rose-light)',
            border: '1px solid var(--sb-rose)',
            borderRadius: '8px',
            padding: '10px 14px',
            marginBottom: '16px',
          }}>
            <p style={{ fontSize: '13px', color: '#7f1d1d', margin: 0 }}>{illusError}</p>
            <button
              onClick={handleGenerateIllustration}
              style={{
                flexShrink: 0,
                backgroundColor: 'var(--sb-rose)',
                color: '#7f1d1d',
                border: 'none',
                borderRadius: '6px',
                padding: '6px 12px',
                fontSize: '12px',
                fontWeight: 500,
                cursor: 'pointer',
                fontFamily: 'Inter, sans-serif',
              }}
            >
              Try again
            </button>
          </div>
        )}

        {/* Loading state */}
        {illusLoading && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '48px 24px', gap: '12px' }}>
            <Loader2 size={28} style={{ color: 'var(--sb-sage-dark)', animation: 'spin 1s linear infinite' }} />
            <p style={{ fontSize: '13px', color: 'var(--sb-charcoal)', opacity: 0.55, margin: 0 }}>This takes 15–30 seconds…</p>
            <style>{`@keyframes spin { from { transform: rotate(0deg) } to { transform: rotate(360deg) } }`}</style>
          </div>
        )}

        {/* Empty state */}
        {!illusLoading && !illus && (
          <div style={{
            border: '2px dashed #d8e0d9',
            borderRadius: '10px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '48px 24px',
            gap: '10px',
          }}>
            <ImageIcon size={32} style={{ color: 'var(--sb-sage-dark)', opacity: 0.4 }} />
            <p style={{ fontSize: '13px', color: 'var(--sb-charcoal)', opacity: 0.4, margin: 0 }}>
              No illustration yet — click Generate to create one
            </p>
          </div>
        )}

        {/* Success: two-column layout */}
        {!illusLoading && illus && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Image */}
            <div style={{ borderRadius: '10px', overflow: 'hidden', border: '1px solid #d8e0d9', aspectRatio: '1 / 1', backgroundColor: '#f5f3ee' }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={illus.imageUrl}
                alt="Generated SimplyBreeze illustration"
                style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
              />
            </div>

            {/* Prompt + actions */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <span style={SECTION_LABEL}>Illustration prompt</span>
                <p style={{ fontSize: '13px', lineHeight: 1.7, color: 'var(--sb-charcoal)', margin: 0 }}>
                  {illus.promptText}
                </p>
              </div>

              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: 'auto' }}>
                <a
                  href={illus.imageUrl}
                  download={`${idea.title.replace(/\s+/g, '-').toLowerCase()}-illustration.jpg`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: 'inline-block',
                    backgroundColor: 'var(--sb-sage)',
                    color: '#1a2e1b',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '8px 16px',
                    fontSize: '13px',
                    fontWeight: 500,
                    cursor: 'pointer',
                    fontFamily: 'Inter, sans-serif',
                    textDecoration: 'none',
                    whiteSpace: 'nowrap',
                  }}
                >
                  Download image
                </a>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Listing copy panel */}
      <div style={{ ...CARD, marginTop: '24px' }}>
        {/* Panel header */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '16px', marginBottom: listing ? '20px' : '0' }}>
          <div>
            <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: '18px', fontWeight: 500, margin: '0 0 4px 0', color: 'var(--sb-charcoal)' }}>
              Listing Copy
            </h2>
            <p style={{ fontSize: '13px', color: 'var(--sb-charcoal)', opacity: 0.55, margin: 0 }}>
              Marketplace-ready copy for Etsy and TPT
            </p>
          </div>
          <button
            onClick={listing ? () => { setListing(null); handleGenerateListing() } : handleGenerateListing}
            disabled={listingLoading}
            style={{
              flexShrink: 0,
              backgroundColor: listingLoading ? 'var(--sb-sage-light)' : 'var(--sb-sage)',
              color: '#1a2e1b',
              border: 'none', borderRadius: '8px',
              padding: '8px 16px', fontSize: '13px', fontWeight: 500,
              cursor: listingLoading ? 'default' : 'pointer',
              fontFamily: 'Inter, sans-serif', whiteSpace: 'nowrap',
            }}
          >
            {listing ? 'Regenerate' : 'Generate listing copy'}
          </button>
        </div>

        {/* Error */}
        {listingError && (
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px',
            backgroundColor: 'var(--sb-rose-light)', border: '1px solid var(--sb-rose)',
            borderRadius: '8px', padding: '10px 14px', marginTop: '16px',
          }}>
            <p style={{ fontSize: '13px', color: '#7f1d1d', margin: 0 }}>{listingError}</p>
            <button
              onClick={handleGenerateListing}
              style={{
                flexShrink: 0, backgroundColor: 'var(--sb-rose)', color: '#7f1d1d',
                border: 'none', borderRadius: '6px', padding: '6px 12px',
                fontSize: '12px', fontWeight: 500, cursor: 'pointer', fontFamily: 'Inter, sans-serif',
              }}
            >
              Try again
            </button>
          </div>
        )}

        {/* Loading */}
        {listingLoading && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '48px 24px', gap: '12px' }}>
            <Loader2 size={28} style={{ color: 'var(--sb-sage-dark)', animation: 'spin 1s linear infinite' }} />
            <p style={{ fontSize: '13px', color: 'var(--sb-charcoal)', opacity: 0.55, margin: 0 }}>Writing your listing copy…</p>
            <style>{`@keyframes spin { from { transform: rotate(0deg) } to { transform: rotate(360deg) } }`}</style>
          </div>
        )}

        {/* Empty state */}
        {!listingLoading && !listing && !listingError && (
          <div style={{
            border: '2px dashed #d8e0d9', borderRadius: '10px',
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            padding: '48px 24px', gap: '10px', marginTop: '20px',
          }}>
            <FileText size={32} style={{ color: 'var(--sb-sage-dark)', opacity: 0.4 }} />
            <p style={{ fontSize: '13px', color: 'var(--sb-charcoal)', opacity: 0.4, margin: 0 }}>
              No listing copy yet — click Generate to create one
            </p>
          </div>
        )}

        {/* Results */}
        {!listingLoading && listing && (
          <div>
            {/* Listing title */}
            <div style={{ paddingBottom: '16px', marginBottom: '16px', borderBottom: '1px solid #f0eee8' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', marginBottom: '8px' }}>
                <span style={SECTION_LABEL}>Listing title</span>
                <CopyButton text={listing.listing_title} />
              </div>
              <p style={{ fontSize: '15px', fontWeight: 500, color: 'var(--sb-charcoal)', margin: 0, lineHeight: 1.4 }}>
                {listing.listing_title}
              </p>
              <p style={{ fontSize: '11px', color: 'var(--sb-charcoal)', opacity: 0.4, margin: '4px 0 0 0' }}>
                {listing.listing_title.length} / 60 characters
              </p>
            </div>

            {/* Description */}
            <div style={{ paddingBottom: '16px', marginBottom: '16px', borderBottom: '1px solid #f0eee8' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', marginBottom: '8px' }}>
                <span style={SECTION_LABEL}>Description</span>
                <CopyButton text={listing.description} />
              </div>
              <p style={{ fontSize: '13px', lineHeight: 1.7, color: 'var(--sb-charcoal)', margin: 0 }}>
                {listing.description}
              </p>
            </div>

            {/* Etsy tags */}
            <div style={{ paddingBottom: '16px', marginBottom: '16px', borderBottom: '1px solid #f0eee8' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', marginBottom: '8px' }}>
                <span style={SECTION_LABEL}>Etsy tags</span>
                <CopyButton text={listing.etsy_tags.join(', ')} />
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {listing.etsy_tags.map(tag => (
                  <span key={tag} style={{ fontSize: '12px', padding: '3px 10px', borderRadius: '9999px', backgroundColor: 'var(--sb-sage-light)', color: '#2a3d2b' }}>
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            {/* TPT tags */}
            <div style={{ paddingBottom: '16px', marginBottom: '16px', borderBottom: '1px solid #f0eee8' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', marginBottom: '8px' }}>
                <span style={SECTION_LABEL}>TPT tags</span>
                <CopyButton text={listing.tpt_tags.join(', ')} />
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {listing.tpt_tags.map(tag => (
                  <span key={tag} style={{ fontSize: '12px', padding: '3px 10px', borderRadius: '9999px', backgroundColor: '#EDE8DF', color: '#5a5050' }}>
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            {/* Suggested price */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', marginBottom: '8px' }}>
                <span style={SECTION_LABEL}>Suggested price</span>
                <CopyButton text={listing.suggested_price} />
              </div>
              <p style={{ fontSize: '22px', fontWeight: 600, color: 'var(--sb-sage-dark)', margin: 0, fontFamily: "'Playfair Display', serif" }}>
                {listing.suggested_price}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Canva brief panel */}
      <div style={{ ...CARD, marginTop: '24px' }}>
        {/* Panel header */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '16px', marginBottom: canvaBrief ? '20px' : '0' }}>
          <div>
            <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: '18px', fontWeight: 500, margin: '0 0 4px 0', color: 'var(--sb-charcoal)' }}>
              Canva Cover Brief
            </h2>
            <p style={{ fontSize: '13px', color: 'var(--sb-charcoal)', opacity: 0.55, margin: 0 }}>
              Design direction for your Canva cover page
            </p>
          </div>
          <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
            {canvaBrief && (
              <CopyButton text={[
                `COVER TITLE: ${canvaBrief.cover_title}`,
                `SUBTITLE: ${canvaBrief.subtitle}`,
                `COLOUR PALETTE: ${canvaBrief.colour_palette}`,
                `FONT SUGGESTIONS: ${canvaBrief.font_suggestions}`,
                `LAYOUT NOTES: ${canvaBrief.layout_notes}`,
                `ILLUSTRATION NOTES: ${canvaBrief.illustration_notes}`,
                `MOOD: ${canvaBrief.mood}`,
                `SIZE SPEC: ${canvaBrief.size_spec}`,
              ].join('\n\n')} />
            )}
            <button
              onClick={canvaBrief ? () => { setCanvaBrief(null); handleGenerateCanvaBrief() } : handleGenerateCanvaBrief}
              disabled={canvaLoading}
              style={{
                backgroundColor: canvaLoading ? 'var(--sb-sage-light)' : 'var(--sb-sage)',
                color: '#1a2e1b',
                border: 'none', borderRadius: '8px',
                padding: '8px 16px', fontSize: '13px', fontWeight: 500,
                cursor: canvaLoading ? 'default' : 'pointer',
                fontFamily: 'Inter, sans-serif', whiteSpace: 'nowrap',
              }}
            >
              {canvaBrief ? 'Regenerate' : 'Generate Canva brief'}
            </button>
          </div>
        </div>

        {/* Error */}
        {canvaError && (
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px',
            backgroundColor: 'var(--sb-rose-light)', border: '1px solid var(--sb-rose)',
            borderRadius: '8px', padding: '10px 14px', marginTop: '16px',
          }}>
            <p style={{ fontSize: '13px', color: '#7f1d1d', margin: 0 }}>{canvaError}</p>
            <button
              onClick={handleGenerateCanvaBrief}
              style={{
                flexShrink: 0, backgroundColor: 'var(--sb-rose)', color: '#7f1d1d',
                border: 'none', borderRadius: '6px', padding: '6px 12px',
                fontSize: '12px', fontWeight: 500, cursor: 'pointer', fontFamily: 'Inter, sans-serif',
              }}
            >
              Try again
            </button>
          </div>
        )}

        {/* Loading */}
        {canvaLoading && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '48px 24px', gap: '12px' }}>
            <Loader2 size={28} style={{ color: 'var(--sb-sage-dark)', animation: 'spin 1s linear infinite' }} />
            <p style={{ fontSize: '13px', color: 'var(--sb-charcoal)', opacity: 0.55, margin: 0 }}>Writing your design brief…</p>
            <style>{`@keyframes spin { from { transform: rotate(0deg) } to { transform: rotate(360deg) } }`}</style>
          </div>
        )}

        {/* Empty state */}
        {!canvaLoading && !canvaBrief && !canvaError && (
          <div style={{
            border: '2px dashed #d8e0d9', borderRadius: '10px',
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            padding: '48px 24px', gap: '10px', marginTop: '20px',
          }}>
            <Palette size={32} style={{ color: 'var(--sb-sage-dark)', opacity: 0.4 }} />
            <p style={{ fontSize: '13px', color: 'var(--sb-charcoal)', opacity: 0.4, margin: 0 }}>
              No Canva brief yet — click Generate to create one
            </p>
          </div>
        )}

        {/* Results */}
        {!canvaLoading && canvaBrief && (
          <div>
            {/* Copy full brief button */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '20px' }}>
              <CopyButton text={[
                `COVER TITLE: ${canvaBrief.cover_title}`,
                `SUBTITLE: ${canvaBrief.subtitle}`,
                `COLOUR PALETTE: ${canvaBrief.colour_palette}`,
                `FONT SUGGESTIONS: ${canvaBrief.font_suggestions}`,
                `LAYOUT NOTES: ${canvaBrief.layout_notes}`,
                `ILLUSTRATION NOTES: ${canvaBrief.illustration_notes}`,
                `MOOD: ${canvaBrief.mood}`,
                `SIZE SPEC: ${canvaBrief.size_spec}`,
              ].join('\n\n')} />
            </div>

            {/* Cover title */}
            <div style={{ paddingBottom: '16px', marginBottom: '16px', borderBottom: '1px solid #f0eee8' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', marginBottom: '8px' }}>
                <span style={SECTION_LABEL}>Cover title</span>
                <CopyButton text={canvaBrief.cover_title} />
              </div>
              <p style={{ fontSize: '17px', fontWeight: 600, color: 'var(--sb-charcoal)', margin: 0, lineHeight: 1.4, fontFamily: "'Playfair Display', serif" }}>
                {canvaBrief.cover_title}
              </p>
            </div>

            {/* Subtitle */}
            <div style={{ paddingBottom: '16px', marginBottom: '16px', borderBottom: '1px solid #f0eee8' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', marginBottom: '8px' }}>
                <span style={SECTION_LABEL}>Subtitle / tagline</span>
                <CopyButton text={canvaBrief.subtitle} />
              </div>
              <p style={{ fontSize: '13px', fontStyle: 'italic', color: 'var(--sb-charcoal)', opacity: 0.8, margin: 0 }}>
                {canvaBrief.subtitle}
              </p>
            </div>

            {/* Colour palette */}
            <div style={{ paddingBottom: '16px', marginBottom: '16px', borderBottom: '1px solid #f0eee8' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', marginBottom: '8px' }}>
                <span style={SECTION_LABEL}>Colour palette</span>
                <CopyButton text={canvaBrief.colour_palette} />
              </div>
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '8px' }}>
                {[
                  { label: 'Dusty sage', hex: '#B5C9B7' },
                  { label: 'Warm linen', hex: '#EDE8DF' },
                  { label: 'Dusty rose', hex: '#D4A5A5' },
                  { label: 'Soft charcoal', hex: '#3D3D3D' },
                  { label: 'Off-white cream', hex: '#FAF8F5' },
                ].map(({ label, hex }) => (
                  <div key={hex} style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '11px', color: 'var(--sb-charcoal)', opacity: 0.7 }}>
                    <div style={{ width: '14px', height: '14px', borderRadius: '3px', backgroundColor: hex, border: '1px solid #d8e0d9', flexShrink: 0 }} />
                    {label}
                  </div>
                ))}
              </div>
              <p style={{ fontSize: '13px', lineHeight: 1.6, color: 'var(--sb-charcoal)', margin: 0 }}>
                {canvaBrief.colour_palette}
              </p>
            </div>

            {/* Font suggestions */}
            <div style={{ paddingBottom: '16px', marginBottom: '16px', borderBottom: '1px solid #f0eee8' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', marginBottom: '8px' }}>
                <span style={SECTION_LABEL}>Font suggestions</span>
                <CopyButton text={canvaBrief.font_suggestions} />
              </div>
              <p style={{ fontSize: '13px', lineHeight: 1.6, color: 'var(--sb-charcoal)', margin: 0 }}>
                {canvaBrief.font_suggestions}
              </p>
            </div>

            {/* Layout notes */}
            <div style={{ paddingBottom: '16px', marginBottom: '16px', borderBottom: '1px solid #f0eee8' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', marginBottom: '8px' }}>
                <span style={SECTION_LABEL}>Layout notes</span>
                <CopyButton text={canvaBrief.layout_notes} />
              </div>
              <div style={{ backgroundColor: '#f5f3ee', borderRadius: '6px', padding: '10px 12px', fontSize: '13px', lineHeight: 1.6, color: 'var(--sb-charcoal)' }}>
                {canvaBrief.layout_notes}
              </div>
            </div>

            {/* Illustration notes */}
            <div style={{ paddingBottom: '16px', marginBottom: '16px', borderBottom: '1px solid #f0eee8' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', marginBottom: '8px' }}>
                <span style={SECTION_LABEL}>Illustration notes</span>
                <CopyButton text={canvaBrief.illustration_notes} />
              </div>
              <p style={{ fontSize: '13px', lineHeight: 1.6, color: 'var(--sb-charcoal)', margin: 0 }}>
                {canvaBrief.illustration_notes}
              </p>
            </div>

            {/* Mood */}
            <div style={{ paddingBottom: '16px', marginBottom: '16px', borderBottom: '1px solid #f0eee8' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', marginBottom: '8px' }}>
                <span style={SECTION_LABEL}>Mood</span>
                <CopyButton text={canvaBrief.mood} />
              </div>
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                {canvaBrief.mood.split(',').map(m => m.trim()).filter(Boolean).map(m => (
                  <span key={m} style={{ fontSize: '12px', padding: '3px 10px', borderRadius: '9999px', backgroundColor: '#EDE8DF', color: '#5a5050' }}>
                    {m}
                  </span>
                ))}
              </div>
            </div>

            {/* Size spec */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', marginBottom: '8px' }}>
                <span style={SECTION_LABEL}>Size spec</span>
                <CopyButton text={canvaBrief.size_spec} />
              </div>
              <p style={{ fontSize: '13px', color: 'var(--sb-charcoal)', margin: 0, fontWeight: 500 }}>
                {canvaBrief.size_spec}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
