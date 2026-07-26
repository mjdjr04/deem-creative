# Multi-type Booking + Per-Meeting Zoom Links — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Offer four distinct booking types (networking, consultation, strategy deep-dive, recruiter) each with its own duration/hours/days/cap/buffer, behind a `/booking` meeting-type picker, and auto-generate a unique Zoom link per Zoom booking.

**Architecture:** The React app is data-driven — `BookingFlow.jsx` renders any flow from a `config` object. We consolidate all per-type settings into a `MEETING_KINDS` map in `src/config/booking.js`, add a picker page at `/booking` that routes to `/booking/:type`, and extend the Google Apps Script (`apps-script/Code.gs`) `CONFIG.TYPES` map with per-type duration/days/cap/buffer plus a Zoom Server-to-Server OAuth helper. All types share one Google Calendar, so cross-type double-booking stays impossible. Zoom and every new setting degrade gracefully to today's behavior when unconfigured.

**Tech Stack:** React 19 + React Router + Vite + Tailwind (frontend); Google Apps Script (booking server); Zoom REST API (Server-to-Server OAuth); Supabase (email templates, unchanged plumbing).

## Global Constraints

- **No automated test harness exists.** Verification gates are: `npm run build` (must pass), `npm run lint` (must be clean), `node --check apps-script/Code.gs` (syntax gate for the script), and the explicit manual checks in each task. Do **not** add a test framework.
- **The Apps Script is one file deployed manually by the user.** Tasks 3–5 all edit `apps-script/Code.gs`; it is pasted into the "Deem Creative Booking" project and redeployed once, at the end. Do not attempt to deploy it from code.
- **Graceful degradation is mandatory** (matches existing Turnstile/Supabase patterns): missing Zoom credentials, a Zoom API failure, or an unknown booking type must never break a booking. Fall back, don't throw.
- **All types share one Google Calendar** (`CalendarApp.getDefaultCalendar()`); do not introduce a second calendar.
- **Keep `MIN_NOTICE_HOURS = 48` and `MAX_DAYS_AHEAD = 60` global** (not per-type) — explicitly out of scope.
- **Recruiter stays out of the public picker** (reached only via `/hire`).
- **Meeting-type keys are exactly:** `networking`, `consultation`, `strategy`, `recruiter` (case-sensitive, used as both config keys and calendar tags).
- Timezone for all windows/Zoom is `America/New_York`.

---

## File Structure

- `src/config/booking.js` — **modified.** Add `MEETING_KINDS` (per-type config) + `PICKER_KINDS`. Re-express existing exports as views over it (back-compat aliases).
- `src/pages/BookingLanding.jsx` — **created.** The `/booking` meeting-type picker.
- `src/pages/BookingPage.jsx` — **modified.** Handles `/booking/:type`; builds the `BookingFlow` config from `MEETING_KINDS[type]`.
- `src/pages/RecruiterBookingPage.jsx` — **modified.** Reads `MEETING_KINDS.recruiter` (behavior unchanged).
- `src/App.jsx` — **modified.** Routes: `/booking` → `BookingLanding`, `/booking/:type` → `BookingPage`.
- `src/components/FloatingCTA.jsx` — **modified.** Active-page check widens to `startsWith('/booking')`.
- `apps-script/Code.gs` — **modified.** Per-type availability engine, per-type duration/required-fields in booking, Zoom helper + wiring, email templates for new types, actual-duration email line.
- `src/data/defaults.js` — **modified.** Add `networking` + `strategy` email-template blocks to `emailsDefaults` to mirror the script's `TPL_DEFAULTS`.
- `BOOKING_SETUP.md` — **modified.** Document the new types + Zoom Server-to-Server OAuth setup + redeploy.

---

## Task 1: Consolidate config into `MEETING_KINDS`

**Files:**
- Modify: `src/config/booking.js`

**Interfaces:**
- Produces: `MEETING_KINDS` (object keyed by `networking|consultation|strategy|recruiter`), where each entry has: `apiType` (string), `session` (`{title, durationMinutes, description}`), `meetingTypes` (`[{value,label,blurb}]`), `fields` (array, same schema as today), `pickerBlurb` (string), `inPicker` (boolean), `eyebrow`/`pageTitle`/`pageSubtitle` (strings), `detailItemsText` (`[string]`), `whatToExpect` (`[string]`), `confirmedLines` (`{zoom, 'in-person', phone}` optional strings). Also produces `PICKER_KINDS = ['networking','consultation','strategy']`.
- Keeps back-compat exports `SESSION`, `MEETING_TYPES`, `CONSULTATION_FIELDS`, `RECRUITER_SESSION`, `RECRUITER_MEETING_TYPES`, `RECRUITER_FIELDS` as references into `MEETING_KINDS` so any other importer keeps working.

- [ ] **Step 1: Add `MEETING_KINDS` and `PICKER_KINDS` above the existing exports**

In `src/config/booking.js`, after the `GOOGLE_BOOKING_FALLBACK_URL` export and before the current `SESSION` export, insert:

```js
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
      'Walk through the role, team, and what you’re looking for',
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
      { name: 'projectOverview', label: 'About the opportunity', type: 'textarea', required: true, rows: 3, maxLength: 2000, placeholder: 'Tell me about the role, team, and what you’re looking for' },
      { name: 'materials', label: 'Link to job posting or details', type: 'textarea', optional: true, rows: 2, maxLength: 2000, placeholder: 'Paste a job link, company site, or anything else helpful (optional)' },
    ],
  },
}

export const PICKER_KINDS = ['networking', 'consultation', 'strategy']
```

- [ ] **Step 2: Replace the old scattered exports with back-compat aliases**

Delete the old `SESSION`, `MEETING_TYPES`, `RECRUITER_SESSION`, `RECRUITER_MEETING_TYPES`, `CONSULTATION_FIELDS`, `RECRUITER_FIELDS` definitions (everything from `export const SESSION = {` through the end of `RECRUITER_FIELDS`). Replace them with:

```js
// ─── Back-compat aliases (derived from MEETING_KINDS) ────────────────────────
export const SESSION = MEETING_KINDS.consultation.session
export const MEETING_TYPES = MEETING_KINDS.consultation.meetingTypes
export const CONSULTATION_FIELDS = MEETING_KINDS.consultation.fields
export const RECRUITER_SESSION = MEETING_KINDS.recruiter.session
export const RECRUITER_MEETING_TYPES = MEETING_KINDS.recruiter.meetingTypes
export const RECRUITER_FIELDS = MEETING_KINDS.recruiter.fields
```

Leave `BOOKING_API_URL` and `GOOGLE_BOOKING_FALLBACK_URL` untouched.

- [ ] **Step 3: Verify build + lint**

Run: `npm run build && npm run lint`
Expected: build succeeds, lint clean. (The old pages still import the alias names, which now resolve through `MEETING_KINDS`, so nothing else changes yet.)

- [ ] **Step 4: Commit**

```bash
git add src/config/booking.js
git commit -m "Consolidate booking config into MEETING_KINDS (networking, consultation, strategy, recruiter)"
```

---

## Task 2: Meeting-type picker + `/booking/:type` routing

**Files:**
- Create: `src/pages/BookingLanding.jsx`
- Modify: `src/pages/BookingPage.jsx`
- Modify: `src/pages/RecruiterBookingPage.jsx`
- Modify: `src/App.jsx:45` (the `/booking` route)
- Modify: `src/components/FloatingCTA.jsx:11`

**Interfaces:**
- Consumes: `MEETING_KINDS`, `PICKER_KINDS` from Task 1.
- Produces: a `buildBookingConfig(kind)` helper local to `BookingPage.jsx` that maps a `MEETING_KINDS` entry + a lucide icon map to the `config` object `BookingFlow` expects (`{apiType, bookingStartEvent, eyebrow, pageTitle, pageSubtitle, session, detailItems, whatToExpect, meetingTypes, meetingIcons, confirmedMeetingLine, fields}`).

- [ ] **Step 1: Create the picker page `src/pages/BookingLanding.jsx`**

```jsx
import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Coffee, MessageSquare, Compass, Clock, ArrowRight } from 'lucide-react'
import { MEETING_KINDS, PICKER_KINDS } from '../config/booking'

// Icon per meeting kind (recruiter isn't in the picker).
const KIND_ICONS = {
  networking: Coffee,
  consultation: MessageSquare,
  strategy: Compass,
}

export default function BookingLanding() {
  useEffect(() => {
    document.title = 'Book a Meeting — Deem Creative'
  }, [])

  return (
    <div className="min-h-screen bg-brand-dark text-white px-6 py-20 sm:py-28">
      <div className="max-w-3xl mx-auto">
        <p className="text-brand-light text-sm font-semibold tracking-widest uppercase mb-4">Deem Creative</p>
        <h1 className="text-4xl md:text-5xl font-bold mb-4">Book a meeting</h1>
        <p className="text-white/65 text-lg sm:text-xl max-w-2xl mb-12">
          Pick the kind of conversation that fits. Every option lands straight on the calendar with an instant confirmation.
        </p>

        <div className="grid gap-4">
          {PICKER_KINDS.map(key => {
            const kind = MEETING_KINDS[key]
            const Icon = KIND_ICONS[key]
            return (
              <Link
                key={key}
                to={`/booking/${key}`}
                className="group flex items-center gap-5 rounded-2xl border border-white/10 bg-white/[0.03] p-6 transition hover:border-brand-light/50 hover:bg-white/[0.06]"
              >
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-brand-light/15 text-brand-light">
                  {Icon ? <Icon size={22} /> : null}
                </span>
                <span className="flex-1">
                  <span className="flex items-center gap-3">
                    <span className="text-xl font-bold">{kind.session.title}</span>
                    <span className="inline-flex items-center gap-1 text-white/50 text-sm">
                      <Clock size={14} /> {kind.session.durationMinutes} min
                    </span>
                  </span>
                  <span className="mt-1 block text-white/60">{kind.pickerBlurb}</span>
                </span>
                <ArrowRight size={20} className="shrink-0 text-white/30 transition group-hover:translate-x-1 group-hover:text-brand-light" />
              </Link>
            )
          })}
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Rewrite `src/pages/BookingPage.jsx` to render a type from the route param**

```jsx
import { useEffect } from 'react'
import { useParams, Navigate } from 'react-router-dom'
import { Video, MapPin, Phone } from 'lucide-react'
import BookingFlow from '../components/BookingFlow'
import { MEETING_KINDS, PICKER_KINDS } from '../config/booking'
import { ANALYTICS_EVENTS } from '../config/analytics'

const MEETING_ICONS = { zoom: Video, 'in-person': MapPin, phone: Phone }

// Map a MEETING_KINDS entry to the config shape BookingFlow consumes.
export function buildBookingConfig(kind) {
  return {
    apiType: kind.apiType,
    bookingStartEvent: ANALYTICS_EVENTS.BOOKING_START,
    eyebrow: kind.eyebrow,
    pageTitle: kind.pageTitle,
    pageSubtitle: kind.pageSubtitle,
    session: kind.session,
    detailItems: (kind.detailItemsText || []).map(text => ({ icon: Video, text })),
    whatToExpect: kind.whatToExpect,
    meetingTypes: kind.meetingTypes,
    meetingIcons: MEETING_ICONS,
    confirmedMeetingLine: (type) => (kind.confirmedLines && kind.confirmedLines[type]) || '',
    fields: kind.fields,
  }
}

export default function BookingPage() {
  const { type } = useParams()
  const kind = type && MEETING_KINDS[type]
  const valid = kind && PICKER_KINDS.includes(type)

  useEffect(() => {
    if (valid) document.title = `${kind.session.title} — Deem Creative`
  }, [valid, kind])

  if (!valid) return <Navigate to="/booking" replace />
  return <BookingFlow config={buildBookingConfig(kind)} />
}
```

- [ ] **Step 3: Simplify `src/pages/RecruiterBookingPage.jsx` to reuse the builder**

Replace the whole file with:

```jsx
import { useEffect } from 'react'
import BookingFlow from '../components/BookingFlow'
import { MEETING_KINDS } from '../config/booking'
import { ANALYTICS_EVENTS } from '../config/analytics'
import { buildBookingConfig } from './BookingPage'

