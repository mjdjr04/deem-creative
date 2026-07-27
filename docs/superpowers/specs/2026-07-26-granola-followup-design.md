# Granola post-meeting follow-up automation — Design

**Date:** 2026-07-26
**Status:** Approved (design); implementation plan to follow
**Scope:** Post-meeting follow-up emails for meetings booked through the site. Separate subsystem from the booking system (which shipped 2026-07-26).

## Problem

After a client meeting, we want an automatic follow-up email that thanks them
and — when the meeting was recorded in Granola — references what was actually
discussed plus next steps / action items. When there's no Granola recording
(phone/in-person, or not captured), send a warm general thank-you instead.
Fully automatic (no human review), roughly one hour after the meeting ends.

## Key constraints (decided during brainstorming)

- **Recipient comes from the booking, not Granola.** Granola does not reliably
  capture the other attendee's email (confirmed: recent notes list only
  `michael@deemcreative.com`). Site bookings DO store the client email on the
  calendar event. So: **the booking says who + when; Granola says what was said.**
- **Scope: site-booked meetings only** (`networking`, `consultation`,
  `strategy`, `recruiter`). Meetings not booked through the site are out of scope
  (no booking record → no recipient).
- **Auto-send in all cases** (~1 hour after the meeting ends):
  - Granola note found for that meeting → personalized follow-up.
  - No note found → general thank-you.
- **No BCC/copy** — it sends as Michael from `michael@deemcreative.com`, so it's
  already in his Sent folder.
- **Sends from `michael@deemcreative.com`** via the existing Apps Script (it runs
  as Michael). Gmail is not separately connected to Claude here.

## Feasibility risk — VERIFY FIRST

The orchestrator is a **scheduled Claude routine**, and Granola is an
interactively-authenticated (claude.ai-connected) MCP. Scheduled/headless runs
do not always retain access to such MCP servers. **The first implementation task
must confirm a scheduled routine can actually call the Granola MCP tools.**

Contingency if Granola is NOT reachable headless:
- The scheduled part still sends the **general thank-you** for every eligible
  meeting via pure Apps Script (no Granola needed) — so no client is missed.
- **Personalized** follow-ups become a **manual/on-demand** action Michael runs
  interactively ("draft/send personalized follow-ups for today"), where Granola
  auth is present. The same `sendFollowup` endpoint is reused.

This contingency reuses all the same components, so the risk affects only the
personalized path's automation, not the architecture.

## Architecture

Two cooperating pieces:

### 1. Apps Script endpoints (added to `apps-script/Code.gs`)

The Apps Script already owns the calendar, sends as Michael, and has the
Supabase/secret patterns. Add two endpoints, both authenticated by a shared
secret in Script Properties (`FOLLOWUP_SECRET`), so only the routine can call
them.

- **`pendingFollowups`** (POST `{action:'pendingFollowups', secret}`):
  Returns site-booked events that ENDED at least 60 minutes ago and within the
  last ~2 days, that are not yet tagged `followupSent`. For each: `eventId`
  (`event.getId()`), `firstName`, `email`, `bookingType`, `meetingType`,
  `startIso`, `endIso`, `title`. Only events tagged `deemBooking='true'` with a
  `clientEmail` tag qualify.

- **`sendFollowup`** (POST `{action:'sendFollowup', secret, eventId, subject, body}`):
  Looks up the event by `eventId`; verifies it is a `deemBooking` not already
  `followupSent`; sends an HTML email **to the event's own `clientEmail` tag**
  (NOT an arbitrary recipient in the payload — the endpoint is not an open
  relay); tags the event `followupSent='true'` (idempotent). Returns
  `{ok:true}`. `body` is treated as the email body (plain text → simple HTML,
  or pre-formatted HTML), escaped/sanitized as the existing email helpers do.

Both fail closed on a bad/missing secret. `sendFollowup` refuses if the event
is missing, not a deemBooking, already sent, or has no `clientEmail`.

### 2. Scheduled Claude routine (the orchestrator)

A cloud routine (created via the `schedule` skill) that runs on a short interval
during booking hours: roughly **every 45–60 minutes, 11:00 AM–7:00 PM ET,
Monday–Friday**. Each run:

1. `curl` the Apps Script `pendingFollowups` endpoint (with the secret) → list of
   meetings needing a follow-up.
