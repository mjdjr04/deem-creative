import { describe, it, expect } from 'vitest'
import { fileURLToPath } from 'node:url'
import { loadGs } from './gs.js'

const path = fileURLToPath(new URL('../apps-script/Code.gs', import.meta.url))
const gs = loadGs(path)

const content = {
  about: { heading: 'About', paragraphs: ['Hi.'] },
  settings: { email: 'm@x.com' },
  projects: {
    items: [
      { id: 'bgccc-gala', title: 'BGCCC Gala', caseStudyPath: '/work/bgccc-gala', year: '2026', category: 'Event', role: 'Producer' },
      { id: 'old-one', title: 'Old One', year: '2024', category: 'Video', role: 'Editor' },
    ],
  },
  services: { items: [{ title: 'Video Production', description: 'Films.' }] },
}

describe('describeHours', () => {
  it('derives the hours string from CONFIG.TYPES windows', () => {
    expect(gs.describeHours()).toBe(
      'Creative consults and networking chats: Fridays 11 AM–6 PM and Saturdays 10 AM–3 PM (ET). Hiring calls: Monday–Friday 10 AM–5 PM (ET).'
    )
  })
})

describe('knowledgeFromContent', () => {
  const kb = gs.knowledgeFromContent(content)
  it('emits the page path for projects with a case study', () => {
    const line = kb.split('\n').find((l) => l.includes('[bgccc-gala]'))
    expect(line).toContain('page: /work/bgccc-gala')
    const other = kb.split('\n').find((l) => l.includes('[old-one]'))
    expect(other).not.toContain('page:')
  })
  it('includes booking hours', () => {
    expect(kb).toContain('BOOKING HOURS: ' + gs.describeHours())
  })
  it('calls services SIDE WORK, not SERVICES', () => {
    expect(kb).not.toContain('SERVICES:')
    expect(kb).toContain('SIDE WORK:')
    expect(kb).toContain('Video Production')
  })
  it('does not describe him as a founder', () => {
    expect(kb).not.toMatch(/Founder:/)
    expect(kb).toContain('video producer & creative technologist at BGCCC')
  })
})

describe('chat copy', () => {
  it('persona is portfolio-first with the new links and no money figures', () => {
    const p = gs.CHAT_PERSONA
    expect(p).toContain("Michael Deem Jr.'s portfolio site")
    expect(p).toContain('[book a creative consult](/booking)')
    expect(p).toContain('[schedule a hiring call](/hire)')
    expect(p).not.toMatch(/founder|studio|free consultation|\/services/i)
    expect(p).toMatch(/NEVER state any (amount|money)/i)
  })
  it('unfinished-booking greeting intent says Creative Consult', () => {
    expect(gs.GREETING_INTENTS.booking_unfinished).toBe('They started booking a Creative Consult and never finished it.')
  })
})