const config = {
  ...buildBookingConfig(MEETING_KINDS.recruiter),
  bookingStartEvent: ANALYTICS_EVENTS.RECRUITER_BOOKING_START,
}

export default function RecruiterBookingPage() {
  useEffect(() => {
    document.title = 'Schedule a Hiring Call — Michael Deem Jr.'
  }, [])
  return <BookingFlow config={config} />
}
```

- [ ] **Step 4: Add the `/booking/:type` route in `src/App.jsx`**

Add the `BookingLanding` import alongside the other page imports (near `src/App.jsx:19`):

```jsx
import BookingLanding from './pages/BookingLanding'
```

Replace the single booking route line (`src/App.jsx:45`):

```jsx
          <Route path="/booking" element={<BookingPage />} />
```

with:

```jsx
          <Route path="/booking" element={<BookingLanding />} />
          <Route path="/booking/:type" element={<BookingPage />} />
```

Leave the `/hire` route (`RecruiterBookingPage`) unchanged.

- [ ] **Step 5: Widen the `FloatingCTA` active-page check**

In `src/components/FloatingCTA.jsx:11`, replace:

```jsx
  const onBookingPage = location.pathname === '/booking'
```

with:

```jsx
  const onBookingPage = location.pathname.startsWith('/booking')
```

- [ ] **Step 6: Verify build + lint**

Run: `npm run build && npm run lint`
Expected: build succeeds, lint clean.

- [ ] **Step 7: Manual check in the dev server**

Run: `npm run dev`, then in the browser:
1. Visit `/booking` → three cards (Networking 20 min, Free Consultation 30 min, Strategy Deep-Dive 60 min). Recruiter is NOT shown.
2. Click each card → routes to `/booking/networking|consultation|strategy` and the booking flow renders with the matching title/duration in the left panel.
3. Visit `/booking/bogus` → redirects to `/booking`.
4. Visit `/hire` → recruiter flow still renders.
5. On any `/booking*` page the floating CTA is hidden.

Expected: all five behave as described. (Availability numbers may still be the old 30-min grid until Task 3's script is deployed — that's fine at this stage.)

- [ ] **Step 8: Commit**

```bash
git add src/pages/BookingLanding.jsx src/pages/BookingPage.jsx src/pages/RecruiterBookingPage.jsx src/App.jsx src/components/FloatingCTA.jsx
git commit -m "Add /booking meeting-type picker and /booking/:type routing"
```

---

## Task 3: Per-type availability + booking in `Code.gs`

**Files:**
- Modify: `apps-script/Code.gs` (`CONFIG.TYPES`, `doGet`, `doPost`, `getAvailableSlots`, `meetingLocation`)

**Interfaces:**
- Consumes: booking `type` sent by the frontend (`networking|consultation|strategy|recruiter`).
- Produces: `getAvailableSlots(type)` honoring per-type `slotMinutes`, `startHour`, `endHour`, `workDays`, `bufferMinutes`, and `maxPerDay`; `doGet` returning per-type `durationMinutes`; `doPost` creating an event of the per-type length with per-type required-field validation. `meetingLocation(meetingType, phone, zoomUrl)` gains a 3rd arg (used by Task 4; pass `''` here).

- [ ] **Step 1: Extend `CONFIG.TYPES` with per-type scheduling settings**

In `apps-script/Code.gs`, replace the entire `TYPES: { ... }` block inside `CONFIG` (currently `apps-script/Code.gs:36-49`) with:

```js
  // Four booking types share the SAME calendar (so they can't double-book each
  // other) but each has its own duration, hours, days, per-day cap, buffer,
  // wording, and meeting formats. Keep durations in sync with
  // src/config/booking.js → MEETING_KINDS[*].session.durationMinutes.
  TYPES: {
    networking: {
      slotMinutes: 20, startHour: 15, endHour: 17, workDays: [1, 2, 3, 4, 5],
      maxPerDay: 2, bufferMinutes: 15,
      eventLabel: 'Networking Chat',
      calTitle: 'Networking Chat with Michael Deem Jr.',
      meetingTypes: ['zoom', 'phone'],
    },
    consultation: {
      slotMinutes: 30, startHour: 11, endHour: 15, workDays: [1, 2, 3, 4, 5],
      maxPerDay: 3, bufferMinutes: 30,
      eventLabel: 'Deem Creative Consultation',
      calTitle: 'Deem Creative Consultation',
      meetingTypes: ['zoom', 'in-person'],
    },
    strategy: {
      slotMinutes: 60, startHour: 11, endHour: 14, workDays: [1, 3, 5],
      maxPerDay: 1, bufferMinutes: 30,
      eventLabel: 'Strategy Deep-Dive',
      calTitle: 'Deem Creative Strategy Deep-Dive',
      meetingTypes: ['zoom', 'in-person'],
    },
    recruiter: {
      slotMinutes: 30, startHour: 10, endHour: 17, workDays: [1, 2, 3, 4, 5],
      maxPerDay: null, bufferMinutes: 30,
      eventLabel: 'Hiring Call',
      calTitle: 'Call with Michael Deem Jr.',
      meetingTypes: ['zoom', 'phone'],
    },
  },
```

- [ ] **Step 2: Return per-type duration from `doGet`**

Replace the `availability` branch in `doGet` (currently `apps-script/Code.gs:126-132`) with:

```js
  if (action === 'availability') {
    var tcg = typeConfig(type);
    return jsonResponse({
      ok: true,
      durationMinutes: tcg.slotMinutes != null ? tcg.slotMinutes : CONFIG.SLOT_MINUTES,
      slots: getAvailableSlots(type),
    });
  }
