import { describe, it, expect, vi } from 'vitest'
import { fileURLToPath } from 'node:url'
import { loadGs } from './gs.js'

const path = fileURLToPath(new URL('../apps-script/Code.gs', import.meta.url))
const DAY = 86400000
const from = Date.UTC(2026, 10, 9, 13, 0)

const ok = (blocks) => ({ busy: blocks.map(([s, e]) => ({ start: new Date(s).toISOString(), end: new Date(e).toISOString() })) })

describe('extraBusy', () => {
  it('merges busy from each calendar', () => {
    const query = vi.fn(() => ({ calendars: { a: ok([[from + 1000, from + 2000]]), b: ok([[from + 5000, from + 6000]]) } }))
    const gs = loadGs(path, { Calendar: { Freebusy: { query } } })
    const r = gs.extraBusy(['a', 'b'], from, from + 7 * DAY)
    expect(r.busy.length).toBe(2)
    expect(r.unreadable).toEqual([])
    expect(query.mock.calls[0][0].timeZone).toBe('America/New_York')
  })

  it('freebusy calendar errors are reported, not treated as free', () => {
    const warn = vi.fn()
    const gs = loadGs(path, {
      console: { warn, log() {} },
      Calendar: { Freebusy: { query: () => ({ calendars: { x: { errors: [{ reason: 'notFound' }] } } }) } },
    })
    const r = gs.extraBusy(['x'], from, from + 7 * DAY)
    expect(r.unreadable).toEqual(['x'])
    expect(r.busy).toEqual([])
    expect(warn).toHaveBeenCalled()
  })

  it('thrown query -> all unreadable', () => {
    const gs = loadGs(path, {
      console: { warn() {}, log() {} },
      Calendar: { Freebusy: { query: () => { throw new Error('boom') } } },
    })
    const r = gs.extraBusy(['a', 'b'], from, from + 7 * DAY)
    expect(r.unreadable).toEqual(['a', 'b'])
    expect(r.busy).toEqual([])
  })

  it('a 60-day range is split into 2 queries', () => {
    const query = vi.fn(() => ({ calendars: { a: ok([]) } }))
    const gs = loadGs(path, { Calendar: { Freebusy: { query } } })
    gs.extraBusy(['a'], from, from + 60 * DAY)
    expect(query).toHaveBeenCalledTimes(2)
    const [c1, c2] = query.mock.calls.map((c) => c[0])
    expect(new Date(c1.timeMax).getTime() - new Date(c1.timeMin).getTime()).toBeLessThanOrEqual(30 * DAY)
    expect(c2.timeMin).toBe(c1.timeMax)
  })

  it('an error in one chunk marks the calendar unreadable but keeps other chunk busy', () => {
    let n = 0
    const query = () => (++n === 1
      ? { calendars: { a: { errors: [{ reason: 'x' }] } } }
      : { calendars: { a: ok([[from + 40 * DAY, from + 40 * DAY + 1000]]) } })
    const gs = loadGs(path, { console: { warn() {}, log() {} }, Calendar: { Freebusy: { query } } })
    const r = gs.extraBusy(['a'], from, from + 60 * DAY)
    expect(r.unreadable).toEqual(['a'])
    expect(r.busy.length).toBe(1)
  })
})

describe('type config', () => {
  const gs = loadGs(path)
  const fs = { 5: [11, 18], 6: [10, 15] }
  it('public types are Fri/Sat and avoid the schedule calendar', () => {
    for (const t of ['consultation', 'networking', 'strategy']) {
      expect(gs.CONFIG.TYPES[t].windows).toEqual(fs)
      expect(gs.CONFIG.TYPES[t].extraBusyCalendars).toEqual([gs.CONFIG.SCHEDULE_CAL_ID])
    }
    expect(gs.CONFIG.SCHEDULE_CAL_ID).toBe('133016e4b280b14123b432346527fd165d3f9096fa52dd9df0a13268e72d2dc4@group.calendar.google.com')
    expect(gs.CONFIG.BGCCC_CAL_ID).toBe('mdeem@bgccumberland.org')
  })
  it('recruiter is weekdays 10-17 and reads BGCCC free/busy', () => {
    expect(gs.CONFIG.TYPES.recruiter.windows).toEqual({ 1: [10, 17], 2: [10, 17], 3: [10, 17], 4: [10, 17], 5: [10, 17] })
    expect(gs.CONFIG.TYPES.recruiter.extraBusyCalendars).toEqual([gs.CONFIG.BGCCC_CAL_ID])
  })
})

describe('getAvailableSlots with extra calendars', () => {
  it('an extra-calendar block removes slots', () => {
    const run = (blocks) => {
      const gs = loadGs(path, {
        CalendarApp: { getDefaultCalendar: () => ({ getEvents: () => [] }) },
        Calendar: { Freebusy: { query: (req) => ({ calendars: { [req.items[0].id]: ok(blocks) } }) } },
      })
      return gs.getAvailableSlots('consultation')
    }
    const before = run([])
    expect(before.length).toBeGreaterThan(0)
    const first = new Date(before[0]).getTime()
    const after = run([[first, first + 30 * 60000]])
    expect(after).not.toContain(before[0])
    expect(after.length).toBeLessThan(before.length)
  })
})
