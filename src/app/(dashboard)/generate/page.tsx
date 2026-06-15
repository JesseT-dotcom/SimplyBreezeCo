'use client'

import { useState } from 'react'
import { Sparkles, Loader2, Check } from 'lucide-react'
import toast from 'react-hot-toast'
import type { GeneratedIdea, GeneratedOutline, GeneratedSeo } from '@/lib/types'

type GenerateResult = {
  ideas: GeneratedIdea[] | null
  outline: GeneratedOutline | null
  seo: GeneratedSeo | null
  error?: string
}

const AGE_GROUPS = ['0–2 yrs', '2–3 yrs', '3–5 yrs', '5–6 yrs']
const CURRICULUM_AREAS = ['Literacy', 'Numeracy', 'STEM', 'Creative Arts', 'Outdoor Play', 'Social & Emotional', 'Sensory Play', 'Fine Motor']
const SEASONAL_OPTIONS = ['Back to kindy', 'Autumn', 'Winter', 'Spring', 'Christmas', 'NAIDOC Week', 'Book Week', 'Easter']

const SECTION_LABEL: React.CSSProperties = {
  fontSize: '12px',
  fontWeight: 500,
  textTransform: 'uppercase',
  color: 'var(--sb-charcoal)',
  opacity: 0.6,
  letterSpacing: '0.08em',
  display: 'block',
  marginBottom: '10px',
}

const CARD_STYLE: React.CSSProperties = {
  backgroundColor: '#ffffff',
  border: '1px solid #d8e0d9',
  borderRadius: '12px',
  padding: '24px',
}

function SagePill({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        padding: '6px 14px',
        borderRadius: '9999px',
        fontSize: '13px',
        cursor: 'pointer',
        border: active ? '1px solid var(--sb-sage-dark)' : '1px solid #c0d0c1',
        backgroundColor: active ? 'var(--sb-sage)' : 'var(--sb-sage-light)',
        color: active ? '#1a2e1b' : '#2a3d2b',
        transition: 'all 0.15s',
        fontWeight: active ? 500 : 400,
      }}
    >
      {label}
    </button>
  )
}

function RosePill({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        padding: '6px 14px',
        borderRadius: '9999px',
        fontSize: '13px',
        cursor: 'pointer',
        border: active ? '1px solid var(--sb-rose)' : '1px solid #e0c5c5',
        backgroundColor: active ? 'var(--sb-rose-light)' : '#f5ebeb',
        color: active ? '#5a2a2a' : '#7a5555',
        transition: 'all 0.15s',
        fontWeight: active ? 500 : 400,
      }}
    >
      {label}
    </button>
  )
}

function SkeletonCards() {
  return (
    <div>
      {[0, 1, 2].map(i => (
        <div key={i} style={{ border: '1px solid #d8e0d9', borderRadius: '8px', padding: '16px', marginBottom: '12px' }}>
          <div className="animate-pulse">
            <div style={{ height: '20px', backgroundColor: '#e8e5e0', borderRadius: '4px', marginBottom: '12px', width: '65%' }} />
            <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
              <div style={{ height: '24px', width: '80px', backgroundColor: '#e8e5e0', borderRadius: '9999px' }} />
              <div style={{ height: '24px', width: '60px', backgroundColor: '#e8e5e0', borderRadius: '9999px' }} />
            </div>
            <div style={{ height: '14px', backgroundColor: '#e8e5e0', borderRadius: '4px', marginBottom: '8px' }} />
            <div style={{ height: '14px', backgroundColor: '#e8e5e0', borderRadius: '4px', width: '80%' }} />
          </div>
        </div>
      ))}
    </div>
  )
}

