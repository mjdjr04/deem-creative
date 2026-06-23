import { useEffect, useMemo, useState } from 'react'
import { Loader2, RefreshCw, ExternalLink, BarChart3 } from 'lucide-react'
import { fetchAnalytics } from '../../../lib/contentApi'
import {
  GA4_MEASUREMENT_ID,
  CLOUDFLARE_BEACON_TOKEN,
  GA4_DASHBOARD_URL,
  CLOUDFLARE_DASHBOARD_URL,
} from '../../../config/analytics'

const RANGES = [
  { days: 7, label: '7 days' },
  { days: 30, label: '30 days' },
  { days: 90, label: '90 days' },
]

function countBy(rows, key) {
  const map = new Map()
  for (const r of rows) {
    const v = r[key]
    if (!v) continue
    map.set(v, (map.get(v) || 0) + 1)
  }
  return [...map.entries()].sort((a, b) => b[1] - a[1])
}

function StatCard({ label, value, sub }) {
  return (
    <div className="rounded-xl bg-brand-mid border border-brand-border p-5">
      <p className="text-3xl font-bold text-white">{value}</p>
      <p className="text-white/55 text-sm mt-1">{label}</p>
      {sub && <p className="text-white/55 text-xs mt-0.5">{sub}</p>}
    </div>
  )
}

