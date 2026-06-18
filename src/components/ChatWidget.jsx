import { useState, useRef, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Bot, X, Send, Loader2, CalendarCheck, ExternalLink, Play } from 'lucide-react'
import { BOOKING_API_URL } from '../config/booking'
import { logChat } from '../lib/contentApi'
import { useContent } from '../context/ContentContext'

// The assistant's name — change it here and it updates everywhere.
const BOT_NAME = 'Deemo'

const GREETING = {
  role: 'assistant',
  content: `Hey, I'm ${BOT_NAME} 🤖 — Michael's AI assistant. Ask me anything about his work, experience, services, or how to get in touch.`,
}

// Shown as tappable chips before the visitor's first message.
const SUGGESTIONS = [
  'What services does Michael offer?',
  'Tell me about his experience',
  'Can I see some of his work?',
  'How do I book a consultation?',
]

// Proactive nudges keyed by route. When a visitor lingers on a page, Deemo peeks
// out with a contextual suggestion. `prompt` (optional) is auto-sent to the chat
// when the visitor taps the nudge; `delay` is how long they linger first.
const NUDGES = {
  '/': {
    text: "👋 New here? I can walk you through Michael's best work in 30 seconds.",
    cta: 'Give me the tour',
    prompt: "Give me a quick overview of Michael's best work.",
    delay: 14000,
  },
  '/portfolio': {
    text: "🎬 Want to see Michael's most recent video?",
    cta: 'Show me',
    prompt: "What's Michael's most recent video project, and where can I watch it?",
    delay: 6000,
  },
  '/services': {
    text: "Not sure which service fits your project? I can point you in the right direction — or you can grab a free consult.",
    cta: 'Help me choose',
    prompt: 'Which service is the best fit for my project, and how do I book a free consultation?',
    delay: 8000,
  },
  '/contact': {
    text: 'Got a quick question before reaching out? Ask me right here.',
    cta: 'Ask a question',
    prompt: null,
    delay: 6000,
  },
}

// One id per page visit, so an admin can read a conversation as a thread.
function newSessionId() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID()
  return 'sess-' + Math.random().toString(36).slice(2) + Date.now().toString(36)
}

// Deemo's replies are lightweight Markdown. We tokenize a reply into plain text,
// **bold**, Markdown links [label](target), and bare URLs, so each renders right:
// bold as bold, links/booking URLs as real clickable navigation.
const TOKEN_RE = /\[([^\]]+)\]\(([^)]+)\)|\*\*([^*]+)\*\*|(https?:\/\/[^\s)]+)/g

// Any link that points at the on-site booking/calendar page.
function isBookingTarget(t) {
  return /^\/booking$|^book$|calendar\.app\.google|calendar\.google\.com/i.test(t)
}

function tokenize(text) {
  const out = []
  let last = 0
  let m
  TOKEN_RE.lastIndex = 0
  while ((m = TOKEN_RE.exec(text)) !== null) {
    if (m.index > last) out.push({ type: 'text', value: text.slice(last, m.index) })
    if (m[1] !== undefined) out.push({ type: 'link', label: m[1], target: m[2].trim() })
    else if (m[3] !== undefined) out.push({ type: 'bold', value: m[3] })
    else if (m[4] !== undefined) out.push({ type: 'url', target: m[4] })
    last = m.index + m[0].length
  }
  if (last < text.length) out.push({ type: 'text', value: text.slice(last) })
  return out
}

