# Multi-type booking + per-meeting Zoom links — Design

**Date:** 2026-07-26
**Status:** Approved (design); implementation plan to follow
**Scope:** Booking subsystem only. The Granola post-meeting follow-up automation
is a separate subsystem and gets its own spec.

## Problem

The site's `/booking` page only offers a single 30-minute "Free Consultation".
People have started booking for other reasons (e.g. a networking / connect
call). We want a small set of distinct meeting types, each with its own
duration, time-of-day window, days, per-day cap, and buffer — and we want
Zoom bookings to get a unique Zoom link generated automatically, the way the
Google Calendar Zoom add-on does when clicked manually.

## Current state (what we're building on)

- **`src/components/BookingFlow.jsx`** — a data-driven booking engine. It renders
  an entire booking flow (calendar, slot list, form, confirmation) from a
  `config` object, so new meeting types are mostly config, not new UI.
- **`src/pages/BookingPage.jsx`** (`/booking`, consultation) and
  **`src/pages/RecruiterBookingPage.jsx`** (`/hire`, recruiter) — thin wrappers,
  each passing a `config` to `BookingFlow`.
- **`src/config/booking.js`** — holds `SESSION`, `MEETING_TYPES`,
  `CONSULTATION_FIELDS`, and the recruiter equivalents (`RECRUITER_SESSION`,
  `RECRUITER_MEETING_TYPES`, `RECRUITER_FIELDS`).
- **`src/context/BookingContext.jsx`** — every "Book" CTA on the site calls
  `open()`, which does `navigate('/booking')`.
- **`apps-script/Code.gs`** — the booking server (Google Apps Script Web App).
  It already has a per-type map `CONFIG.TYPES` (`consultation`, `recruiter`)
  with per-type hours/labels/formats, but **slot length is a single global
  `CONFIG.SLOT_MINUTES = 30`**, and `WORK_DAYS`, `BUFFER_MINUTES`,
  `MIN_NOTICE_HOURS`, `MAX_DAYS_AHEAD` are all global. All types share one
  Google Calendar, so they can't double-book each other.
- **`apps-script/appointment-email-automation.gs`** — a *separate* script that
  sends a generic post-booking thank-you for non-website bookings. Out of scope
  here; not modified.

## Meeting types

| Key | Title | Duration | Days & window (ET) | Max/day | Buffer | Formats | In public picker |
|---|---|---|---|---|---|---|---|
| `networking` | Networking / Coffee Chat | 20 min | Mon–Fri, 3:00–5:00 PM | 2 | 15 min | Zoom, Phone | Yes |
| `consultation` | Free Consultation | 30 min | Mon–Fri, 11:00 AM–3:00 PM | 3 | 30 min | Zoom, In-person | Yes |
| `strategy` | Strategy Deep-Dive | 60 min | Mon/Wed/Fri, 11:00 AM–2:00 PM | 1 | 30 min | Zoom, In-person | Yes |
| `recruiter` | Recruiter / Hiring Call | 30 min | Mon–Fri, 10:00 AM–5:00 PM | (none) | 30 min | Zoom, Phone | No (`/hire` only) |

Rationale: networking is low-commitment, so it's pushed to late afternoon to
protect prime midday hours for paid work, capped at 2/day. The 60-min deep-dive
is the heaviest, so it's limited to 1/day on alternating days. Recruiter is a
distinct audience reached via a direct `/hire` link, so it stays out of the
public picker.

All values are tunable later by editing config + `CONFIG.TYPES` and re-deploying.

## Frontend design

### Routing

- `/booking` → **new meeting-type picker** (`BookingLanding`): three cards
  (Networking, Consultation, Strategy Deep-Dive), each showing title, duration,
  and a one-line description. Selecting a card navigates to `/booking/:type`.
- `/booking/:type` (`type` ∈ `networking | consultation | strategy`) → renders
  `BookingFlow` with that type's config. An unknown/invalid `:type` redirects
  back to `/booking`.
- `/hire` → unchanged (recruiter), still not in the public picker.
- `BookingContext.open()` stays `navigate('/booking')` — every existing CTA now
  lands on the picker. No CTA call sites change.
- `FloatingCTA` active-page check widens from `pathname === '/booking'` to
  `pathname.startsWith('/booking')` so it hides itself on the picker and all
  type flows.

### Config consolidation (`src/config/booking.js`)

