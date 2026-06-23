import { useEffect, useState, useCallback, useMemo } from 'react'
import { Loader2, RefreshCw, Trash2, MessageSquare, User, Sparkles } from 'lucide-react'
import { fetchChats, deleteChat, deleteChatSession } from '../../../lib/contentApi'
import { Card } from '../../../components/admin/ui'

function formatDate(ts) {
  const d = new Date(ts)
  if (isNaN(d)) return ts
  return d.toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' })
}

// Group flat rows (newest-first) into conversations keyed by session_id,
// each ordered oldest-first so it reads top-to-bottom like a chat.
function groupBySession(rows) {
  const map = new Map()
  for (const r of rows) {
    const key = r.session_id || `solo-${r.id}`
    if (!map.has(key)) map.set(key, [])
    map.get(key).push(r)
  }
  return Array.from(map.entries()).map(([sessionId, items]) => {
    const ordered = [...items].sort((a, b) => new Date(a.created_at) - new Date(b.created_at))
    return {
      sessionId,
      items: ordered,
      // Sort sessions by their most recent message.
      latest: ordered[ordered.length - 1]?.created_at,
    }
  }).sort((a, b) => new Date(b.latest) - new Date(a.latest))
}

function Session({ session, onRemoveExchange, onRemoveSession }) {
  return (
    <Card>
      <div className="flex items-start justify-between gap-4 mb-3">
        <div className="min-w-0">
          <p className="text-white/55 text-xs">{formatDate(session.items[0].created_at)}</p>
          <p className="text-white/55 text-[11px] mt-0.5">
            {session.items.length} {session.items.length === 1 ? 'exchange' : 'exchanges'}
          </p>
        </div>
        <button
          onClick={() => onRemoveSession(session.sessionId)}
          className="text-red-400/60 hover:text-red-400 p-2 flex-shrink-0"
          title="Delete whole conversation"
        >
          <Trash2 size={16} />
        </button>
      </div>

      <div className="space-y-3">
        {session.items.map((row) => (
          <div key={row.id} className="group space-y-2">
            <div className="flex gap-2">
              <span className="mt-0.5 text-white/55 flex-shrink-0"><User size={14} /></span>
              <p className="text-white/85 text-sm whitespace-pre-line flex-1">{row.question}</p>
              <button
                onClick={() => onRemoveExchange(row.id)}
                className="opacity-0 group-hover:opacity-100 text-red-400/50 hover:text-red-400 transition-opacity flex-shrink-0"
                title="Delete this exchange"
              >
                <Trash2 size={13} />
              </button>
            </div>
            <div className="flex gap-2">
              <span className="mt-0.5 text-brand-light flex-shrink-0"><Sparkles size={14} /></span>
              <p className="text-white/60 text-sm whitespace-pre-line flex-1">{row.answer}</p>
            </div>
          </div>
        ))}
      </div>
    </Card>
  )
}

export default function ChatsEditor() {
  const [chats, setChats] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      setChats(await fetchChats())
    } catch (e) {
      setError(e.message || 'Could not load chats')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    let active = true
    fetchChats()
      .then((data) => { if (active) setChats(data) })
      .catch((e) => { if (active) setError(e.message || 'Could not load chats') })
      .finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [])

  const sessions = useMemo(() => groupBySession(chats), [chats])

  const removeExchange = async (id) => {
    setChats((prev) => prev.filter((x) => x.id !== id))
    try {
      await deleteChat(id)
    } catch {
      load()
    }
  }

  const removeSession = async (sessionId) => {
    if (!window.confirm('Delete this entire conversation? This cannot be undone.')) return
    setChats((prev) => prev.filter((x) => (x.session_id || `solo-${x.id}`) !== sessionId))
    try {
      await deleteChatSession(sessionId)
    } catch {
      load()
    }
  }

  return (
    <div>
      <div className="flex items-start justify-between gap-4 mb-6 pb-5 border-b border-brand-border">
        <div>
          <h1 className="text-2xl font-bold text-white">Chat Logs</h1>
          <p className="text-white/55 text-sm mt-1">
            What visitors are asking the AI assistant
            {sessions.length > 0 ? ` — ${sessions.length} ${sessions.length === 1 ? 'conversation' : 'conversations'}` : ''}.
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
      ) : sessions.length === 0 ? (
        <div className="flex flex-col items-center py-16 text-center">
          <MessageSquare size={28} className="text-white/20 mb-3" />
          <p className="text-white/55 text-sm">No conversations yet.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {sessions.map((s) => (
            <Session
              key={s.sessionId}
              session={s}
              onRemoveExchange={removeExchange}
              onRemoveSession={removeSession}
            />
          ))}
        </div>
      )}
    </div>
  )
}
