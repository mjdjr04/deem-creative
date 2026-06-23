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
export const BOOKING_API_URL = 'https://script.google.com/macros/s/AKfycbxBc0HbJovSEwEiLefYEM25aFX2tTcaRQmIm6aQ53ZAxxI-rHP4KXJYCaxaMk5sohbmaw/exec'

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

// ─── Recruiter / hiring call ────────────────────────────────────────────────
// Shares the same Google Calendar (so it can't double-book), but with a wider
// daily window (10am–5pm — set in the Apps Script CONFIG.RECRUITER hours) and
// hiring-focused wording + form fields.
export const RECRUITER_SESSION = {
  title: 'Recruiter / Hiring Call',
  durationMinutes: 30,
  description:
    "A 30-minute call for recruiters, hiring managers, and teams interested in working with me. We'll talk through the role, how my background fits, and next steps — no pressure.",
}

export const RECRUITER_MEETING_TYPES = [
  {
    value: 'zoom',
    label: 'Zoom',
    blurb: "I'll email you the link beforehand",
  },
  {
    value: 'phone',
    label: 'Phone',
    blurb: "I'll call the number you provide",
  },
]

// Form field schemas. Driving the form from data lets one booking engine serve
// both the consultation and recruiter flows. `type: 'meeting'` renders the
// meeting-format picker; everything else is a standard input/textarea.
export const CONSULTATION_FIELDS = [
  { name: 'firstName', label: 'First name', type: 'text', required: true, half: true, placeholder: 'Jane', maxLength: 100, autoComplete: 'given-name' },
  { name: 'lastName', label: 'Last name', type: 'text', required: true, half: true, placeholder: 'Doe', maxLength: 100, autoComplete: 'family-name' },
  { name: 'email', label: 'Email', type: 'email', required: true, half: true, placeholder: 'you@company.com', maxLength: 200, autoComplete: 'email' },
  { name: 'phone', label: 'Phone', type: 'tel', required: true, half: true, placeholder: '(555) 123-4567', maxLength: 50, autoComplete: 'tel' },
  { name: 'organization', label: 'Organization / Company', type: 'text', required: true, placeholder: 'Your organization', maxLength: 200, autoComplete: 'organization' },
  { name: 'meetingType', label: 'Meeting type', type: 'meeting' },
  { name: 'projectOverview', label: 'Brief project overview', type: 'textarea', required: true, rows: 3, maxLength: 2000, placeholder: 'A few sentences about your project, goals, or what you need help with' },
  { name: 'materials', label: 'Materials to review beforehand', type: 'textarea', optional: true, rows: 2, maxLength: 2000, placeholder: 'Links to your site, socials, brand docs, or anything I should look at' },
]

export const RECRUITER_FIELDS = [
  { name: 'firstName', label: 'First name', type: 'text', required: true, half: true, placeholder: 'Jane', maxLength: 100, autoComplete: 'given-name' },
  { name: 'lastName', label: 'Last name', type: 'text', required: true, half: true, placeholder: 'Doe', maxLength: 100, autoComplete: 'family-name' },
  { name: 'email', label: 'Work email', type: 'email', required: true, half: true, placeholder: 'you@company.com', maxLength: 200, autoComplete: 'email' },
  { name: 'phone', label: 'Phone', type: 'tel', required: true, half: true, placeholder: '(555) 123-4567', maxLength: 50, autoComplete: 'tel' },
  { name: 'organization', label: 'Company', type: 'text', required: true, half: true, placeholder: 'Company name', maxLength: 200, autoComplete: 'organization' },
  { name: 'roleTitle', label: 'Role / position', type: 'text', required: true, half: true, placeholder: 'e.g. Content Producer', maxLength: 200 },
  { name: 'meetingType', label: 'Meeting type', type: 'meeting' },
  { name: 'projectOverview', label: 'About the opportunity', type: 'textarea', required: true, rows: 3, maxLength: 2000, placeholder: 'Tell me about the role, team, and what you’re looking for' },
  { name: 'materials', label: 'Link to job posting or details', type: 'textarea', optional: true, rows: 2, maxLength: 2000, placeholder: 'Paste a job link, company site, or anything else helpful (optional)' },
]
