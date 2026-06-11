// ─────────────────────────────────────────────────────────────────────────────
// Booking configuration
//
// BOOKING_API_URL connects the /booking page directly to your Google Calendar
// via a Google Apps Script Web App. See BOOKING_SETUP.md in the project root
// for the 5-minute setup walkthrough.
//
// Until it's set, the booking page falls back to your Google appointment link.
// ─────────────────────────────────────────────────────────────────────────────

// Paste your deployed Apps Script Web App URL here (ends in /exec):
export const BOOKING_API_URL = 'https://script.google.com/macros/s/AKfycbzx1UUQinu3Zc_jCBhFTuYcF7Z25k673KzXDZxYA_-XNUA5c7LLIVh0vInRWE71WzbQZg/exec'

// Fallback: existing Google Calendar appointment schedule link
export const GOOGLE_BOOKING_FALLBACK_URL = 'https://calendar.app.google/CVSNo86SEqFK16JB7'

// Shown on the booking page
export const SESSION = {
  title: 'Free Consultation',
  durationMinutes: 30,
  description:
    "A 30-minute call to talk through your goals, current challenges, audience, and what kind of creative support would actually move the needle.",
}

// Meeting formats the visitor can choose between
export const MEETING_TYPES = [
  {
    value: 'zoom',
    label: 'Zoom',
    blurb: 'Michael will email you the link beforehand',
  },
  {
    value: 'in-person',
    label: 'In person',
    blurb: 'South Jersey area — location confirmed after booking',
  },
]
