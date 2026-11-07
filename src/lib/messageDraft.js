// Deemo drafts a message for the visitor to review; the reply carries it as
//   [[MESSAGE_DRAFT]]{"name":"..","email":"..","message":".."}[[/MESSAGE_DRAFT]]
// extractMessageDraft ALWAYS strips the marker, including an unclosed one cut off
// by the token limit and a trailing partial opening tag, and parses the draft
// only when a complete, valid marker is present.
const OPEN = '[[MESSAGE_DRAFT]]'
const CLOSED_RE = /\[\[MESSAGE_DRAFT\]\]([\s\S]*?)\[\[\/MESSAGE_DRAFT\]\]/g
const UNCLOSED_RE = /\[\[MESSAGE_DRAFT\]\][\s\S]*$/

const field = (v) => (typeof v === 'string' ? v : typeof v === 'number' ? String(v) : '')

export function extractMessageDraft(text) {
  const src = String(text ?? '')
  let draft = null
  let opened = false
  let out = src.replace(CLOSED_RE, (_, json) => {
    opened = true
    try {
      const o = JSON.parse(json)
      if (o && typeof o === 'object' && !Array.isArray(o) && !draft) {
        draft = { name: field(o.name), email: field(o.email), message: field(o.message) }
      }
    } catch { /* malformed — marker is still stripped */ }
    return ''
  })
  if (UNCLOSED_RE.test(out)) {
    opened = true
    out = out.replace(UNCLOSED_RE, '')
  }
  for (let k = OPEN.length - 1; k >= 2; k--) {
    if (out.endsWith(OPEN.slice(0, k))) {
      opened = true
      out = out.slice(0, -k)
      break
    }
  }
  const result = out === src ? src : out.trim()
  return { text: result, draft, truncated: opened && !draft && result === '' }
}