function IdeaCard({
  idea,
  index,
  saved,
  saving,
  onSave,
}: {
  idea: GeneratedIdea
  index: number
  saved: boolean
  saving: boolean
  onSave: () => void
}) {
  return (
    <div style={{ border: '1px solid #d8e0d9', borderRadius: '8px', padding: '16px', marginBottom: '12px' }}>
      <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: '16px', fontWeight: 500, margin: '0 0 10px 0', color: 'var(--sb-charcoal)' }}>
        {idea.title}
      </h3>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '12px', alignItems: 'center' }}>
        <span style={{ backgroundColor: 'var(--sb-sage-light)', color: '#2a4d2c', fontSize: '12px', padding: '3px 10px', borderRadius: '9999px', border: '1px solid var(--sb-sage)' }}>
          {idea.type}
        </span>
        <span style={{ backgroundColor: '#d0e8d1', color: '#2a4d2c', fontSize: '12px', padding: '3px 10px', borderRadius: '9999px' }}>
          {idea.price}
        </span>
        {idea.hook && (
          <span style={{ backgroundColor: 'var(--sb-rose-light)', color: '#5a2a2a', fontSize: '12px', padding: '3px 10px', borderRadius: '9999px' }}>
            {idea.hook}
          </span>
        )}
      </div>

      <p style={{ fontSize: '14px', lineHeight: 1.6, color: 'var(--sb-charcoal)', margin: '0 0 12px 0' }}>
        {idea.description}
      </p>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginBottom: '14px' }}>
        {idea.tags.map(tag => (
          <span key={tag} style={{ backgroundColor: '#f0eee8', color: '#5a5a58', fontSize: '11px', padding: '2px 8px', borderRadius: '9999px' }}>
            {tag}
          </span>
        ))}
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <button
          onClick={onSave}
          disabled={saved || saving}
          style={{
            padding: '6px 12px',
            borderRadius: '6px',
            fontSize: '13px',
            fontWeight: 500,
            cursor: saved || saving ? 'default' : 'pointer',
            border: saved ? 'none' : '1px solid var(--sb-sage-dark)',
            backgroundColor: saved ? 'var(--sb-sage)' : 'transparent',
            color: saved ? '#1a2e1b' : 'var(--sb-sage-dark)',
            display: 'flex',
            alignItems: 'center',
            gap: '5px',
            transition: 'background-color 0.15s',
          }}
          onMouseEnter={e => { if (!saved && !saving) e.currentTarget.style.backgroundColor = 'var(--sb-sage-light)' }}
          onMouseLeave={e => { if (!saved && !saving) e.currentTarget.style.backgroundColor = 'transparent' }}
        >
          {saved ? <><Check size={13} /> Saved ✓</> : saving ? <Loader2 size={13} className="animate-spin" /> : 'Save to dashboard'}
        </button>
      </div>
    </div>
  )
}

function OutlineTab({ outline }: { outline: GeneratedOutline }) {
  return (
    <div style={{ padding: '20px 0' }}>
      <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: '18px', fontWeight: 500, margin: '0 0 20px 0', color: 'var(--sb-charcoal)' }}>
        {outline.packTitle}
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6" style={{ marginBottom: '20px' }}>
        <div>
          <p style={{ ...SECTION_LABEL, marginBottom: '8px' }}>Learning outcomes</p>
          <ul style={{ margin: 0, paddingLeft: '18px' }}>
            {outline.learningOutcomes.map((o, i) => (
              <li key={i} style={{ fontSize: '14px', lineHeight: 1.6, color: 'var(--sb-charcoal)', marginBottom: '4px' }}>{o}</li>
            ))}
          </ul>
        </div>
        <div>
          <p style={{ ...SECTION_LABEL, marginBottom: '8px' }}>EYLF links</p>
          <ul style={{ margin: 0, paddingLeft: '18px' }}>
            {outline.eylf.map((e, i) => (
              <li key={i} style={{ fontSize: '14px', lineHeight: 1.6, color: 'var(--sb-charcoal)', marginBottom: '4px' }}>{e}</li>
            ))}
          </ul>
        </div>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <p style={{ ...SECTION_LABEL, marginBottom: '12px' }}>Activities</p>
        {outline.activities.map((activity, i) => (
          <div key={i} style={{ border: '1px solid #d8e0d9', borderRadius: '8px', padding: '12px 14px', marginBottom: '8px' }}>
            <p style={{ fontSize: '14px', fontWeight: 500, margin: '0 0 4px 0', color: 'var(--sb-charcoal)' }}>{activity.name}</p>
            <p style={{ fontSize: '13px', color: 'var(--sb-charcoal)', opacity: 0.7, margin: '0 0 4px 0' }}>{activity.description}</p>
            <p style={{ fontSize: '13px', color: 'var(--sb-charcoal)', opacity: 0.55, margin: 0, fontStyle: 'italic' }}>Materials: {activity.materials}</p>
          </div>
        ))}
      </div>

      <div style={{ marginBottom: '20px' }}>
        <p style={{ ...SECTION_LABEL, marginBottom: '8px' }}>Printables included</p>
        <ul style={{ margin: 0, paddingLeft: '18px' }}>
          {outline.printables.map((p, i) => (
            <li key={i} style={{ fontSize: '14px', lineHeight: 1.6, color: 'var(--sb-charcoal)', marginBottom: '4px' }}>{p}</li>
          ))}
        </ul>
      </div>

      <div>
        <p style={{ ...SECTION_LABEL, marginBottom: '8px' }}>Differentiation</p>
        <div style={{ backgroundColor: '#f5f3ee', borderRadius: '6px', padding: '12px', fontSize: '14px', lineHeight: 1.6, color: 'var(--sb-charcoal)' }}>
          {outline.differentiationTips}
        </div>
      </div>
    </div>
  )
}

