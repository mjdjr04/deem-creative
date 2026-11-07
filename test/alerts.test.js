import { describe, it, expect, vi } from 'vitest'
import { fileURLToPath } from 'node:url'
import { loadGs } from './gs.js'

const path = fileURLToPath(new URL('../apps-script/Code.gs', import.meta.url))

const R1 = { name: 'Ann', email: 'ann@x.com', message: 'Hi', created_at: '2026-11-08T15:00:00+00:00' }
const R2 = { name: 'Bob', email: 'bob@x.com', phone: '555', company: 'Co', message: 'Yo', created_at: '2026-11-08T16:00:00+00:00' }

function setup({ props = {}, rows = [], sendImpl } = {}) {
  const store = { ...props }
  const fetch = vi.fn(() => ({ getResponseCode: () => 200, getContentText: () => JSON.stringify(rows) }))
  const sendEmail = vi.fn(sendImpl || (() => {}))
  const gs = loadGs(path, {
    UrlFetchApp: { fetch },
    MailApp: { sendEmail },
    PropertiesService: { getScriptProperties: () => ({
      getProperty: (k) => (k in store ? store[k] : null),
      setProperty: (k, v) => { store[k] = v },
    }) },
    Utilities: { formatDate: (d) => d.toISOString() },
    console: { warn: vi.fn(), log: vi.fn() },
  })
  return { gs, store, fetch, sendEmail }
}

describe('formatMessageAlert', () => {
  it('omits empty company/phone and sets replyTo', () => {
    const { gs } = setup()
    const m = gs.formatMessageAlert(R1)
    expect(m.subject).toBe('New message from Ann — deemcreative.com')
    expect(m.body).not.toContain('Company:')
    expect(m.body).not.toContain('Phone:')
    expect(m.body).toContain('https://deemcreative.com/admin')
    expect(m.replyTo).toBe('ann@x.com')
  })
  it('includes phone and company when present', () => {
    const { gs } = setup()
    const m = gs.formatMessageAlert(R2)
    expect(m.body).toContain('Company: Co')
    expect(m.body).toContain('Phone: 555')
  })
})

describe('notifyNewMessages', () => {
  const props = { SUPABASE_SERVICE_KEY: 'k', LAST_ALERTED_AT: '2026-11-08T00:00:00+00:00' }
  it('sends per row and advances to the last created_at', () => {
    const { gs, store, sendEmail } = setup({ props, rows: [R1, R2] })
    gs.notifyNewMessages()
    expect(sendEmail).toHaveBeenCalledTimes(2)
    expect(sendEmail.mock.calls[0][0].to).toBe('michael@deemcreative.com')
    expect(store.LAST_ALERTED_AT).toBe(R2.created_at)
  })
  it('stops after a failed send, keeping the prior row as the watermark', () => {
    let n = 0
    const { gs, store } = setup({ props, rows: [R1, R2], sendImpl: () => { if (++n === 2) throw new Error('quota') } })
    gs.notifyNewMessages()
    expect(store.LAST_ALERTED_AT).toBe(R1.created_at)
  })
  it('seeds LAST_ALERTED_AT on first run and sends nothing', () => {
    const { gs, store, sendEmail, fetch } = setup({ props: { SUPABASE_SERVICE_KEY: 'k' }, rows: [R1] })
    gs.notifyNewMessages()
    expect(sendEmail).not.toHaveBeenCalled()
    expect(fetch).not.toHaveBeenCalled()
    expect(store.LAST_ALERTED_AT).toBeTruthy()
  })
  it('does nothing without the service key', () => {
    const { gs, fetch } = setup({ props: { LAST_ALERTED_AT: 'x' } })
    gs.notifyNewMessages()
    expect(fetch).not.toHaveBeenCalled()
  })
})

describe('installMessageAlertTrigger', () => {
  it('replaces existing triggers with one 5-minute trigger', () => {
    const del = vi.fn(), create = vi.fn()
    const old = { getHandlerFunction: () => 'notifyNewMessages' }
    const other = { getHandlerFunction: () => 'sendReminders' }
    const chain = { timeBased: () => chain, everyMinutes: (n) => { chain.n = n; return chain }, create }
    const gs = loadGs(path, { ScriptApp: { getProjectTriggers: () => [old, other], deleteTrigger: del, newTrigger: () => chain } })
    gs.installMessageAlertTrigger()
    expect(del).toHaveBeenCalledTimes(1)
    expect(del).toHaveBeenCalledWith(old)
    expect(chain.n).toBe(5)
    expect(create).toHaveBeenCalled()
  })
})
