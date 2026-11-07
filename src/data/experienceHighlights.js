// Home-page experience summary: a short bio, four headline numbers, and one
// line each for the roles that best show the range. The full timeline lives
// at /experience.

export const EXPERIENCE_SUMMARY =
  "I'm a Film & Television graduate of Rider University who has edited for FOX Sports, grown social channels for nonprofits, and run national programs for the Bonner Foundation. Today I lead special projects at the Boys & Girls Clubs of Cumberland County, where I make the films and build the tools behind the work."

export const EXPERIENCE_STATS = [
  { value: '462%', label: 'Instagram view growth in 6 months · NJ Chamber of Commerce Foundation' },
  { value: '450+', label: 'attendees at the Bonner Summer Leadership Institute I helped run' },
  { value: '18', label: 'partner programs onboarded to Notion · Bonner Foundation' },
  { value: '2026', label: 'World Cup build-up, editing at FOX Sports Digital' },
]

// Ordered. `match` takes an experience item. The first entry also carries a
// `fallback` for data that predates the current-role entry.
export const EXPERIENCE_HIGHLIGHTS = [
  {
    match: (it) => it.type === 'current' && /Boys & Girls/.test(it.organization || ''),
    fallback: (it) => it.id === 'bgcc',
    line: 'Lead special projects across video, events, technology, and communications, including the 2026 Gala from tribute film to check-in.',
  },
  {
    match: (it) => it.id === 'fox-sports',
    line: 'Edited social-first video and prepared archival World Cup footage for FOX Sports digital and broadcast programming.',
  },
  {
    match: (it) => it.id === 'njccf',
    line: "Grew Instagram views 462% and reach 317% in six months for the Foundation's workforce-development programs.",
  },
  {
    match: (it) => it.id === 'bonner',
    line: 'Helped run a 450-person national leadership institute and led a Notion rollout across 18 partner programs.',
  },
]

// Returns [{ item, line }] in highlight order. Uses the first unused item each
// match finds, skips highlights with no match, never reuses an item.
export function pickHighlights(items) {
  const list = Array.isArray(items) ? items : []
  const used = new Set()
  const out = []
  for (const h of EXPERIENCE_HIGHLIGHTS) {
    const free = list.filter((it) => it && !used.has(it))
    const item = free.find(h.match) || (h.fallback ? free.find(h.fallback) : undefined)
    if (!item) continue
    used.add(item)
    out.push({ item, line: h.line })
  }
  return out
}
