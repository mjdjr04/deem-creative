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

// ─── Meeting kinds ───────────────────────────────────────────────────────────
// Single source of truth for every booking type. BookingPage/RecruiterBookingPage
// build their BookingFlow config from these. Durations/hours/day-caps that the
// SERVER enforces live in the Apps Script CONFIG.TYPES (apps-script/Code.gs);
// durationMinutes here is only for display and must be kept in sync with it.
export const MEETING_KINDS = {
  networking: {
    apiType: 'networking',
    inPicker: true,
    pickerBlurb: 'A casual 20-minute chat to connect — no agenda needed.',
    eyebrow: 'Deem Creative',
    pageTitle: 'Book a Networking Chat',
    pageSubtitle:
      "A quick, low-key call to connect. Pick a time — it goes straight onto the calendar and you'll get a confirmation right away.",
    session: {
      title: 'Networking / Coffee Chat',
      durationMinutes: 20,
      description:
        "A relaxed 20-minute call to connect, swap ideas, or just say hi — no pitch, no pressure.",
    },
    detailItemsText: ['Zoom or phone — your choice'],
    whatToExpect: [
      'Get to know each other',
      'Swap ideas, referrals, or advice',
      'No agenda — just a genuine connect',
    ],
    meetingTypes: [
      { value: 'zoom', label: 'Zoom', blurb: "I'll email you the link beforehand" },
      { value: 'phone', label: 'Phone', blurb: "I'll call the number you provide" },
    ],
    confirmedLines: {
      zoom: 'This is a Zoom call — Michael will email you the link (or it will be on your invite) before we meet.',
      phone: "This is a phone call — Michael will call the number you provided at the scheduled time.",
    },
    fields: [
      { name: 'firstName', label: 'First name', type: 'text', required: true, half: true, placeholder: 'Jane', maxLength: 100, autoComplete: 'given-name' },
      { name: 'lastName', label: 'Last name', type: 'text', required: true, half: true, placeholder: 'Doe', maxLength: 100, autoComplete: 'family-name' },
      { name: 'email', label: 'Email', type: 'email', required: true, half: true, placeholder: 'you@email.com', maxLength: 200, autoComplete: 'email' },
      { name: 'phone', label: 'Phone', type: 'tel', required: true, half: true, placeholder: '(555) 123-4567', maxLength: 50, autoComplete: 'tel' },
      { name: 'meetingType', label: 'Meeting type', type: 'meeting' },
      { name: 'projectOverview', label: 'What would you like to connect about?', type: 'textarea', required: true, rows: 3, maxLength: 2000, placeholder: 'A sentence or two on what prompted you to reach out' },
    ],
  },

  consultation: {
    apiType: 'consultation',
    inPicker: true,
    pickerBlurb: 'A free 30-minute call to talk through your goals and next steps.',
    eyebrow: 'Deem Creative',
    pageTitle: 'Book a Consultation',
    pageSubtitle:
      "Pick a time that works for you — it goes straight onto the calendar, and you'll get a confirmation email right away.",
    session: {
      title: 'Free Consultation',
      durationMinutes: 30,
      description:
        "A 30-minute call to talk through your goals, current challenges, audience, and what kind of creative support would actually move the needle.",
    },
    detailItemsText: ['Zoom or in person — your choice'],
    whatToExpect: [
      'Clarify your goals and what success looks like',
      'Review your current content, systems, or creative challenges',
      'Walk away with clear next steps — no pressure',
    ],
    meetingTypes: [
      { value: 'zoom', label: 'Zoom', blurb: 'Michael will email you the link beforehand' },
      { value: 'in-person', label: 'In person', blurb: 'South Jersey area — location confirmed after booking' },
    ],
    confirmedLines: {
      zoom: 'This is a Zoom meeting — Michael will email you the link before your meeting.',
      'in-person': 'This is an in-person meeting — Michael will confirm the exact location (South Jersey area) with you.',
    },
    fields: [
      { name: 'firstName', label: 'First name', type: 'text', required: true, half: true, placeholder: 'Jane', maxLength: 100, autoComplete: 'given-name' },
      { name: 'lastName', label: 'Last name', type: 'text', required: true, half: true, placeholder: 'Doe', maxLength: 100, autoComplete: 'family-name' },
      { name: 'email', label: 'Email', type: 'email', required: true, half: true, placeholder: 'you@company.com', maxLength: 200, autoComplete: 'email' },
      { name: 'phone', label: 'Phone', type: 'tel', required: true, half: true, placeholder: '(555) 123-4567', maxLength: 50, autoComplete: 'tel' },
      { name: 'organization', label: 'Organization / Company', type: 'text', required: true, placeholder: 'Your organization', maxLength: 200, autoComplete: 'organization' },
      { name: 'meetingType', label: 'Meeting type', type: 'meeting' },
      { name: 'projectOverview', label: 'Brief project overview', type: 'textarea', required: true, rows: 3, maxLength: 2000, placeholder: 'A few sentences about your project, goals, or what you need help with' },
      { name: 'materials', label: 'Materials to review beforehand', type: 'textarea', optional: true, rows: 2, maxLength: 2000, placeholder: 'Links to your site, socials, brand docs, or anything I should look at' },
    ],
  },

  strategy: {
    apiType: 'strategy',
    inPicker: true,
    pickerBlurb: 'A focused 60-minute working session to go deep on strategy.',
    eyebrow: 'Deem Creative',
    pageTitle: 'Book a Strategy Deep-Dive',
    pageSubtitle:
      "A full hour to dig into your content, brand, and creative strategy. Pick a time — it goes straight onto the calendar with an instant confirmation.",
    session: {
      title: 'Strategy Deep-Dive',
      durationMinutes: 60,
      description:
        "A focused 60-minute working session to map your goals, audit what you have, and build a concrete creative + content plan you can act on.",
    },
    detailItemsText: ['Zoom or in person — your choice'],
    whatToExpect: [
      'Audit your current content, brand, and systems',
      'Map goals to a concrete creative + content plan',
      'Leave with a prioritized, actionable roadmap',
    ],
    meetingTypes: [
      { value: 'zoom', label: 'Zoom', blurb: 'Michael will email you the link beforehand' },
      { value: 'in-person', label: 'In person', blurb: 'South Jersey area — location confirmed after booking' },
    ],
    confirmedLines: {
      zoom: 'This is a Zoom session — Michael will email you the link before we meet.',
      'in-person': 'This is an in-person session — Michael will confirm the exact location (South Jersey area) with you.',
    },
    fields: [
      { name: 'firstName', label: 'First name', type: 'text', required: true, half: true, placeholder: 'Jane', maxLength: 100, autoComplete: 'given-name' },
      { name: 'lastName', label: 'Last name', type: 'text', required: true, half: true, placeholder: 'Doe', maxLength: 100, autoComplete: 'family-name' },
      { name: 'email', label: 'Email', type: 'email', required: true, half: true, placeholder: 'you@company.com', maxLength: 200, autoComplete: 'email' },
      { name: 'phone', label: 'Phone', type: 'tel', required: true, half: true, placeholder: '(555) 123-4567', maxLength: 50, autoComplete: 'tel' },
      { name: 'organization', label: 'Organization / Company', type: 'text', required: true, placeholder: 'Your organization', maxLength: 200, autoComplete: 'organization' },
      { name: 'meetingType', label: 'Meeting type', type: 'meeting' },
      { name: 'projectOverview', label: 'What do you want to get out of the session?', type: 'textarea', required: true, rows: 3, maxLength: 2000, placeholder: 'Your goals, current challenges, and what a great outcome looks like' },
      { name: 'materials', label: 'Materials to review beforehand', type: 'textarea', optional: true, rows: 2, maxLength: 2000, placeholder: 'Links to your site, socials, brand docs, analytics, or anything I should look at' },
    ],
  },

  recruiter: {
    apiType: 'recruiter',
    inPicker: false,
    pickerBlurb: '',
    eyebrow: 'For recruiters & hiring teams',
    pageTitle: 'Schedule a Hiring Call',
    pageSubtitle:
      "Considering me for a role? Grab a time below — it lands straight on my calendar and you'll get an instant confirmation.",
    session: {
      title: 'Recruiter / Hiring Call',
      durationMinutes: 30,
      description:
        "A 30-minute call for recruiters, hiring managers, and teams interested in working with me. We'll talk through the role, how my background fits, and next steps — no pressure.",
    },
    detailItemsText: ['Recruiters, hiring managers & teams', 'Zoom or phone — your choice'],
    whatToExpect: [
      'Walk through the role, team, and what you\'re looking for',
      'How my film, social, and creative-strategy background fits',
      'Clear next steps — references, portfolio deep-dives, or a follow-up',
    ],
    meetingTypes: [
      { value: 'zoom', label: 'Zoom', blurb: "I'll email you the link beforehand" },
      { value: 'phone', label: 'Phone', blurb: "I'll call the number you provide" },
    ],
    confirmedLines: {
      zoom: 'This is a Zoom call — Michael will email you the link before the meeting.',
      phone: "This is a phone call — Michael will call the number you provided at the scheduled time.",
    },
    fields: [
      { name: 'firstName', label: 'First name', type: 'text', required: true, half: true, placeholder: 'Jane', maxLength: 100, autoComplete: 'given-name' },
      { name: 'lastName', label: 'Last name', type: 'text', required: true, half: true, placeholder: 'Doe', maxLength: 100, autoComplete: 'family-name' },
      { name: 'email', label: 'Work email', type: 'email', required: true, half: true, placeholder: 'you@company.com', maxLength: 200, autoComplete: 'email' },
      { name: 'phone', label: 'Phone', type: 'tel', required: true, half: true, placeholder: '(555) 123-4567', maxLength: 50, autoComplete: 'tel' },
      { name: 'organization', label: 'Company', type: 'text', required: true, half: true, placeholder: 'Company name', maxLength: 200, autoComplete: 'organization' },
      { name: 'roleTitle', label: 'Role / position', type: 'text', required: true, half: true, placeholder: 'e.g. Content Producer', maxLength: 200 },
      { name: 'meetingType', label: 'Meeting type', type: 'meeting' },
      { name: 'projectOverview', label: 'About the opportunity', type: 'textarea', required: true, rows: 3, maxLength: 2000, placeholder: 'Tell me about the role, team, and what you\'re looking for' },
      { name: 'materials', label: 'Link to job posting or details', type: 'textarea', optional: true, rows: 2, maxLength: 2000, placeholder: 'Paste a job link, company site, or anything else helpful (optional)' },
    ],
  },
}

export const PICKER_KINDS = ['networking', 'consultation', 'strategy']

// ─── Back-compat aliases (derived from MEETING_KINDS) ────────────────────────
export const SESSION = MEETING_KINDS.consultation.session
export const MEETING_TYPES = MEETING_KINDS.consultation.meetingTypes
export const CONSULTATION_FIELDS = MEETING_KINDS.consultation.fields
export const RECRUITER_SESSION = MEETING_KINDS.recruiter.session
export const RECRUITER_MEETING_TYPES = MEETING_KINDS.recruiter.meetingTypes
export const RECRUITER_FIELDS = MEETING_KINDS.recruiter.fields