Introduce a single ordered structure describing each client-facing kind:

```js
export const MEETING_KINDS = {
  networking:   { key, apiType:'networking',   title, durationMinutes:20,
                  tagline, description, meetingTypes:[…], meetingIcons:{…},
                  whatToExpect:[…], fields:[…], pickerBlurb, inPicker:true },
  consultation: { … durationMinutes:30 … inPicker:true },
  strategy:     { … durationMinutes:60 … inPicker:true },
  recruiter:    { … durationMinutes:30 … inPicker:false },
}
export const PICKER_KINDS = ['networking','consultation','strategy']
```

- Existing `SESSION` / `MEETING_TYPES` / `CONSULTATION_FIELDS` / recruiter
  exports are re-expressed as entries in `MEETING_KINDS`. Keep thin backwards-
  compatible aliases if any other module imports the old names (grep first;
  only `BookingPage.jsx`, `RecruiterBookingPage.jsx` are expected).
- Component mapping:
  - **New `src/pages/BookingLanding.jsx`** — the picker at `/booking`. Maps over
    `PICKER_KINDS`, renders a card per kind, navigates to `/booking/:type`.
  - **`src/pages/BookingPage.jsx`** — handles `/booking/:type`: reads the
    `:type` route param, looks up `MEETING_KINDS[type]` (invalid → redirect to
    `/booking`), builds the `config` shape `BookingFlow` already expects, and
    renders it.
  - **`src/pages/RecruiterBookingPage.jsx`** — reads `MEETING_KINDS.recruiter`
    (otherwise unchanged, still routed at `/hire`).

### Form fields per type

- `networking`: lighter — first name, last name, email, phone, meeting type,
  and one textarea "What would you like to connect about?" (no
  organization/materials required).
- `consultation`: unchanged from today's `CONSULTATION_FIELDS`.
- `strategy`: same as consultation (organization + project overview + optional
  materials), wording geared to an in-depth working session.
- `recruiter`: unchanged.

The Apps Script already accepts a superset of fields and only *requires* the
ones relevant to the booking type, so lighter forms need matching relaxations
in `doPost` validation (see below).

## Availability engine (`apps-script/Code.gs`)

### Per-type settings

Extend each `CONFIG.TYPES[k]` with: `slotMinutes`, `startHour`, `endHour`,
`workDays` (array; defaults to global `WORK_DAYS`), `maxPerDay` (number or
null), `bufferMinutes` (defaults to global `BUFFER_MINUTES`). Global
`SLOT_MINUTES`, `WORK_DAYS`, `BUFFER_MINUTES` remain as fallbacks.
`MIN_NOTICE_HOURS` (48) and `MAX_DAYS_AHEAD` (60) stay global.

### `getAvailableSlots(type)` changes

1. Resolve `tc = typeConfig(type)`; read `slotMinutes`, `startHour`, `endHour`,
   `workDays`, `bufferMinutes`, `maxPerDay` from it (with global fallbacks).
2. Step and slot length both use `tc.slotMinutes` (not the global).
3. Day filter uses `tc.workDays`.
4. Buffer padding uses `tc.bufferMinutes`.
5. **Per-day cap:** before generating a day's slots, count existing bookings of
   *this* type on that day (calendar events tagged `deemBooking=true` and
   `bookingType=type`). If the count ≥ `tc.maxPerDay`, skip the whole day.
6. Notice/window checks unchanged (global).

### `doPost` (book) changes

- Accept the new `type` values (`networking`, `strategy`) in addition to
  `consultation`/`recruiter`; unknown types fall back to `consultation`.
- Compute `end = start + tc.slotMinutes*60000` (per-type duration).
- Re-run the availability check for the type (already does) **and** re-check the
  per-day cap at write time (guards a race between two concurrent bookings).
- Relax required-field validation per type: networking requires
  first/last/email/phone/meetingType + the connect-about note, but **not**
  organization; consultation/strategy keep organization + overview; recruiter
  keeps roleTitle. Drive this from a small per-type "required fields" list so
  validation stays declarative.
- Tag the event with `bookingType`, `meetingType`, `clientEmail`,
  `clientFirstName` as today, plus `zoomUrl` when a Zoom meeting is created.

## Zoom integration (unique link per booking)

### Mechanism

A new helper `createZoomMeeting(topic, startDate, durationMin)`:

