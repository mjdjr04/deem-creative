import { useEffect, useMemo, useRef, useState } from 'react'
import { Loader2, RefreshCw, ExternalLink, BarChart3, MapPin } from 'lucide-react'
import { fetchAnalytics, trafficSource } from '../../../lib/contentApi'
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

// Series plotted on the interactive chart. Page views in brand blue, interactions
// in amber so the two lines stay distinct against the dark admin theme.
const SERIES = [
  { key: 'pageviews', label: 'Page views', color: '#4A7EC7' },
  { key: 'events', label: 'Interactions', color: '#E8B04B' },
]

// Rounded y-axis ticks from 0..max. Small ranges get plain integer ticks so the
// axis never shows duplicate rounded labels.
function niceTicks(max, desired = 4) {
  if (max <= 5) return Array.from({ length: max + 1 }, (_, i) => i)
  const rawStep = max / desired
  const mag = Math.pow(10, Math.floor(Math.log10(rawStep)))
  const norm = rawStep / mag
  const step = (norm <= 1 ? 1 : norm <= 2 ? 2 : norm <= 5 ? 5 : 10) * mag
  const ticks = []
  for (let v = 0; v <= max; v += step) ticks.push(Math.round(v))
  ticks.push(Math.round(ticks[ticks.length - 1] + step))
  return ticks
}

