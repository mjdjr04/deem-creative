# Connecting the Booking Page to Your Google Calendar

The **/booking** page shows your real availability and books directly onto your
Google Calendar — no iframe, no third-party service, no monthly fee. Clients pick
**Zoom or in person**, get an instant confirmation email, and automatic reminders
the **day before** and the **day of**.

It runs through a small **Google Apps Script** that executes as you (the code is in
`apps-script/Code.gs`). Setup takes about 5 minutes.

## What's already configured for you

In `apps-script/Code.gs`, the `CONFIG` block at the top is set to:

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

## 1. Create the script

1. Go to **[script.new](https://script.new)** while signed into the Google account
   that owns your calendar and `michael@deemcreative.com`.
2. Name the project (top left) — e.g. `Deem Creative Booking`.
3. Delete the placeholder code and paste in the entire contents of
   `apps-script/Code.gs`.

## 2. Set your time zone

Click **⚙ Project Settings** (left sidebar) → **Time zone** → set it to
**`America/New_York`**. (This makes the 11–3 window and the 8 AM reminders run in
Eastern Time, and it follows daylight saving automatically.)

## 3. Deploy as a Web App

1. Click **Deploy** (top right) → **New deployment**.
2. Click the gear next to "Select type" → **Web app**.
3. Set:
   - **Execute as:** `Me`
   - **Who has access:** `Anyone`  ← required so site visitors can load availability
4. Click **Deploy**, then **Authorize access** and approve the permissions. It will
   ask for calendar access and permission to send email as you (for confirmations
   and reminders). It warns the app isn't verified — click
   *Advanced → Go to … (unsafe)*; that's normal for your own scripts.
5. Copy the **Web app URL** (it ends in `/exec`).

> "Who has access: Anyone" only exposes what the script returns — open time slots
> and a booking endpoint. Nobody can see your event details or anything else on
> your calendar.

## 4. Turn on the daily reminder job

Back in the editor, choose **`createDailyTrigger`** from the function dropdown
(top toolbar) and click **▷ Run** once. This schedules the day-before / day-of
reminder emails to go out automatically at 8 AM. (You only do this once; re-running
it won't create duplicates.)

## 5. Connect the website

1. Open `src/config/booking.js` and paste your URL:
   ```js
   export const BOOKING_API_URL = 'https://script.google.com/macros/s/XXXX/exec'
   ```
2. Deploy the site:
   ```sh
   npm run deploy
   ```

> The `/booking` page now shows a **meeting-type picker** (Networking,
> Consultation, Strategy Deep-Dive). Each routes to `/booking/<type>`. The
> recruiter flow stays at `/hire` and is not shown in the picker.

## 6. Test it

Visit `deemcreative.com/#/booking`, pick a slot, and book it with a second email
address. You should see:

- The event appears on your Google Calendar with the client's name, phone,
  organization, project overview, and any materials
- The client receives a confirmation email (and a calendar invite)
- You receive a "New booking" email with all their details
- That slot — plus the 30 minutes on either side — disappears from the page

To test reminders without waiting, run the **`sendReminders`** function manually
from the editor; it emails anyone booked for today/tomorrow who hasn't been
reminded yet.

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

## 7. Changing settings later

Edit `CONFIG` in `Code.gs` (hours, buffer, 48-hour notice, 60-day window, reminder
time, etc.), then **Deploy → Manage deployments → ✏️ Edit → Version: New version →
Deploy**. The URL stays the same, so the website needs no changes.

## Until it's connected

If `BOOKING_API_URL` is empty (or the script is unreachable), the booking page
automatically falls back to a button linking to your existing Google Calendar
appointment page — so the site is never broken.
