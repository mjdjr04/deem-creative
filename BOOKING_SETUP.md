# Connecting the Booking Page to Your Google Calendar

The **/booking** page shows your real availability and books directly onto your
Google Calendar — no iframe, no third-party service, no monthly fee. Clients pick
**Zoom or in person**, get an instant confirmation email, and automatic reminders
the **day before** and the **day of**.

It runs through a small **Google Apps Script** that executes as you (the code is in
`apps-script/Code.gs`). Setup takes about 5 minutes.

## What's already configured for you

In `apps-script/Code.gs`, the `CONFIG` block at the top is set to:

| Setting | Value |
|---|---|
| Hours | 11:00 AM – 3:00 PM |
| Days | Monday – Friday |
| Slot length | 30 minutes |
| Booking window | up to **60 days** ahead |
| Minimum notice | **48 hours** |
| Buffer between meetings | **30 minutes** |
| Reminder send time | 8:00 AM ET, day before + day of |

Change any of these later by editing `CONFIG` and re-deploying (step 7).

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

## 7. Changing settings later

Edit `CONFIG` in `Code.gs` (hours, buffer, 48-hour notice, 60-day window, reminder
time, etc.), then **Deploy → Manage deployments → ✏️ Edit → Version: New version →
Deploy**. The URL stays the same, so the website needs no changes.

## Until it's connected

If `BOOKING_API_URL` is empty (or the script is unreachable), the booking page
automatically falls back to a button linking to your existing Google Calendar
appointment page — so the site is never broken.