```

- [ ] **Step 3: Rewrite `getAvailableSlots` to be per-type (incl. per-day cap)**

Replace the whole `getAvailableSlots` function (currently `apps-script/Code.gs:275-318`) with:

```js
/** Open slot start times (ISO strings) for one booking type, honoring that
 *  type's duration, hours, days, buffer, and per-day cap plus the global
 *  notice/window. */
function getAvailableSlots(type) {
  var tc = typeConfig(type);
  var slotMin = tc.slotMinutes != null ? tc.slotMinutes : CONFIG.SLOT_MINUTES;
  var startHour = tc.startHour != null ? tc.startHour : CONFIG.WORK_START_HOUR;
  var endHour = tc.endHour != null ? tc.endHour : CONFIG.WORK_END_HOUR;
  var workDays = tc.workDays || CONFIG.WORK_DAYS;
  var bufferMin = tc.bufferMinutes != null ? tc.bufferMinutes : CONFIG.BUFFER_MINUTES;
  var maxPerDay = tc.maxPerDay != null ? tc.maxPerDay : null;

  var now = new Date();
  var minStartMs = now.getTime() + CONFIG.MIN_NOTICE_HOURS * 3600000;
  var horizonMs = now.getTime() + CONFIG.MAX_DAYS_AHEAD * 86400000;

  var cal = CalendarApp.getDefaultCalendar();
  var events = cal.getEvents(now, new Date(horizonMs + 86400000))
    .filter(function (ev) { return !ev.isAllDayEvent(); });

  // Pad every real event by THIS TYPE's buffer on both sides.
  var pad = bufferMin * 60000;
  var busy = events.map(function (ev) {
    return [ev.getStartTime().getTime() - pad, ev.getEndTime().getTime() + pad];
  });

  // Count existing bookings OF THIS TYPE per calendar day, for the per-day cap.
  var perDayCount = {};
  if (maxPerDay != null) {
    events.forEach(function (ev) {
      if (ev.getTag('deemBooking') !== 'true') return;
      if (ev.getTag('bookingType') !== type) return;
      var d = ev.getStartTime();
      var key = d.getFullYear() + '-' + d.getMonth() + '-' + d.getDate();
      perDayCount[key] = (perDayCount[key] || 0) + 1;
    });
  }

  var slots = [];
  var day = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  while (day.getTime() <= horizonMs) {
    if (workDays.indexOf(day.getDay()) !== -1) {
      var dayKey = day.getFullYear() + '-' + day.getMonth() + '-' + day.getDate();
      var atCap = maxPerDay != null && (perDayCount[dayKey] || 0) >= maxPerDay;
      if (!atCap) {
        for (var mins = startHour * 60; mins + slotMin <= endHour * 60; mins += slotMin) {
          var slotStart = new Date(day.getFullYear(), day.getMonth(), day.getDate(), 0, mins);
          var s = slotStart.getTime();
          var eMs = s + slotMin * 60000;
          if (s < minStartMs || s > horizonMs) continue;
          var blocked = busy.some(function (b) { return s < b[1] && eMs > b[0]; });
          if (!blocked) slots.push(slotStart.toISOString());
        }
      }
    }
    day.setDate(day.getDate() + 1);
  }
  return slots;
}
```

- [ ] **Step 4: Accept the new types + per-type required fields + per-type duration in `doPost`**

In `doPost`, replace the booking-type resolution line (currently `apps-script/Code.gs:167`):

```js
    var bookingType = (f.type === 'recruiter') ? 'recruiter' : 'consultation';
```

with:

```js
    var VALID_TYPES = { networking: 1, consultation: 1, strategy: 1, recruiter: 1 };
    var bookingType = VALID_TYPES[f.type] ? f.type : 'consultation';
```

Then replace the required-field validation block (currently `apps-script/Code.gs:182-187`, the two `if` checks for required fields and recruiter roleTitle) with:

```js
    // Per-type required fields (email is validated separately below).
    var REQUIRED = {
      networking: ['firstName', 'lastName', 'phone', 'projectOverview'],
      consultation: ['firstName', 'lastName', 'phone', 'organization', 'projectOverview'],
      strategy: ['firstName', 'lastName', 'phone', 'organization', 'projectOverview'],
      recruiter: ['firstName', 'lastName', 'phone', 'organization', 'roleTitle', 'projectOverview'],
    };
    var vals = { firstName: firstName, lastName: lastName, phone: phone, organization: organization, roleTitle: roleTitle, projectOverview: projectOverview };
    var missing = (REQUIRED[bookingType] || REQUIRED.consultation).some(function (k) { return !vals[k]; });
    if (missing) {
      return jsonResponse({ ok: false, error: 'Please fill in all required fields.' });
    }
```

Then replace the `end` computation (currently `apps-script/Code.gs:217`):

```js
    var end = new Date(start.getTime() + CONFIG.SLOT_MINUTES * 60000);
```

with:

```js
    var end = new Date(start.getTime() + (tc.slotMinutes || CONFIG.SLOT_MINUTES) * 60000);
```

- [ ] **Step 5: Make the organization line in the event description conditional**

In `doPost`, the `description` string (currently `apps-script/Code.gs:223-233`) hardcodes `'Organization: ' + organization`. Networking has no organization. Replace:

```js
      'Organization: ' + organization + '\n' +
```

with:

```js
      (organization ? 'Organization: ' + organization + '\n' : '') +