function SeoTab({ seo }: { seo: GeneratedSeo }) {
  const competitionColor = (c: string) => {
    if (c === 'low') return { bg: '#d0e8d1', text: '#2a4d2c' }
    if (c === 'medium') return { bg: '#fef3c7', text: '#78350f' }
    return { bg: '#fee2e2', text: '#7f1d1d' }
  }

  return (
    <div style={{ padding: '20px 0' }}>
      <div style={{ marginBottom: '20px' }}>
        <p style={SECTION_LABEL}>Primary keyword</p>
        <p style={{ fontSize: '20px', fontWeight: 500, color: 'var(--sb-sage-dark)', margin: 0 }}>{seo.primaryKeyword}</p>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <p style={SECTION_LABEL}>Optimised title formula</p>
        <p style={{ fontSize: '14px', fontStyle: 'italic', color: 'var(--sb-charcoal)', opacity: 0.8, margin: 0 }}>{seo.titleFormula}</p>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <p style={{ ...SECTION_LABEL, marginBottom: '10px' }}>Keywords</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          {seo.keywords.map((kw, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', padding: '8px 10px', borderRadius: '6px', backgroundColor: '#fafaf8', border: '1px solid #ede9e3' }}>
              <span style={{ fontSize: '13px', color: 'var(--sb-charcoal)', flex: 1, minWidth: '120px' }}>{kw.keyword}</span>
              <span style={{
                fontSize: '11px', padding: '2px 8px', borderRadius: '9999px',
                backgroundColor: kw.intent === 'buyer' ? 'var(--sb-sage)' : 'transparent',
                color: kw.intent === 'buyer' ? '#1a2e1b' : '#2a4d2c',
                border: kw.intent === 'buyer' ? 'none' : '1px solid var(--sb-sage)',
              }}>
                {kw.intent}
              </span>
              <span style={{ fontSize: '11px', padding: '2px 8px', borderRadius: '9999px', backgroundColor: competitionColor(kw.competition).bg, color: competitionColor(kw.competition).text }}>
                {kw.competition}
              </span>
              {kw.auNzRelevance === 'high' && (
                <span style={{ fontSize: '11px', color: 'var(--sb-sage-dark)' }}>✓ AU/NZ</span>
              )}
            </div>
          ))}
        </div>
      </div>

      <div>
        <p style={SECTION_LABEL}>Description opener</p>
        <blockquote style={{ borderLeft: '3px solid var(--sb-sage)', paddingLeft: '12px', margin: 0, fontSize: '14px', fontStyle: 'italic', lineHeight: 1.6, color: 'var(--sb-charcoal)' }}>
          {seo.descriptionOpener}
        </blockquote>
      </div>
    </div>
  )
}

