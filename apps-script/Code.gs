/**
 * Deem Creative — Booking API (Google Apps Script)
 * ────────────────────────────────────────────────────────────────────────────
 * Connects deemcreative.com/#/booking directly to your Google Calendar.
 *
 * • Shows only times you're actually free (checks your PRIMARY calendar)
 * • Books straight onto your calendar + sends the client a calendar invite
 * • Client chooses Zoom or in-person; no Google Meet link is created
 * • Sends an instant confirmation email + reminders the day before and day of
 *
 * Hours, buffer, and booking-window limits are all in CONFIG below.
 * Setup walkthrough: see BOOKING_SETUP.md in the website repo.
 * ────────────────────────────────────────────────────────────────────────────
 */

var CONFIG = {
  BUSINESS_NAME: 'Deem Creative',
  HOST_NAME: 'Michael Deem Jr.',

  // Confirmation + reminder emails are sent from / reply to this address.
  // (Emails actually send from whichever Google account runs this script —
  //  set the script up on the account that owns michael@deemcreative.com.)
  OWNER_EMAIL: 'michael@deemcreative.com',

  SLOT_MINUTES: 30,        // length of each consultation

  // Bookable window, in THIS SCRIPT'S time zone (set it to America/New_York
  // under Project Settings ⚙ → Time zone). 11 = 11 AM, 15 = 3 PM.
  WORK_START_HOUR: 11,
  WORK_END_HOUR: 15,       // last slot ends by 3:00 PM → last start 2:30 PM
  WORK_DAYS: [1, 2, 3, 4, 5],   // Mon–Fri (0 = Sun … 6 = Sat)

  MAX_DAYS_AHEAD: 60,      // can't book more than 60 days out
  MIN_NOTICE_HOURS: 48,    // must book at least 48 hours ahead
  BUFFER_MINUTES: 30,      // required gap before/after any existing event

  REMINDER_HOUR: 8,        // daily reminder run, e.g. 8 = 8:00 AM ET
};

var MEETING_LABELS = { zoom: 'Zoom', 'in-person': 'In person' };

// ─── Web endpoints ──────────────────────────────────────────────────────────

function doGet(e) {
  var action = e && e.parameter ? e.parameter.action : '';
  if (action === 'availability') {
    return jsonResponse({
      ok: true,
      durationMinutes: CONFIG.SLOT_MINUTES,
      slots: getAvailableSlots(),
    });
  }
  return jsonResponse({ ok: false, error: 'Unknown action' });
}

function doPost(e) {
  try {
    var f = JSON.parse(e.postData.contents);
    if (f.action !== 'book') {
      return jsonResponse({ ok: false, error: 'Unknown action' });
    }

    // Trim + length-cap every field
    var firstName = clean(f.firstName, 100);
    var lastName = clean(f.lastName, 100);
    var email = clean(f.email, 200);
    var phone = clean(f.phone, 50);
    var organization = clean(f.organization, 200);
    var projectOverview = clean(f.projectOverview, 2000);
    var materials = clean(f.materials, 2000); // optional
    var meetingType = String(f.meetingType || '').trim();

    // Validate required fields (everything except `materials`)
    if (!firstName || !lastName || !phone || !organization || !projectOverview) {
      return jsonResponse({ ok: false, error: 'Please fill in all required fields.' });
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return jsonResponse({ ok: false, error: 'A valid email is required.' });
    }
    if (!MEETING_LABELS[meetingType]) {
      return jsonResponse({ ok: false, error: 'Please choose a meeting type.' });
    }

    var start = new Date(f.start);
    if (isNaN(start.getTime())) {
      return jsonResponse({ ok: false, error: 'Invalid start time.' });
    }

    // Re-check the slot is still free (guards against double-booking)
    if (getAvailableSlots().indexOf(start.toISOString()) === -1) {
      return jsonResponse({ ok: false, code: 'SLOT_TAKEN', error: 'That slot is no longer available.' });
    }

    var end = new Date(start.getTime() + CONFIG.SLOT_MINUTES * 60000);
    var fullName = firstName + ' ' + lastName;
    var typeLabel = MEETING_LABELS[meetingType];

    var location = meetingType === 'zoom'
      ? 'Zoom (link to follow by email)'
      : 'In person — South Jersey (location to be confirmed)';

    var description =
      'Booked via deemcreative.com\n\n' +
      'Name: ' + fullName + '\n' +
      'Email: ' + email + '\n' +
      'Phone: ' + phone + '\n' +
      'Organization: ' + organization + '\n' +
      'Meeting type: ' + typeLabel + '\n\n' +
      'Project overview:\n' + projectOverview +
      (materials ? '\n\nMaterials to review beforehand:\n' + materials : '');

    var cal = CalendarApp.getDefaultCalendar();
    var event = cal.createEvent(
      CONFIG.BUSINESS_NAME + ' Consultation — ' + fullName + ' (' + typeLabel + ')',
      start, end,
      { description: description, location: location, guests: email, sendInvites: true }
    );

    // Tags let the daily reminder job find this booking later
    event.setTag('deemBooking', 'true');
    event.setTag('clientEmail', email);
    event.setTag('clientFirstName', firstName);
    event.setTag('meetingType', meetingType);

    // Friendly confirmation to the client + a heads-up to you
    sendClientEmail('confirmation', {
      firstName: firstName, email: email,
      start: start, end: end, meetingType: meetingType,
    });
    sendOwnerEmail({
      fullName: fullName, email: email, phone: phone, organization: organization,
      projectOverview: projectOverview, materials: materials,
      meetingType: meetingType, start: start, end: end,
    });

    return jsonResponse({
      ok: true,
      start: start.toISOString(),
      end: end.toISOString(),
      meetingType: meetingType,
    });
  } catch (err) {
    return jsonResponse({ ok: false, error: 'Booking failed: ' + err });
  }
}

