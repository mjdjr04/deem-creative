import { useEffect, useMemo, useState } from 'react'
import {
  Loader2, RefreshCw, Users, ChevronRight, MapPin, Monitor, Smartphone, Tablet,
  Eye, MousePointerClick, Repeat, Compass, Ban, ShieldCheck,
} from 'lucide-react'
import {
  fetchAnalytics, trafficSource, fetchBlockedVisitors, blockVisitor, unblockVisitor,
} from '../../../lib/contentApi'

const RANGES = [
  { days: 7, label: '7 days' },
  { days: 30, label: '30 days' },
  { days: 90, label: '90 days' },
]

function timeAgo(ms, now) {
  const s = Math.max(0, Math.round((now - ms) / 1000))
  if (s < 60) return 'just now'
  const m = Math.round(s / 60)
  if (m < 60) return `${m}m ago`
  const h = Math.round(m / 60)
  if (h < 24) return `${h}h ago`
  return `${Math.round(h / 24)}d ago`
}

function fmtDuration(sec) {
  if (sec <= 0) return '—'
  if (sec < 60) return `${sec}s`
  const m = Math.floor(sec / 60)
  const s = sec % 60
  return s ? `${m}m ${s}s` : `${m}m`
}

const fmtDate = (ms) => new Date(ms).toLocaleDateString([], { month: 'short', day: 'numeric' })

function deviceGlyph(device, size = 12) {
  if (device === 'mobile') return <Smartphone size={size} />
  if (device === 'tablet') return <Tablet size={size} />
  return <Monitor size={size} />
}

const prettyEvent = (name) => (name || 'event').replace(/_/g, ' ')

// Block / unblock control shown inside an expanded visit or visitor. Blocking a
// visitor id stops that browser from submitting the contact form (soft block).
function BlockControl({ visitorId, blocked, busy, onToggle }) {
  if (!visitorId) return null
  return blocked ? (
    <button
      onClick={() => onToggle(visitorId, false)}
      disabled={busy}
      className="inline-flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-lg border border-brand-border text-white/60 hover:text-white hover:border-brand-accent transition-colors disabled:opacity-50"
    >
      <ShieldCheck size={13} /> Unblock
    </button>
  ) : (
    <button
      onClick={() => onToggle(visitorId, true)}
      disabled={busy}
      className="inline-flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-lg border border-red-500/30 text-red-300/80 hover:text-red-200 hover:border-red-500/60 transition-colors disabled:opacity-50"
    >
      <Ban size={13} /> Block this visitor
    </button>
  )
}

function StatCard({ label, value }) {
  return (
    <div className="rounded-xl bg-brand-mid border border-brand-border p-5">
      <p className="text-3xl font-bold text-white">{value}</p>
      <p className="text-white/55 text-sm mt-1">{label}</p>
    </div>
  )
}

