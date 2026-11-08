import { describe, it, expect } from 'vitest'
import { pickHighlights, EXPERIENCE_STATS, EXPERIENCE_HIGHLIGHTS } from '../src/data/experienceHighlights.js'
import { experiences } from '../src/data/experience.js'

const BG = 'Boys & Girls Clubs of Cumberland County'
const live = [
  { id: 'exp-1791336650664', role: 'Director of Special Projects', organization: BG, type: 'current', startDate: 'Sep 2026', endDate: 'Present' },
  { id: 'bgcc', role: 'Creative Marketing Consultant', organization: BG, type: 'past', startDate: 'May 2026', endDate: 'Sep 2026' },
  { id: 'njccf', role: 'Social Media Marketing Assistant', organization: 'NJ Chamber of Commerce Foundation', type: 'past' },
  { id: 'fox-sports', role: 'Digital Post-Production Intern', organization: 'FOX Sports', type: 'past' },
  { id: 'dpa-group', organization: 'DPA Group', type: 'past' },
  { id: 'bonner', role: 'National Foundation Summer Intern', organization: 'The Bonner Foundation', type: 'past' },
  { id: 'rider', role: 'Film & Television', organization: 'Rider University', type: 'education' },
]

describe('pickHighlights', () => {
  it('live-like list: Director first, then FOX, NJCCF, Bonner, no repeats', () => {
    const r = pickHighlights(live)
    expect(r.map((x) => x.item.id)).toEqual(['exp-1791336650664', 'fox-sports', 'njccf', 'bonner'])
    expect(r.map((x) => x.line)).toEqual(EXPERIENCE_HIGHLIGHTS.map((h) => h.line))
    expect(new Set(r.map((x) => x.item)).size).toBe(r.length)
  })

  it('bundled defaults: the current Director entry fills the first slot', () => {
    const r = pickHighlights(experiences)
    expect(r.map((x) => x.item.id)).toEqual(['exp-1791336650664', 'fox-sports', 'njccf', 'bonner'])
  })

  it('falls back to id bgcc when it is not marked current', () => {
    const r = pickHighlights(live.filter((x) => x.id !== 'exp-1791336650664'))
    expect(r[0].item.id).toBe('bgcc')
  })

  it('skips highlights with no match and tolerates bad input', () => {
    expect(pickHighlights(live.filter((x) => x.id !== 'fox-sports')).map((x) => x.item.id))
      .toEqual(['exp-1791336650664', 'njccf', 'bonner'])
    expect(pickHighlights(undefined)).toEqual([])
    expect(pickHighlights([])).toEqual([])
  })
})

describe('stats', () => {
  it('has four value/label pairs', () => {
    expect(EXPERIENCE_STATS).toHaveLength(4)
    for (const s of EXPERIENCE_STATS) expect(s.value && s.label).toBeTruthy()
  })
})
