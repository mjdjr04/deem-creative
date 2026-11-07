import { describe, it, expect } from 'vitest'
import { projects, FEATURED_PROJECT_IDS } from '../src/data/projects.js'
import { SHOWCASE, HERO_LOOP_SRC, REEL_YOUTUBE_ID } from '../src/data/showcase.js'

const byId = id => projects.find(p => p.id === id)
const text = p => JSON.stringify(p)

describe('showcase list', () => {
  it('every SHOWCASE projectId exists in projects', () => {
    for (const s of SHOWCASE) expect(byId(s.projectId), s.projectId).toBeTruthy()
  })
  it('has the seven films in order with the expected shape', () => {
    expect(SHOWCASE.map(s => s.projectId)).toEqual([
      'bgccc-gala', 'boys-girls-clubs', 'one-lens-one-voice', 'lets-film-jr-2025',
      'make-a-match-psa', 'stop-the-bleed-psa', 'vineland-fire-safety',
    ])
    for (const s of SHOWCASE) {
      expect(s.youtubeId).toMatch(/^[\w-]{11}$/)
      expect(typeof s.title).toBe('string')
      expect(typeof s.caption).toBe('string')
      expect(typeof s.previewStart).toBe('number')
      expect(s.previewSrc).toBeNull()
    }
  })
  it('youtube ids match the project video urls', () => {
    for (const s of SHOWCASE) expect(byId(s.projectId).mediaUrl).toContain(s.youtubeId)
  })
  it('hero loop and reel are null for now', () => {
    expect(HERO_LOOP_SRC).toBeNull()
    expect(REEL_YOUTUBE_ID).toBeNull()
  })
})

describe('project records', () => {
  it('every caseStudyPath is /work/<slug>', () => {
    for (const p of projects.filter(p => p.caseStudyPath)) expect(p.caseStudyPath).toMatch(/^\/work\/[a-z0-9-]+$/)
  })
  it('the three new records exist with case study paths and the bgccc group', () => {
    for (const id of ['bgccc-gala', 'bgccc-connect', 'bgccc-letter-builder']) {
      expect(byId(id).caseStudyPath).toBe(`/work/${id}`)
      expect(byId(id).group).toBe('bgccc')
    }
    expect(byId('boys-girls-clubs').group).toBe('bgccc')
  })
  it('gala has the video, year and category', () => {
    const g = byId('bgccc-gala')
    expect(g.mediaType).toBe('video')
    expect(g.mediaUrl).toBe('https://www.youtube.com/embed/8yVfb2hg0tk')
    expect(g.year).toBe('2026')
    expect(g.category).toBe('Nonprofit & Community Storytelling')
    expect(text(g)).toContain('120+ guests')
    expect(text(g)).toContain('12 sponsors')
  })
  it('connect and letter builder are Website & Digital Systems', () => {
    expect(byId('bgccc-connect').category).toBe('Website & Digital Systems')
    expect(byId('bgccc-letter-builder').category).toBe('Website & Digital Systems')
  })
  it('no project text has a money figure or says raised', () => {
    for (const p of projects) {
      expect(text(p), p.id).not.toMatch(/\$46/)
      expect(text(p), p.id).not.toMatch(/raised/i)
    }
    for (const id of ['bgccc-gala', 'bgccc-connect', 'bgccc-letter-builder']) expect(text(byId(id))).not.toContain('$')
  })
  it('letter builder has no links', () => {
    const lb = byId('bgccc-letter-builder')
    expect(lb).not.toHaveProperty('socialLinks')
    expect(lb).not.toHaveProperty('liveUrl')
    expect(lb).not.toHaveProperty('link')
    expect(text(lb)).not.toMatch(/https?:\/\//)
  })
  it('boys-girls-clubs does not claim the redesign shipped', () => {
    expect(text(byId('boys-girls-clubs'))).not.toMatch(/website redesign/i)
  })
  it('featured list leads with the gala', () => {
    expect(FEATURED_PROJECT_IDS[0]).toBe('bgccc-gala')
    for (const id of FEATURED_PROJECT_IDS) expect(byId(id), id).toBeTruthy()
  })
})