export default function ChatWidget({ onOpenProject }) {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState([GREETING])
  const [input, setInput] = useState('')
  const [busy, setBusy] = useState(false)
  const [nudge, setNudge] = useState(null)
  const scrollRef = useRef(null)
  const sessionId = useRef(newSessionId())
  const engaged = useRef(false) // visitor has opened the chat at least once
  const nudgedPaths = useRef(new Set()) // each page nudges at most once per visit
  const location = useLocation()
  const navigate = useNavigate()
  const content = useContent()

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' })
  }, [messages, open])

  // Proactive nudge: after the visitor lingers on a page, peek out with a hint.
  // Skips if the chat is open, already engaged, or this page already nudged.
  useEffect(() => {
    if (engaged.current || open) return
    const path = location.pathname
    const cfg = NUDGES[path]
    if (!cfg || nudgedPaths.current.has(path)) return
    const t = setTimeout(() => {
      if (engaged.current || open) return
      nudgedPaths.current.add(path)
      setNudge({ ...cfg, path })
    }, cfg.delay ?? 6000)
    return () => clearTimeout(t)
  }, [location.pathname, open])

  // No backend configured → don't render the widget at all.
  if (!BOOKING_API_URL) return null

  const toggleOpen = () => {
    setOpen((v) => !v)
    engaged.current = true
    setNudge(null)
  }

  const acceptNudge = () => {
    const n = nudge
    setNudge(null)
    engaged.current = true
    setOpen(true)
    if (n?.prompt) send(null, n.prompt)
  }

  // Carry out a link Deemo placed in a reply: open a project, go to a page,
  // or follow an external URL. We close the panel so the visitor sees the result.
  const runAction = (target) => {
    if (/^https?:/i.test(target)) {
      window.open(target, '_blank', 'noopener,noreferrer')
      return
    }
    const proj = target.match(/^(?:project|video):(.+)$/i)
    if (proj) {
      const id = proj[1].trim()
      const match = (content?.projects?.items || []).find((p) => p.id === id)
      if (match && onOpenProject) {
        onOpenProject(match)
        setOpen(false)
      } else {
        navigate('/portfolio')
        setOpen(false)
      }
      return
    }
    const path = target === 'book' ? '/booking' : target
    if (path.startsWith('/')) {
      navigate(path)
      setOpen(false)
    }
  }

  // A booking call-to-action rendered as a button (calendar icon).
  const bookingButton = (label, key) => (
    <button
      key={key}
      onClick={() => runAction('/booking')}
      className="inline-flex items-center gap-1.5 align-middle mx-0.5 px-2.5 py-1 rounded-lg bg-brand-navy border border-brand-accent text-white text-xs font-semibold hover:bg-brand-accent transition-colors"
    >
      <CalendarCheck size={13} /> {label}
    </button>
  )

  // Render an assistant reply: **bold**, [label](target) links, and bare URLs all
  // become their proper element. Booking links/URLs render as a calendar button.
  const renderReply = (text) =>
    tokenize(text).map((seg, i) => {
      if (seg.type === 'text') return <span key={i}>{seg.value}</span>
      if (seg.type === 'bold') return <strong key={i} className="font-semibold text-white">{seg.value}</strong>

      if (seg.type === 'url') {
        if (isBookingTarget(seg.target)) return bookingButton('Book a free consultation', i)
        return (
          <a
            key={i}
            href={seg.target}
            target="_blank"
            rel="noopener noreferrer"
            className="text-brand-light font-medium underline underline-offset-2 hover:text-white break-all"
          >
            {seg.target} <ExternalLink size={11} className="inline mb-0.5" />
          </a>
        )
      }

      // Markdown link
      if (isBookingTarget(seg.target)) return bookingButton(seg.label, i)
      const isExternal = /^https?:/i.test(seg.target)
      const isProject = /^(?:project|video):/i.test(seg.target)
      return (
        <button
          key={i}
          onClick={() => runAction(seg.target)}
          className="inline text-left text-brand-light font-medium underline underline-offset-2 hover:text-white transition-colors"
        >
          {isProject && <Play size={12} className="inline mb-0.5 mr-0.5" />}
          {seg.label}
          {isExternal && <ExternalLink size={11} className="inline mb-0.5 ml-0.5" />}
        </button>
      )
    })

  const send = async (e, preset) => {
    e?.preventDefault()
    const text = (preset ?? input).trim()
    if (!text || busy) return
    setInput('')
    const next = [...messages, { role: 'user', content: text }]
    setMessages(next)
    setBusy(true)

    // API history must start with a user turn — drop the greeting (index 0).
    const apiMessages = next.slice(1).map((m) => ({ role: m.role, content: m.content }))

    try {
      const res = await fetch(BOOKING_API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({ action: 'chat', messages: apiMessages }),
      })
      const data = await res.json()
      const reply = data.ok ? data.reply : (data.error || 'Something went wrong. Please email michael@deemcreative.com.')
      setMessages((m) => [...m, { role: 'assistant', content: reply }])
      // Best-effort log of the exchange for the admin panel — never blocks the UI.
      if (data.ok) logChat({ sessionId: sessionId.current, question: text, answer: reply })
    } catch {
      setMessages((m) => [...m, { role: 'assistant', content: 'I had trouble connecting. Please try again, or email michael@deemcreative.com.' }])
    } finally {
      setBusy(false)
    }
  }

  return (
    <>
      {/* Proactive nudge bubble — peeks out above the launcher */}
      <AnimatePresence>
        {nudge && !open && (
          <motion.div
            initial={{ opacity: 0, y: 12, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.9 }}
            transition={{ type: 'spring', stiffness: 400, damping: 28 }}
            className="fixed bottom-24 left-6 z-40 w-[min(20rem,calc(100vw-3rem))]"
          >
            <div className="relative rounded-2xl rounded-bl-sm bg-brand-mid border border-brand-border shadow-2xl p-3.5">
              <button
                onClick={() => setNudge(null)}
                aria-label="Dismiss"
                className="absolute top-2 right-2 text-white/30 hover:text-white p-1"
              >
                <X size={14} />
              </button>
              <button onClick={acceptNudge} className="flex items-start gap-2.5 text-left w-full pr-4">
                <span className="mt-0.5 w-7 h-7 flex-shrink-0 rounded-lg bg-brand-accent/20 border border-brand-accent/40 flex items-center justify-center">
                  <Bot size={15} className="text-brand-light" />
                </span>
                <span className="min-w-0">
                  <span className="block text-white/85 text-sm leading-snug">{nudge.text}</span>
                  <span className="mt-1.5 inline-block text-brand-light text-xs font-semibold">{nudge.cta} →</span>
                </span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Launcher */}
      <motion.button
        onClick={toggleOpen}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        aria-label={open ? 'Close chat' : `Open ${BOT_NAME}, the AI assistant`}
        className="fixed bottom-6 left-6 z-40 w-14 h-14 rounded-full bg-brand-navy border border-brand-accent text-white shadow-lg flex items-center justify-center hover:bg-brand-accent transition-colors"
      >
        {/* Soft ping to draw the eye while a nudge is waiting */}
        {nudge && !open && (
          <span className="absolute -top-0.5 -right-0.5 w-3 h-3 rounded-full bg-brand-light ring-2 ring-brand-dark animate-pulse" />
        )}
        {open ? <X size={22} /> : <Bot size={24} />}
      </motion.button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.96 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-24 left-6 z-40 w-[calc(100vw-3rem)] sm:w-96 max-h-[70vh] flex flex-col rounded-2xl bg-brand-mid border border-brand-border shadow-2xl overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center gap-3 px-4 py-3 bg-brand-navy border-b border-brand-border">
              <div className="w-8 h-8 rounded-lg bg-brand-accent/20 border border-brand-accent/40 flex items-center justify-center">
                <Bot size={16} className="text-brand-light" />
              </div>
              <div className="min-w-0">
                <p className="text-white text-sm font-semibold leading-tight">{BOT_NAME}</p>
                <p className="text-white/45 text-xs">Michael's AI assistant · powered by Claude</p>
              </div>
            </div>

            {/* Messages */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3">
              {messages.map((m, i) => (
                <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div
                    className={`max-w-[85%] px-3.5 py-2 rounded-2xl text-sm leading-relaxed whitespace-pre-line ${
                      m.role === 'user'
                        ? 'bg-brand-navy text-white rounded-br-sm'
                        : 'bg-brand-surface text-white/85 border border-brand-border rounded-bl-sm'
                    }`}
                  >
                    {m.role === 'assistant' ? renderReply(m.content) : m.content}
                  </div>
                </div>
              ))}
              {busy && (
                <div className="flex justify-start">
                  <div className="px-3.5 py-2.5 rounded-2xl rounded-bl-sm bg-brand-surface border border-brand-border">
                    <Loader2 size={16} className="animate-spin text-brand-light" />
                  </div>
                </div>
              )}

              {/* Suggested questions — only before the visitor's first message */}
              {messages.length === 1 && !busy && (
                <div className="flex flex-wrap gap-2 pt-1">
                  {SUGGESTIONS.map((q) => (
                    <button
                      key={q}
                      onClick={() => send(null, q)}
                      className="px-3 py-1.5 rounded-full bg-brand-surface border border-brand-border text-white/70 text-xs text-left hover:border-brand-accent hover:text-white transition-colors"
                    >
                      {q}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Input */}
            <form onSubmit={send} className="p-3 border-t border-brand-border flex items-center gap-2">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={`Ask ${BOT_NAME} anything…`}
                className="flex-1 px-3 py-2 rounded-lg bg-brand-dark border border-brand-border text-white text-sm placeholder-white/30 focus:outline-none focus:border-brand-accent"
              />
              <button
                type="submit"
                disabled={busy || !input.trim()}
                className="w-9 h-9 flex-shrink-0 rounded-lg bg-brand-navy border border-brand-accent text-white flex items-center justify-center hover:bg-brand-accent transition-colors disabled:opacity-40"
                aria-label="Send message"
              >
                <Send size={16} />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