// One visit: summary row that expands into the ordered journey. Self-contained
// so it renders identically in the flat list and nested under a visitor.
function SessionCard({ s, nowMs, nested = false, blocked = false, blockBusy = false, onToggleBlock }) {
  const [open, setOpen] = useState(false)
  const location = [s.city, s.country].filter(Boolean).join(', ') || 'Unknown location'
  return (
    <div className={`rounded-xl overflow-hidden ${nested ? 'bg-brand-dark/40 border border-brand-border/60' : 'bg-brand-mid border border-brand-border'}`}>
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center gap-3 md:gap-4 p-4 text-left hover:bg-brand-surface/40 transition-colors"
      >
        <ChevronRight size={18} className={`text-white/40 flex-shrink-0 transition-transform ${open ? 'rotate-90' : ''}`} />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="flex items-center gap-1.5 text-white font-medium text-sm">
              <MapPin size={14} className="text-brand-light flex-shrink-0" /> {location}
            </span>
            {s.returning && !nested && (
              <span className="inline-flex items-center gap-1 text-[11px] px-1.5 py-0.5 rounded bg-brand-navy text-brand-light">
                <Repeat size={11} /> Returning
              </span>
            )}
            {blocked && (
              <span className="inline-flex items-center gap-1 text-[11px] px-1.5 py-0.5 rounded bg-red-500/15 text-red-300">
                <Ban size={11} /> Blocked
              </span>
            )}
          </div>
          <div className="flex items-center gap-x-3 gap-y-0.5 flex-wrap text-white/50 text-xs mt-1">
            <span className="flex items-center gap-1">{deviceGlyph(s.device)} {s.device}{s.browser ? ` · ${s.browser}` : ''}</span>
            <span>{s.pageviews} page{s.pageviews === 1 ? '' : 's'}</span>
            {s.eventCount > 0 && <span className="text-amber-300/80">{s.eventCount} action{s.eventCount === 1 ? '' : 's'}</span>}
            <span>{fmtDuration(s.durationSec)}</span>
            <span className="flex items-center gap-1"><Compass size={12} /> {s.source === 'Direct' ? 'Direct' : `via ${s.source}`}</span>
          </div>
        </div>
        <span className="text-white/40 text-xs flex-shrink-0 whitespace-nowrap">{timeAgo(s.startMs, nowMs)}</span>
      </button>

      {open && (
        <div className="border-t border-brand-border px-4 py-3 bg-brand-dark/30">
          <p className="text-white/40 text-[11px] uppercase tracking-wide mb-2">
            Journey · visitor {s.visitorId ? `#${s.visitorId.slice(0, 6)}` : 'unknown'}
          </p>
          <ol className="space-y-1.5">
            {s.events.map((e, i) => {
              const isEvent = e.type === 'event'
              const Icon = isEvent ? MousePointerClick : Eye
              const label = isEvent ? prettyEvent(e.name) : (e.path || '/')
              const t = new Date(e.created_at).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', second: '2-digit' })
              return (
                <li key={i} className="flex items-center gap-2.5 text-sm">
                  <Icon size={13} className={isEvent ? 'text-amber-300 flex-shrink-0' : 'text-brand-light flex-shrink-0'} />
                  <span className={`${isEvent ? 'text-amber-200' : 'text-white/80'} truncate`}>{label}</span>
                  <span className="text-white/30 text-xs ml-auto flex-shrink-0">{t}</span>
                </li>
              )
            })}
          </ol>
          {onToggleBlock && (
            <div className="mt-3 pt-3 border-t border-brand-border/60 flex justify-end">
              <BlockControl visitorId={s.visitorId} blocked={blocked} busy={blockBusy} onToggle={onToggleBlock} />
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// One visitor across all their visits: count, first/last seen, expand to visits.
function VisitorCard({ v, nowMs, blocked = false, blockBusy = false, onToggleBlock }) {
  const [open, setOpen] = useState(false)
  const location = [v.city, v.country].filter(Boolean).join(', ') || 'Unknown location'
  return (
    <div className="rounded-xl bg-brand-mid border border-brand-border overflow-hidden">
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center gap-3 md:gap-4 p-4 text-left hover:bg-brand-surface/40 transition-colors"
      >
        <ChevronRight size={18} className={`text-white/40 flex-shrink-0 transition-transform ${open ? 'rotate-90' : ''}`} />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="flex items-center gap-1.5 text-white font-medium text-sm">
              <MapPin size={14} className="text-brand-light flex-shrink-0" /> {location}
            </span>
            <span className="inline-flex items-center gap-1 text-[11px] px-1.5 py-0.5 rounded bg-brand-navy text-brand-light">
              <Repeat size={11} /> {v.visitCount} visit{v.visitCount === 1 ? '' : 's'}
            </span>
            {blocked && (
              <span className="inline-flex items-center gap-1 text-[11px] px-1.5 py-0.5 rounded bg-red-500/15 text-red-300">
                <Ban size={11} /> Blocked
              </span>
            )}
          </div>
          <div className="flex items-center gap-x-3 gap-y-0.5 flex-wrap text-white/50 text-xs mt-1">
            <span className="flex items-center gap-1">{deviceGlyph(v.device)} {v.device}</span>
            <span>{v.totalPageviews} page{v.totalPageviews === 1 ? '' : 's'}</span>
            {v.totalEvents > 0 && <span className="text-amber-300/80">{v.totalEvents} action{v.totalEvents === 1 ? '' : 's'}</span>}
            <span>First seen {fmtDate(v.firstMs)}</span>
          </div>
        </div>
        <span className="text-white/40 text-xs flex-shrink-0 whitespace-nowrap">{timeAgo(v.lastMs, nowMs)}</span>
      </button>

      {open && (
        <div className="border-t border-brand-border p-3 bg-brand-dark/20 space-y-2">
          {v.sessions.map((s) => <SessionCard key={s.sessionId} s={s} nowMs={nowMs} nested />)}
          {onToggleBlock && (
            <div className="pt-2 flex justify-end">
              <BlockControl visitorId={v.visitorId} blocked={blocked} busy={blockBusy} onToggle={onToggleBlock} />
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default function VisitorsEditor() {
  const [days, setDays] = useState(30)
  const [rows, setRows] = useState([])
  const [nowMs, setNowMs] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [view, setView] = useState('visit') // 'visit' | 'visitor'
  const [blocked, setBlocked] = useState(() => new Set()) // blocked visitor ids
  const [blockBusyId, setBlockBusyId] = useState(null)

  const load = async (d) => {
    setLoading(true)
    setError(null)
    try {
      const [data, blockList] = await Promise.all([
        fetchAnalytics({ days: d }),
        fetchBlockedVisitors().catch(() => []),
      ])
      setNowMs(Date.now())
      setRows(data)
      setBlocked(new Set(blockList.map((b) => b.visitor_id)))
    } catch (e) {
      setError(e.message || 'Could not load visitor data.')
    } finally {
      setLoading(false)
    }
  }

  const toggleBlock = async (visitorId, shouldBlock) => {
    setBlockBusyId(visitorId)
    try {
      if (shouldBlock) await blockVisitor(visitorId)
      else await unblockVisitor(visitorId)
      setBlocked((prev) => {
        const next = new Set(prev)
        if (shouldBlock) next.add(visitorId)
        else next.delete(visitorId)
        return next
      })
    } catch (e) {
      setError(e.message || 'Could not update the blocklist.')
    } finally {
      setBlockBusyId(null)
    }
  }

  // load() flips loading state inside an async call, after the effect body runs.
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { load(days) }, [days])

  const { sessions, visitors, stats } = useMemo(() => {
    // Group raw events into sessions (one per-tab visit), keyed by session_id.
    const byId = new Map()
    for (const r of rows) {
      if (!r.session_id) continue
      if (!byId.has(r.session_id)) {
        byId.set(r.session_id, { sessionId: r.session_id, visitorId: r.visitor_id, events: [] })
      }
      byId.get(r.session_id).events.push(r)
    }

    const visitorCount = new Map()
    const list = []
    for (const s of byId.values()) {
      s.events.sort((a, b) => new Date(a.created_at) - new Date(b.created_at))
      const first = s.events[0]
      const last = s.events[s.events.length - 1]
      const startMs = new Date(first.created_at).getTime()
      const endMs = new Date(last.created_at).getTime()
      const geo = s.events.find((e) => e.city || e.country) || first
      list.push({
        sessionId: s.sessionId,
        visitorId: s.visitorId,
        events: s.events,
        startMs,
        durationSec: Math.round((endMs - startMs) / 1000),
        pageviews: s.events.filter((e) => e.type === 'pageview').length,
        eventCount: s.events.filter((e) => e.type === 'event').length,
        city: geo.city,
        country: geo.country,
        device: first.device,
        browser: first.browser,
        source: trafficSource(first),
      })
      visitorCount.set(s.visitorId, (visitorCount.get(s.visitorId) || 0) + 1)
    }
    list.sort((a, b) => b.startMs - a.startMs)
    for (const s of list) s.returning = (visitorCount.get(s.visitorId) || 0) > 1

    // Roll sessions up into visitors (newest activity first).
    const vMap = new Map()
    for (const s of list) {
      if (!vMap.has(s.visitorId)) vMap.set(s.visitorId, [])
      vMap.get(s.visitorId).push(s)
    }
    const visitors = [...vMap.entries()].map(([visitorId, ss]) => ({
      visitorId,
      sessions: ss, // already newest-first
      visitCount: ss.length,
      firstMs: Math.min(...ss.map((s) => s.startMs)),
      lastMs: Math.max(...ss.map((s) => s.startMs)),
      totalPageviews: ss.reduce((a, s) => a + s.pageviews, 0),
      totalEvents: ss.reduce((a, s) => a + s.eventCount, 0),
      city: ss[0].city,
      country: ss[0].country,
      device: ss[0].device,
    })).sort((a, b) => b.lastMs - a.lastMs)

    return {
      sessions: list,
      visitors,
      stats: {
        total: list.length,
        uniqueVisitors: vMap.size,
        returningVisitors: [...visitorCount.values()].filter((c) => c > 1).length,
      },
    }
  }, [rows])

  return (
    <div>
      <div className="flex flex-wrap items-start justify-between gap-4 mb-6 pb-5 border-b border-brand-border">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Users size={22} className="text-brand-light" /> Visitors
          </h1>
          <p className="text-white/55 text-sm mt-1">
            Individual visits over the last {days} days. Each visit is anonymous (a random ID, not a
            name or IP) and expands to show exactly what that visitor did, in order.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex rounded-lg border border-brand-border overflow-hidden">
            {RANGES.map((r) => (
              <button
                key={r.days}
                onClick={() => setDays(r.days)}
                className={`px-3 py-1.5 text-sm transition-colors ${days === r.days ? 'bg-brand-navy text-white' : 'text-white/60 hover:text-white'}`}
              >
                {r.label}
              </button>
            ))}
          </div>
          <button
            onClick={() => load(days)}
            className="p-2 rounded-lg border border-brand-border text-white/60 hover:text-white hover:border-brand-accent transition-colors"
            title="Refresh"
          >
            <RefreshCw size={16} />
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-24 text-white/55">
          <Loader2 className="animate-spin mr-2" size={20} /> Loading visitors…
        </div>
      ) : error ? (
        <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-5 text-red-300 text-sm">{error}</div>
      ) : sessions.length === 0 ? (
        <div className="rounded-xl bg-brand-mid border border-brand-border p-10 text-center">
          <Users size={32} className="text-white/55 mx-auto mb-3" />
          <h3 className="text-white font-semibold">No visits yet</h3>
          <p className="text-white/55 text-sm mt-1 max-w-md mx-auto">
            Once visitors accept analytics cookies and browse the site, each visit will appear here
            with its full journey.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-3 gap-4">
            <StatCard label="Visits" value={stats.total} />
            <StatCard label="Unique visitors" value={stats.uniqueVisitors} />
            <StatCard label="Returning" value={stats.returningVisitors} />
          </div>

          <div className="flex items-center gap-2">
            <span className="text-white/40 text-xs">Group by</span>
            <div className="flex rounded-lg border border-brand-border overflow-hidden">
              {[{ k: 'visit', label: 'Visit' }, { k: 'visitor', label: 'Visitor' }].map((o) => (
                <button
                  key={o.k}
                  onClick={() => setView(o.k)}
                  className={`px-3 py-1.5 text-sm transition-colors ${view === o.k ? 'bg-brand-navy text-white' : 'text-white/60 hover:text-white'}`}
                >
                  {o.label}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            {view === 'visit'
              ? sessions.map((s) => (
                  <SessionCard
                    key={s.sessionId}
                    s={s}
                    nowMs={nowMs}
                    blocked={blocked.has(s.visitorId)}
                    blockBusy={blockBusyId === s.visitorId}
                    onToggleBlock={toggleBlock}
                  />
                ))
              : visitors.map((v) => (
                  <VisitorCard
                    key={v.visitorId}
                    v={v}
                    nowMs={nowMs}
                    blocked={blocked.has(v.visitorId)}
                    blockBusy={blockBusyId === v.visitorId}
                    onToggleBlock={toggleBlock}
                  />
                ))}
          </div>
        </div>
      )}
    </div>
  )
}