export default function GeneratePage() {
  const [ageGroup, setAgeGroup] = useState('')
  const [curriculumAreas, setCurriculumAreas] = useState<string[]>([])
  const [theme, setTheme] = useState('')
  const [seasonalHook, setSeasonalHook] = useState<string[]>([])
  const [numIdeas, setNumIdeas] = useState(3)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<GenerateResult | null>(null)
  const [activeTab, setActiveTab] = useState<'ideas' | 'outline' | 'seo'>('ideas')
  const [savedIdeas, setSavedIdeas] = useState<Set<number>>(new Set())
  const [savingIdeas, setSavingIdeas] = useState<Set<number>>(new Set())

  function toggleCurriculum(area: string) {
    setCurriculumAreas(prev => prev.includes(area) ? prev.filter(a => a !== area) : [...prev, area])
  }

  function toggleSeasonal(hook: string) {
    setSeasonalHook(prev => prev.includes(hook) ? prev.filter(h => h !== hook) : [...prev, hook])
  }

  async function handleGenerate() {
    if (!ageGroup || !theme || curriculumAreas.length === 0) {
      toast.error('Please fill in age group, at least one curriculum area, and a theme.')
      return
    }

    setLoading(true)
    setResult(null)

    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ageGroup,
          curriculumAreas,
          theme,
          seasonalHook: seasonalHook.length > 0 ? seasonalHook.join(', ') : undefined,
          numIdeas,
        }),
      })

      const data: GenerateResult = await res.json()

      if (!data.ideas) {
        toast.error(data.error ?? 'Generation failed. Please try again.')
      } else {
        setResult(data)
        setActiveTab('ideas')
        setSavedIdeas(new Set())
        if (data.error) toast.error(`Partial results: ${data.error}`)
      }
    } catch {
      toast.error('Generation failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  async function handleSave(idea: GeneratedIdea, index: number) {
    if (savedIdeas.has(index) || savingIdeas.has(index) || !result) return

    setSavedIdeas(prev => new Set(prev).add(index))

    try {
      const res = await fetch('/api/ideas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          idea,
          outline: result.outline,
          seo: result.seo,
          ageGroup,
          curriculumAreas,
          theme,
          seasonalHook: seasonalHook.length > 0 ? seasonalHook.join(', ') : undefined,
        }),
      })

      if (res.ok) {
        toast.success('Idea saved to dashboard!')
      } else {
        setSavedIdeas(prev => { const n = new Set(prev); n.delete(index); return n })
        toast.error('Failed to save idea.')
      }
    } catch {
      setSavedIdeas(prev => { const n = new Set(prev); n.delete(index); return n })
      toast.error('Failed to save idea.')
    } finally {
      setSavingIdeas(prev => { const n = new Set(prev); n.delete(index); return n })
    }
  }

  const tabs: { key: 'ideas' | 'outline' | 'seo'; label: string }[] = [
    { key: 'ideas', label: 'Product ideas' },
    { key: 'outline', label: 'Resource outline' },
    { key: 'seo', label: 'SEO & keywords' },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

      {/* LEFT — Input */}
      <div style={CARD_STYLE}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

          {/* Age group */}
          <div>
            <span style={SECTION_LABEL}>Age group</span>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
              {AGE_GROUPS.map(ag => (
                <SagePill key={ag} label={ag} active={ageGroup === ag} onClick={() => setAgeGroup(ag)} />
              ))}
            </div>
          </div>

          {/* Curriculum areas */}
          <div>
            <span style={SECTION_LABEL}>Curriculum areas</span>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
              {CURRICULUM_AREAS.map(area => (
                <SagePill key={area} label={area} active={curriculumAreas.includes(area)} onClick={() => toggleCurriculum(area)} />
              ))}
            </div>
          </div>

          {/* Theme */}
          <div>
            <span style={SECTION_LABEL}>Theme / topic</span>
            <input
              type="text"
              value={theme}
              onChange={e => setTheme(e.target.value)}
              placeholder="e.g. insects, ocean, feelings, Australia…"
              style={{
                border: '1px solid #d8e0d9',
                borderRadius: '6px',
                padding: '10px 12px',
                fontSize: '14px',
                outline: 'none',
                width: '100%',
                boxSizing: 'border-box',
                color: 'var(--sb-charcoal)',
                backgroundColor: '#fff',
              }}
              onFocus={e => e.currentTarget.style.boxShadow = '0 0 0 2px var(--sb-sage)'}
              onBlur={e => e.currentTarget.style.boxShadow = 'none'}
            />
          </div>

          {/* Seasonal hook */}
          <div>
            <span style={SECTION_LABEL}>Seasonal / trending (optional)</span>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
              {SEASONAL_OPTIONS.map(s => (
                <RosePill key={s} label={s} active={seasonalHook.includes(s)} onClick={() => toggleSeasonal(s)} />
              ))}
            </div>
          </div>

          {/* Number of ideas */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
              <span style={SECTION_LABEL}>Number of product ideas</span>
              <span style={{ fontSize: '14px', fontWeight: 500, color: 'var(--sb-charcoal)' }}>{numIdeas}</span>
            </div>
            <input
              type="range"
              min={1}
              max={5}
              step={1}
              value={numIdeas}
              onChange={e => setNumIdeas(Number(e.target.value))}
              style={{ width: '100%', accentColor: 'var(--sb-sage-dark)', cursor: 'pointer' }}
            />
          </div>

          {/* Generate button */}
          <button
            onClick={handleGenerate}
            disabled={loading}
            style={{
              backgroundColor: 'var(--sb-sage)',
              color: '#1a2e1b',
              border: 'none',
              borderRadius: '8px',
              padding: '12px',
              fontSize: '15px',
              fontWeight: 500,
              cursor: loading ? 'not-allowed' : 'pointer',
              width: '100%',
              opacity: loading ? 0.5 : 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              transition: 'background-color 0.15s',
            }}
            onMouseEnter={e => { if (!loading) e.currentTarget.style.backgroundColor = 'var(--sb-sage-dark)' }}
            onMouseLeave={e => { if (!loading) e.currentTarget.style.backgroundColor = 'var(--sb-sage)' }}
          >
            {loading
              ? <><Loader2 size={16} className="animate-spin" /> Generating…</>
              : <><Sparkles size={16} /> Generate ideas</>
            }
          </button>
        </div>
      </div>

      {/* RIGHT — Output */}
      <div style={CARD_STYLE}>
        {!result && !loading && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '300px', color: '#aaa' }}>
            <Sparkles size={48} style={{ color: 'var(--sb-sage)', marginBottom: '12px' }} />
            <p style={{ margin: 0, fontSize: '14px' }}>Your ideas will appear here</p>
          </div>
        )}

        {loading && <SkeletonCards />}

        {result && !loading && (
          <>
            {/* Tabs */}
            <div style={{ borderBottom: '1px solid #d8e0d9', display: 'flex', marginBottom: '4px' }}>
              {tabs.map(tab => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  style={{
                    padding: '12px 14px',
                    fontSize: '14px',
                    border: 'none',
                    background: 'none',
                    cursor: 'pointer',
                    color: activeTab === tab.key ? 'var(--sb-charcoal)' : '#888',
                    fontWeight: activeTab === tab.key ? 500 : 400,
                    borderBottom: activeTab === tab.key ? '2px solid var(--sb-sage-dark)' : '2px solid transparent',
                    marginBottom: '-1px',
                    transition: 'color 0.15s',
                    whiteSpace: 'nowrap',
                  }}
                  onMouseEnter={e => { if (activeTab !== tab.key) e.currentTarget.style.color = 'var(--sb-charcoal)' }}
                  onMouseLeave={e => { if (activeTab !== tab.key) e.currentTarget.style.color = '#888' }}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Tab: Ideas */}
            {activeTab === 'ideas' && (
              <div style={{ paddingTop: '16px' }}>
                {result.ideas
                  ? result.ideas.map((idea, i) => (
                    <IdeaCard
                      key={i}
                      idea={idea}
                      index={i}
                      saved={savedIdeas.has(i)}
                      saving={savingIdeas.has(i)}
                      onSave={() => handleSave(idea, i)}
                    />
                  ))
                  : <p style={{ color: '#888', fontSize: '14px' }}>No ideas were generated. Please try again.</p>
                }
              </div>
            )}

            {/* Tab: Outline */}
            {activeTab === 'outline' && (
              result.outline
                ? <OutlineTab outline={result.outline} />
                : <p style={{ color: '#888', fontSize: '14px', paddingTop: '16px' }}>Outline unavailable.</p>
            )}

            {/* Tab: SEO */}
            {activeTab === 'seo' && (
              result.seo
                ? <SeoTab seo={result.seo} />
                : <p style={{ color: '#888', fontSize: '14px', paddingTop: '16px' }}>SEO data unavailable.</p>
            )}
          </>
        )}
      </div>
    </div>
  )
}
