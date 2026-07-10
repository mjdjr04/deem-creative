// ─────────────────────────────────────────────────────────────────────────────
// Analytics core — three layers, all behind consent:
//   1. Custom first-party logging to Supabase (table: analytics_events)
//   2. Google Analytics 4 (loaded only after consent, only if an ID is set)
//   3. Cloudflare Web Analytics beacon (cookieless; only if a token is set)
//
// Nothing here runs until `setAnalyticsAllowed(true)` is called by the consent
// layer. Every function is a no-op when analytics are disallowed.
// ─────────────────────────────────────────────────────────────────────────────
import { supabase, isSupabaseConfigured } from './supabase'
import {
  GA4_MEASUREMENT_ID,
  CLOUDFLARE_BEACON_TOKEN,
  CUSTOM_ANALYTICS_ENABLED,
} from '../config/analytics'

let allowed = false
let ga4Loaded = false
let cfLoaded = false

// ── Identifiers (created only once consent is granted) ──────────────────────
const VID_KEY = 'dc_vid' // persistent-ish visitor id, for unique counts
const SID_KEY = 'dc_sid' // per-tab session id, for grouping a visit

function randomId() {
  if (window.crypto?.randomUUID) return window.crypto.randomUUID()
  return 'xxxxxxxxxxxx'.replace(/x/g, () => ((Math.random() * 16) | 0).toString(16))
}

// Whether this device has been here before — determined ONCE, the first time
// visitorId() runs this session, by checking if the id already existed. Used to
// flag returning visitors (badge + live presence).
let _returningChecked = false
let _returning = false

function visitorId() {
  try {
    let id = localStorage.getItem(VID_KEY)
    if (!_returningChecked) { _returning = Boolean(id); _returningChecked = true }
    if (!id) { id = randomId(); localStorage.setItem(VID_KEY, id) }
    return id
  } catch { return null }
}

/** True if this browser had a visitor id before this session (a repeat visit). */
export function isReturningVisitor() {
  if (!_returningChecked) visitorId()
  return _returning
}

function sessionId() {
  try {
    let id = sessionStorage.getItem(SID_KEY)
    if (!id) { id = randomId(); sessionStorage.setItem(SID_KEY, id) }
    return id
  } catch { return null }
}

// ── Campaign attribution (first-touch, per session) ─────────────────────────
// Capture how the visitor arrived from a tagged link — UTM params or a simple
// ?ref=. Read once on the first event of the session (before SPA navigation
// clears the query string) and cached, so every event carries the same source.
const CAMPAIGN_KEY = 'dc_campaign_v1'

function getCampaign() {
  try {
    const cached = sessionStorage.getItem(CAMPAIGN_KEY)
    if (cached) return JSON.parse(cached)
  } catch { /* sessionStorage unavailable */ }

  const c = {}
  try {
    const p = new URLSearchParams(window.location.search)
    const src = p.get('utm_source'); if (src) c.utm_source = src
    const med = p.get('utm_medium'); if (med) c.utm_medium = med
    const camp = p.get('utm_campaign'); if (camp) c.utm_campaign = camp
    const ref = p.get('ref'); if (ref) c.ref = ref
  } catch { /* malformed URL */ }

  try { sessionStorage.setItem(CAMPAIGN_KEY, JSON.stringify(c)) } catch { /* ignore */ }
  return c
}

