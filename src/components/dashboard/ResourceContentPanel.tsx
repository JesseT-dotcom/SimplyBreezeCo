'use client'

import { useState, useMemo } from 'react'
import { Check, ChevronDown, ChevronUp, Copy, FileText, Loader2, RefreshCw } from 'lucide-react'
import toast from 'react-hot-toast'
import type { ProductIdea, ResourceTheme, SupportingTextItem } from '@/lib/types'

// ── Shared copy helpers ──────────────────────────────────────────────────────

function CopyButton({ text, label = 'Copy' }: { text: string; label?: string }) {
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
        fontFamily: 'Inter, sans-serif', flexShrink: 0, whiteSpace: 'nowrap',
      }}
    >
      {copied ? <Check size={12} /> : <Copy size={12} />}
      {copied ? 'Copied' : label}
    </button>
  )
}

// ── Style constants ──────────────────────────────────────────────────────────

const SECTION_LABEL: React.CSSProperties = {
  fontSize: '11px', fontWeight: 500,
  textTransform: 'uppercase', letterSpacing: '0.08em',
  color: 'var(--sb-charcoal)', opacity: 0.55,
  display: 'block', marginBottom: '6px',
}

const INPUT_STYLE: React.CSSProperties = {
  width: '100%', boxSizing: 'border-box',
  border: '1px solid #d8e0d9', borderRadius: '6px',
  padding: '8px 10px', fontSize: '13px',
  color: 'var(--sb-charcoal)', fontFamily: 'Inter, sans-serif',
  backgroundColor: '#fff', outline: 'none',
}

// ── Supporting text section grouped by item_type ─────────────────────────────

