# Granola Post-Meeting Follow-up — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax. NOTE: Tasks 2, 4, and 5 are **interactive/environment tasks** (scheduled-routine creation, live dry run) that must run in the main session, not be delegated to a code subagent.

**Goal:** Auto-send a follow-up email ~1 hour after each site-booked meeting — personalized from the Granola transcript when one exists, a warm general thank-you when it doesn't.

**Architecture:** A scheduled Claude routine orchestrates; two secret-guarded Apps Script endpoints do the calendar lookup and the actual send (as Michael). The booking supplies the recipient + timing; Granola supplies the content. See `docs/superpowers/specs/2026-07-26-granola-followup-design.md`.

**Tech Stack:** Google Apps Script (`apps-script/Code.gs`); a scheduled Claude routine (cron via the `schedule` skill) using the Granola MCP + Bash/curl; email sent via `MailApp` from `michael@deemcreative.com`.

## Global Constraints

- **No automated test harness.** Gates: `cp apps-script/Code.gs "$TMPDIR/c.js" && node --check "$TMPDIR/c.js"` (exit 0) for the script; an interactive dry run for the routine. Do not add a test framework.
- **The follow-up endpoints fail CLOSED** on a missing or wrong secret (they send email) — unlike the Turnstile check which fails open. If `FOLLOWUP_SECRET` is unset in Script Properties, the endpoints deny.
- **`sendFollowup` sends ONLY to the event's own `clientEmail` tag**, never to a recipient supplied in the request payload — the endpoint must not be an open email relay.
- **Idempotent via a `followupSent` event tag**, distinct from the existing `remSentBefore` / `remSentOf` / `thankYouSent` tags. Exactly one follow-up per booking.
- **Scope:** only events tagged `deemBooking='true'` with a `clientEmail` tag, that ENDED ≥60 min ago and within the last ~2 days.
- **Never fabricate** personalized content — reference only what is literally in the Granola transcript/summary. Ambiguous/no match → general thank-you. Zoom meeting whose transcript isn't ready → DEFER (don't send) until ≥~2.5 h past end, then general.
- Sends as `michael@deemcreative.com`; timezone `America/New_York`.
- Do NOT modify `appointment-email-automation.gs` or the existing booking/reminder logic.

---

## File Structure

- `apps-script/Code.gs` — **modified.** Add `followupSecretOk`, `handlePendingFollowups`, `handleSendFollowup`, `buildFollowupHtml`, and two `doPost` dispatch branches.
- `automation/granola-followup-routine.md` — **created.** The exact operating instructions the scheduled routine follows each run (source of truth + the prompt handed to the scheduler).
- `BOOKING_SETUP.md` — **modified.** Add a "Post-meeting follow-ups" setup section (`FOLLOWUP_SECRET`, redeploy, how to pause/monitor).

---

## Task 1: Apps Script follow-up endpoints

**Files:**
- Modify: `apps-script/Code.gs`

**Interfaces:**
- Produces two POST actions on the existing web app:
  - `pendingFollowups` — request `{action:'pendingFollowups', secret}` → `{ok:true, meetings:[{eventId, firstName, email, bookingType, meetingType, startIso, endIso, title}]}`.
  - `sendFollowup` — request `{action:'sendFollowup', secret, eventId, subject, body}` → `{ok:true}` (or `{ok:true, alreadySent:true}`). Sends to the event's `clientEmail` tag; sets `followupSent`.
- Consumes: Script Property `FOLLOWUP_SECRET`.

- [ ] **Step 1: Add the secret check + endpoints + HTML wrapper**

In `apps-script/Code.gs`, add these functions immediately AFTER the `verifyTurnstile` function (search for `function verifyTurnstile`, insert after its closing brace):

