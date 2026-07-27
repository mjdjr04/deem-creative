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
