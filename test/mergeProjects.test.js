import { describe, it, expect, vi } from 'vitest'
import { mergeProjects } from '../scripts/lib/mergeProjects.mjs'
import { mergeEmails, OLD_EMAIL_DEFAULTS } from '../scripts/lib/mergeEmails.mjs'
import { runSync, StaleWriteError } from '../scripts/lib/syncRunner.mjs'

const rec = (id, extra = {}) => ({ id, title: `T ${id}`, ...extra })
const defaults = [
  rec('bgccc-gala', { v: 'new' }),
  rec('bgccc-connect'),
  rec('bgccc-letter-builder'),
  rec('boys-girls-clubs', { v: 'new' }),
  rec('fox-sports', { v: 'DEFAULT' }),
]

describe('mergeProjects', () => {
  const existing = () => [
    rec('jag-nj-chamber'),
    rec('boys-girls-clubs', { v: 'old' }),
    rec('fox-sports', { v: 'admin edit', note: 'kept' }),
    rec('bonner-foundation'),
  ]

  it('keeps an admin-edited fox-sports byte-identical', () => {
    const before = JSON.stringify(existing().find((p) => p.id === 'fox-sports'))
    const out = mergeProjects(existing(), defaults, ['bgccc-gala'])
    expect(JSON.stringify(out.find((p) => p.id === 'fox-sports'))).toBe(before)
  })

  it('inserts bgccc-gala right after boys-girls-clubs', () => {
    const out = mergeProjects(existing(), defaults, ['bgccc-gala'])
    expect(out.map((p) => p.id)).toEqual([
      'jag-nj-chamber', 'boys-girls-clubs', 'bgccc-gala', 'fox-sports', 'bonner-foundation',
    ])
  })

  it('appends several new ones after boys-girls-clubs in id order', () => {
    const out = mergeProjects(existing(), defaults, ['bgccc-gala', 'bgccc-connect', 'bgccc-letter-builder'])
    expect(out.map((p) => p.id).slice(1, 5)).toEqual([
      'boys-girls-clubs', 'bgccc-gala', 'bgccc-connect', 'bgccc-letter-builder',
    ])
  })

  it('replaces boys-girls-clubs in place when its id is listed', () => {
    const out = mergeProjects(existing(), defaults, ['boys-girls-clubs'])
    expect(out.map((p) => p.id)).toEqual(['jag-nj-chamber', 'boys-girls-clubs', 'fox-sports', 'bonner-foundation'])
    expect(out[1].v).toBe('new')
  })

  it('does not mutate its inputs and is idempotent', () => {
    const e = existing()
    const snap = JSON.stringify(e)
    const once = mergeProjects(e, defaults, ['bgccc-gala', 'boys-girls-clubs'])
    expect(JSON.stringify(e)).toBe(snap)
    expect(mergeProjects(once, defaults, ['bgccc-gala', 'boys-girls-clubs'])).toEqual(once)
  })

  it('appends at the end when boys-girls-clubs is absent', () => {
    const out = mergeProjects([rec('fox-sports')], defaults, ['bgccc-gala'])
    expect(out.map((p) => p.id)).toEqual(['fox-sports', 'bgccc-gala'])
  })
})

const NEW = {
  confirmation: { subject: 'S new', heading: 'H', intro: 'I new' },
  reminderDayBefore: { subject: 'B new', heading: 'H', intro: 'BI new' },
  reminderDayOf: { subject: 'D new', heading: 'H', intro: 'DI new' },
}
const OLD = {
  confirmation: { subject: 'S old', heading: 'H', intro: 'I old' },
  reminderDayBefore: { subject: 'B old', heading: 'H', intro: 'BI old' },
  reminderDayOf: { subject: 'D old', heading: 'H', intro: 'DI old' },
}

