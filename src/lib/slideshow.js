// Pure state machine for the presentation-style video showcase.
// State: { index, elapsedMs, paused: Set<reason>, reducedMotion, count }
export const SLIDE_MS = 8000

export function initialState(count, reducedMotion = false) {
  return { index: 0, elapsedMs: 0, paused: new Set(), reducedMotion, count }
}

const wrap = (i, n) => (n > 0 ? ((i % n) + n) % n : 0)

export function slideshowReducer(state, action) {
  switch (action.type) {
    case 'tick': {
      if (state.reducedMotion || state.paused.size > 0 || state.count < 2) return state
      const elapsedMs = state.elapsedMs + action.dtMs
      if (elapsedMs >= SLIDE_MS) {
        return { ...state, index: wrap(state.index + 1, state.count), elapsedMs: 0 }
      }
      return { ...state, elapsedMs }
    }
    case 'go':
      return { ...state, index: wrap(action.index, state.count), elapsedMs: 0 }
    case 'next':
      return { ...state, index: wrap(state.index + 1, state.count), elapsedMs: 0 }
    case 'prev':
      return { ...state, index: wrap(state.index - 1, state.count), elapsedMs: 0 }
    case 'pause': {
      if (state.paused.has(action.reason)) return state
      const paused = new Set(state.paused)
      paused.add(action.reason)
      return { ...state, paused }
    }
    case 'resume': {
      if (!state.paused.has(action.reason)) return state
      const paused = new Set(state.paused)
      paused.delete(action.reason)
      return { ...state, paused }
    }
    case 'reducedMotion':
      return { ...state, reducedMotion: action.value }
    default:
      return state
  }
}
