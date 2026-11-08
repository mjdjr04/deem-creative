// Home-page experience summary: a short bio, four headline numbers, and one
// line each for the roles that best show the range. The summary and stats are
// the defaults for the CMS experience section (editable in /admin); the full
// timeline lives at /experience.

export const EXPERIENCE_SUMMARY =
  "I'm a filmmaker and builder for organizations that serve their communities. I've edited for FOX Sports Digital, grown the NJ Chamber Foundation's Instagram views 462%, and helped run a 450-person national institute for the Bonner Foundation. Today I'm Director of Special Projects at the Boys & Girls Clubs of Cumberland County, where I make the films and build the tools behind the work."

export const EXPERIENCE_STATS = [
  { value: '462%', label: 'Instagram view growth, Sep–Dec 2025 · NJ Chamber of Commerce Foundation' },
  { value: '125+', label: 'registered guests at a gala I produced end to end · Boys & Girls Clubs of Cumberland County' },
  { value: '450+', label: 'students, faculty, and staff at a national institute I helped run · Bonner Foundation' },
  { value: '5', label: 'in-house tools shipped in three months · Boys & Girls Clubs of Cumberland County' },
]

// Ordered. `match` takes an experience item. The first entry also carries a
// `fallback` for data that predates the current-role entry.
export const EXPERIENCE_HIGHLIGHTS = [
  {
    match: (it) => it.type === 'current' && /Boys & Girls/.test(it.organization || ''),
    fallback: (it) => it.id === 'bgcc',
    line: 'Produced the 2026 Gala end to end for 125+ registered guests, from the tribute film to check-in, and shipped five in-house tools in three months.',
  },
  {
    match: (it) => it.id === 'fox-sports',
    line: 'Edited social-first video and prepared archival World Cup footage for FOX Sports digital and broadcast programming.',
  },
  {
    match: (it) => it.id === 'njccf',
    line: "Grew Instagram views 462% and interactions 696% from September to December 2025 for the Foundation's workforce-development programs.",
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