2. For each meeting, find the matching Granola note:
   - `list_meetings` with a `custom` range covering that meeting's day.
   - Match a Granola meeting whose start time is within ±30 min of `startIso`
     (bonus confidence if its title contains the client's name — booked events
     and Granola notes share the same title, e.g. "Deem Creative Consultation —
     Jane Doe").
   - If matched, `get_meetings([id])` for the AI summary + attendees, and
     `get_meeting_transcript(id)` for specifics.
3. Compose the email:
   - **Matched** → personalized: thanks them, references 1–2 concrete points
     actually in the transcript/summary, lists next steps / action items.
   - **Not matched** → general thank-you.
4. `curl` `sendFollowup` with `eventId`, `subject`, `body`. The event gets tagged
   `followupSent`, so later polls skip it.

The routine needs only: Granola MCP tools + `Bash` (curl) to reach the Apps
Script. It does not touch the calendar directly.

## Timing details

- **"~1 hour after"** is achieved by polling, not per-meeting arming.
  `pendingFollowups` only returns meetings ended ≥60 min ago, so each meeting
  first appears ~1 hour after it ends and is handled that cycle.
- **Recorded-but-not-ready (Zoom):** if a meeting's `meetingType === 'zoom'` and
  no Granola note is found yet, DEFER — skip it this cycle (do not send) until it
  is **≥ ~2.5 hours** past `endIso`, then fall back to the general thank-you.
  This prevents a slow transcript from wrongly getting the generic version.
  Non-Zoom (`phone`, `in-person`) meetings are unlikely to be in Granola, so they
  send the general thank-you at the normal 1-hour mark.
  (Deferral is stateless: the routine computes it from `endIso`; because the
  event isn't tagged `followupSent` until something is actually sent, it
  naturally reappears on the next poll.)

## Auto-send guardrails (no human review)

- **Never fabricate.** Personalized content may reference ONLY what is literally
  in the transcript/summary — same rule as the existing
  `appointment-email-automation.gs` Gemini prompt. No invented projects,
  numbers, names, or commitments.
- **Ambiguous match → general.** If no single Granola meeting matches within the
  time window, or two meetings overlap the slot, use the general thank-you rather
  than risk quoting the wrong conversation.
- **Recipient is server-derived.** `sendFollowup` sends to the booking's own
  `clientEmail` tag, never to a recipient chosen by the routine — so a routing
  mistake can't email the wrong person.
- **Idempotent.** `followupSent` tag guarantees exactly one send per booking.

## No conflict with existing automations

- Site bookings today get: a booking confirmation + day-before/day-of reminders
  (from `Code.gs`). This adds a distinct **post-meeting** touchpoint.
- The separate `appointment-email-automation.gs` (Gemini thank-you) deliberately
  excludes site-booking titles, so it never touches these. Unchanged here.
- Follow-up uses its own `followupSent` tag, independent of `remSentBefore` /
  `remSentOf` / `thankYouSent`.

## Email content

**Personalized** (transcript matched): warm, professional, grammatically clean.
Structure: greeting by first name → thanks for the meeting → 1–2 sentences
referencing concrete points discussed (from transcript only) → next steps /
action items (bulleted or inline) → sign-off. Sign-off block: `Michael Deem Jr.`,
`michael@deemcreative.com`, `(929) 831-7254`.

**General** (no transcript): greeting → thanks for their time today → a light
"reach out if anything comes up / looking forward to next steps" → same sign-off.
Mirrors the tone of the existing `thankYouFallback` in
`appointment-email-automation.gs`.

Subject: personalized → `Great connecting today, {firstName}` (or similar);
general → `Thank you for your time today, {firstName}`.

Lightly type-aware wording is fine (e.g. recruiter vs. consultation) but not
required for v1 — one flow serves all four types.

## Out of scope (YAGNI / later)

- Reply handling / threading, CRM logging beyond the Sent folder.
- Per-client or heavy per-type template customization.
- Follow-ups for non-site meetings.
- Editing follow-up wording from the site admin UI.
- Attachments or scheduling-the-next-meeting links.

## Testing / acceptance

- `node --check` clean on `Code.gs`; existing booking flows unaffected.
- `pendingFollowups` returns only ended, untagged site bookings with a client
  email; rejects a bad secret.
- `sendFollowup` sends to the event's `clientEmail`, tags `followupSent`, is
  idempotent (second call is a no-op), rejects bad secret / unknown event /
  already-sent.
- **Feasibility check:** a scheduled routine run can successfully call a Granola
  MCP tool (or the contingency path is adopted).
- End-to-end dry run: a recently-ended test booking with a Granola note →
  personalized email to the test client, event tagged. A test booking with NO
  note → general thank-you. A Zoom booking whose note isn't ready → deferred, not
  generic-sent, until the ~2.5h fallback.
- No double-sends across consecutive polls.

## Setup steps for the user (post-implementation)

1. Add `apps-script/Code.gs`'s new endpoints (redeploy the "Deem Creative
   Booking" project → new version) and set Script Property `FOLLOWUP_SECRET` to a
   long random string.
2. Approve creation of the scheduled routine (runs on the Claude account); it
   holds the same secret to call the endpoints.
3. Confirm the feasibility check passed (Granola reachable on schedule) or accept
   the contingency (general thank-yous automatic; personalized on-demand).