describe('mergeEmails', () => {
  it('updates fields still at the old default', () => {
    const { value, changed, skipped } = mergeEmails(structuredClone(OLD), OLD, NEW)
    expect(value.confirmation.subject).toBe('S new')
    expect(value.reminderDayOf.intro).toBe('DI new')
    expect(changed).toHaveLength(6)
    expect(skipped).toEqual([])
  })

  it('leaves admin edits alone and reports them', () => {
    const stored = structuredClone(OLD)
    stored.confirmation.subject = 'My own subject'
    stored.reminderDayBefore.intro = 'Custom reminder wording'
    const { value, changed, skipped } = mergeEmails(stored, OLD, NEW)
    expect(value.confirmation.subject).toBe('My own subject')
    expect(value.reminderDayBefore.intro).toBe('Custom reminder wording')
    expect(skipped.map((s) => s.path).sort()).toEqual(['confirmation.subject', 'reminderDayBefore.intro'])
    expect(changed).toHaveLength(4)
  })

  it('touches only consultation fields and leaves everything else byte-identical', () => {
    const stored = { ...structuredClone(OLD), zoomLine: 'custom zoom', recruiter: { confirmation: { subject: 'x' } } }
    stored.confirmation.heading = 'Custom heading'
    const { value } = mergeEmails(stored, OLD, NEW)
    expect(value.zoomLine).toBe('custom zoom')
    expect(value.recruiter).toEqual({ confirmation: { subject: 'x' } })
    expect(value.confirmation.heading).toBe('Custom heading')
  })

  it('treats already-new and missing fields as no-ops', () => {
    const stored = { confirmation: { subject: 'S new' } }
    const { value, changed, skipped } = mergeEmails(stored, OLD, NEW)
    expect(value).toEqual(stored)
    expect(changed).toEqual([])
    expect(skipped).toEqual([])
  })

  it('ships old defaults that match the wording before the Creative Consult change', () => {
    expect(OLD_EMAIL_DEFAULTS.confirmation.subject).toBe("You're booked — Deem Creative Consultation")
    expect(OLD_EMAIL_DEFAULTS.reminderDayOf.intro).toBe('A friendly reminder that your consultation with Deem Creative is today:')
  })
})

function fakeStore({ rows, recheck }) {
  let reads = 0
  const store = {
    readSections: vi.fn(async () => {
      reads += 1
      return reads === 1 || !recheck ? structuredClone(rows) : recheck
    }),
    updateDraft: vi.fn(async () => {}),
    publishAll: vi.fn(async () => {}),
  }
  return store
}

const baseRows = () => ({
  projects: { draft_data: { items: [rec('boys-girls-clubs', { v: 'old' })], categories: ['All'] }, updated_at: 't1' },
  emails: { draft_data: structuredClone(OLD), updated_at: 'e1' },
})
const run = (store, opts = {}) =>
  runSync({
    store,
    projectDefaults: defaults,
    ids: ['bgccc-gala', 'boys-girls-clubs'],
    emailsOld: OLD,
    emailsNew: NEW,
    log: () => {},
    ...opts,
  })

describe('runSync', () => {
  it('dry run never writes or publishes', async () => {
    const store = fakeStore({ rows: baseRows() })
    const plan = await run(store)
    expect(plan.projects.changed).toBe(true)
    expect(store.updateDraft).not.toHaveBeenCalled()
    expect(store.publishAll).not.toHaveBeenCalled()
  })

  it('refuses a stale write: StaleWriteError and no update', async () => {
    const stale = baseRows()
    stale.projects.updated_at = 't2'
    const store = fakeStore({ rows: baseRows(), recheck: stale })
    await expect(run(store, { write: true })).rejects.toBeInstanceOf(StaleWriteError)
    expect(store.updateDraft).not.toHaveBeenCalled()
    expect(store.publishAll).not.toHaveBeenCalled()
  })

  it('writes both sections with the expected updated_at, preserving other draft keys', async () => {
    const store = fakeStore({ rows: baseRows() })
    await run(store, { write: true })
    expect(store.updateDraft).toHaveBeenCalledTimes(2)
    const [section, data, expected] = store.updateDraft.mock.calls.find((c) => c[0] === 'projects')
    expect(section).toBe('projects')
    expect(expected).toBe('t1')
    expect(data.categories).toEqual(['All'])
    expect(data.items.map((p) => p.id)).toEqual(['boys-girls-clubs', 'bgccc-gala'])
    expect(store.publishAll).not.toHaveBeenCalled()
  })

  it('publishes only with --publish, after the writes', async () => {
    const store = fakeStore({ rows: baseRows() })
    await run(store, { write: true, publish: true })
    expect(store.publishAll).toHaveBeenCalledTimes(1)
  })

  it('refuses --publish without --write', async () => {
    const store = fakeStore({ rows: baseRows() })
    await expect(run(store, { publish: true })).rejects.toThrow(/--write/)
    expect(store.publishAll).not.toHaveBeenCalled()
  })

  it('skips the write when nothing changes', async () => {
    const rows = baseRows()
    rows.projects.draft_data.items = mergeProjects(rows.projects.draft_data.items, defaults, ['bgccc-gala', 'boys-girls-clubs'])
    rows.emails.draft_data = mergeEmails(rows.emails.draft_data, OLD, NEW).value
    const store = fakeStore({ rows })
    const plan = await run(store, { write: true })
    expect(plan.projects.changed).toBe(false)
    expect(store.updateDraft).not.toHaveBeenCalled()
  })
})