```

- [ ] **Step 6: Give `meetingLocation` a `zoomUrl` parameter (used in Task 4)**

Replace `meetingLocation` (currently `apps-script/Code.gs:115-119`) with:

```js
/** Human-readable event/calendar location for a meeting format. */
function meetingLocation(meetingType, phone, zoomUrl) {
  if (meetingType === 'zoom') return zoomUrl ? zoomUrl : 'Zoom (link to follow by email)';
  if (meetingType === 'phone') return 'Phone call' + (phone ? ' — ' + phone : '');
  return 'In person — South Jersey (location to be confirmed)';
}
```

The existing call in `doPost` (`var location = meetingLocation(meetingType, phone);`) still works (3rd arg `undefined` → fallback). Leave it for now; Task 4 passes the real URL.

- [ ] **Step 7: Syntax-check the script**

Run: `node --check apps-script/Code.gs`
Expected: no output (exit 0). A non-zero exit means a syntax error to fix before continuing.

- [ ] **Step 8: Commit**

```bash
git add apps-script/Code.gs
git commit -m "Per-type availability, duration, and required fields in booking script"
```

---

## Task 4: Unique Zoom link per Zoom booking

**Files:**
- Modify: `apps-script/Code.gs` (new `createZoomMeeting`/`getZoomToken`, wiring in `doPost`, `sendReminders` path, email/ics/calendar-link functions)
- Modify: `BOOKING_SETUP.md` (Zoom setup section)

**Interfaces:**
- Consumes: Script Properties `ZOOM_ACCOUNT_ID`, `ZOOM_CLIENT_ID`, `ZOOM_CLIENT_SECRET` (set by the user in the Apps Script project).
- Produces: `createZoomMeeting(topic, startDate, durationMin) → {joinUrl, password} | null`. A `zoomUrl` event tag carrying the join URL. `sendClientEmail`, `calData`, and `buildIcs` accept `d.zoomUrl` and use it for the location/link when present.

- [ ] **Step 1: Add the Zoom helper functions**

In `apps-script/Code.gs`, immediately after the `verifyTurnstile` function (ends `apps-script/Code.gs:460`), add:

```js
// ─── Zoom (Server-to-Server OAuth) ──────────────────────────────────────────

/**
 * Create a unique Zoom meeting for a booking and return its join URL.
 * Requires Script Properties ZOOM_ACCOUNT_ID / ZOOM_CLIENT_ID /
 * ZOOM_CLIENT_SECRET. Returns null (→ caller falls back to "link to follow by
 * email") when unconfigured or if Zoom errors, so a booking never fails on Zoom.
 */
function createZoomMeeting(topic, startDate, durationMin) {
  var props = PropertiesService.getScriptProperties();
  var accountId = props.getProperty('ZOOM_ACCOUNT_ID');
  var clientId = props.getProperty('ZOOM_CLIENT_ID');
  var clientSecret = props.getProperty('ZOOM_CLIENT_SECRET');
  if (!accountId || !clientId || !clientSecret) return null;  // not set up yet

  try {
    var token = getZoomToken(accountId, clientId, clientSecret);
    if (!token) return null;
    var res = UrlFetchApp.fetch('https://api.zoom.us/v2/users/me/meetings', {
      method: 'post',
      contentType: 'application/json',
      muteHttpExceptions: true,
      headers: { Authorization: 'Bearer ' + token },
      payload: JSON.stringify({
        topic: String(topic).slice(0, 200),
        type: 2,  // scheduled meeting
        start_time: Utilities.formatDate(startDate, 'America/New_York', "yyyy-MM-dd'T'HH:mm:ss"),
        duration: durationMin,
        timezone: 'America/New_York',
        settings: { join_before_host: true, waiting_room: false },
      }),
    });
    if (res.getResponseCode() === 201) {
      var data = JSON.parse(res.getContentText());
      if (data && data.join_url) return { joinUrl: data.join_url, password: data.password || '' };
    }
  } catch (err) { /* fall through to fallback */ }
  return null;
}

/** Fetch (and 50-min cache) a Zoom S2S OAuth access token. Returns null on error. */
function getZoomToken(accountId, clientId, clientSecret) {
  var cache = CacheService.getScriptCache();
  var cached = cache.get('zoomToken');
  if (cached) return cached;
  try {
    var res = UrlFetchApp.fetch(
      'https://zoom.us/oauth/token?grant_type=account_credentials&account_id=' + encodeURIComponent(accountId),
      {
        method: 'post',
        muteHttpExceptions: true,
        headers: { Authorization: 'Basic ' + Utilities.base64Encode(clientId + ':' + clientSecret) },
      }
    );
    if (res.getResponseCode() === 200) {
      var data = JSON.parse(res.getContentText());
      if (data && data.access_token) {
        cache.put('zoomToken', data.access_token, Math.max(60, (data.expires_in || 3600) - 300));
        return data.access_token;
      }
    }
  } catch (err) { /* fall through */ }
  return null;
}
```

- [ ] **Step 2: Create the Zoom meeting during booking and thread the URL through**

In `doPost`, replace the location + event-creation region (currently `apps-script/Code.gs:221` for `var location = ...` through the `event.setTag('meetingType', meetingType);` line at `apps-script/Code.gs:247`) with:

```js
    // For Zoom bookings, create a real unique Zoom meeting (falls back to null
    // → "link to follow by email" if Zoom isn't configured or errors).
    var zoom = (meetingType === 'zoom')
      ? createZoomMeeting(tc.calTitle + ' — ' + fullName, start, tc.slotMinutes || CONFIG.SLOT_MINUTES)
      : null;
    var zoomUrl = zoom ? zoom.joinUrl : '';

    var location = meetingLocation(meetingType, phone, zoomUrl);

    var description =
      'Booked via deemcreative.com\n\n' +
      'Type: ' + tc.eventLabel + '\n' +
      'Name: ' + fullName + '\n' +
      'Email: ' + email + '\n' +
      'Phone: ' + phone + '\n' +
      (organization ? 'Organization: ' + organization + '\n' : '') +
      (bookingType === 'recruiter' ? 'Role / position: ' + roleTitle + '\n' : '') +
      'Meeting type: ' + typeLabel + '\n' +
      (zoomUrl ? 'Zoom link: ' + zoomUrl + (zoom.password ? '  (passcode: ' + zoom.password + ')' : '') + '\n' : '') +
      '\n' +
      (bookingType === 'recruiter' ? 'About the opportunity:\n' : 'Project overview:\n') + projectOverview +
      (materials ? '\n\n' + (bookingType === 'recruiter' ? 'Job link / details:\n' : 'Materials to review beforehand:\n') + materials : '');

    var cal = CalendarApp.getDefaultCalendar();
    var event = cal.createEvent(
      tc.eventLabel + ' — ' + fullName + ' (' + typeLabel + ')',
      start, end,
      { description: description, location: location, guests: email, sendInvites: true }
    );

    // Tags let the daily reminder job find this booking later
    event.setTag('deemBooking', 'true');
    event.setTag('bookingType', bookingType);
    event.setTag('clientEmail', email);
    event.setTag('clientFirstName', firstName);
    event.setTag('meetingType', meetingType);
    if (zoomUrl) event.setTag('zoomUrl', zoomUrl);