// ─── Availability ───────────────────────────────────────────────────────────

/** Open slot start times (ISO strings), honoring hours, notice, window & buffer. */
function getAvailableSlots() {
  var now = new Date();
  var minStartMs = now.getTime() + CONFIG.MIN_NOTICE_HOURS * 3600000;
  var horizonMs = now.getTime() + CONFIG.MAX_DAYS_AHEAD * 86400000;

  var cal = CalendarApp.getDefaultCalendar();

  // Pad every real event by the buffer on both sides so bookings can't sit
  // within BUFFER_MINUTES of an existing commitment. All-day events ignored.
  var pad = CONFIG.BUFFER_MINUTES * 60000;
  var busy = cal.getEvents(now, new Date(horizonMs + 86400000))
    .filter(function (ev) { return !ev.isAllDayEvent(); })
    .map(function (ev) {
      return [ev.getStartTime().getTime() - pad, ev.getEndTime().getTime() + pad];
    });

  var slots = [];
  var day = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  while (day.getTime() <= horizonMs) {
    if (CONFIG.WORK_DAYS.indexOf(day.getDay()) !== -1) {
      for (
        var mins = CONFIG.WORK_START_HOUR * 60;
        mins + CONFIG.SLOT_MINUTES <= CONFIG.WORK_END_HOUR * 60;
        mins += CONFIG.SLOT_MINUTES
      ) {
        var slotStart = new Date(day.getFullYear(), day.getMonth(), day.getDate(), 0, mins);
        var s = slotStart.getTime();
        var eMs = s + CONFIG.SLOT_MINUTES * 60000;

        if (s < minStartMs || s > horizonMs) continue;

        var blocked = busy.some(function (b) { return s < b[1] && eMs > b[0]; });
        if (!blocked) slots.push(slotStart.toISOString());
      }
    }
    day.setDate(day.getDate() + 1);
  }
  return slots;
}

// ─── Reminders (daily time-driven trigger) ──────────────────────────────────

/**
 * Run once from the editor (▷ Run) to schedule the daily reminder check.
 * Re-run any time; it won't create duplicate triggers.
 */
function createDailyTrigger() {
  ScriptApp.getProjectTriggers().forEach(function (t) {
    if (t.getHandlerFunction() === 'sendReminders') ScriptApp.deleteTrigger(t);
  });
  ScriptApp.newTrigger('sendReminders')
    .timeBased().everyDays(1).atHour(CONFIG.REMINDER_HOUR).create();
}

/** Fired daily: emails day-before reminders for tomorrow and day-of for today. */
function sendReminders() {
  remindForDay(1, 'reminder-day-before', 'remSentBefore');
  remindForDay(0, 'reminder-day-of', 'remSentOf');
}

function remindForDay(dayOffset, kind, sentTag) {
  var cal = CalendarApp.getDefaultCalendar();
  var d = new Date();
  d.setDate(d.getDate() + dayOffset);
  var dayStart = new Date(d.getFullYear(), d.getMonth(), d.getDate(), 0, 0, 0);
  var dayEnd = new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59);

  cal.getEvents(dayStart, dayEnd).forEach(function (ev) {
    if (ev.getTag('deemBooking') !== 'true') return;
    if (ev.getTag(sentTag) === 'true') return;     // already reminded
    sendClientEmail(kind, {
      firstName: ev.getTag('clientFirstName') || 'there',
      email: ev.getTag('clientEmail'),
      start: ev.getStartTime(),
      end: ev.getEndTime(),
      meetingType: ev.getTag('meetingType') || 'zoom',
    });
    ev.setTag(sentTag, 'true');
  });
}

// ─── Emails ─────────────────────────────────────────────────────────────────

function meetingLine(meetingType) {
  return meetingType === 'zoom'
    ? CONFIG.HOST_NAME + ' will email you the Zoom link before your meeting.'
    : CONFIG.HOST_NAME + ' will confirm the exact location with you (South Jersey area) before your meeting.';
}

