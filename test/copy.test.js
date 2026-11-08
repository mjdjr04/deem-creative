import { describe, it, expect } from 'vitest'
import { STORIES } from '../src/data/stories.js'
import { WHITEPAPER, getWhitepaper } from '../src/data/whitepaper.js'
import { services, groupServices, DOORS } from '../src/data/services.js'
import { defaultContent, SECTIONS, heroDefaults } from '../src/data/defaults.js'
import { experiences } from '../src/data/experience.js'

// Drafting markers and claims we chose not to make until they're confirmed.
const BANNED = [
  /\[YOUR WORDS/i,
  /\[CONFIRM/i,
  /OUTCOMES BOX/i,
  /TBD/,
  /millions of viewers/i,
  /230,975/,
  /almost halfway/i,
  /Temp Post Production/i,
]

// The copy this rework owns. (projects is out of scope and edited in /admin.)
const shipped = JSON.stringify({
  STORIES,
  WHITEPAPER,
  services,
  experiences,
  hero: defaultContent.hero,
  about: defaultContent.about,
  experience: defaultContent.experience,
})

describe('shipped copy', () => {
  it.each(BANNED.map((r) => [r]))('contains no %s', (re) => {
    expect(shipped).not.toMatch(re)
  })
})

describe('stories', () => {
  it('has the four stories in order, each with body text', () => {
    expect(STORIES.map((s) => s.id)).toEqual(['origin', 'transformation', 'process', 'vision'])
    for (const s of STORIES) {
      expect(s.title).toBeTruthy()
      expect((s.paragraphs?.length || 0) + (s.steps?.length || 0)).toBeGreaterThan(0)
    }
  })
})

describe('whitepaper', () => {
  it('is found by slug and has sections', () => {
    expect(getWhitepaper('after-the-applause')).toBe(WHITEPAPER)
    expect(getWhitepaper('nope')).toBeNull()
    expect(WHITEPAPER.sections.length).toBeGreaterThanOrEqual(6)
    for (const s of WHITEPAPER.sections) expect(s.heading).toBeTruthy()
  })
})

describe('services', () => {
  it('keep the fields the current live code renders', () => {
    for (const s of services) {
      expect(typeof s.title).toBe('string')
      expect(typeof s.iconName).toBe('string')
      expect(typeof s.description).toBe('string')
      expect(typeof s.bestFor).toBe('string')
      expect(Array.isArray(s.deliverables)).toBe(true)
      expect(DOORS.map((d) => d.id)).toContain(s.door)
    }
  })

  it('groups by door in door order, skipping empty doors', () => {
    const g = groupServices(services)
    expect(g.map((x) => x.door)).toEqual(['hire', 'studio', 'crew'])
    expect(g.reduce((n, x) => n + x.items.length, 0)).toBe(services.length)
  })

  it('puts unknown or missing doors under the studio door', () => {
    const g = groupServices([{ id: 'a', door: 'weird' }, { id: 'b' }])
    expect(g).toHaveLength(1)
    expect(g[0].door).toBe('studio')
    expect(g[0].items.map((x) => x.id)).toEqual(['a', 'b'])
  })

  it('tolerates bad input', () => {
    expect(groupServices(undefined)).toEqual([])
    expect(groupServices([null])).toEqual([])
  })
})

describe('hero section', () => {
  it('is an editable section with the positioning line', () => {
    expect(SECTIONS).toContain('hero')
    expect(defaultContent.hero).toEqual(heroDefaults)
    expect(`${heroDefaults.headline} ${heroDefaults.headlineAccent}`).toBe(
      'Filmmaker and builder for organizations that serve their communities.',
    )
    expect(heroDefaults.chips.length).toBeGreaterThan(0)
  })

  it('experience carries an editable summary and four stats', () => {
    expect(defaultContent.experience.summary).toBeTruthy()
    expect(defaultContent.experience.stats).toHaveLength(4)
  })
})