```js
// ─── Post-meeting follow-ups ────────────────────────────────────────────────

/** Follow-up endpoints send email, so they FAIL CLOSED: no secret set, or a
 *  mismatch, means deny. The secret lives in Script Property FOLLOWUP_SECRET
 *  and is shared only with the scheduled routine that calls these endpoints. */
function followupSecretOk(secret) {
  var want = PropertiesService.getScriptProperties().getProperty('FOLLOWUP_SECRET');
  return !!want && String(secret || '') === want;
}

/** List site-booked meetings that ended >=60 min ago (within the last ~2 days)
 *  and have not been followed up yet. The routine matches each to a Granola note. */
function handlePendingFollowups(f) {
  if (!followupSecretOk(f.secret)) return jsonResponse({ ok: false, error: 'unauthorized' });
  var now = new Date();
  var endedBefore = now.getTime() - 60 * 60000;             // must have ended >= 60 min ago
  var lookbackStart = new Date(now.getTime() - 2 * 24 * 60 * 60000);
  var cal = CalendarApp.getDefaultCalendar();
  var out = [];
  cal.getEvents(lookbackStart, now).forEach(function (ev) {
    if (ev.getTag('deemBooking') !== 'true') return;
    if (ev.getTag('followupSent') === 'true') return;
    if (ev.getEndTime().getTime() > endedBefore) return;    // not yet 60 min past end
    var email = ev.getTag('clientEmail');
    if (!email) return;
    out.push({
      eventId: ev.getId(),
      firstName: ev.getTag('clientFirstName') || 'there',
      email: email,
      bookingType: ev.getTag('bookingType') || 'consultation',
      meetingType: ev.getTag('meetingType') || '',
      startIso: ev.getStartTime().toISOString(),
      endIso: ev.getEndTime().toISOString(),
      title: ev.getTitle(),
    });
  });
  return jsonResponse({ ok: true, meetings: out });
}

/** Send one follow-up. Recipient is the EVENT'S OWN clientEmail tag (never a
 *  payload-supplied address). Idempotent via the followupSent tag. */
function handleSendFollowup(f) {
  if (!followupSecretOk(f.secret)) return jsonResponse({ ok: false, error: 'unauthorized' });
  var eventId = clean(f.eventId, 300);
  var subject = clean(f.subject, 300);
  var body = clean(f.body, 8000);
  if (!eventId || !subject || !body) return jsonResponse({ ok: false, error: 'Missing fields.' });

  var cal = CalendarApp.getDefaultCalendar();
  var ev = null;
  try { ev = cal.getEventById(eventId); } catch (e) { ev = null; }
  if (!ev) return jsonResponse({ ok: false, error: 'Event not found.' });
  if (ev.getTag('deemBooking') !== 'true') return jsonResponse({ ok: false, error: 'Not a booking.' });
  if (ev.getTag('followupSent') === 'true') return jsonResponse({ ok: true, alreadySent: true });

  var to = ev.getTag('clientEmail');
  if (!to || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(to)) {
    return jsonResponse({ ok: false, error: 'No valid recipient on event.' });
  }

  MailApp.sendEmail({
    to: to,
    subject: subject,
    htmlBody: buildFollowupHtml(body),
    body: body,
    name: CONFIG.BUSINESS_NAME,
    replyTo: CONFIG.OWNER_EMAIL,
  });
  ev.setTag('followupSent', 'true');
  return jsonResponse({ ok: true });
}

/** Wrap the routine-composed plain-text body in the branded email shell.
 *  The body already contains greeting + sign-off; this only escapes + nl2br. */
function buildFollowupHtml(body) {
  return '<div style="font-family:Arial,Helvetica,sans-serif;max-width:560px;margin:0 auto;' +
    'color:#1a2e4a;line-height:1.55;font-size:14px">' +
    escapeHtml(body).replace(/\n/g, '<br>') +
  '</div>';
}
```

- [ ] **Step 2: Wire the two actions into `doPost`**

In `doPost`, find the existing action dispatch (the block with `if (f.action === 'reply')`, `'chat'`, `'feedDescribe'`, `'verifyTurnstile'`). Add these two lines alongside them (before the `if (f.action !== 'book')` guard):

```js
    if (f.action === 'pendingFollowups') {
      return handlePendingFollowups(f);
    }
    if (f.action === 'sendFollowup') {
      return handleSendFollowup(f);
    }
```

- [ ] **Step 3: Syntax-check**

Run: `cp apps-script/Code.gs "$TMPDIR/c.js" && node --check "$TMPDIR/c.js"`
Expected: exit 0, no output. Confirm `followupSecretOk`, `handlePendingFollowups`, `handleSendFollowup`, `buildFollowupHtml` are each defined exactly once, and the two new `doPost` branches exist.

- [ ] **Step 4: Commit**

```bash
git add apps-script/Code.gs
git commit -m "Add secret-guarded pendingFollowups + sendFollowup endpoints"
```

---

## Task 2: Granola-in-cron feasibility spike (INTERACTIVE — run in session)

**Goal:** Prove a scheduled routine can reach the Granola MCP before we build the routine around it. If it can't, adopt the contingency (general thank-yous automatic; personalized on-demand).

**Files:** none (records a findings note).

- [ ] **Step 1: Register a one-off probe routine**

Use the `schedule` skill (or the `CronCreate` deferred tool) to create a ONE-OFF scheduled run ~3 minutes out, with this prompt:

