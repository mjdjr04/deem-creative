// ─────────────────────────────────────────────────────────────────────────────
// Analytics configuration
//
// The site runs three analytics layers, all OPT-IN behind the cookie banner:
//
//   1. Custom (Supabase)  — first-party page views + high-intent events, shown
//                           in your admin under "Analytics". Always available
//                           (no ID needed); cookieless.
//   2. Google Analytics 4 — paste your Measurement ID below to enable. Uses
//                           cookies, so it only loads after the visitor accepts.
//   3. Cloudflare Web Analytics — paste your beacon token below. Cookieless.
//
// Every layer degrades gracefully: leave an ID blank and that layer simply
// stays off. You can also override via Vite env vars (VITE_GA4_ID, etc.).
// ─────────────────────────────────────────────────────────────────────────────

// Google Analytics 4 Measurement ID, e.g. 'G-XXXXXXXXXX'. Leave '' to disable.
export const GA4_MEASUREMENT_ID = import.meta.env.VITE_GA4_ID || ''

// Cloudflare Web Analytics beacon token (Cloudflare dashboard → Web Analytics →
// your site → "JS snippet" → the `token` value). Leave '' to disable.
export const CLOUDFLARE_BEACON_TOKEN = import.meta.env.VITE_CLOUDFLARE_TOKEN || ''

// Custom Supabase analytics. On by default; it reuses your existing Supabase
// connection. Set to false to turn off first-party tracking entirely.
export const CUSTOM_ANALYTICS_ENABLED = true

// Optional deep links so the admin Analytics page can jump to the external
// dashboards. Paste the URLs of your GA4 property and Cloudflare site.
export const GA4_DASHBOARD_URL = import.meta.env.VITE_GA4_DASHBOARD_URL || ''
export const CLOUDFLARE_DASHBOARD_URL = import.meta.env.VITE_CLOUDFLARE_DASHBOARD_URL || ''

// High-intent events worth tracking on a hiring-focused portfolio. Used by the
// custom tracker and forwarded to GA4 when enabled.
export const ANALYTICS_EVENTS = {
  RESUME_DOWNLOAD: 'resume_download',
  VCARD_SAVE: 'vcard_save',
  BOOKING_START: 'booking_start',
  RECRUITER_BOOKING_START: 'recruiter_booking_start',
  BOOKING_CONFIRMED: 'booking_confirmed',
  CONTACT_SUBMIT: 'contact_submit',
  PROJECT_OPEN: 'project_open',
  CHAT_OPEN: 'chat_open',
  OUTBOUND_LINKEDIN: 'outbound_linkedin',
  EMAIL_CLICK: 'email_click',
}