// Interactive time-series chart: two toggleable series, an auto-scaling y-axis
// that always fits the traffic in the current window, and a hover crosshair +
// tooltip. Dependency-free SVG; the viewBox scales to the container width.
function TrafficChart({ data }) {
  const [visible, setVisible] = useState({ pageviews: true, events: true })
  const [hover, setHover] = useState(null)
  const svgRef = useRef(null)

  const n = data.length
  const W = 720, H = 240
  const padL = 34, padR = 14, padT = 14, padB = 26
  const plotW = W - padL - padR
  const plotH = H - padT - padB

  const activeKeys = SERIES.filter((s) => visible[s.key]).map((s) => s.key)
  const dataMax = Math.max(1, ...data.flatMap((d) => activeKeys.map((k) => d[k] || 0)))
  const ticks = niceTicks(dataMax)
  const yMax = ticks[ticks.length - 1] || 1

  const xAt = (i) => padL + (n <= 1 ? plotW / 2 : (i / (n - 1)) * plotW)
  const yAt = (v) => padT + plotH - (v / yMax) * plotH

  const linePath = (key) =>
    data.map((d, i) => `${i === 0 ? 'M' : 'L'} ${xAt(i).toFixed(1)} ${yAt(d[key] || 0).toFixed(1)}`).join(' ')
  const areaPath = (key) =>
    `${linePath(key)} L ${xAt(n - 1).toFixed(1)} ${(padT + plotH).toFixed(1)} L ${xAt(0).toFixed(1)} ${(padT + plotH).toFixed(1)} Z`

  const toggle = (key) => {
    // Never allow turning off the last visible series (empty chart).
    if (visible[key] && activeKeys.length === 1) return
    setVisible((v) => ({ ...v, [key]: !v[key] }))
  }

  const onMove = (e) => {
    if (!svgRef.current || n === 0) return
    const rect = svgRef.current.getBoundingClientRect()
    const ratio = (e.clientX - rect.left) / rect.width
    const idx = Math.max(0, Math.min(n - 1, Math.round(ratio * (n - 1))))
    setHover(idx)
  }

  // X-axis labels: ~6 evenly spaced so they don't crowd on 90-day ranges.
  const labelStep = Math.max(1, Math.ceil(n / 6))
  const point = hover != null ? data[hover] : null

  return (
    <div className="rounded-xl bg-brand-mid border border-brand-border p-5">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <h3 className="text-white font-semibold">Traffic over time</h3>
        <div className="flex items-center gap-2">
          {SERIES.map((s) => {
            const on = visible[s.key]
            return (
              <button
                key={s.key}
                onClick={() => toggle(s.key)}
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs transition-colors ${
                  on ? 'border-brand-border text-white' : 'border-brand-border text-white/35'
                }`}
                title={on ? `Hide ${s.label.toLowerCase()}` : `Show ${s.label.toLowerCase()}`}
              >
                <span
                  className="w-2.5 h-2.5 rounded-full"
                  style={{ backgroundColor: on ? s.color : 'transparent', border: `2px solid ${s.color}` }}
                />
                {s.label}
              </button>
            )
          })}
        </div>
      </div>

      <div className="relative">
        <svg
          ref={svgRef}
          viewBox={`0 0 ${W} ${H}`}
          preserveAspectRatio="none"
          className="w-full h-56"
          onMouseMove={onMove}
          onMouseLeave={() => setHover(null)}
        >
          {/* gridlines + y-axis labels */}
          {ticks.map((t) => (
            <g key={t}>
              <line x1={padL} y1={yAt(t)} x2={W - padR} y2={yAt(t)} stroke="#1E3A5F" strokeWidth="1" />
              <text x={padL - 6} y={yAt(t) + 3} textAnchor="end" fontSize="10" fill="#ffffff66">{t}</text>
            </g>
          ))}

          {/* series areas + lines */}
          {SERIES.filter((s) => visible[s.key]).map((s) => (
            <g key={s.key}>
              <path d={areaPath(s.key)} fill={s.color} opacity="0.10" />
              <path d={linePath(s.key)} fill="none" stroke={s.color} strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
            </g>
          ))}

          {/* hover crosshair + points */}
          {point && (
            <g>
              <line x1={xAt(hover)} y1={padT} x2={xAt(hover)} y2={padT + plotH} stroke="#ffffff55" strokeWidth="1" strokeDasharray="3 3" />
              {SERIES.filter((s) => visible[s.key]).map((s) => (
                <circle key={s.key} cx={xAt(hover)} cy={yAt(point[s.key] || 0)} r="3.5" fill={s.color} stroke="#112040" strokeWidth="1.5" />
              ))}
            </g>
          )}

          {/* x-axis labels */}
          {data.map((d, i) =>
            i % labelStep === 0 || i === n - 1 ? (
              <text key={d.day} x={xAt(i)} y={H - 8} textAnchor="middle" fontSize="10" fill="#ffffff66">{d.label}</text>
            ) : null,
          )}
        </svg>

        {/* tooltip (positioned in container space so it tracks the scaled viewBox) */}
        {point && (
          <div
            className="pointer-events-none absolute -translate-x-1/2 -translate-y-2 top-0 z-10 rounded-lg bg-brand-dark border border-brand-border px-3 py-2 shadow-lg"
            style={{ left: `${(xAt(hover) / W) * 100}%` }}
          >
            <p className="text-white text-xs font-medium whitespace-nowrap mb-1">{point.label}</p>
            {SERIES.filter((s) => visible[s.key]).map((s) => (
              <p key={s.key} className="text-white/75 text-xs whitespace-nowrap flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full inline-block" style={{ backgroundColor: s.color }} />
                {s.label}: <span className="text-white font-semibold">{point[s.key] || 0}</span>
              </p>
            ))}
          </div>
        )}
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

    // Daily trend of page views AND interactions (anchored to the load timestamp).
    const anchor = nowMs || 0
    const byDay = new Map()
    for (let i = days - 1; i >= 0; i--) {
      const dt = new Date(anchor - i * 86400000)
      const key = dt.toISOString().slice(0, 10)
      byDay.set(key, { day: key, label: dt.toLocaleDateString([], { month: 'short', day: 'numeric' }), pageviews: 0, events: 0 })
    }
    for (const r of rows) {
      const key = (r.created_at || '').slice(0, 10)
      if (!byDay.has(key)) continue
      if (r.type === 'pageview') byDay.get(key).pageviews++
      else if (r.type === 'event') byDay.get(key).events++
    }

    // Traffic sources: one count per SESSION using its first-touch source. Rows
    // arrive newest-first, so the last write per session is its earliest event.
    const sessionSource = new Map()
    for (const r of rows) {
      if (r.session_id) sessionSource.set(r.session_id, trafficSource(r))
    }
    const sourceCounts = new Map()
    for (const src of sessionSource.values()) sourceCounts.set(src, (sourceCounts.get(src) || 0) + 1)
    const sources = [...sourceCounts.entries()].sort((a, b) => b[1] - a[1])

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
      countries: countBy(pageviews, 'country'),
      cities: countBy(pageviews, 'city'),
      sources,
      sessionCount: sessionSource.size,
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

          <TrafficChart data={stats.trend} />

          <div>
            <h2 className="text-white/80 text-sm font-semibold flex items-center gap-1.5 mb-3">
              <MapPin size={15} className="text-brand-light" /> Where visitors come from
            </h2>
            <div className="grid md:grid-cols-2 gap-6">
              <BarList title="Top countries" rows={stats.countries} total={stats.pageviews.length} empty="No location data yet — this fills in as visitors arrive." />
              <BarList title="Top cities" rows={stats.cities} total={stats.pageviews.length} empty="No location data yet — this fills in as visitors arrive." />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <BarList title="Traffic sources" rows={stats.sources} total={stats.sessionCount} empty="No visits yet." />
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
