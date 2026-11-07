import { submitMessage, isVisitorBlocked, isEmailBlocked, verifyTurnstile } from './contentApi'
import { currentVisitorId } from './analytics'
import { isTurnstileEnabled } from '../config/turnstile'

// Shared send pipeline for the contact form and Deemo's message drafts:
// rate limit -> blocklists -> Turnstile -> save (Supabase) + optional Formspree.

export const RESUBMIT_COOLDOWN_MS = 30000
export const RATE_KEY = 'dc_last_contact'

// Shown when a submission is blocked (by the admin or the spam filter). Kept
// generic so it doesn't reveal exactly why, and offers a path for real people.
export const FLAGGED_MSG = "This message couldn't be sent — it was flagged by our spam filter. If this is a mistake, please email me directly at michael@deemcreative.com."
export const RATE_MSG = 'You just sent a message a moment ago — please wait a bit before sending another.'
export const TURNSTILE_MSG = 'Please complete the "I’m human" check below.'
export const GENERIC_ERR = 'Something went wrong. Please email me directly.'
export const CHAT_PREFIX = '(Sent through Deemo, the site chat)\n\n'

/** RATE_MSG when this browser sent a message within the cooldown, else null. */
export function rateLimitError() {
  try {
    const last = Number(localStorage.getItem(RATE_KEY) || 0)
    if (last && Date.now() - last < RESUBMIT_COOLDOWN_MS) return RATE_MSG
  } catch { /* localStorage unavailable — skip rate limit */ }
  return null
}

/**
 * @param {{name,email,phone?,company?,message}} fields
 * @param {{turnstileToken?: string, source?: 'form'|'chat', formspreeEndpoint?: string}} opts
 * @returns {Promise<{ok:true}|{ok:false,error:string}>}
 */
export async function sendContactMessage(fields, { turnstileToken = '', source = 'form', formspreeEndpoint } = {}) {
  const limited = rateLimitError()
  if (limited) return { ok: false, error: limited }

  // Soft block: blocked by anonymous visitor id OR (reliably) by email.
  const [blockedById, blockedByEmail] = await Promise.all([
    isVisitorBlocked(currentVisitorId()),
    isEmailBlocked(fields.email),
  ])
  if (blockedById || blockedByEmail) return { ok: false, error: FLAGGED_MSG }

  // Turnstile: require a solved, server-verified token when enabled.
  if (isTurnstileEnabled) {
    if (!turnstileToken) return { ok: false, error: TURNSTILE_MSG }
    if (!(await verifyTurnstile(turnstileToken))) return { ok: false, error: FLAGGED_MSG }
  }

  const payload = {
    ...fields,
    message: source === 'chat' ? CHAT_PREFIX + fields.message : fields.message,
  }

  let ok = false
  let firstErr = null
  try {
    await submitMessage(payload)
    ok = true
  } catch (err) {
    firstErr = err
  }

  if (formspreeEndpoint) {
    try {
      const res = await fetch(formspreeEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(payload),
      })
      if (res.ok) ok = true
    } catch {
      /* ignore — covered by the Supabase path */
    }
  }

  if (!ok) return { ok: false, error: firstErr?.message || GENERIC_ERR }
  try { localStorage.setItem(RATE_KEY, String(Date.now())) } catch { /* ignore */ }
  return { ok: true }
}