```

> NOTE: This block replaces the OLD lines that built `description` with an unconditional `'Organization: '` line — so it supersedes Task 3 Step 5's edit if that region overlaps. After this edit, confirm there is exactly ONE `description =` assignment in `doPost`.

- [ ] **Step 3: Pass `zoomUrl` into the confirmation + owner emails**

In `doPost`, update the `sendClientEmail('confirmation', {...})` call (currently around `apps-script/Code.gs:250-253`) to include `zoomUrl`:

```js
    sendClientEmail('confirmation', {
      firstName: firstName, email: email,
      start: start, end: end, meetingType: meetingType, bookingType: bookingType,
      zoomUrl: zoomUrl,
    });
```

(The owner email doesn't need the link — the event already carries it — so leave `sendOwnerEmail` as-is.)

- [ ] **Step 4: Include the stored `zoomUrl` in reminder emails**

In `remindForDay` (currently `apps-script/Code.gs:340-360`), update the `sendClientEmail(...)` call to pass the tag:

```js
    sendClientEmail(kind, {
      firstName: ev.getTag('clientFirstName') || 'there',
      email: ev.getTag('clientEmail'),
      start: ev.getStartTime(),
      end: ev.getEndTime(),
      meetingType: ev.getTag('meetingType') || 'zoom',
      bookingType: ev.getTag('bookingType') || 'consultation',
      zoomUrl: ev.getTag('zoomUrl') || '',
    });
```

- [ ] **Step 5: Render a "Join Zoom" button and real link in `sendClientEmail`**

In `sendClientEmail`, find the meeting-line paragraph (currently `apps-script/Code.gs:759`):

```js
        '<p style="margin:0 0 20px;color:#42526b">' + escapeHtml(meetLine) + '</p>' +
```

Replace it with a block that shows a Join button + link when a Zoom URL exists, otherwise the original line:

```js
        (d.zoomUrl
          ? '<div style="margin:0 0 20px">' +
              '<a href="' + escapeHtml(d.zoomUrl) + '" style="' + pill + '">Join Zoom meeting</a>' +
              '<p style="margin:8px 0 0;color:#42526b;font-size:13px;word-break:break-all">' + escapeHtml(d.zoomUrl) + '</p>' +
            '</div>'
          : '<p style="margin:0 0 20px;color:#42526b">' + escapeHtml(meetLine) + '</p>') +
```

(`pill` is already defined just above in this function for the calendar buttons.)

- [ ] **Step 6: Use the real Zoom URL as the location in calendar links + `.ics`**

Replace `calData` (currently `apps-script/Code.gs:783-794`) so the location prefers the Zoom URL:

```js
/** Shared event details used by every calendar link + the .ics file. */
function calData(d) {
  var fmtZ = function (dt) { return Utilities.formatDate(dt, 'UTC', "yyyyMMdd'T'HHmmss'Z'"); };
  var tc = typeConfig(d.bookingType);
  var isRecruiter = d.bookingType === 'recruiter';
  return {
    title: tc.calTitle,
    desc: (isRecruiter ? 'Call with ' : 'Meeting with ') + CONFIG.HOST_NAME + ', ' + CONFIG.BUSINESS_NAME + '.'
      + (d.zoomUrl ? ' Zoom: ' + d.zoomUrl : ''),
    loc: meetingLocation(d.meetingType, d.phone, d.zoomUrl),
    startZ: fmtZ(d.start), endZ: fmtZ(d.end),
    startIso: d.start.toISOString(), endIso: d.end.toISOString(),
  };
}
```

And in `buildIcs` (currently `apps-script/Code.gs:828-851`), replace the `var loc = ...` line:

```js
  var loc = meetingLocation(d.meetingType, d.phone);
```

with:

```js
  var loc = meetingLocation(d.meetingType, d.phone, d.zoomUrl);
```

- [ ] **Step 7: Syntax-check the script**

Run: `node --check apps-script/Code.gs`
Expected: exit 0, no output.

- [ ] **Step 8: Document the Zoom setup in `BOOKING_SETUP.md`**

Add this section to `BOOKING_SETUP.md`, immediately before the "## 7. Changing settings later" section:

```markdown
## Auto-generate a unique Zoom link per booking (optional)

By default, Zoom bookings say "Michael will email you the link." To have the
script create a **real, unique Zoom meeting for every Zoom booking** (like the
Google Calendar Zoom button does, but automatic):

