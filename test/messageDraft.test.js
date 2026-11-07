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
    expect(extractMessageDraft(t)).toEqual({ text: t, draft: null, truncated: false })
  })
  it('strips an unclosed marker running to the end', () => {
    const r = extractMessageDraft('Here you go. [[MESSAGE_DRAFT]]{"name":"Jo","email":"jo@x.com","mess')
    expect(r).toEqual({ text: 'Here you go.', draft: null, truncated: false })
  })
  it('strips a trailing partial opening tag', () => {
    expect(extractMessageDraft('Here you go. [[MESSAGE_DR').text).toBe('Here you go.')
    expect(extractMessageDraft('Here you go. [[').text).toBe('Here you go.')
  })
  it('flags truncated when nothing but a broken marker remains', () => {
    expect(extractMessageDraft('[[MESSAGE_DRAFT]]{"name":"Jo"').truncated).toBe(true)
    expect(extractMessageDraft('[[MESSAGE_DRAFT]]{bad}[[/MESSAGE_DRAFT]]').truncated).toBe(true)
    expect(extractMessageDraft('[[MESSAGE_DR')).toMatchObject({ text: '', truncated: true })
  })
  it('does not flag a valid draft with no surrounding text as truncated', () => {
    const r = extractMessageDraft('[[MESSAGE_DRAFT]]{"name":"a","email":"b","message":"c"}[[/MESSAGE_DRAFT]]')
    expect(r.truncated).toBe(false)
    expect(r.draft).toEqual({ name: 'a', email: 'b', message: 'c' })
  })
  it('only accepts string or number fields', () => {
    const r = extractMessageDraft('[[MESSAGE_DRAFT]]{"name":{"x":1},"email":["a"],"message":42}[[/MESSAGE_DRAFT]]')
    expect(r.draft).toEqual({ name: '', email: '', message: '42' })
  })
})
