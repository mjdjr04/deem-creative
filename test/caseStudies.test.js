import { describe, it, expect } from 'vitest'
import { CASE_STUDIES, visibleStats, getCaseStudy } from '../src/data/caseStudies.js'
import { projects } from '../src/data/projects.js'

describe('case studies', () => {
  it('keys match the caseStudyPath slugs in projects', () => {
    for (const p of projects.filter(p => p.caseStudyPath)) {
      expect(CASE_STUDIES[p.caseStudyPath.replace('/work/', '')], p.id).toBeTruthy()
    }
    expect(Object.keys(CASE_STUDIES).sort()).toEqual(['bgccc-connect', 'bgccc-gala', 'bgccc-letter-builder'])
  })
  it('gala stats include guests and sponsors', () => {
    const s = CASE_STUDIES['bgccc-gala'].stats
    expect(s).toContainEqual({ value: '120+', label: 'guests' })
    expect(s).toContainEqual({ value: '12', label: 'sponsors' })
  })
  it('gala chapter ids are exact', () => {
    expect(CASE_STUDIES['bgccc-gala'].chapters.map(c => c.id)).toEqual(['film', 'registration', 'program-book', 'gala-night', 'after'])
  })
  it('next chain is gala -> connect -> letter-builder -> gala', () => {
    for (const c of Object.values(CASE_STUDIES)) expect(CASE_STUDIES[c.next]).toBeTruthy()
    expect(CASE_STUDIES['bgccc-gala'].next).toBe('bgccc-connect')
    expect(CASE_STUDIES['bgccc-connect'].next).toBe('bgccc-letter-builder')
    expect(CASE_STUDIES['bgccc-letter-builder'].next).toBe('bgccc-gala')
  })
  it('visibleStats drops empty values', () => {
    expect(visibleStats([{ value: '', label: 'raised' }])).toEqual([])
    expect(visibleStats([{ value: '1', label: 'x' }, { value: '', label: 'y' }])).toHaveLength(1)
  })
  it('letter builder has no link and no URL anywhere', () => {
    const lb = CASE_STUDIES['bgccc-letter-builder']
    for (const c of lb.chapters) expect(c.link).toBeUndefined()
    expect(JSON.stringify(lb)).not.toMatch(/https?:|letters\./)
  })
  it('connect and gala link to the live sites', () => {
    const links = k => CASE_STUDIES[k].chapters.map(c => c.link?.href).filter(Boolean)
    expect(links('bgccc-connect')).toContain('https://connect.bgccumberland.org')
    expect(links('bgccc-gala')).toContain('https://gala.bgccumberland.org')
  })
  it('has no money talk, no quotes, images under /assets/work/<slug>/', () => {
    for (const [slug, c] of Object.entries(CASE_STUDIES)) {
      expect(JSON.stringify(c)).not.toMatch(/\$|raised/i)
      expect(c.quote).toBeNull()
      for (const ch of c.chapters) {
        expect(ch.problem).toBeTruthy()
        expect(ch.built).toBeTruthy()
        for (const im of ch.images) expect(im.src).toMatch(new RegExp(`^/assets/work/${slug}/[a-z0-9-]+\\.jpg$`))
      }
    }
  })
  it('gala hero is the YouTube film', () => {
    expect(CASE_STUDIES['bgccc-gala'].hero).toEqual({ youtubeId: '8yVfb2hg0tk' })
  })
  it('getCaseStudy returns null for unknown', () => {
    expect(getCaseStudy('nope')).toBeNull()
    expect(getCaseStudy('bgccc-gala').title).toMatch(/Gala/)
  })
})
