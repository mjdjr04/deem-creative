import { useEffect, useState, useCallback } from 'react'
import { Loader2, RefreshCw, Trash2, Mail, MailOpen, Reply, Phone, Building2, Send, CheckCircle2, ExternalLink } from 'lucide-react'
import { fetchMessages, setMessageRead, deleteMessage, sendReply } from '../../../lib/contentApi'
import { Card } from '../../../components/admin/ui'

function formatDate(ts) {
  const d = new Date(ts)
  if (isNaN(d)) return ts
  return d.toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' })
}

// Fallback: pre-filled reply that opens in your own email app.
function mailtoHref(m) {
  const subject = `Re: your message to Deem Creative`
  const quoted = `\n\n\n———\nOn ${formatDate(m.created_at)}, ${m.name || 'you'} wrote:\n${m.message || ''}`
  return `mailto:${m.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(quoted)}`
}

const replyInputClass =
  'w-full px-3 py-2 rounded-lg bg-brand-dark border border-brand-border text-white text-sm placeholder-white/30 focus:outline-none focus:border-brand-accent'

function MessageCard({ m, onToggleRead, onRemove, onMarkRead }) {
  const firstName = (m.name || '').trim().split(/\s+/)[0] || ''
  const [replying, setReplying] = useState(false)
  const [subject, setSubject] = useState('Re: your message to Deem Creative')
  const [body, setBody] = useState(firstName ? `Hi ${firstName},\n\n` : '')
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(false)
  const [err, setErr] = useState(null)

  const send = async () => {
    setSending(true)
    setErr(null)
    try {
      await sendReply({ to: m.email, subject, body })
      setSent(true)
      if (!m.read) onMarkRead(m)
    } catch (e) {
      setErr(e.message || 'Could not send')
    } finally {
      setSending(false)
    }
  }

  return (
    <Card className={m.read ? 'opacity-70' : 'border-brand-accent/50'}>
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-white font-semibold">{m.name || 'Anonymous'}</span>
            {!m.read && <span className="text-[10px] uppercase tracking-wide text-brand-dark bg-brand-light rounded px-1.5 py-0.5 font-bold">New</span>}
          </div>
          {m.email && <a href={`mailto:${m.email}`} className="text-brand-light text-sm hover:text-white">{m.email}</a>}
          <div className="flex flex-wrap items-center gap-x-4 gap-y-0.5 mt-0.5">
            {m.phone && (
              <a href={`tel:${m.phone.replace(/[^\d+]/g, '')}`} className="flex items-center gap-1 text-white/55 text-xs hover:text-white">
                <Phone size={11} /> {m.phone}
              </a>
            )}
            {m.company && (
              <span className="flex items-center gap-1 text-white/55 text-xs">
                <Building2 size={11} /> {m.company}
              </span>
            )}
          </div>
          <p className="text-white/55 text-xs mt-0.5">{formatDate(m.created_at)}</p>
        </div>
        <div className="flex items-center gap-1 flex-shrink-0">
          <button onClick={() => onToggleRead(m)} className="text-white/55 hover:text-white p-2" title={m.read ? 'Mark unread' : 'Mark read'}>
            {m.read ? <Mail size={16} /> : <MailOpen size={16} />}
          </button>
          <button onClick={() => onRemove(m)} className="text-red-400/60 hover:text-red-400 p-2" title="Delete">
            <Trash2 size={16} />
          </button>
        </div>
      </div>

      <p className="text-white/70 text-sm mt-3 whitespace-pre-line">{m.message}</p>

      {m.email && (
        <div className="mt-4 pt-3 border-t border-brand-border">
          {sent ? (
            <p className="flex items-center gap-2 text-green-400 text-sm">
              <CheckCircle2 size={16} /> Reply sent to {m.email}
            </p>
          ) : !replying ? (
            <div className="flex items-center gap-3">
              <button
                onClick={() => setReplying(true)}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-brand-navy border border-brand-accent text-white text-sm font-semibold hover:bg-brand-accent transition-colors"
              >
                <Reply size={15} /> Reply
              </button>
              <a href={mailtoHref(m)} className="inline-flex items-center gap-1.5 text-white/55 text-xs hover:text-white">
                <ExternalLink size={12} /> Open in email app instead
              </a>
            </div>
          ) : (
            <div className="space-y-2">
              <p className="text-white/55 text-xs">Sends from michael@deemcreative.com</p>
              <input value={subject} onChange={(e) => setSubject(e.target.value)} className={replyInputClass} placeholder="Subject" />
              <textarea value={body} onChange={(e) => setBody(e.target.value)} rows={5} className={`${replyInputClass} resize-y`} placeholder="Write your reply…" />
              {err && <p className="text-red-400 text-xs">{err}</p>}
              <div className="flex items-center gap-2">
                <button
                  onClick={send}
                  disabled={sending || !body.trim()}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-green-600 border border-green-500 text-white text-sm font-semibold hover:bg-green-500 transition-colors disabled:opacity-50"
                >
                  {sending ? <Loader2 size={15} className="animate-spin" /> : <Send size={15} />}
                  {sending ? 'Sending…' : 'Send reply'}
                </button>
                <button onClick={() => setReplying(false)} disabled={sending} className="px-4 py-2 rounded-lg border border-brand-border text-white/60 text-sm hover:text-white">
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </Card>
  )
}

export default function MessagesEditor() {
  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      setMessages(await fetchMessages())
    } catch (e) {
      setError(e.message || 'Could not load messages')
    } finally {
      setLoading(false)
    }
  }, [])

  // Initial load — state is set from async callbacks, never synchronously in
  // the effect body (avoids cascading-render warnings).
  useEffect(() => {
    let active = true
    fetchMessages()
      .then((data) => { if (active) setMessages(data) })
      .catch((e) => { if (active) setError(e.message || 'Could not load messages') })
      .finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [])

  const toggleRead = async (m) => {
    setMessages((prev) => prev.map((x) => (x.id === m.id ? { ...x, read: !m.read } : x)))
    try {
      await setMessageRead(m.id, !m.read)
    } catch {
      load()
    }
  }

  const remove = async (m) => {
    if (!window.confirm('Delete this message? This cannot be undone.')) return
    setMessages((prev) => prev.filter((x) => x.id !== m.id))
    try {
      await deleteMessage(m.id)
    } catch {
      load()
    }
  }

  const unread = messages.filter((m) => !m.read).length

  return (
    <div>
      <div className="flex items-start justify-between gap-4 mb-6 pb-5 border-b border-brand-border">
        <div>
          <h1 className="text-2xl font-bold text-white">Messages</h1>
          <p className="text-white/55 text-sm mt-1">
            Contact-form submissions{unread > 0 ? ` — ${unread} unread` : ''}.
          </p>
        </div>
        <button
          onClick={load}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-brand-border text-white/70 text-sm font-medium hover:border-brand-accent hover:text-white"
        >
          <RefreshCw size={15} /> Refresh
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><Loader2 className="animate-spin text-brand-light" /></div>
      ) : error ? (
        <p className="text-red-400 text-sm">{error}</p>
      ) : messages.length === 0 ? (
        <p className="text-white/55 text-sm">No messages yet.</p>
      ) : (
        <div className="space-y-4">
          {messages.map((m) => (
            <MessageCard
              key={m.id}
              m={m}
              onToggleRead={toggleRead}
              onRemove={remove}
              onMarkRead={(msg) => toggleRead({ ...msg, read: false })}
            />
          ))}
        </div>
      )}
    </div>
  )
}