```
Probe: call the Granola MCP tool mcp__claude_ai_Granola__get_account_info and then
mcp__claude_ai_Granola__list_meetings (time_range last_30_days). Write the result
(account email + how many meetings returned, or the exact error) to
automation/granola-probe-result.txt in the repo. Do nothing else.
```

- [ ] **Step 2: Inspect the outcome**

After it runs, read `automation/granola-probe-result.txt` (or the routine's task output).

- Expected PASS: account email + a meeting count returned.
- Expected FAIL: an error like "tool not available" / auth / MCP-absent.

- [ ] **Step 3: Record the decision**

Append one line to the plan's progress ledger (or `automation/granola-probe-result.txt`):
- PASS → proceed with Tasks 3–6 as written (full auto path).
- FAIL → adopt contingency: Task 3's routine still runs but only for the GENERAL thank-you (skip all Granola calls), and personalized follow-ups become an on-demand action Michael triggers in an interactive session. Note this in Task 3.

Delete the probe routine after (it was one-off; confirm it won't re-fire).

---

## Task 3: Routine definition doc

**Files:**
- Create: `automation/granola-followup-routine.md`

**Interfaces:**
- Consumes: the Task 1 endpoints (`pendingFollowups`, `sendFollowup`), the deployed web-app `/exec` URL (same base as `BOOKING_API_URL`), and `FOLLOWUP_SECRET`.

- [ ] **Step 1: Write the routine instructions**

Create `automation/granola-followup-routine.md` with EXACTLY this content (this doubles as the scheduler prompt in Task 5):

```markdown
# Granola post-meeting follow-up — routine instructions

You run on a schedule. Do exactly this each run, then stop. Never invent facts.

## Config
- EXEC_URL: <paste the deployed Apps Script /exec URL — same base as BOOKING_API_URL>
- SECRET: <paste FOLLOWUP_SECRET — must match the Apps Script Script Property>

## Steps
1. POST to EXEC_URL with JSON `{"action":"pendingFollowups","secret":"<SECRET>"}`
   (use: `curl -s -L -X POST "<EXEC_URL>" -H 'Content-Type: application/json' -d '<json>'`).
   Parse `meetings[]`. If empty, stop.

2. For each meeting `m`:
   a. Find its Granola note: call `list_meetings` with a `custom` range covering
      `m.startIso`'s calendar day (custom_start = that day 00:00, custom_end = next
      day 00:00). Pick the Granola meeting whose start is within ±30 min of
      `m.startIso`. Strong confirmation if its title contains `m.firstName` (booked
      events and Granola notes share the same title).
      - If TWO or more Granola meetings fall in the window (ambiguous) → treat as
        NO match (use the general email in step d).
   b. If a single note matched: `get_meetings([id])` for the AI summary, and
      `get_meeting_transcript(id)` for specifics.
   c. DEFERRAL: if `m.meetingType === "zoom"` AND no note matched AND it is LESS
      than 2.5 hours after `m.endIso` → SKIP this meeting this run (do not send;
      it will reappear next run). For phone/in-person, or once ≥2.5 h past end,
      proceed to the general email.
   d. Compose the email body (plain text, greeting to `m.firstName`, sign-off
      block: "Michael Deem Jr." / "michael@deemcreative.com" / "(929) 831-7254"):
      - MATCHED → thank them for the meeting, reference 1–2 concrete things
        ACTUALLY in the transcript/summary, then next steps / action items.
        Reference nothing that isn't literally in the notes.
      - NOT MATCHED → warm general thank-you for their time today; invite them to
        reach out with anything that comes up.
      Subject: matched → "Great connecting today, <firstName>"; general →
      "Thank you for your time today, <firstName>".
   e. POST to EXEC_URL `{"action":"sendFollowup","secret":"<SECRET>","eventId":
      "<m.eventId>","subject":"<subject>","body":"<body>"}`. Confirm `ok:true`.

3. Report a one-line summary: how many sent (personalized vs general) and how
   many deferred.

## Safety
- Never send twice — the endpoint tags the event, but also don't re-POST on ok.
- Never quote a meeting you're not confident is THIS booking (ambiguous → general).
- Never fabricate details, numbers, names, or commitments.
```

> If Task 2 was FAIL (contingency): also add a line at the top — "Granola is not
> available on schedule; skip steps 2a–2c and always send the general email" —
> and keep the personalized path for interactive on-demand use only.

- [ ] **Step 2: Commit**

```bash
git add automation/granola-followup-routine.md
git commit -m "Add Granola follow-up routine definition"
```

---

## Task 4: End-to-end dry run (INTERACTIVE — run in session)

**Goal:** Prove the whole chain works on a real (test) booking before scheduling anything. Requires the Task 1 endpoints DEPLOYED and `FOLLOWUP_SECRET` set (coordinate with the user — see Task 6 setup).

**Files:** none.

- [ ] **Step 1: Create a test "just-ended" booking**

Ask the user to book a test meeting via the site (or manually create a calendar event tagged like a booking) whose end time is ~61+ minutes ago, using a test recipient email the user controls. Confirm it carries `deemBooking`, `clientEmail`, `clientFirstName`, `bookingType`, `meetingType` tags.

- [ ] **Step 2: Run the routine logic once, by hand, in this session**

Follow `automation/granola-followup-routine.md` manually: `curl` `pendingFollowups`; confirm the test booking appears. Match Granola (or confirm no match). Compose. `curl` `sendFollowup`.

- [ ] **Step 3: Verify**

- The test recipient received the correct email (personalized if a Granola note exists for it; general otherwise).
- A second `curl` of `sendFollowup` for the same `eventId` returns `{ok:true, alreadySent:true}` and does NOT send again (idempotency).
- `pendingFollowups` no longer lists that event (now tagged).
- If testing a Zoom meeting with no note < 2.5 h old: confirm the routine logic SKIPS it (deferral), and that it would send general once past 2.5 h.
- A `curl` with a wrong `secret` returns `unauthorized` and sends nothing.

- [ ] **Step 4: Record results** in the progress ledger. Fix any issue in Task 1/3 and re-run before proceeding.

---

## Task 5: Register the scheduled routine (INTERACTIVE — run in session)

**Goal:** Put the verified routine on a recurring schedule.

**Files:** none (creates a cron routine on the user's account).

- [ ] **Step 1: Register the cron**

Using the `schedule` skill, register a recurring routine with the cadence: **every 60 minutes, 11:00–19:00 ET, Monday–Friday** (adjust to the user's confirmed hours). The routine prompt is the contents of `automation/granola-followup-routine.md` with `EXEC_URL` and `SECRET` filled in (the secret lives in the routine config on the user's account; note it is sensitive).

- [ ] **Step 2: Confirm registration**

List scheduled routines and confirm it appears with the right cadence. Note the routine ID in the ledger so it can be paused/edited later.

- [ ] **Step 3: Watch the first live cycle** during booking hours (or trigger one run) and confirm it either sends for a real ended meeting or reports "none pending" cleanly.

---

## Task 6: Setup + operations docs

**Files:**
- Modify: `BOOKING_SETUP.md`

- [ ] **Step 1: Add a "Post-meeting follow-ups" section**

Append to `BOOKING_SETUP.md`:

```markdown
## Post-meeting follow-up emails (automatic)

About an hour after each site-booked meeting, a scheduled assistant emails the
client a follow-up — personalized from the Granola notes if the meeting was
recorded, otherwise a general thank-you. It sends as you, so copies are in your
Sent folder.

**Setup:**
1. In the "Deem Creative Booking" Apps Script → ⚙ Project Settings → Script
   Properties, add `FOLLOWUP_SECRET` = a long random string.
2. Re-deploy (Deploy → Manage deployments → Edit → New version).
3. The scheduled routine on your Claude account holds the same secret and calls
   the booking web app to fetch pending meetings and send follow-ups.

**Controls:**
- It only ever sends ONE follow-up per meeting (tracked on the calendar event).
- To pause it, disable the scheduled routine on your Claude account.
- To change the wording/behavior, edit `automation/granola-followup-routine.md`
  and update the routine prompt.
- It only touches meetings booked through your site.
```

- [ ] **Step 2: Commit**

```bash
git add BOOKING_SETUP.md
git commit -m "Document post-meeting follow-up setup and controls"
```

---

## Self-review notes (author)

- **Spec coverage:** endpoints + secret (Task 1), feasibility risk (Task 2 + contingency in Task 3), routine orchestration/matching/deferral/guardrails (Task 3), verification/idempotency/auth (Task 4), scheduling (Task 5), setup+ops (Task 6). Out-of-scope items (reply handling, CRM, non-site meetings, admin-editable wording) untouched.
- **Type/name consistency:** `followupSent` is the single tag name (Task 1 sets it, Task 1 `pendingFollowups` filters it, Task 4 verifies it). `FOLLOWUP_SECRET` consistent across Task 1 (read), Task 3 (routine), Task 6 (setup). Endpoint action strings `pendingFollowups`/`sendFollowup` consistent between Code.gs dispatch and the routine doc. `eventId` from `event.getId()` round-trips through `getEventById`.
- **Fail-closed** on the secret is explicit and different from the fail-open Turnstile path — intentional because these endpoints send email.
- **Interactive tasks (2, 4, 5)** are flagged so they aren't handed to a code-only subagent.