function BarList({ title, rows, total, empty }) {
  return (
    <div className="rounded-xl bg-brand-mid border border-brand-border p-5">
      <h3 className="text-white font-semibold mb-4">{title}</h3>
      {rows.length === 0 ? (
        <p className="text-white/55 text-sm">{empty || 'No data yet.'}</p>
      ) : (
        <ul className="space-y-2.5">
          {rows.slice(0, 8).map(([label, count]) => {
            const pct = total ? Math.round((count / total) * 100) : 0
            return (
              <li key={label}>
                <div className="flex items-center justify-between text-sm mb-1">
                  <span className="text-white/75 truncate pr-3">{label}</span>
                  <span className="text-white/55 flex-shrink-0">{count}{total ? ` · ${pct}%` : ''}</span>
                </div>
                <div className="h-1.5 rounded-full bg-brand-surface overflow-hidden">
                  <div className="h-full rounded-full bg-brand-accent" style={{ width: `${pct}%` }} />
                </div>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}

function TrendChart({ data }) {
  const max = Math.max(1, ...data.map((d) => d.count))
  return (
    <div className="rounded-xl bg-brand-mid border border-brand-border p-5">
      <h3 className="text-white font-semibold mb-4">Page views over time</h3>
      <div className="flex items-end gap-1 h-40">
        {data.map((d) => (
          <div key={d.day} className="flex-1 flex flex-col items-center justify-end group" title={`${d.day}: ${d.count}`}>
            <div
              className="w-full rounded-t bg-brand-accent/70 group-hover:bg-brand-accent transition-colors"
              style={{ height: `${(d.count / max) * 100}%`, minHeight: d.count ? '3px' : '0' }}
            />
          </div>
        ))}
      </div>
      <div className="flex justify-between text-white/55 text-xs mt-2">
        <span>{data[0]?.label}</span>
        <span>{data[data.length - 1]?.label}</span>
      </div>
    </div>
  )
}

export default function AnalyticsEditor() {
  const [days, setDays] = useState(30)
  const [rows, setRows] = useState([])
  const [nowMs, setNowMs] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const load = async (d) => {
    setLoading(true)
    setError(null)
    try {
      const data = await fetchAnalytics({ days: d })
      setNowMs(Date.now()) // anchor the trend window (set off-render, in async)
      setRows(data)
    } catch (e) {
      setError(e.message || 'Could not load analytics.')
    } finally {
      setLoading(false)
    }
  }

  // load() flips loading state inside an async call, after the effect body runs.
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { load(days) }, [days])

  const stats = useMemo(() => {
    const pageviews = rows.filter((r) => r.type === 'pageview')
    const events = rows.filter((r) => r.type === 'event')
    const uniqueVisitors = new Set(rows.map((r) => r.visitor_id).filter(Boolean)).size
    const sessions = new Set(rows.map((r) => r.session_id).filter(Boolean)).size

    // Daily trend of page views (anchored to the load timestamp).
    const anchor = nowMs || 0
    const byDay = new Map()
    for (let i = days - 1; i >= 0; i--) {
      const dt = new Date(anchor - i * 86400000)
      const key = dt.toISOString().slice(0, 10)
      byDay.set(key, { day: key, label: dt.toLocaleDateString([], { month: 'short', day: 'numeric' }), count: 0 })
    }
    for (const r of pageviews) {
      const key = (r.created_at || '').slice(0, 10)
      if (byDay.has(key)) byDay.get(key).count++
    }

    return {
      pageviews,
      events,
      uniqueVisitors,
      sessions,
      trend: [...byDay.values()],
      topPages: countBy(pageviews, 'path'),
      referrers: countBy(pageviews, 'referrer_host'),
      devices: countBy(pageviews, 'device'),
      browsers: countBy(pageviews, 'browser'),
      topEvents: countBy(events, 'name'),
    }
  }, [rows, days, nowMs])

  const externalLinks = [
    GA4_MEASUREMENT_ID && { label: 'Open Google Analytics', url: GA4_DASHBOARD_URL || 'https://analytics.google.com/' },
    CLOUDFLARE_BEACON_TOKEN && { label: 'Open Cloudflare Analytics', url: CLOUDFLARE_DASHBOARD_URL || 'https://dash.cloudflare.com/' },
  ].filter(Boolean)

  return (
    <div>
      <div className="flex flex-wrap items-start justify-between gap-4 mb-6 pb-5 border-b border-brand-border">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <BarChart3 size={22} className="text-brand-light" /> Analytics
          </h1>
          <p className="text-white/55 text-sm mt-1">
            First-party traffic for the last {days} days. Visitors are only counted after they accept analytics cookies.
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

      {externalLinks.length > 0 && (
        <div className="flex flex-wrap gap-3 mb-6">
          {externalLinks.map((l) => (
            <a
              key={l.label}
              href={l.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-brand-border text-brand-light text-sm hover:border-brand-accent hover:text-white transition-colors"
            >
              {l.label} <ExternalLink size={13} />
            </a>
          ))}
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-24 text-white/55">
          <Loader2 className="animate-spin mr-2" size={20} /> Loading analytics…
        </div>
      ) : error ? (
        <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-5 text-red-300 text-sm">
          {error}
          <p className="text-white/55 mt-2">
            If this is the first run, make sure you’ve added the <code className="text-brand-light">analytics_events</code> table
            from <strong>supabase/schema.sql</strong>.
          </p>
        </div>
      ) : rows.length === 0 ? (
        <div className="rounded-xl bg-brand-mid border border-brand-border p-10 text-center">
          <BarChart3 size={32} className="text-white/55 mx-auto mb-3" />
          <h3 className="text-white font-semibold">No data yet</h3>
          <p className="text-white/55 text-sm mt-1 max-w-md mx-auto">
            Once visitors accept analytics cookies and browse the site, page views and events will show up here.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard label="Page views" value={stats.pageviews.length} />
            <StatCard label="Unique visitors" value={stats.uniqueVisitors} />
            <StatCard label="Sessions" value={stats.sessions} />
            <StatCard label="Tracked events" value={stats.events.length} />
          </div>

          <TrendChart data={stats.trend} />

          <div className="grid md:grid-cols-2 gap-6">
            <BarList title="Top pages" rows={stats.topPages} total={stats.pageviews.length} />
            <BarList title="Referrers" rows={stats.referrers} total={stats.referrers.reduce((a, [, c]) => a + c, 0)} empty="No external referrers yet (mostly direct visits)." />
            <BarList title="Devices" rows={stats.devices} total={stats.pageviews.length} />
            <BarList title="Browsers" rows={stats.browsers} total={stats.pageviews.length} />
          </div>

          <BarList
            title="High-intent events"
            rows={stats.topEvents}
            total={stats.events.length}
            empty="No events tracked yet (resume downloads, booking starts, etc.)."
          />
        </div>
      )}
    </div>
  )
}
