// Deemo drafts a message for the visitor to review; the reply carries it as
//   [[MESSAGE_DRAFT]]{"name":"..","email":"..","message":".."}[[/MESSAGE_DRAFT]]
// This strips the marker (always) and parses the draft (when valid).
const MARKER_RE = /\[\[MESSAGE_DRAFT\]\]([\s\S]*?)\[\[\/MESSAGE_DRAFT\]\]/g

export function extractMessageDraft(text) {
  const src = String(text ?? '')
  let draft = null
  const stripped = src.replace(MARKER_RE, (_, json) => {
    try {
      const o = JSON.parse(json)
      if (o && typeof o === 'object' && !Array.isArray(o)) {
        draft = {
          name: String(o.name ?? ''),
          email: String(o.email ?? ''),
          message: String(o.message ?? ''),
        }
      }
    } catch { /* malformed — marker is still stripped */ }
    return ''
  })
  return { text: stripped === src ? src : stripped.trim(), draft }
}