1. Go to **[marketplace.zoom.us](https://marketplace.zoom.us)**, sign in, then
   **Develop → Build App → Server-to-Server OAuth → Create**. Name it
   `Deem Creative Booking`.
2. On **App Credentials**, note the **Account ID**, **Client ID**, and
   **Client Secret**.
3. Fill in the **Information** tab (company + your name/email) — required to activate.
4. **Scopes → Add Scopes → Meeting** → add the "view and manage meetings"
   (`meeting:write`) scope. Save.
5. **Activation → Activate your app.**
6. In the Apps Script editor: **⚙ Project Settings → Script Properties → Add**,
   and create three properties (names are case-sensitive):
   - `ZOOM_ACCOUNT_ID`
   - `ZOOM_CLIENT_ID`
   - `ZOOM_CLIENT_SECRET`
7. Re-deploy (Deploy → Manage deployments → Edit → New version). Done — Zoom
   bookings now get a unique join link in the calendar event and the emails.

If these properties are absent, or Zoom is unreachable, bookings still succeed
and simply use the "link to follow by email" wording — nothing breaks.
```

- [ ] **Step 9: Commit**

```bash
git add apps-script/Code.gs BOOKING_SETUP.md
git commit -m "Generate a unique Zoom link per Zoom booking via Server-to-Server OAuth"
```

---

## Task 5: Email templates + actual duration for new types

**Files:**
- Modify: `apps-script/Code.gs` (`TPL_DEFAULTS`, `sendClientEmail` template selection + duration line)
- Modify: `src/data/defaults.js` (`emailsDefaults`)

**Interfaces:**
- Consumes: `bookingType` on the email data object `d`.
- Produces: `TPL_DEFAULTS.networking` and `TPL_DEFAULTS.strategy` template blocks; `sendClientEmail` selecting the right block by `bookingType` and showing the booked meeting's actual length.

- [ ] **Step 1: Add `networking` + `strategy` blocks to `TPL_DEFAULTS`**

In `apps-script/Code.gs`, inside `TPL_DEFAULTS`, immediately after the `recruiter: { ... }` block's closing `},` (currently `apps-script/Code.gs:104`, just before the final `};` of `TPL_DEFAULTS`), add:

```js
  networking: {
    confirmation: {
      subject: "You're booked — networking chat with Michael Deem Jr.",
      heading: "You're booked!",
      intro: 'Thanks for setting up a networking chat with Michael Deem Jr. Looking forward to connecting. Here are the details:',
    },
    reminderDayBefore: {
      subject: 'Reminder: your networking chat with Michael Deem Jr. is tomorrow',
      heading: 'See you tomorrow',
      intro: 'A friendly reminder that your networking chat with Michael Deem Jr. is tomorrow:',
    },
    reminderDayOf: {
      subject: 'Reminder: your networking chat with Michael Deem Jr. is today',
      heading: 'See you today',
      intro: 'A friendly reminder that your networking chat with Michael Deem Jr. is today:',
    },
    zoomLine: 'Michael Deem Jr. will email you the Zoom link before the chat.',
    phoneLine: 'Michael Deem Jr. will call the number you provided at the scheduled time.',
  },
  strategy: {
    confirmation: {
      subject: "You're booked — Deem Creative Strategy Deep-Dive",
      heading: "You're booked!",
      intro: 'Thanks for scheduling a Strategy Deep-Dive with Deem Creative. Here are the details:',
    },
    reminderDayBefore: {
      subject: 'Reminder: your Deem Creative Strategy Deep-Dive is tomorrow',
      heading: 'See you tomorrow',
      intro: 'A friendly reminder that your Strategy Deep-Dive with Deem Creative is tomorrow:',
    },
    reminderDayOf: {
      subject: 'Reminder: your Deem Creative Strategy Deep-Dive is today',
      heading: 'See you today',
      intro: 'A friendly reminder that your Strategy Deep-Dive with Deem Creative is today:',
    },
    zoomLine: 'Michael Deem Jr. will email you the Zoom link before the session.',
    inPersonLine: 'Michael Deem Jr. will confirm the exact location with you (South Jersey area) before the session.',
  },
```

- [ ] **Step 2: Generalize template selection + meeting line in `sendClientEmail`**

In `sendClientEmail`, replace the block that picks `src`/`t`/`meetLine` (currently `apps-script/Code.gs:719-729`, from the `var isRecruiter = ...` line through the `meetLine` assignment) with a per-type version:

```js
  // Each non-consultation type may have its own template block (T.networking,
  // T.strategy, T.recruiter). Consultation uses the top-level T.*.
  var typeBlock = T[d.bookingType];
  var src = (typeBlock && typeof typeBlock === 'object') ? typeBlock : T;
  var t = src[keyMap[kind]] || src.confirmation || T.confirmation;

  var when = formatRange(d.start, d.end);
  var typeLabel = MEETING_LABELS[d.meetingType] || 'Meeting';
  var meetLine;
  if (d.meetingType === 'phone') {
    meetLine = src.phoneLine || (T.recruiter && T.recruiter.phoneLine) || '';
  } else if (d.meetingType === 'in-person') {
    meetLine = src.inPersonLine || T.inPersonLine;
  } else {
    meetLine = src.zoomLine || T.zoomLine;
  }
```

- [ ] **Step 3: Show the booked meeting's actual length in the email**

In `sendClientEmail`, replace the duration row (currently `apps-script/Code.gs:755`):

```js
          row('Duration', CONFIG.SLOT_MINUTES + ' minutes') +
```

with (compute from the event's own start/end):

```js
          row('Duration', Math.max(1, Math.round((d.end.getTime() - d.start.getTime()) / 60000)) + ' minutes') +
```

- [ ] **Step 4: Mirror the new template blocks in `src/data/defaults.js`**

In `src/data/defaults.js`, inside `emailsDefaults`, immediately after the `recruiter: { ... }` block's closing brace (near `src/data/defaults.js:144`, before the object's final `}`), add the same `networking` and `strategy` blocks used in Step 1 (JS object literal form — no `var`, matching the file's existing `recruiter` entry style):

```js
  networking: {
    confirmation: {
      subject: "You're booked — networking chat with Michael Deem Jr.",
      heading: "You're booked!",
      intro: 'Thanks for setting up a networking chat with Michael Deem Jr. Looking forward to connecting. Here are the details:',
    },
    reminderDayBefore: {
      subject: 'Reminder: your networking chat with Michael Deem Jr. is tomorrow',
      heading: 'See you tomorrow',
      intro: 'A friendly reminder that your networking chat with Michael Deem Jr. is tomorrow:',
    },
    reminderDayOf: {
      subject: 'Reminder: your networking chat with Michael Deem Jr. is today',
      heading: 'See you today',
      intro: 'A friendly reminder that your networking chat with Michael Deem Jr. is today:',
    },
    zoomLine: 'Michael Deem Jr. will email you the Zoom link before the chat.',
    phoneLine: 'Michael Deem Jr. will call the number you provided at the scheduled time.',
  },
  strategy: {
    confirmation: {
      subject: "You're booked — Deem Creative Strategy Deep-Dive",
      heading: "You're booked!",
      intro: 'Thanks for scheduling a Strategy Deep-Dive with Deem Creative. Here are the details:',
    },
    reminderDayBefore: {
      subject: 'Reminder: your Deem Creative Strategy Deep-Dive is tomorrow',
      heading: 'See you tomorrow',
      intro: 'A friendly reminder that your Strategy Deep-Dive with Deem Creative is tomorrow:',
    },
    reminderDayOf: {
      subject: 'Reminder: your Deem Creative Strategy Deep-Dive is today',
      heading: 'See you today',
      intro: 'A friendly reminder that your Strategy Deep-Dive with Deem Creative is today:',
    },
    zoomLine: 'Michael Deem Jr. will email you the Zoom link before the session.',
    inPersonLine: 'Michael Deem Jr. will confirm the exact location with you (South Jersey area) before the session.',
  },
