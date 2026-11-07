import { describe, it, expect, vi } from 'vitest'
import { fileURLToPath } from 'node:url'
import { loadGs } from './gs.js'

const path = fileURLToPath(new URL('../apps-script/Code.gs', import.meta.url))

const R1 = { id: 'a1', name: 'Ann', email: 'ann@x.com', message: 'Hi', created_at: '2026-11-08T15:00:00+00:00' }
const R2 = { id: 'b2', name: 'Bob', email: 'bob@x.com', phone: '555', company: 'Co', message: 'Yo', created_at: '2026-11-08T16:00:00+00:00' }

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
  it('seeds both cursor properties from the newest row and sends nothing', () => {
    const { gs, store, sendEmail } = setup({ props: { SUPABASE_SERVICE_KEY: 'k' }, rows: [R2] })
    gs.notifyNewMessages()
    expect(sendEmail).not.toHaveBeenCalled()
    expect(store.LAST_ALERTED_AT).toBe(R2.created_at)
    expect(store.LAST_ALERTED_ID).toBe('b2')
  })
  it('seeds to now when the table is empty', () => {
    const { gs, store, sendEmail } = setup({ props: { SUPABASE_SERVICE_KEY: 'k' }, rows: [] })
    gs.notifyNewMessages()
    expect(sendEmail).not.toHaveBeenCalled()
    expect(store.LAST_ALERTED_AT).toBeTruthy()
  })
  it('queries with the keyset filter and auth headers', () => {
    const { gs, fetch } = setup({ props: { ...props, LAST_ALERTED_ID: 'z9' }, rows: [] })
    gs.notifyNewMessages()
    const [url, o] = fetch.mock.calls[0]
    expect(url).toContain('order=created_at.asc,id.asc')
    expect(decodeURIComponent(url)).toContain('or=(created_at.gt.' + props.LAST_ALERTED_AT + ',and(created_at.eq.' + props.LAST_ALERTED_AT + ',id.gt.z9))')
    expect(o.headers.apikey).toBe('k')
    expect(o.headers.Authorization).toBe('Bearer k')
  })
  it('falls back to created_at=gt when no id is stored', () => {
    const { gs, fetch } = setup({ props, rows: [] })
    gs.notifyNewMessages()
    expect(fetch.mock.calls[0][0]).toContain('created_at=gt.')
  })
  it('alerts both rows sharing a created_at and ends on the second id', () => {
    const a = { ...R1, created_at: R2.created_at }
    const { gs, store, sendEmail } = setup({ props, rows: [a, R2] })
    gs.notifyNewMessages()
    expect(sendEmail).toHaveBeenCalledTimes(2)
    expect(store.LAST_ALERTED_ID).toBe('b2')
  })
  it('omits replyTo for a malformed email but still sends', () => {
    const bad = { ...R1, email: 'a@x.com, evil@y.com' }
    const { gs, sendEmail, store } = setup({ props, rows: [bad] })
    gs.notifyNewMessages()
    expect(sendEmail).toHaveBeenCalledTimes(1)
    expect('replyTo' in sendEmail.mock.calls[0][0]).toBe(false)
    expect(sendEmail.mock.calls[0][0].body).toContain('(no valid reply-to)')
    expect(store.LAST_ALERTED_AT).toBe(bad.created_at)
  })
  it('sends nothing on a non-200 response', () => {
    const { gs, fetch, sendEmail } = setup({ props, rows: [R1] })
    fetch.mockReturnValue({ getResponseCode: () => 500, getContentText: () => '' })
    gs.notifyNewMessages()
    expect(sendEmail).not.toHaveBeenCalled()
  })
  it('does nothing without the service key', () => {
    const { gs, fetch } = setup({ props: { LAST_ALERTED_AT: 'x' } })
    gs.notifyNewMessages()
    expect(fetch).not.toHaveBeenCalled()
  })
})

describe('formatMessageAlert sanitizing', () => {
  it('strips control chars, caps name and message', () => {
    const { gs } = setup()
    const m = gs.formatMessageAlert({ ...R1, name: 'Evil\r\nBcc: x' + 'y'.repeat(200), message: 'm'.repeat(6000) })
    expect(m.subject).not.toMatch(/[\r\n]/)
    expect(m.subject.length).toBeLessThan(140)
    expect(m.body).toContain('truncated')
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

describe('formatMessageAlert HTML', () => {
  it('escapes visitor input and includes reply + admin buttons', () => {
    const { gs } = setup()
    const m = gs.formatMessageAlert({ ...R2, name: 'Ann <b>', message: '<script>x</script>\nline 2' })
    expect(m.htmlBody).not.toContain('<script>')
    expect(m.htmlBody).toContain('&lt;script&gt;')
    expect(m.htmlBody).toContain('Ann &lt;b&gt;')
    expect(m.htmlBody).toContain('mailto:bob@x.com')
    expect(m.htmlBody).toContain('https://deemcreative.com/admin')
    expect(m.htmlBody).toContain('Contact form')
  })
  it('tags Deemo messages and strips the prefix from the shown text', () => {
    const { gs } = setup()
    const m = gs.formatMessageAlert({ ...R1, message: '(Sent through Deemo, the site chat)\n\nHello there' })
    expect(m.htmlBody).toContain('Sent through Deemo, the site chat')
    expect(m.htmlBody).toContain('Hello there')
    expect(m.htmlBody.match(/Sent through Deemo/g).length).toBe(1)
  })
  it('omits the reply button without a valid email', () => {
    const { gs } = setup()
    const m = gs.formatMessageAlert({ ...R1, email: 'not-an-email' })
    expect(m.htmlBody).not.toContain('Reply to')
    expect(m.htmlBody).toContain('no valid reply-to')
  })
})

describe('notifyNewMessages HTML', () => {
  it('sends the HTML body with the plain-text fallback', () => {
    const { gs, sendEmail } = setup({ props: { SUPABASE_SERVICE_KEY: 'k', LAST_ALERTED_AT: '2026-11-08T00:00:00+00:00' }, rows: [R1] })
    gs.notifyNewMessages()
    const mail = sendEmail.mock.calls[0][0]
    expect(mail.htmlBody).toContain('wrote to you on deemcreative.com')
    expect(mail.body).toContain('Name: Ann')
  })
})