1. **Auth (Server-to-Server OAuth):** `POST https://zoom.us/oauth/token?grant_type=account_credentials&account_id=<ZOOM_ACCOUNT_ID>`
   with header `Authorization: Basic base64(ZOOM_CLIENT_ID:ZOOM_CLIENT_SECRET)`.
   Cache the returned `access_token` in `CacheService` for ~50 min.
2. **Create meeting:** `POST https://api.zoom.us/v2/users/me/meetings` with
   `{ topic, type:2 (scheduled), start_time (ISO), duration, timezone:'America/New_York',
   settings:{ join_before_host:true, waiting_room:false } }`.
   Returns `join_url` (and `password`). Return `{ joinUrl, password }`.

### Wiring

- Only for bookings where `meetingType === 'zoom'`.
- Credentials live in **Script Properties**: `ZOOM_ACCOUNT_ID`,
  `ZOOM_CLIENT_ID`, `ZOOM_CLIENT_SECRET`. If any are missing, `createZoomMeeting`
  returns null and the flow falls back to today's behavior (event location
  "Zoom (link to follow by email)" and the "Michael will email you the link"
  email line). This mirrors the existing fail-open patterns (Turnstile, Supabase).
- When a link is created:
  - Event `location` = the `join_url`; append the join URL (and passcode) to the
    event description.
  - Store `event.setTag('zoomUrl', joinUrl)` so `sendReminders` can include the
    same link without re-creating a meeting.
  - Confirmation + reminder emails render a **"Join Zoom"** button linking to
    `join_url`, replacing the generic `zoomLine` when a link exists.
  - The `.ics` `LOCATION` and calendar-provider "add event" links use `join_url`.
- Zoom meeting creation failure (network/API) is non-fatal: log it, fall back to
  the email-the-link wording, still create the calendar event and confirmations.
  A booking must never fail because Zoom is down.

### One-time setup (documented in BOOKING_SETUP.md)

User creates a free **Server-to-Server OAuth** app at
`marketplace.zoom.us` (scopes: `meeting:write:meeting`,
`meeting:write:meeting:admin` as required), copies Account ID / Client ID /
Client Secret into the three Script Properties, and re-deploys. Until then, Zoom
bookings use the fallback wording — nothing breaks.

## Emails (`Code.gs`)

- Extend `TPL_DEFAULTS` with `networking` and `strategy` template blocks
  (confirmation + day-before + day-of), mirroring the existing `recruiter`
  block. Keep in sync with `src/data/defaults.js` → `emailsDefaults` and the
  admin "Booking Emails" editor if those enumerate types.
- `sendClientEmail` selects the template block by `bookingType`.
- The "Duration" row uses the **booked event's actual length** (from `tc.slotMinutes`
  / event end−start) instead of the global `CONFIG.SLOT_MINUTES`.
- When `zoomUrl` is present, render the "Join Zoom" button and use the real link
  in the calendar buttons + `.ics`; otherwise unchanged wording.

## Out of scope (YAGNI / later)

- Per-type min-notice and booking-window (stay global; easy to split later).
- Teaching the AI chatbot about the new meeting types (it still links `/booking`,
  which now lands on the picker — functional).
- Granola post-meeting follow-up automation — separate spec.
- Changing `appointment-email-automation.gs`.

## Testing / acceptance

- `npm run build` passes; `npm run lint` clean.
- `/booking` shows three cards; each routes to a working flow with the correct
  duration and day/time windows; invalid `/booking/:type` redirects to `/booking`.
- Networking slots only appear 3–5 PM Mon–Fri and cap at 2/day; strategy only
  Mon/Wed/Fri 11–2 and caps at 1/day; consultation unchanged.
- Booking each type creates a calendar event of the correct length; the slot and
  its buffer disappear from availability; the correct type-specific emails send.
- With Zoom creds set, a Zoom booking produces a unique `join_url` in the event,
  confirmation email button, and `.ics`; reminders reuse the same link. With
  creds unset, the fallback wording is used and booking still succeeds.
- Existing `/hire` recruiter flow and all site "Book" CTAs still work.

## Setup steps for the user (post-implementation)

1. Paste the updated `Code.gs` into the "Deem Creative Booking" Apps Script
   project; **Deploy → Manage deployments → Edit → New version**. URL unchanged.
2. (Optional but desired) Create the Zoom Server-to-Server OAuth app and set the
   three Script Properties, then re-deploy.
3. `npm run deploy` for the site.
