import { describe, it, expect } from 'vitest'
import { slideshowReducer, initialState, SLIDE_MS } from '../src/lib/slideshow.js'

const start = (over = {}) => ({ ...initialState(7), ...over })

describe('slideshowReducer', () => {
  it('tick accumulates time without advancing before SLIDE_MS', () => {
    const s = slideshowReducer(start(), { type: 'tick', dtMs: 1000 })
    expect(s.index).toBe(0)
    expect(s.elapsedMs).toBe(1000)
  })
  it('tick advances to (index+1) % n at SLIDE_MS and resets elapsedMs', () => {
    const s = slideshowReducer(start({ elapsedMs: SLIDE_MS - 10 }), { type: 'tick', dtMs: 50 })
    expect(s.index).toBe(1)
    expect(s.elapsedMs).toBe(0)
  })
  it('wraps from the last slide to 0', () => {
    const s = slideshowReducer(start({ index: 6, elapsedMs: SLIDE_MS - 1 }), { type: 'tick', dtMs: 5 })
    expect(s.index).toBe(0)
  })
  it('ticks do nothing while any pause reason is present', () => {
    for (const r of ['hover', 'focus', 'hidden', 'offscreen', 'overlay', 'user']) {
      const s0 = slideshowReducer(start(), { type: 'pause', reason: r })
      const s1 = slideshowReducer(s0, { type: 'tick', dtMs: 9000 })
      expect(s1.index).toBe(0)
      expect(s1.elapsedMs).toBe(0)
    }
  })
  it('resuming one of two reasons stays paused', () => {
    let s = slideshowReducer(start(), { type: 'pause', reason: 'hover' })
    s = slideshowReducer(s, { type: 'pause', reason: 'focus' })
    s = slideshowReducer(s, { type: 'resume', reason: 'hover' })
    expect(s.paused.has('focus')).toBe(true)
    expect(slideshowReducer(s, { type: 'tick', dtMs: 500 }).elapsedMs).toBe(0)
    s = slideshowReducer(s, { type: 'resume', reason: 'focus' })
    expect(slideshowReducer(s, { type: 'tick', dtMs: 500 }).elapsedMs).toBe(500)
  })
  it('does not mutate the previous paused set', () => {
    const s0 = start()
    slideshowReducer(s0, { type: 'pause', reason: 'hover' })
    expect(s0.paused.size).toBe(0)
  })
  it('reducedMotion never auto-advances', () => {
    const s = slideshowReducer(start({ reducedMotion: true }), { type: 'tick', dtMs: SLIDE_MS * 3 })
    expect(s.index).toBe(0)
  })
  it('go resets elapsedMs and wraps the index', () => {
    const s = slideshowReducer(start({ elapsedMs: 5000 }), { type: 'go', index: 3 })
    expect(s.index).toBe(3)
    expect(s.elapsedMs).toBe(0)
    expect(slideshowReducer(start(), { type: 'go', index: 7 }).index).toBe(0)
    expect(slideshowReducer(start(), { type: 'go', index: -1 }).index).toBe(6)
  })
  it('next and prev wrap, prev from 0 goes to n-1', () => {
    expect(slideshowReducer(start(), { type: 'prev' }).index).toBe(6)
    expect(slideshowReducer(start({ index: 6 }), { type: 'next' }).index).toBe(0)
    expect(slideshowReducer(start({ index: 2, elapsedMs: 900 }), { type: 'next' }).elapsedMs).toBe(0)
  })
  it('reducedMotion action toggles the flag', () => {
    const s = slideshowReducer(start(), { type: 'reducedMotion', value: true })
    expect(s.reducedMotion).toBe(true)
    expect(slideshowReducer(s, { type: 'tick', dtMs: SLIDE_MS }).index).toBe(0)
  })
  it('a tick larger than SLIDE_MS advances once and discards the overshoot', () => {
    const s = slideshowReducer(start(), { type: 'tick', dtMs: SLIDE_MS * 2.5 })
    expect(s.index).toBe(1)
    expect(s.elapsedMs).toBe(0)
  })
})
