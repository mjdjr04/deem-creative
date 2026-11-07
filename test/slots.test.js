import { describe, it, expect } from 'vitest'
import { fileURLToPath } from 'node:url'
import { loadGs } from './gs.js'

const gs = loadGs(fileURLToPath(new URL('../apps-script/Code.gs', import.meta.url)))

// Mon 2026-11-09 08:00 ET = 13:00Z (EST)
const nowMs = Date.UTC(2026, 10, 9, 13, 0)
const et = (d, h, m = 0) => Date.UTC(2026, 10, d, h + 5, m) // EST, Nov 2026
const base = {
  nowMs, slotMinutes: 30, bufferMinutes: 0, busy: [], perDayCount: {},
  maxPerDay: null, minNoticeHours: 48, maxDaysAhead: 14,
}
const fmt = (iso) => new Date(iso).toLocaleString('en-US', {
  timeZone: 'America/New_York', weekday: 'short', hour: '2-digit', minute: '2-digit', hourCycle: 'h23',
}).replace(',', '') // 'Fri 11:00'

describe('computeSlots', () => {
  it('fri/sat windows only', () => {
    const slots = gs.computeSlots({ ...base, windowsByDay: { 5: [11, 18], 6: [10, 15] } })
    expect(slots[0]).toBe('2026-11-13T16:00:00.000Z')
    const days = slots.map((s) => fmt(s).split(' ')[0])
    expect(new Set(days)).toEqual(new Set(['Fri', 'Sat']))
    const fri = slots.filter((s) => fmt(s).startsWith('Fri'))
    expect(fmt(fri[0])).toBe('Fri 11:00')
    const firstFri = slots.filter((s) => new Date(s).getTime() < et(14, 0))
    expect(fmt(firstFri[firstFri.length - 1])).toBe('Fri 17:30')
    const sat = slots.filter((s) => new Date(s).getTime() >= et(14, 0) && new Date(s).getTime() < et(15, 0))
    expect(fmt(sat[0])).toBe('Sat 10:00')
    expect(fmt(sat[sat.length - 1])).toBe('Sat 14:30')
  })

  it('busy block pads by buffer', () => {
    const slots = gs.computeSlots({
      ...base, bufferMinutes: 30, windowsByDay: { 5: [11, 18] },
      busy: [[et(13, 12), et(13, 13)]],
    })
    const times = slots.filter((s) => new Date(s).getTime() < et(14, 0)).map((s) => fmt(s).split(' ')[1])
    for (const t of ['11:30', '12:00', '12:30', '13:00']) expect(times).not.toContain(t)
    expect(times).toContain('11:00')
    expect(times).toContain('13:30')
  })

  it('per-day cap', () => {
    const slots = gs.computeSlots({
      ...base, maxPerDay: 1, windowsByDay: { 5: [11, 18] },
      perDayCount: { '2026-10-13': 1 }, // Y-M(0-based)-D for Fri Nov 13
    })
    expect(slots.filter((s) => new Date(s).getTime() < et(14, 0))).toEqual([])
    expect(slots.length).toBeGreaterThan(0) // the following Friday still opens
  })
})

describe('windowsFor', () => {
  it('back-compat from workDays/startHour/endHour', () => {
    expect(gs.windowsFor({ workDays: [1, 2], startHour: 10, endHour: 17 })).toEqual({ 1: [10, 17], 2: [10, 17] })
  })
  it('prefers tc.windows', () => {
    const w = { 5: [11, 18] }
    expect(gs.windowsFor({ windows: w, workDays: [1], startHour: 1, endHour: 2 })).toBe(w)
  })
})
