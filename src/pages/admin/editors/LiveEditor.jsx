import { useEffect, useMemo, useState } from 'react'
import {
  Radio, Users, MapPin, Monitor, Smartphone, Tablet, Repeat, Eye, WifiOff,
} from 'lucide-react'
import { supabase, isSupabaseConfigured } from '../../../lib/supabase'

const PRESENCE_CHANNEL = 'presence:visitors'

function deviceGlyph(device, size = 13) {
  if (device === 'mobile') return <Smartphone size={size} />
  if (device === 'tablet') return <Tablet size={size} />
  return <Monitor size={size} />
}

export default function LiveEditor() {
  // Map of sessionId -> presence payload for everyone currently on the site.
  const [present, setPresent] = useState({})
  // connecting | live | error. Starts in error if Supabase isn't configured.
  const [status, setStatus] = useState(isSupabaseConfigured && supabase ? 'connecting' : 'error')

  useEffect(() => {
    if (!isSupabaseConfigured || !supabase) return
    // Subscribe WITHOUT track() — the admin observes presence but never appears
    // in it, so it is not counted as a visitor.
    const channel = supabase.channel(PRESENCE_CHANNEL, {
      config: { presence: { key: 'admin-observer' } },
    })

    const sync = () => {
      const state = channel.presenceState()
      const flat = {}
      for (const key of Object.keys(state)) {
        const meta = state[key][0] // most recent metas entry for this presence key
        if (meta && key !== 'admin-observer') flat[key] = meta
      }
      setPresent(flat)
    }

    channel
      .on('presence', { event: 'sync' }, sync)
      .on('presence', { event: 'join' }, sync)
      .on('presence', { event: 'leave' }, sync)
      .subscribe((s) => {
        if (s === 'SUBSCRIBED') setStatus('live')
        else if (s === 'CHANNEL_ERROR' || s === 'TIMED_OUT') setStatus('error')
      })

    return () => {
      try { supabase.removeChannel(channel) } catch { /* ignore */ }
    }
  }, [])

  const visitors = useMemo(() => {
    const list = Object.values(present)
    // Collapse to unique visitors (a visitor may have multiple tabs/sessions).
    const seen = new Set()
    const unique = []
    for (const v of list.sort((a, b) => new Date(b.since || 0) - new Date(a.since || 0))) {
      const id = v.visitorId || v.sessionId
      if (seen.has(id)) continue
      seen.add(id)
      unique.push(v)
    }
    return unique
  }, [present])

  const returningCount = visitors.filter((v) => v.returning).length

  return (
    <div>
      <div className="flex flex-wrap items-start justify-between gap-4 mb-6 pb-5 border-b border-brand-border">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Radio size={22} className="text-brand-light" /> Live
          </h1>
          <p className="text-white/55 text-sm mt-1">
            Visitors on the site right now, updating in real time. Updates instantly as people
            arrive, move between pages, and leave.
          </p>
        </div>
        <span
          className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border text-sm ${
            status === 'live'
              ? 'border-green-500/40 text-green-300'
              : status === 'error'
                ? 'border-red-500/40 text-red-300'
                : 'border-brand-border text-white/50'
          }`}
        >
          {status === 'live' && <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />}
          {status === 'error' ? 'Realtime unavailable' : status === 'live' ? 'Live' : 'Connecting…'}
        </span>
      </div>

      {status === 'error' ? (
        <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-5 text-red-300 text-sm flex items-start gap-2">
          <WifiOff size={18} className="flex-shrink-0 mt-0.5" />
          <div>
            Couldn’t connect to Supabase Realtime. Make sure Realtime is enabled for your project
            (Supabase dashboard → Project Settings → Realtime).
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-xl bg-brand-mid border border-brand-border p-5">
              <p className="text-3xl font-bold text-white flex items-center gap-2">
                <Users size={22} className="text-brand-light" /> {visitors.length}
              </p>
              <p className="text-white/55 text-sm mt-1">On the site now</p>
            </div>
            <div className="rounded-xl bg-brand-mid border border-brand-border p-5">
              <p className="text-3xl font-bold text-white flex items-center gap-2">
                <Repeat size={20} className="text-brand-light" /> {returningCount}
              </p>
              <p className="text-white/55 text-sm mt-1">Returning right now</p>
            </div>
          </div>

          {visitors.length === 0 ? (
            <div className="rounded-xl bg-brand-mid border border-brand-border p-10 text-center">
              <Radio size={32} className="text-white/55 mx-auto mb-3" />
              <h3 className="text-white font-semibold">No one on the site right now</h3>
              <p className="text-white/55 text-sm mt-1 max-w-md mx-auto">
                This list updates the instant a visitor (who has accepted analytics) opens the site.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {visitors.map((v) => {
                const location = [v.city, v.country].filter(Boolean).join(', ') || 'Unknown location'
                return (
                  <div key={v.visitorId || v.sessionId} className="rounded-xl bg-brand-mid border border-brand-border p-4 flex items-center gap-4">
                    <span className="w-2.5 h-2.5 rounded-full bg-green-400 animate-pulse flex-shrink-0" />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="flex items-center gap-1.5 text-white font-medium text-sm">
                          <MapPin size={14} className="text-brand-light flex-shrink-0" /> {location}
                        </span>
                        {v.returning && (
                          <span className="inline-flex items-center gap-1 text-[11px] px-1.5 py-0.5 rounded bg-brand-navy text-brand-light">
                            <Repeat size={11} /> Returning
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-x-3 gap-y-0.5 flex-wrap text-white/50 text-xs mt-1">
                        <span className="flex items-center gap-1">{deviceGlyph(v.device, 12)} {v.device}{v.browser ? ` · ${v.browser}` : ''}</span>
                        <span className="flex items-center gap-1"><Eye size={12} /> {v.path || '/'}</span>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
