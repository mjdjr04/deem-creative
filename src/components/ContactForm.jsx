import { useRef, useState } from 'react'
import { Send, Loader2, CheckCircle2 } from 'lucide-react'
import { useContent } from '../context/ContentContext'
import { submitMessage, isVisitorBlocked, isEmailBlocked, verifyTurnstile } from '../lib/contentApi'
import { trackEvent, currentVisitorId } from '../lib/analytics'
import { ANALYTICS_EVENTS } from '../config/analytics'
import { isTurnstileEnabled } from '../config/turnstile'
import Turnstile from './Turnstile'

const inputClass =
  'w-full px-4 py-3 rounded-lg bg-brand-mid border border-brand-border text-white text-sm placeholder-white/30 focus:outline-none focus:border-brand-accent'

// Spam thresholds. A human takes more than a couple seconds to fill the form,
// and won't legitimately submit twice within a short window.
const MIN_FILL_MS = 3000
const RESUBMIT_COOLDOWN_MS = 30000
const RATE_KEY = 'dc_last_contact'

// Shown when a submission is blocked (by the admin or the spam filter). Kept
// generic so it doesn't reveal exactly why, and offers a path for real people.
const FLAGGED_MSG = "This message couldn't be sent — it was flagged by our spam filter. If this is a mistake, please email me directly at michael@deemcreative.com."
const RATE_MSG = 'You just sent a message a moment ago — please wait a bit before sending another.'

