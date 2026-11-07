import { useId, useRef, useState } from 'react'
import { Send, Loader2, CheckCircle2 } from 'lucide-react'
import { useContent } from '../context/ContentContext'
import { sendContactMessage } from '../lib/sendContactMessage'
import { trackEvent } from '../lib/analytics'
import { ANALYTICS_EVENTS } from '../config/analytics'
import Turnstile from './Turnstile'

const fieldClass =
  'w-full px-3 py-2 rounded-lg bg-brand-dark border border-brand-border text-white text-sm placeholder-white/30 focus:outline-none focus:border-brand-accent focus-visible:ring-2 focus-visible:ring-brand-accent/60 disabled:opacity-60'

// Deemo's draft of a message to Michael. The visitor edits and sends it; nothing
// leaves the browser until they press "Send to Michael".
export default function ChatMessageDraft({ draft, sent, sending, onSending, onSent, onCancel }) {
  const contact = useContent().settings.contact || {}
  const uid = useId()
  const [form, setForm] = useState({ name: draft.name, email: draft.email, message: draft.message })
  const [localBusy, setBusy] = useState(false)
  // `sending` lives on the parent message, so closing and reopening the panel
  // mid-send can't start a second submit.
  const busy = localBusy || Boolean(sending)
  const [error, setError] = useState(null)
  const [tsToken, setTsToken] = useState('')
  const turnstile = useRef(null)

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }))

  if (sent) {
    return (
      <div role="status" className="mt-2.5 flex items-start gap-2 rounded-xl bg-brand-dark border border-brand-border p-3 text-xs text-white/85">
        <CheckCircle2 size={16} className="text-green-400 flex-shrink-0 mt-px" />
        <span>Sent — Michael usually replies within a couple of days.</span>
      </div>
    )
  }

  const submit = async (e) => {
    e.preventDefault()
    if (busy) return
    setBusy(true)
    onSending(true)
    setError(null)
    const values = { name: form.name.trim(), email: form.email.trim(), message: form.message.trim() }
    const result = await sendContactMessage(
      { ...values, phone: '', company: '' },
      { turnstileToken: tsToken, source: 'chat', formspreeEndpoint: contact.formspreeEndpoint },
    )
    setBusy(false)
    onSending(false)
    turnstile.current?.reset()
    if (result.ok) {
      trackEvent(ANALYTICS_EVENTS.CONTACT_SUBMIT, { form: 'chat' })
      onSent(values)
    } else {
      setError(result.error)
    }
  }

  return (
    <form onSubmit={submit} className="mt-2.5 space-y-2.5 rounded-xl bg-brand-dark border border-brand-border p-3 whitespace-normal">
      <p className="text-white/55 text-xs">Review, edit, then send. Nothing goes to Michael until you press Send.</p>
      <div>
        <label htmlFor={`${uid}-name`} className="block text-white/60 text-xs font-medium mb-1">Name</label>
        <input id={`${uid}-name`} type="text" required autoComplete="name" value={form.name} onChange={set('name')} disabled={busy} className={fieldClass} />
      </div>
      <div>
        <label htmlFor={`${uid}-email`} className="block text-white/60 text-xs font-medium mb-1">Email</label>
        <input id={`${uid}-email`} type="email" required autoComplete="email" value={form.email} onChange={set('email')} disabled={busy} className={fieldClass} />
      </div>
      <div>
        <label htmlFor={`${uid}-msg`} className="block text-white/60 text-xs font-medium mb-1">Message</label>
        <textarea id={`${uid}-msg`} required rows={4} value={form.message} onChange={set('message')} disabled={busy} className={`${fieldClass} resize-y`} />
      </div>

      <Turnstile controlRef={turnstile} onToken={setTsToken} />

      {error && <p role="alert" className="text-red-400 text-xs">{error}</p>}

      <div className="flex items-center gap-2">
        <button
          type="submit"
          disabled={busy}
          className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-lg bg-brand-navy border border-brand-accent text-white text-xs font-semibold hover:bg-brand-accent transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-accent/60 disabled:opacity-50"
        >
          {busy ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
          {busy ? 'Sending…' : 'Send to Michael'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          disabled={busy}
          className="px-3.5 py-2 rounded-lg bg-brand-surface border border-brand-border text-white/70 text-xs hover:border-brand-accent hover:text-white transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-accent/60 disabled:opacity-50"
        >
          Cancel
        </button>
      </div>
    </form>
  )
}