function SupportingTextSection({ items }: { items: SupportingTextItem[] }) {
  const groups = useMemo(() => {
    const map = new Map<string, string[]>()
    for (const { item_type, content } of items) {
      if (!map.has(item_type)) map.set(item_type, [])
      map.get(item_type)!.push(content)
    }
    return Array.from(map.entries())
  }, [items])

  if (groups.length === 0) return null

  return (
    <div>
      <span style={SECTION_LABEL}>Supporting text</span>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        {groups.map(([type, lines]) => (
          <div key={type}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', marginBottom: '6px' }}>
              <span style={{ fontSize: '12px', fontWeight: 500, color: 'var(--sb-charcoal)', opacity: 0.7 }}>{type}</span>
              <CopyButton text={lines.join('\n')} label="Copy all" />
            </div>
            <ul style={{ margin: 0, paddingLeft: '0', listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '3px' }}>
              {lines.map((line, i) => (
                <li key={i} style={{ fontSize: '13px', color: 'var(--sb-charcoal)', padding: '4px 10px', backgroundColor: '#FAF8F5', borderRadius: '5px', borderLeft: '3px solid #B5C9B7' }}>
                  {line}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  )
}

// ── Single theme result block ─────────────────────────────────────────────────

function ThemeBlock({
  theme,
  index,
  regenLoading,
  onRegen,
}: {
  theme: ResourceTheme
  index: number
  regenLoading: number | null
  onRegen: (index: number) => void
}) {
  const [collapsed, setCollapsed] = useState(false)
  const isRegening = regenLoading === index

  const cardLabels = theme.cards.map(c => c.label).join('\n')
  const cardDescs = theme.cards.map(c => c.description).join('\n')

  return (
    <div style={{ border: '1px solid #d8e0d9', borderRadius: '10px', overflow: 'hidden' }}>
      {/* Theme header */}
      <div
        style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px',
          padding: '14px 16px', backgroundColor: '#FAF8F5', cursor: 'pointer',
          borderBottom: collapsed ? 'none' : '1px solid #e8e4dc',
        }}
      >
        <button
          onClick={() => setCollapsed(c => !c)}
          style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'none', border: 'none', cursor: 'pointer', padding: 0, flex: 1, textAlign: 'left' }}
        >
          {collapsed
            ? <ChevronDown size={15} style={{ color: 'var(--sb-charcoal)', opacity: 0.5, flexShrink: 0 }} />
            : <ChevronUp size={15} style={{ color: 'var(--sb-charcoal)', opacity: 0.5, flexShrink: 0 }} />
          }
          <span style={{ fontFamily: "'Playfair Display', serif", fontSize: '15px', fontWeight: 500, color: 'var(--sb-charcoal)' }}>
            {theme.theme_name}
          </span>
          <span style={{ fontSize: '11px', color: 'var(--sb-charcoal)', opacity: 0.4 }}>
            {theme.cards.length} cards
          </span>
        </button>

        <button
          onClick={() => onRegen(index)}
          disabled={regenLoading !== null}
          style={{
            display: 'flex', alignItems: 'center', gap: '5px',
            fontSize: '12px', fontWeight: 500,
            color: regenLoading !== null ? '#aaa' : '#2a3d2b',
            backgroundColor: regenLoading !== null ? '#f0eee8' : 'var(--sb-sage-light)',
            border: '1px solid #c0d0c1', borderRadius: '6px',
            padding: '5px 10px', cursor: regenLoading !== null ? 'default' : 'pointer',
            fontFamily: 'Inter, sans-serif', flexShrink: 0,
          }}
        >
          {isRegening
            ? <><Loader2 size={11} style={{ animation: 'spin 1s linear infinite' }} /> Regenerating…</>
            : <><RefreshCw size={11} /> Regenerate</>
          }
        </button>
      </div>

      {/* Theme content */}
      {!collapsed && (
        <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '24px' }}>

          {/* Cards */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', marginBottom: '10px' }}>
              <span style={SECTION_LABEL}>Cards ({theme.cards.length})</span>
              <div style={{ display: 'flex', gap: '6px' }}>
                <CopyButton text={cardLabels} label="Copy labels" />
                <CopyButton text={cardDescs} label="Copy descriptions" />
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
              {theme.cards.map((card, i) => (
                <div
                  key={i}
                  style={{
                    display: 'grid', gridTemplateColumns: '24px 1fr',
                    gap: '8px', alignItems: 'baseline',
                    padding: '6px 0',
                    borderBottom: i < theme.cards.length - 1 ? '1px solid #f5f3ee' : 'none',
                  }}
                >
                  <span style={{ fontSize: '11px', color: 'var(--sb-charcoal)', opacity: 0.35, textAlign: 'right', paddingTop: '1px' }}>
                    {i + 1}
                  </span>
                  <div>
                    <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--sb-charcoal)' }}>{card.label}</span>
                    <span style={{ fontSize: '13px', color: 'var(--sb-charcoal)', opacity: 0.55 }}> — {card.description}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* EYLF */}
          <div>
            <span style={SECTION_LABEL}>EYLF outcomes</span>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {theme.eylf_outcomes.map((o, i) => (
                <div key={i} style={{ backgroundColor: 'var(--sb-sage-light)', borderRadius: '8px', padding: '12px 14px' }}>
                  <p style={{ fontSize: '12px', fontWeight: 600, color: '#2a3d2b', margin: '0 0 4px 0' }}>{o.outcome}</p>
                  <p style={{ fontSize: '12px', color: '#2a3d2b', opacity: 0.8, margin: 0, lineHeight: 1.55 }}>{o.explanation}</p>
                </div>
              ))}
            </div>
          </div>

          {/* How to use */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', marginBottom: '8px' }}>
              <span style={SECTION_LABEL}>How to use</span>
              <CopyButton text={theme.how_to_use} />
            </div>
            <p style={{ fontSize: '13px', lineHeight: 1.7, color: 'var(--sb-charcoal)', margin: 0 }}>
              {theme.how_to_use}
            </p>
          </div>

          {/* Supporting text */}
          {theme.supporting_text.length > 0 && (
            <SupportingTextSection items={theme.supporting_text} />
          )}
        </div>
      )}
    </div>
  )
}

// ── Main panel ───────────────────────────────────────────────────────────────

export default function ResourceContentPanel({ idea }: { idea: ProductIdea }) {
  const [content, setContent] = useState<ResourceTheme[]>(idea.resource_content ?? [])
  const [generating, setGenerating] = useState(false)
  const [regenLoading, setRegenLoading] = useState<number | null>(null)
  const [error, setError] = useState<string | null>(null)

  // Form state
  const [themesRaw, setThemesRaw] = useState('')
  const [cardsPerTheme, setCardsPerTheme] = useState(12)
  const [ageGroup, setAgeGroup] = useState(idea.age_group ?? '')
  const [inclusions, setInclusions] = useState('')

  const parsedThemes = useMemo(
    () => themesRaw.split(',').map(s => s.trim()).filter(Boolean),
    [themesRaw]
  )

  // All theme names currently in content (for regen calls)
  const contentThemeNames = content.map(t => t.theme_name)

  async function handleGenerate() {
    if (parsedThemes.length === 0) {
      toast.error('Enter at least one theme name')
      return
    }
    setGenerating(true)
    setError(null)
    try {
      const res = await fetch('/api/generate-resource-content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ideaId: idea.id,
          title: idea.title,
          description: idea.description,
          ageGroup,
          productType: idea.product_type,
          themes: parsedThemes,
          cardsPerTheme,
          inclusions: inclusions || undefined,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Generation failed')
      setContent(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Generation failed')
    } finally {
      setGenerating(false)
    }
  }

  async function handleRegenTheme(index: number) {
    setRegenLoading(index)
    setError(null)
    try {
      const res = await fetch('/api/generate-resource-content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ideaId: idea.id,
          title: idea.title,
          description: idea.description,
          ageGroup,
          productType: idea.product_type,
          themes: contentThemeNames,
          cardsPerTheme: content[index]?.cards.length ?? cardsPerTheme,
          inclusions: inclusions || undefined,
          regenerateIndex: index,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Regeneration failed')
      setContent(data)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Regeneration failed')
    } finally {
      setRegenLoading(null)
    }
  }

  const isLoading = generating || regenLoading !== null

  return (
    <div>
      {/* Panel header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '16px', marginBottom: '24px' }}>
        <div>
          <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: '18px', fontWeight: 500, margin: '0 0 4px 0', color: 'var(--sb-charcoal)' }}>
            Resource Content Generator
          </h2>
          <p style={{ fontSize: '13px', color: 'var(--sb-charcoal)', opacity: 0.55, margin: 0 }}>
            Full card list, EYLF outcomes, instructions &amp; supporting text for Canva build
          </p>
        </div>
      </div>

      {/* Form */}
      <div style={{ backgroundColor: '#FAF8F5', borderRadius: '10px', padding: '20px', marginBottom: '24px', border: '1px solid #e8e4dc' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '16px', marginBottom: '14px', alignItems: 'end' }}>

          {/* Theme names */}
          <div>
            <label style={{ ...SECTION_LABEL, marginBottom: '6px' }}>
              Theme names <span style={{ opacity: 0.5, textTransform: 'none', letterSpacing: 0 }}>(comma-separated)</span>
            </label>
            <input
              type="text"
              value={themesRaw}
              onChange={e => setThemesRaw(e.target.value)}
              placeholder="e.g. Café, Restaurant, Supermarket"
              style={INPUT_STYLE}
              onFocus={e => e.currentTarget.style.boxShadow = '0 0 0 2px var(--sb-sage)'}
              onBlur={e => e.currentTarget.style.boxShadow = 'none'}
            />
            {parsedThemes.length > 0 && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginTop: '6px' }}>
                {parsedThemes.map(t => (
                  <span key={t} style={{ fontSize: '11px', padding: '2px 8px', borderRadius: '9999px', backgroundColor: '#EDE8DF', color: '#3D3D3D', border: '1px solid #B5C9B7' }}>
                    {t}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Cards per theme */}
          <div style={{ minWidth: '110px' }}>
            <label style={{ ...SECTION_LABEL, marginBottom: '6px' }}>Cards / theme</label>
            <input
              type="number"
              value={cardsPerTheme}
              min={4}
              max={30}
              onChange={e => setCardsPerTheme(Math.max(4, Math.min(30, Number(e.target.value))))}
              style={{ ...INPUT_STYLE, width: '110px' }}
              onFocus={e => e.currentTarget.style.boxShadow = '0 0 0 2px var(--sb-sage)'}
              onBlur={e => e.currentTarget.style.boxShadow = 'none'}
            />
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '14px' }}>
          {/* Age group */}
          <div>
            <label style={{ ...SECTION_LABEL, marginBottom: '6px' }}>Age group</label>
            <input
              type="text"
              value={ageGroup}
              onChange={e => setAgeGroup(e.target.value)}
              placeholder="e.g. 3–5 years"
              style={INPUT_STYLE}
              onFocus={e => e.currentTarget.style.boxShadow = '0 0 0 2px var(--sb-sage)'}
              onBlur={e => e.currentTarget.style.boxShadow = 'none'}
            />
          </div>

          {/* Specific inclusions */}
          <div>
            <label style={{ ...SECTION_LABEL, marginBottom: '6px' }}>
              Specific inclusions <span style={{ opacity: 0.5, textTransform: 'none', letterSpacing: 0 }}>(optional)</span>
            </label>
            <input
              type="text"
              value={inclusions}
              onChange={e => setInclusions(e.target.value)}
              placeholder="e.g. include a menu, play money, order pad"
              style={INPUT_STYLE}
              onFocus={e => e.currentTarget.style.boxShadow = '0 0 0 2px var(--sb-sage)'}
              onBlur={e => e.currentTarget.style.boxShadow = 'none'}
            />
          </div>
        </div>

        <button
          onClick={handleGenerate}
          disabled={isLoading || parsedThemes.length === 0}
          style={{
            backgroundColor: isLoading || parsedThemes.length === 0 ? 'var(--sb-sage-light)' : 'var(--sb-sage)',
            color: '#1a2e1b',
            border: 'none', borderRadius: '8px',
            padding: '9px 20px', fontSize: '13px', fontWeight: 500,
            cursor: isLoading || parsedThemes.length === 0 ? 'default' : 'pointer',
            fontFamily: 'Inter, sans-serif', display: 'flex', alignItems: 'center', gap: '7px',
          }}
        >
          {generating && <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} />}
          {generating
            ? `Generating ${parsedThemes.length} theme${parsedThemes.length > 1 ? 's' : ''}…`
            : content.length > 0
              ? 'Regenerate all'
              : `Generate resource content`
          }
        </button>
      </div>

      {/* Error */}
      {error && (
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px',
          backgroundColor: 'var(--sb-rose-light)', border: '1px solid var(--sb-rose)',
          borderRadius: '8px', padding: '10px 14px', marginBottom: '16px',
        }}>
          <p style={{ fontSize: '13px', color: '#7f1d1d', margin: 0 }}>{error}</p>
          <button
            onClick={handleGenerate}
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
      {generating && (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '48px 24px', gap: '12px' }}>
          <Loader2 size={28} style={{ color: 'var(--sb-sage-dark)', animation: 'spin 1s linear infinite' }} />
          <p style={{ fontSize: '13px', color: 'var(--sb-charcoal)', opacity: 0.55, margin: 0 }}>
            Writing content for {parsedThemes.length} theme{parsedThemes.length > 1 ? 's' : ''}… this takes a moment
          </p>
          <style>{`@keyframes spin { from { transform: rotate(0deg) } to { transform: rotate(360deg) } }`}</style>
        </div>
      )}

      {/* Empty state */}
      {!generating && content.length === 0 && !error && (
        <div style={{
          border: '2px dashed #d8e0d9', borderRadius: '10px',
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          padding: '48px 24px', gap: '10px',
        }}>
          <FileText size={32} style={{ color: 'var(--sb-sage-dark)', opacity: 0.4 }} />
          <p style={{ fontSize: '13px', color: 'var(--sb-charcoal)', opacity: 0.4, margin: 0 }}>
            Enter theme names above and click Generate
          </p>
        </div>
      )}

      {/* Results */}
      {!generating && content.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <style>{`@keyframes spin { from { transform: rotate(0deg) } to { transform: rotate(360deg) } }`}</style>
          {content.map((theme, i) => (
            <ThemeBlock
              key={`${theme.theme_name}-${i}`}
              theme={theme}
              index={i}
              regenLoading={regenLoading}
              onRegen={handleRegenTheme}
            />
          ))}

          {/* Export links */}
          <div style={{ marginTop: '6px', padding: '16px 20px', backgroundColor: '#FAF8F5', border: '1px solid #e8e4dc', borderRadius: '10px', display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '12px', fontWeight: 500, color: 'var(--sb-charcoal)', opacity: 0.55, flexShrink: 0 }}>
              Export link{content.length > 1 ? 's' : ''}
            </span>
            {content.length === 1 ? (
              <CopyButton
                text={`https://simply-breeze-co.vercel.app/resources/${idea.id}/export`}
                label="Copy export link"
              />
            ) : (
              content.map(t => (
                <CopyButton
                  key={t.theme_name}
                  text={`https://simply-breeze-co.vercel.app/resources/${idea.id}/export?theme=${encodeURIComponent(t.theme_name)}`}
                  label={`Copy ${t.theme_name} link`}
                />
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}