```

> Note: the admin "Booking Emails" editor UI (`src/pages/admin/editors/EmailsEditor.jsx`) is intentionally NOT expanded to edit these new blocks — the script falls back to these defaults, which is sufficient. Extending the editor is out of scope (YAGNI).

- [ ] **Step 5: Verify frontend build/lint + script syntax**

Run: `npm run build && npm run lint && node --check apps-script/Code.gs`
Expected: build succeeds, lint clean, script syntax OK (exit 0).

- [ ] **Step 6: Commit**

```bash
git add apps-script/Code.gs src/data/defaults.js
git commit -m "Add networking/strategy email templates and actual-duration email line"
```

---

## Task 6: Update `BOOKING_SETUP.md` settings table + deploy checklist

**Files:**
- Modify: `BOOKING_SETUP.md`

- [ ] **Step 1: Replace the "What's already configured" table with the per-type table**

In `BOOKING_SETUP.md`, replace the single settings table under "## What's already configured for you" with:

```markdown
| Type | Length | Days & window (ET) | Max/day | Buffer | Formats |
|---|---|---|---|---|---|
| Networking / Coffee Chat | 20 min | Mon–Fri, 3:00–5:00 PM | 2 | 15 min | Zoom, Phone |
| Free Consultation | 30 min | Mon–Fri, 11:00 AM–3:00 PM | 3 | 30 min | Zoom, In-person |
| Strategy Deep-Dive | 60 min | Mon/Wed/Fri, 11:00 AM–2:00 PM | 1 | 30 min | Zoom, In-person |
| Recruiter / Hiring Call | 30 min | Mon–Fri, 10:00 AM–5:00 PM | — | 30 min | Zoom, Phone |

Shared across all types: booking window up to **60 days** ahead, minimum notice
**48 hours**, reminder emails at **8:00 AM ET** the day before + day of. Change
any per-type value in `CONFIG.TYPES` (in `apps-script/Code.gs`) and re-deploy;
change the shared values in `CONFIG`.
```

- [ ] **Step 2: Add a note that the site now has a meeting-type picker**

In `BOOKING_SETUP.md`, under "## 5. Connect the website", add this line after the existing deploy step:

```markdown
> The `/booking` page now shows a **meeting-type picker** (Networking,
> Consultation, Strategy Deep-Dive). Each routes to `/booking/<type>`. The
> recruiter flow stays at `/hire` and is not shown in the picker.
```

- [ ] **Step 3: Commit**

```bash
git add BOOKING_SETUP.md
git commit -m "Document multi-type booking settings and picker in BOOKING_SETUP.md"
```

---

## Final integration verification (manual, after deploy)

These run after the user pastes the final `Code.gs` into the "Deem Creative
Booking" Apps Script project and redeploys (Deploy → Manage deployments → Edit →
New version), and `npm run deploy` for the site.

- [ ] Availability endpoints return the right grids (open each in a browser, swapping `<EXEC_URL>` for the deployed `/exec` URL):
  - `<EXEC_URL>?action=availability&type=networking` → `durationMinutes: 20`, slot times only 15:00–16:40 ET on Mon–Fri.
  - `...type=strategy` → `durationMinutes: 60`, slots only 11:00/12:00/13:00 ET on Mon/Wed/Fri.
  - `...type=consultation` → `durationMinutes: 30`, unchanged 11:00–14:30 grid.
- [ ] Book a networking slot with a **second** email: 20-minute event appears on the calendar; if Zoom is configured, the event location is a Zoom URL and the confirmation email has a "Join Zoom meeting" button; the slot + 15-min buffer disappear; after 2 bookings on a day, that day drops out of networking availability.
- [ ] Book a strategy slot: 60-minute event; after 1 booking that day disappears from strategy availability.
- [ ] Book an in-person consultation: no Zoom link created; email shows the in-person line and "30 minutes".
- [ ] `/hire` recruiter booking still works end-to-end.
- [ ] With Zoom Script Properties **removed**, a Zoom booking still succeeds and uses the "link to follow by email" wording (fallback proven).

---

## Self-review notes (author)

- **Spec coverage:** meeting types (Task 1/3), picker + routing (Task 2), per-type availability incl. duration/days/cap/buffer (Task 3), Zoom unique link + fallback + reminders reuse (Task 4), per-type emails + actual duration (Task 5), docs incl. Zoom setup + settings table (Task 4/6). Out-of-scope items (per-type notice/window, chatbot type-awareness, EmailsEditor UI, appointment-email-automation.gs) intentionally untouched.
- **Overlap guard:** Task 3 Step 5 edits the `description`'s organization line; Task 4 Step 2 rewrites the whole `description` region. If executed in order, Task 4 supersedes it — the note in Task 4 Step 2 flags verifying a single `description =` remains.
- **Type consistency:** `zoomUrl` is the single name used for the tag, the `d.zoomUrl` email field, and `meetingLocation`/`calData`/`buildIcs` args. `buildBookingConfig` is defined in `BookingPage.jsx` and imported by `RecruiterBookingPage.jsx`. `apiType` values match the `CONFIG.TYPES` keys and `VALID_TYPES`.
