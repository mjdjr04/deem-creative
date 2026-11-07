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

describe('trimChatHistory', () => {
  const turn = (i) => ({ role: i % 2 === 0 ? 'user' : 'assistant', content: 'm' + i })
  it('leaves short histories alone', () => {
    const m = [turn(0), turn(1), turn(2)]
    expect(gs.trimChatHistory(m).map((x) => x.content)).toEqual(['m0', 'm1', 'm2'])
  })
  it('starts the 30-turn window on a user turn', () => {
    const m = Array.from({ length: 33 }, (_, i) => turn(i)) // slice(-30) starts at m3 (assistant)
    const out = gs.trimChatHistory(m)
    expect(out[0].role).toBe('user')
    expect(out[0].content).toBe('m4')
    expect(out[out.length - 1].content).toBe('m32')
  })
  it('falls back to the last user message when the window has none', () => {
    const m = [{ role: 'user', content: 'q' }, ...Array.from({ length: 30 }, () => ({ role: 'assistant', content: 'a' }))]
    expect(gs.trimChatHistory(m)).toEqual([{ role: 'user', content: 'q' }])
  })
})
