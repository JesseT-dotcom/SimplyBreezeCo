import { createClient } from '@supabase/supabase-js'
import { notFound } from 'next/navigation'
import type { ResourceTheme, SupportingTextItem } from '@/lib/types'

// Service-role client — bypasses RLS so this route needs no session.
function adminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  )
}

// Normalise a theme name or query param to a comparable slug.
// "Café / Coffee Shop" → "cafe / coffee shop"
// "farmers_market"    → "farmers market"
function normalise(s: string) {
  return s.toLowerCase().replace(/_/g, ' ').trim()
}

function themeMatches(themeName: string, filter: string) {
  const n = normalise(themeName)
  const f = normalise(filter)
  // Accept substring match so "cafe" matches "Café / Coffee Shop"
  return n.includes(f) || f.includes(n)
}

// ── Markdown builders ─────────────────────────────────────────────────────────

function renderSupportingText(items: SupportingTextItem[]): string {
  if (items.length === 0) return ''

  const groups = new Map<string, string[]>()
  for (const { item_type, content } of items) {
    if (!groups.has(item_type)) groups.set(item_type, [])
    groups.get(item_type)!.push(content)
  }

  const lines: string[] = ['### Supporting text', '']
  for (const [type, contents] of groups) {
    lines.push(`**${type}**`, '')
    for (const c of contents) lines.push(`- ${c}`)
    lines.push('')
  }
  return lines.join('\n')
}

function renderTheme(theme: ResourceTheme): string {
  const lines: string[] = []

  // Cards
  lines.push('#### Cards', '')
  theme.cards.forEach((card, i) => {
    lines.push(`${i + 1}. **${card.label}** — ${card.description}`)
  })
  lines.push('')

  // EYLF outcomes
  lines.push('#### EYLF outcomes', '')
  for (const o of theme.eylf_outcomes) {
    lines.push(`- **${o.outcome}**`)
    lines.push(`  ${o.explanation}`)
    lines.push('')
  }

  // How to use
  lines.push('#### How to use', '', theme.how_to_use, '')

  // Supporting text (optional)
  const suppText = renderSupportingText(theme.supporting_text)
  if (suppText) lines.push(suppText)

  return lines.join('\n')
}

function buildMarkdown(
  title: string,
  ageGroup: string,
  description: string,
  themes: ResourceTheme[],
): string {
  const lines: string[] = [
    `# ${title}`,
    '',
    `**Age group:** ${ageGroup || 'Not specified'}`,
    `**Description:** ${description}`,
    '',
    '---',
    '',
  ]

  for (const theme of themes) {
    lines.push(`## ${theme.theme_name}`, '')
    lines.push(renderTheme(theme))
    lines.push('---', '')
  }

  return lines.join('\n').trimEnd() + '\n'
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default async function ExportPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const { id } = await params
  const { theme: themeFilter } = await searchParams

  const supabase = adminClient()

  const { data, error } = await supabase
    .from('product_ideas')
    .select('title, age_group, description, resource_content')
    .eq('id', id)
    .single()

  if (error || !data) notFound()

  const allThemes: ResourceTheme[] = Array.isArray(data.resource_content)
    ? (data.resource_content as ResourceTheme[])
    : []

  if (allThemes.length === 0) {
    const md = `# ${data.title}\n\nNo resource content has been generated for this idea yet.\n`
    return <pre style={{ fontFamily: 'monospace', whiteSpace: 'pre-wrap', padding: '2rem' }}>{md}</pre>
  }

  // Filter or keep all
  const filter = typeof themeFilter === 'string' ? themeFilter.trim() : ''
  const themes = filter
    ? allThemes.filter(t => themeMatches(t.theme_name, filter))
    : allThemes

  if (filter && themes.length === 0) {
    const available = allThemes.map(t => t.theme_name).join(', ')
    const md = `# ${data.title}\n\nNo theme matching "${filter}" found.\n\n**Available themes:** ${available}\n`
    return <pre style={{ fontFamily: 'monospace', whiteSpace: 'pre-wrap', padding: '2rem' }}>{md}</pre>
  }

  const markdown = buildMarkdown(
    data.title,
    data.age_group ?? '',
    data.description ?? '',
    themes,
  )

  return (
    <pre style={{ fontFamily: 'monospace', whiteSpace: 'pre-wrap', padding: '2rem', margin: 0 }}>
      {markdown}
    </pre>
  )
}
