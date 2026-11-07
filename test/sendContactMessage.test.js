import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('../src/lib/contentApi.js', () => ({
  submitMessage: vi.fn(async () => {}),
  isVisitorBlocked: vi.fn(async () => false),
  isEmailBlocked: vi.fn(async () => false),
  verifyTurnstile: vi.fn(async () => true),
}))
vi.mock('../src/lib/analytics.js', () => ({ currentVisitorId: () => 'v1' }))
vi.mock('../src/config/turnstile.js', () => ({ isTurnstileEnabled: false }))

import * as api from '../src/lib/contentApi.js'
import { sendContactMessage, RATE_MSG, FLAGGED_MSG, CHAT_PREFIX, RATE_KEY } from '../src/lib/sendContactMessage.js'

const fields = { name: 'Jo', email: 'jo@x.com', phone: '', company: '', message: 'Hello' }

beforeEach(() => {
  vi.clearAllMocks()
  const store = {}
  globalThis.localStorage = {
    getItem: (k) => store[k] ?? null,
    setItem: (k, v) => { store[k] = String(v) },
  }
})

describe('sendContactMessage', () => {
  it('prefixes chat messages', async () => {
    const r = await sendContactMessage(fields, { source: 'chat' })
    expect(r).toEqual({ ok: true })
    expect(api.submitMessage).toHaveBeenCalledWith({ ...fields, message: CHAT_PREFIX + 'Hello' })
  })
  it('leaves form messages unprefixed', async () => {
    await sendContactMessage(fields, { source: 'form' })
    expect(api.submitMessage).toHaveBeenCalledWith(fields)
  })
  it('refuses a blocked email without saving', async () => {
    api.isEmailBlocked.mockResolvedValueOnce(true)
    const r = await sendContactMessage(fields, { source: 'chat' })
    expect(r).toEqual({ ok: false, error: FLAGGED_MSG })
    expect(api.submitMessage).not.toHaveBeenCalled()
  })
  it('refuses within the cooldown', async () => {
    localStorage.setItem(RATE_KEY, String(Date.now()))
    const r = await sendContactMessage(fields, { source: 'chat' })
    expect(r).toEqual({ ok: false, error: RATE_MSG })
    expect(api.submitMessage).not.toHaveBeenCalled()
  })
  it('returns the save error message on failure', async () => {
    api.submitMessage.mockRejectedValueOnce(new Error('boom'))
    expect(await sendContactMessage(fields)).toEqual({ ok: false, error: 'boom' })
  })
})
