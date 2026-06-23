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

function visitorId() {
  try {
    let id = localStorage.getItem(VID_KEY)
    if (!id) { id = randomId(); localStorage.setItem(VID_KEY, id) }
    return id
  } catch { return null }
}

function sessionId() {
  try {
    let id = sessionStorage.getItem(SID_KEY)
    if (!id) { id = randomId(); sessionStorage.setItem(SID_KEY, id) }
    return id
  } catch { return null }
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
  const page = path || window.location.hash.replace(/^#/, '') || '/'

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
  try {
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
        props,
      })
      .then(() => {}, () => {}) // swallow errors (RLS, offline, table missing)
  } catch {
    /* never let analytics break the page */
  }
}
