// Cloudflare Turnstile — invisible/managed bot verification for the contact and
// booking forms. Set your SITE key here (public, safe to ship). The matching
// SECRET key goes in the booking Apps Script's Script Properties (never in the
// client). Leave blank to disable: no widget renders and no token is required,
// so the forms keep working until you finish setup.
//
// Get keys at: Cloudflare dashboard → Turnstile → Add site.
export const TURNSTILE_SITE_KEY = import.meta.env.VITE_TURNSTILE_SITE_KEY || ''

export const isTurnstileEnabled = Boolean(TURNSTILE_SITE_KEY)