export default function ContactForm() {
  const contact = useContent().settings.contact || {}
  const heading = contact.heading || 'Send a Message'
  const subtext = contact.subtext || "Fill out the form and I'll get back to you, usually within 24 hours."
  const [form, setForm] = useState({ name: '', email: '', phone: '', company: '', message: '' })
  const [website, setWebsite] = useState('') // honeypot — real users never see or fill this
  const [busy, setBusy] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState(null)

  const [tsToken, setTsToken] = useState('') // Cloudflare Turnstile token
  const turnstile = useRef(null)
  const startedAt = useRef(0) // ms of first interaction; 0 until the user edits

  const set = (key, v) => {
    // Fire a one-time "form_start" the first time the visitor edits the form, so
    // the visitor journey shows started-vs-submitted; also anchors the fill timer.
    if (!startedAt.current) {
      startedAt.current = Date.now()
      trackEvent(ANALYTICS_EVENTS.FORM_START, { form: 'contact' })
    }
    setForm((f) => ({ ...f, [key]: v }))
  }

  const submit = async (e) => {
    e.preventDefault()

    // ── Spam gates (show a visible error instead of sending) ──────────────────
    // 1) Honeypot filled → bot.  2) Never interacted / filled implausibly fast.
    const filledMs = startedAt.current ? Date.now() - startedAt.current : 0
    if (website || filledMs < MIN_FILL_MS) {
      setError(FLAGGED_MSG)
      return
    }
    // 3) Rate limit: same browser submitting again within the cooldown.
    try {
      const last = Number(localStorage.getItem(RATE_KEY) || 0)
      if (last && Date.now() - last < RESUBMIT_COOLDOWN_MS) {
        setError(RATE_MSG)
        return
      }
    } catch { /* localStorage unavailable — skip rate limit */ }

    setBusy(true)
    setError(null)

    // 4) Soft block: blocked by anonymous visitor id OR (reliably) by email.
    const [blockedById, blockedByEmail] = await Promise.all([
      isVisitorBlocked(currentVisitorId()),
      isEmailBlocked(form.email),
    ])
    if (blockedById || blockedByEmail) {
      setBusy(false)
      setError(FLAGGED_MSG)
      return
    }

    // 5) Turnstile: require a solved, server-verified token when enabled.
    if (isTurnstileEnabled) {
      if (!tsToken) {
        setBusy(false)
        setError('Please complete the "I’m human" check below.')
        return
      }
      const human = await verifyTurnstile(tsToken)
      if (!human) {
        setBusy(false)
        setError(FLAGGED_MSG)
        turnstile.current?.reset()
        return
      }
    }

    let ok = false
    let firstErr = null

    // 1) Save to the admin inbox (Supabase).
    try {
      await submitMessage(form)
      ok = true
    } catch (err) {
      firstErr = err
    }

    // 2) Email via Formspree, if an endpoint is configured.
    const endpoint = contact.formspreeEndpoint
    if (endpoint) {
      try {
        const res = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
          body: JSON.stringify(form),
        })
        if (res.ok) ok = true
      } catch {
        /* ignore — covered by the Supabase path */
      }
    }

    setBusy(false)
    // The Turnstile token is single-use — clear it for any subsequent attempt.
    turnstile.current?.reset()
    if (ok) {
      trackEvent(ANALYTICS_EVENTS.CONTACT_SUBMIT, { form: 'contact' })
      try { localStorage.setItem(RATE_KEY, String(Date.now())) } catch { /* ignore */ }
      setDone(true)
      setForm({ name: '', email: '', phone: '', company: '', message: '' })
    } else {
      setError(firstErr?.message || 'Something went wrong. Please email me directly.')
    }
  }

  if (done) {
    return (
      <div className="p-8 rounded-2xl bg-brand-mid border border-brand-border text-center">
        <CheckCircle2 size={40} className="text-green-400 mx-auto mb-3" />
        <h3 className="text-white font-semibold text-lg">Message sent!</h3>
        <p className="text-white/55 text-sm mt-1">Thanks for reaching out — I’ll get back to you soon.</p>
        <button onClick={() => setDone(false)} className="mt-4 text-brand-light text-sm hover:text-white">
          Send another
        </button>
      </div>
    )
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <h2 className="text-2xl font-bold text-white">{heading}</h2>
      <p className="text-white/60 text-sm leading-relaxed">{subtext}</p>

      {/* Honeypot: hidden from humans (off-screen + not focusable). Bots that
          fill every field trip this and are silently dropped. */}
      <div aria-hidden="true" className="absolute -left-[9999px] top-auto h-px w-px overflow-hidden">
        <label>
          Website
          <input
            type="text"
            tabIndex={-1}
            autoComplete="off"
            value={website}
            onChange={(e) => setWebsite(e.target.value)}
          />
        </label>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <label className="block">
          <span className="block text-white/60 text-xs font-medium mb-1.5">Name</span>
          <input
            type="text"
            required
            placeholder="Jane Smith"
            value={form.name}
            onChange={(e) => set('name', e.target.value)}
            className={inputClass}
            autoComplete="name"
          />
        </label>
        <label className="block">
          <span className="block text-white/60 text-xs font-medium mb-1.5">Email</span>
          <input
            type="email"
            required
            placeholder="jane@example.com"
            value={form.email}
            onChange={(e) => set('email', e.target.value)}
            className={inputClass}
            autoComplete="email"
          />
        </label>
      </div>
      <div className="grid sm:grid-cols-2 gap-4">
        <label className="block">
          <span className="block text-white/60 text-xs font-medium mb-1.5">Phone <span className="text-white/55">(optional)</span></span>
          <input
            type="tel"
            placeholder="(555) 123-4567"
            value={form.phone}
            onChange={(e) => set('phone', e.target.value)}
            className={inputClass}
            autoComplete="tel"
          />
        </label>
        <label className="block">
          <span className="block text-white/60 text-xs font-medium mb-1.5">Company / Organization <span className="text-white/55">(optional)</span></span>
          <input
            type="text"
            placeholder="Your organization"
            value={form.company}
            onChange={(e) => set('company', e.target.value)}
            className={inputClass}
            autoComplete="organization"
          />
        </label>
      </div>
      <label className="block">
        <span className="block text-white/60 text-xs font-medium mb-1.5">Message</span>
        <textarea
          required
          rows={5}
          placeholder="Tell me a bit about your project, timeline, and goals…"
          value={form.message}
          onChange={(e) => set('message', e.target.value)}
          className={`${inputClass} resize-y`}
        />
      </label>

      <Turnstile controlRef={turnstile} onToken={setTsToken} />

      {error && <p className="text-red-400 text-sm">{error}</p>}

      <button
        type="submit"
        disabled={busy}
        className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-brand-navy border border-brand-accent text-white text-sm font-semibold hover:bg-brand-accent transition-colors disabled:opacity-50"
      >
        {busy ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
        {busy ? 'Sending…' : 'Send Message'}
      </button>
    </form>
  )
}
