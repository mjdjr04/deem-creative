import { describe, it, expect } from 'vitest'
import { extractMessageDraft } from '../src/lib/messageDraft.js'

describe('extractMessageDraft', () => {
  it('parses a valid marker and strips it', () => {
    const r = extractMessageDraft('Here is a draft.\n[[MESSAGE_DRAFT]]{"name":"Jo","email":"jo@x.com","message":"Hi Michael"}[[/MESSAGE_DRAFT]]')
    expect(r.text).toBe('Here is a draft.')
    expect(r.draft).toEqual({ name: 'Jo', email: 'jo@x.com', message: 'Hi Michael' })
  })
  it('returns null draft for malformed JSON but still strips the marker', () => {
    const r = extractMessageDraft('Draft: [[MESSAGE_DRAFT]]{"name":"Jo",[[/MESSAGE_DRAFT]]')
    expect(r.draft).toBeNull()
    expect(r.text).toBe('Draft:')
    expect(r.text).not.toContain('MESSAGE_DRAFT')
  })
  it('leaves text without a marker unchanged', () => {
    const t = '  Just chatting. '
    expect(extractMessageDraft(t)).toEqual({ text: t, draft: null })
  })
})