function sendClientEmail(kind, d) {
  if (!d.email) return;
  var when = formatRange(d.start, d.end);
  var typeLabel = MEETING_LABELS[d.meetingType] || 'Meeting';

  var heading, intro;
  if (kind === 'confirmation') {
    heading = "You're booked!";
    intro = 'Thanks for scheduling a consultation with ' + CONFIG.BUSINESS_NAME + '. Here are the details:';
  } else if (kind === 'reminder-day-before') {
    heading = 'See you tomorrow';
    intro = 'A friendly reminder that your consultation with ' + CONFIG.BUSINESS_NAME + ' is tomorrow:';
  } else {
    heading = 'See you today';
    intro = 'A friendly reminder that your consultation with ' + CONFIG.BUSINESS_NAME + ' is today:';
  }

  var subjectMap = {
    'confirmation': "You're booked — " + CONFIG.BUSINESS_NAME + ' Consultation',
    'reminder-day-before': 'Reminder: your ' + CONFIG.BUSINESS_NAME + ' consultation is tomorrow',
    'reminder-day-of': 'Reminder: your ' + CONFIG.BUSINESS_NAME + ' consultation is today',
  };

  var html =
    '<div style="font-family:Arial,Helvetica,sans-serif;max-width:560px;margin:0 auto;color:#1a2e4a">' +
      '<div style="background:#0A1628;padding:24px 28px;border-radius:12px 12px 0 0">' +
        '<h1 style="color:#fff;font-size:20px;margin:0">' + heading + '</h1>' +
      '</div>' +
      '<div style="border:1px solid #e3e8ef;border-top:none;border-radius:0 0 12px 12px;padding:28px">' +
        '<p style="margin:0 0 18px">Hi ' + escapeHtml(d.firstName) + ',</p>' +
        '<p style="margin:0 0 20px;color:#42526b">' + intro + '</p>' +
        '<table style="width:100%;border-collapse:collapse;margin-bottom:20px">' +
          row('When', when) +
          row('Duration', CONFIG.SLOT_MINUTES + ' minutes') +
          row('Format', typeLabel) +
        '</table>' +
        '<p style="margin:0 0 20px;color:#42526b">' + meetingLine(d.meetingType) + '</p>' +
        '<p style="margin:0;color:#42526b">Need to reschedule? Just reply to this email.</p>' +
        '<p style="margin:24px 0 0;color:#90a0b7;font-size:13px">— ' + CONFIG.HOST_NAME + ', ' + CONFIG.BUSINESS_NAME + '</p>' +
      '</div>' +
    '</div>';

  MailApp.sendEmail({
    to: d.email,
    subject: subjectMap[kind],
    htmlBody: html,
    name: CONFIG.BUSINESS_NAME,
    replyTo: CONFIG.OWNER_EMAIL,
  });
}

function sendOwnerEmail(d) {
  var html =
    '<div style="font-family:Arial,Helvetica,sans-serif;max-width:560px;color:#1a2e4a">' +
      '<h2 style="margin:0 0 16px">New consultation booked</h2>' +
      '<table style="width:100%;border-collapse:collapse">' +
        row('When', formatRange(d.start, d.end)) +
        row('Format', MEETING_LABELS[d.meetingType]) +
        row('Name', escapeHtml(d.fullName)) +
        row('Email', escapeHtml(d.email)) +
        row('Phone', escapeHtml(d.phone)) +
        row('Organization', escapeHtml(d.organization)) +
        row('Project overview', escapeHtml(d.projectOverview)) +
        row('Materials', d.materials ? escapeHtml(d.materials) : '—') +
      '</table>' +
    '</div>';

  MailApp.sendEmail({
    to: CONFIG.OWNER_EMAIL,
    subject: 'New booking: ' + d.fullName + ' (' + MEETING_LABELS[d.meetingType] + ')',
    htmlBody: html,
    name: CONFIG.BUSINESS_NAME,
    replyTo: d.email,
  });
}

// ─── Helpers ────────────────────────────────────────────────────────────────

function row(label, value) {
  return '<tr>' +
    '<td style="padding:8px 0;color:#90a0b7;font-size:13px;vertical-align:top;width:140px">' + label + '</td>' +
    '<td style="padding:8px 0;color:#1a2e4a;font-size:14px;white-space:pre-line">' + value + '</td>' +
  '</tr>';
}

function formatRange(start, end) {
  var tz = Session.getScriptTimeZone();
  var date = Utilities.formatDate(start, tz, 'EEEE, MMMM d, yyyy');
  var t1 = Utilities.formatDate(start, tz, 'h:mm a');
  var t2 = Utilities.formatDate(end, tz, 'h:mm a');
  return date + '\n' + t1 + ' – ' + t2 + ' (Eastern Time)';
}

function clean(v, max) {
  return String(v == null ? '' : v).trim().slice(0, max);
}

function escapeHtml(s) {
  return String(s)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function jsonResponse(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