// ── Lightweight UA parsing (no dependency) ──────────────────────────────────
function parseUA() {
  const ua = navigator.userAgent || ''
  let device = 'desktop'
  if (/\b(iPad|Tablet)\b/i.test(ua)) device = 'tablet'
  else if (/Mobi|Android|iPhone|iPod/i.test(ua)) device = 'mobile'

  let browser = 'Other'
  if (/Edg\//.test(ua)) browser = 'Edge'
  else if (/OPR\/|Opera/.test(ua)) browser = 'Opera'
  else if (/Chrome\//.test(ua)) browser = 'Chrome'
  else if (/Safari\//.test(ua) && /Version\//.test(ua)) browser = 'Safari'
  else if (/Firefox\//.test(ua)) browser = 'Firefox'

  let os = 'Other'
  if (/Windows/.test(ua)) os = 'Windows'
  else if (/Mac OS X/.test(ua)) os = 'macOS'
  else if (/Android/.test(ua)) os = 'Android'
  else if (/iPhone|iPad|iPod/.test(ua)) os = 'iOS'
  else if (/Linux/.test(ua)) os = 'Linux'

  return { device, browser, os }
}

function referrerHost() {
  try {
    if (!document.referrer) return ''
    const url = new URL(document.referrer)
    if (url.hostname === window.location.hostname) return '' // internal nav
    return url.hostname.replace(/^www\./, '')
  } catch { return '' }
}

// ── Approximate visitor location (first-party, cookieless) ──────────────────
// The site is static (no server to read IPs), so we resolve an approximate
// country/city from the visitor's IP via a free, no-key endpoint. Looked up
// ONCE per session (cached in sessionStorage) and reused for every event, so
// it never adds a network call per pageview. Best-effort: any failure leaves
// the fields null and logging proceeds normally.
const GEO_KEY = 'dc_geo_v1'
let geoPromise = null

async function fetchGeo() {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), 2500)
  try {
    const res = await fetch('https://ipwho.is/', { signal: controller.signal })
    const j = await res.json()
    if (j && j.success !== false) {
      return {
        country: j.country || null,
        city: j.city || null,
        region: j.region || null,
      }
    }
  } catch {
    /* offline, blocked, timeout, rate-limited — fall through to nulls */
  } finally {
    clearTimeout(timer)
  }
  return { country: null, city: null, region: null }
}

/** Resolve approximate location once per session; memoized + sessionStorage-cached. */
function getGeo() {
  if (geoPromise) return geoPromise
  geoPromise = (async () => {
    try {
      const cached = sessionStorage.getItem(GEO_KEY)
      if (cached) return JSON.parse(cached)
    } catch { /* sessionStorage unavailable */ }
    const geo = await fetchGeo()
    try { sessionStorage.setItem(GEO_KEY, JSON.stringify(geo)) } catch { /* ignore */ }
    return geo
  })()
  return geoPromise
}

// ── Google Analytics 4 ──────────────────────────────────────────────────────
function loadGA4() {
  if (ga4Loaded || !GA4_MEASUREMENT_ID) return
  ga4Loaded = true
  const s = document.createElement('script')
  s.async = true
  s.src = `https://www.googletagmanager.com/gtag/js?id=${GA4_MEASUREMENT_ID}`
  document.head.appendChild(s)
  window.dataLayer = window.dataLayer || []
  window.gtag = function gtag() { window.dataLayer.push(arguments) }
  window.gtag('js', new Date())
  // We send page_view manually on route change (SPA), so disable auto.
  window.gtag('config', GA4_MEASUREMENT_ID, { send_page_view: false })
}

// ── Cloudflare Web Analytics ────────────────────────────────────────────────
function loadCloudflare() {
  if (cfLoaded || !CLOUDFLARE_BEACON_TOKEN) return
  cfLoaded = true
  const s = document.createElement('script')
  s.defer = true
  s.src = 'https://static.cloudflareinsights.com/beacon.min.js'
  s.setAttribute('data-cf-beacon', JSON.stringify({ token: CLOUDFLARE_BEACON_TOKEN }))
  document.head.appendChild(s)
}

// ── Public API ──────────────────────────────────────────────────────────────

/** Turn analytics on/off. Called by the consent layer. */
export function setAnalyticsAllowed(value) {
  allowed = Boolean(value)
  if (allowed) {
    loadGA4()
    loadCloudflare()
  }
}

/** Log a page view across every enabled layer. */
export function trackPageview(path) {
  if (!allowed) return
  // Strip any query string (e.g. ?ref=…) so campaign tags don't fragment the
  // "Top pages" list — attribution is captured separately via getCampaign().
  const page = (path || window.location.pathname || '/').split('?')[0]

  if (GA4_MEASUREMENT_ID && window.gtag) {
    window.gtag('event', 'page_view', { page_path: page, page_location: window.location.href })
  }
  writeCustom('pageview', null, page, {})
}

/** Log a named high-intent event (resume_download, booking_start, …). */
export function trackEvent(name, props = {}) {
  if (!allowed || !name) return
  const page = window.location.hash.replace(/^#/, '') || '/'

  if (GA4_MEASUREMENT_ID && window.gtag) {
    window.gtag('event', name, props)
  }
  writeCustom('event', name, page, props)
}

/** First-party insert into Supabase. Best-effort — never throws to the caller. */
function writeCustom(type, name, path, props) {
  if (!CUSTOM_ANALYTICS_ENABLED || !isSupabaseConfigured || !supabase) return
  const { device, browser, os } = parseUA()
  // Campaign attribution rides along in props so it needs no schema change and
  // is available per event; event-specific props win on any key conflict.
  const enrichedProps = { ...getCampaign(), ...props }
  // Resolve location first (cached per session), then insert. Geo failures
  // resolve to nulls, so the event is always logged either way.
  getGeo()
    .then((geo) => {
      supabase
        .from('analytics_events')
        .insert({
          type,
          name,
          path,
          referrer_host: referrerHost(),
          visitor_id: visitorId(),
          session_id: sessionId(),
          device,
          browser,
          os,
          screen_w: window.innerWidth || null,
          country: geo.country,
          city: geo.city,
          region: geo.region,
          props: enrichedProps,
        })
        .then(() => {}, () => {}) // swallow errors (RLS, offline, table missing)
    })
    .catch(() => { /* never let analytics break the page */ })
}
