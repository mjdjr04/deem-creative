import { useState } from 'react'
import { Send, Loader2, CheckCircle2 } from 'lucide-react'
import { useContent } from '../context/ContentContext'
import { submitMessage } from '../lib/contentApi'

const inputClass =
  'w-full px-4 py-3 rounded-lg bg-brand-mid border border-brand-border text-white text-sm placeholder-white/30 focus:outline-none focus:border-brand-accent'

export default function ContactForm() {
  const contact = useContent().settings.contact || {}
  const heading = contact.heading || 'Send a Message'
  const subtext = contact.subtext || "Fill out the form and I'll get back to you, usually within 24 hours."
  const [form, setForm] = useState({ name: '', email: '', phone: '', company: '', message: '' })
  const [busy, setBusy] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState(null)

  const set = (key, v) => setForm((f) => ({ ...f, [key]: v }))

  const submit = async (e) => {
    e.preventDefault()
    setBusy(true)
    setError(null)

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
    if (ok) {
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
          <span className="block text-white/60 text-xs font-medium mb-1.5">Phone <span className="text-white/35">(optional)</span></span>
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
          <span className="block text-white/60 text-xs font-medium mb-1.5">Company / Organization <span className="text-white/35">(optional)</span></span>
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
