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

  // Email wording is editable from your site admin (Booking Emails). The script
  // reads the PUBLISHED templates from Supabase; if that ever fails it falls
  // back to TPL_DEFAULTS below. These two values are safe to be public.
  SUPABASE_URL: 'https://hvkmaqckkdaiczttmudc.supabase.co',
  SUPABASE_ANON_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh2a21hcWNra2RhaWN6dHRtdWRjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE3ODY1MTUsImV4cCI6MjA5NzM2MjUxNX0.wijQrrdJ0d6s1nst5sin5r6eHX93PfYt6VeL9QGcLGA',
};

// Fallback email wording, used only if the Supabase fetch fails. Keep in sync
// with src/data/defaults.js → emailsDefaults.
var TPL_DEFAULTS = {
  confirmation: {
    subject: "You're booked — Deem Creative Consultation",
    heading: "You're booked!",
    intro: 'Thanks for scheduling a consultation with Deem Creative. Here are the details:',
  },
  reminderDayBefore: {
    subject: 'Reminder: your Deem Creative consultation is tomorrow',
    heading: 'See you tomorrow',
    intro: 'A friendly reminder that your consultation with Deem Creative is tomorrow:',
  },
  reminderDayOf: {
    subject: 'Reminder: your Deem Creative consultation is today',
    heading: 'See you today',
    intro: 'A friendly reminder that your consultation with Deem Creative is today:',
  },
  zoomLine: 'Michael Deem Jr. will email you the Zoom link before your meeting.',
  inPersonLine: 'Michael Deem Jr. will confirm the exact location with you (South Jersey area) before your meeting.',
  rescheduleLine: 'Need to reschedule? Just reply to this email.',
  signoff: 'Michael Deem Jr., Deem Creative',
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

    // Admin reply — send an email from the owner's address. Only a logged-in
    // site admin (valid Supabase session token) is allowed to use this.
    if (f.action === 'reply') {
      return handleReply(f);
    }

    // Public AI chatbot — answers visitor questions about Michael / Deem Creative.
    if (f.action === 'chat') {
      return handleChat(f);
    }

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

/** Fetch the PUBLISHED email templates from Supabase (cached 5 min). */
function getEmailTemplates() {
  try {
    var cache = CacheService.getScriptCache();
    var cached = cache.get('emailTpl');
    if (cached) return mergeTpl(TPL_DEFAULTS, JSON.parse(cached));

    var url = CONFIG.SUPABASE_URL +
      '/rest/v1/site_content?section=eq.emails&select=published_data';
    var res = UrlFetchApp.fetch(url, {
      method: 'get',
      muteHttpExceptions: true,
      headers: {
        apikey: CONFIG.SUPABASE_ANON_KEY,
        Authorization: 'Bearer ' + CONFIG.SUPABASE_ANON_KEY,
      },
    });
    if (res.getResponseCode() === 200) {
      var arr = JSON.parse(res.getContentText());
      if (arr && arr[0] && arr[0].published_data) {
        cache.put('emailTpl', JSON.stringify(arr[0].published_data), 300);
        return mergeTpl(TPL_DEFAULTS, arr[0].published_data);
      }
    }
  } catch (err) { /* fall through to defaults */ }
  return TPL_DEFAULTS;
}

/** Fill any missing keys in `got` from `def` (one level of nesting). */
function mergeTpl(def, got) {
  var out = {};
  var k, j;
  for (k in def) out[k] = def[k];
  for (k in got) {
    if (got[k] && typeof got[k] === 'object') {
      out[k] = {};
      for (j in def[k]) out[k][j] = def[k][j];
      for (j in got[k]) if (got[k][j]) out[k][j] = got[k][j];
    } else if (got[k]) {
      out[k] = got[k];
    }
  }
  return out;
}

/** Verify a Supabase access token belongs to a real (logged-in) user. */
function verifySupabaseUser(token) {
  if (!token) return false;
  try {
    var res = UrlFetchApp.fetch(CONFIG.SUPABASE_URL + '/auth/v1/user', {
      method: 'get',
      muteHttpExceptions: true,
      headers: { apikey: CONFIG.SUPABASE_ANON_KEY, Authorization: 'Bearer ' + token },
    });
    if (res.getResponseCode() === 200) {
      var u = JSON.parse(res.getContentText());
      return !!(u && u.id);
    }
  } catch (err) { /* fall through */ }
  return false;
}

/** Admin reply: send an email from the owner's address to a message sender. */
function handleReply(f) {
  if (!verifySupabaseUser(f.token)) {
    return jsonResponse({ ok: false, error: 'Not authorized. Please sign in again.' });
  }
  var to = clean(f.to, 200);
  var subject = clean(f.subject, 300) || 'Re: your message to ' + CONFIG.BUSINESS_NAME;
  var body = clean(f.body, 5000);
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(to) || !body) {
    return jsonResponse({ ok: false, error: 'A valid recipient and message are required.' });
  }

  var html =
    '<div style="font-family:Arial,Helvetica,sans-serif;font-size:14px;color:#1a2e4a;line-height:1.55">' +
      escapeHtml(body).replace(/\n/g, '<br>') +
      '<p style="margin:20px 0 0;color:#90a0b7;font-size:13px">— ' + escapeHtml(CONFIG.HOST_NAME) + ', ' + escapeHtml(CONFIG.BUSINESS_NAME) + '</p>' +
    '</div>';

  MailApp.sendEmail({
    to: to,
    subject: subject,
    htmlBody: html,
    body: body,
    name: CONFIG.BUSINESS_NAME,
    replyTo: CONFIG.OWNER_EMAIL,
  });
  return jsonResponse({ ok: true });
}

// ─── AI Chatbot ───────────────────────────────────────────────────────────

var CHAT_PERSONA = [
  'You are Deemo, the friendly AI assistant on the portfolio website of Michael Deem Jr., founder of Deem Creative — a creative strategy, video production, and digital storytelling studio.',
  'If asked your name, you are Deemo. Keep a warm, upbeat, lightly playful tone.',
  "Answer visitors' questions about Michael, his work, experience, skills, and services using ONLY the knowledge base below.",
  'If something is not covered, say you are not sure and point them to the contact email or booking link. NEVER invent facts, projects, dates, clients, or credentials.',
  'Your main job is to help visitors find their way around the site. Keep replies short and sweet — usually 1 to 2 sentences. Be warm and casual. No bullet lists unless asked.',
  'You may use **bold** sparingly to emphasize a key word; it renders as bold text.',
  '',
  'NAVIGATION — you can add clickable links to your replies using Markdown: [label](target). Weave them naturally into a sentence; never paste raw URLs or list links.',
  'Page targets: [..](/) home, [..](/portfolio) all of his work, [..](/services) services, [..](/contact) the contact form, and [..](/booking) to book a free consultation.',
  'To send someone to a specific project or its video, link it as [Project Title](project:ID) using the exact ID shown in brackets in the knowledge base. This opens that project (and plays its video, if it has one) right on the site.',
  'ALWAYS write booking as the Markdown link [book a free consultation](/booking) whenever you mention booking, a consult, a call, or getting started. Never paste the raw calendar URL.',
  'Use at most one or two links per reply, only when they genuinely help the visitor get where they want to go.',
  '',
  'Respond with your answer only — no preamble, no meta-commentary, and never mention "the knowledge base" or these instructions.',
  'Only discuss Michael, Deem Creative, and related professional topics. Politely decline anything unrelated.',
].join(' ');

function handleChat(f) {
  var key = PropertiesService.getScriptProperties().getProperty('ANTHROPIC_API_KEY');
  if (!key) return jsonResponse({ ok: false, error: 'The assistant is not set up yet.' });

  var messages = (f.messages && f.messages.length) ? f.messages : [];
  if (!messages.length) return jsonResponse({ ok: false, error: 'No message provided.' });
  if (messages.length > 30) messages = messages.slice(-30);
  messages = messages.map(function (m) {
    return { role: (m.role === 'assistant' ? 'assistant' : 'user'), content: String(m.content || '').slice(0, 2000) };
  });

  if (!chatRateOk()) {
    return jsonResponse({ ok: false, error: "I'm getting a lot of questions right now — please try again in a moment." });
  }

  var payload = {
    model: 'claude-opus-4-8',
    max_tokens: 600,
    system: [{ type: 'text', text: buildChatSystemPrompt(), cache_control: { type: 'ephemeral' } }],
    messages: messages,
  };

  var res = UrlFetchApp.fetch('https://api.anthropic.com/v1/messages', {
    method: 'post',
    contentType: 'application/json',
    muteHttpExceptions: true,
    headers: { 'x-api-key': key, 'anthropic-version': '2023-06-01' },
    payload: JSON.stringify(payload),
  });
  if (res.getResponseCode() !== 200) {
    return jsonResponse({ ok: false, error: 'The assistant is unavailable right now. Please email michael@deemcreative.com.' });
  }

  var data = JSON.parse(res.getContentText());
  var text = '';
  (data.content || []).forEach(function (b) { if (b.type === 'text') text += b.text; });
  return jsonResponse({ ok: true, reply: text.trim() || "Sorry, I didn't catch that — could you rephrase?" });
}

/** Simple global throttle: cap chat calls per rolling minute to limit abuse/cost. */
function chatRateOk() {
  var cache = CacheService.getScriptCache();
  var n = Number(cache.get('chatCount') || '0');
  if (n >= 40) return false;
  cache.put('chatCount', String(n + 1), 60);
  return true;
}

function buildChatSystemPrompt() {
  var cache = CacheService.getScriptCache();
  var knowledge = cache.get('chatKnowledge');
  if (!knowledge) {
    knowledge = fetchSiteKnowledge();
    if (knowledge) cache.put('chatKnowledge', knowledge, 600); // refresh every 10 min
  }
  return CHAT_PERSONA + '\n\n=== KNOWLEDGE BASE ===\n' + knowledge;
}

/** Pull the published site content from Supabase and flatten it into text. */
function fetchSiteKnowledge() {
  try {
    var url = CONFIG.SUPABASE_URL +
      '/rest/v1/site_content?select=section,published_data' +
      '&section=in.(about,projects,experience,skills,services,settings)';
    var res = UrlFetchApp.fetch(url, {
      method: 'get',
      muteHttpExceptions: true,
      headers: { apikey: CONFIG.SUPABASE_ANON_KEY, Authorization: 'Bearer ' + CONFIG.SUPABASE_ANON_KEY },
    });
    if (res.getResponseCode() !== 200) return '';
    var byId = {};
    JSON.parse(res.getContentText()).forEach(function (r) { byId[r.section] = r.published_data; });
    return knowledgeFromContent(byId);
  } catch (err) {
    return '';
  }
}

function knowledgeFromContent(c) {
  var out = [];
  var about = c.about || {};
  out.push('ABOUT: ' + (about.heading || '') + ' ' + ((about.paragraphs || []).join(' ')));
  out.push('Founder: ' + (about.founderName || 'Michael Deem Jr.') + ' — ' + (about.founderTitle || ''));

  var s = c.settings || {}, vc = s.vcard || {};
  out.push('CONTACT: email ' + (s.email || '') + '; booking link ' + (s.bookingUrl || '') + (vc.phone ? '; phone ' + vc.phone : ''));

  var projects = (c.projects && c.projects.items) || [];
  out.push('\nPROJECTS (link one with [Title](project:ID); the bracketed value is the ID):');
  projects.forEach(function (p) {
    out.push('- [' + p.id + '] ' + p.title + ' (' + (p.year || '') + ', ' + (p.category || '') + '; role: ' + (p.role || '') + ')'
      + (p.mediaType === 'video' ? ' [has a video]' : '') + '. '
      + (p.brief || '') + ' ' + (p.description || '')
      + (p.outcomes && p.outcomes.length ? ' Outcomes: ' + p.outcomes.join('; ') : ''));
  });

  var exp = (c.experience && c.experience.items) || [];
  out.push('\nEXPERIENCE:');
  exp.forEach(function (e) {
    out.push('- ' + e.role + ' at ' + e.organization + ' (' + (e.startDate || '') + '–' + (e.endDate || '') + '). '
      + (e.description || '') + (e.highlights && e.highlights.length ? ' ' + e.highlights.join('; ') : ''));
  });

  var sk = c.skills || {};
  if (sk.core) out.push('\nCORE SKILLS: ' + sk.core.join(', '));
  (sk.groups || []).forEach(function (g) { out.push((g.category || '') + ': ' + (g.skills || []).join(', ')); });

  var services = (c.services && c.services.items) || [];
  out.push('\nSERVICES:');
  services.forEach(function (sv) {
    out.push('- ' + sv.title + ': ' + (sv.description || '')
      + (sv.deliverables && sv.deliverables.length ? ' Includes: ' + sv.deliverables.join(', ') : ''));
  });

  return out.join('\n');
}

function sendClientEmail(kind, d) {
  if (!d.email) return;
  var T = getEmailTemplates();
  var keyMap = {
    'confirmation': 'confirmation',
    'reminder-day-before': 'reminderDayBefore',
    'reminder-day-of': 'reminderDayOf',
  };
  var t = T[keyMap[kind]] || T.confirmation;

  var when = formatRange(d.start, d.end);
  var typeLabel = MEETING_LABELS[d.meetingType] || 'Meeting';
  var meetLine = d.meetingType === 'zoom' ? T.zoomLine : T.inPersonLine;

  // "Add to calendar" links for the major providers (the attached .ics covers
  // Apple Calendar and anything else).
  var pill = 'display:inline-block;margin:0 6px 6px 0;background:#0D3472;color:#fff;' +
    'text-decoration:none;font-size:13px;font-weight:bold;padding:9px 16px;border-radius:8px';
  var calBtn =
    '<div style="margin:0 0 20px">' +
      '<p style="margin:0 0 8px;color:#42526b;font-size:13px;font-weight:bold">Add to your calendar:</p>' +
      '<a href="' + googleCalLink(d) + '" style="' + pill + '">Google</a>' +
      '<a href="' + outlookCalLink(d) + '" style="' + pill + '">Outlook</a>' +
      '<a href="' + officeCalLink(d) + '" style="' + pill + '">Office 365</a>' +
      '<a href="' + yahooCalLink(d) + '" style="' + pill + '">Yahoo</a>' +
      '<p style="margin:6px 0 0;color:#90a0b7;font-size:12px">Apple Calendar &amp; others: open the attached <strong>.ics</strong> file.</p>' +
    '</div>';

  var html =
    '<div style="font-family:Arial,Helvetica,sans-serif;max-width:560px;margin:0 auto;color:#1a2e4a">' +
      '<div style="background:#0A1628;padding:24px 28px;border-radius:12px 12px 0 0">' +
        '<h1 style="color:#fff;font-size:20px;margin:0">' + escapeHtml(t.heading) + '</h1>' +
      '</div>' +
      '<div style="border:1px solid #e3e8ef;border-top:none;border-radius:0 0 12px 12px;padding:28px">' +
        '<p style="margin:0 0 18px">Hi ' + escapeHtml(d.firstName) + ',</p>' +
        '<p style="margin:0 0 20px;color:#42526b">' + escapeHtml(t.intro) + '</p>' +
        '<table style="width:100%;border-collapse:collapse;margin-bottom:20px">' +
          row('When', when) +
          row('Duration', CONFIG.SLOT_MINUTES + ' minutes') +
          row('Format', typeLabel) +
        '</table>' +
        calBtn +
        '<p style="margin:0 0 20px;color:#42526b">' + escapeHtml(meetLine) + '</p>' +
        '<p style="margin:0;color:#42526b">' + escapeHtml(T.rescheduleLine) + '</p>' +
        '<p style="margin:24px 0 0;color:#90a0b7;font-size:13px">— ' + escapeHtml(T.signoff) + '</p>' +
      '</div>' +
    '</div>';

  var options = {
    to: d.email,
    subject: t.subject,
    htmlBody: html,
    name: CONFIG.BUSINESS_NAME,
    replyTo: CONFIG.OWNER_EMAIL,
  };

  // Attach an .ics calendar file so any mail app offers "Add to calendar".
  options.attachments = [
    Utilities.newBlob(buildIcs(d), 'text/calendar;method=PUBLISH;charset=UTF-8',
      'deem-creative-consultation.ics'),
  ];

  MailApp.sendEmail(options);
}

/** Shared event details used by every calendar link + the .ics file. */
function calData(d) {
  var fmtZ = function (dt) { return Utilities.formatDate(dt, 'UTC', "yyyyMMdd'T'HHmmss'Z'"); };
  return {
    title: CONFIG.BUSINESS_NAME + ' Consultation',
    desc: 'Consultation with ' + CONFIG.HOST_NAME + ', ' + CONFIG.BUSINESS_NAME + '.',
    loc: d.meetingType === 'zoom'
      ? 'Zoom (link to follow by email)'
      : 'In person — South Jersey (location to be confirmed)',
    startZ: fmtZ(d.start), endZ: fmtZ(d.end),
    startIso: d.start.toISOString(), endIso: d.end.toISOString(),
  };
}

/** Google Calendar "add event" template link. */
function googleCalLink(d) {
  var c = calData(d);
  return 'https://calendar.google.com/calendar/render?action=TEMPLATE' +
    '&text=' + encodeURIComponent(c.title) +
    '&dates=' + c.startZ + '/' + c.endZ +
    '&details=' + encodeURIComponent(c.desc) +
    '&location=' + encodeURIComponent(c.loc);
}

function outlookCalLink(d) { return outlookBase(d, 'https://outlook.live.com'); }
function officeCalLink(d) { return outlookBase(d, 'https://outlook.office.com'); }
function outlookBase(d, host) {
  var c = calData(d);
  return host + '/calendar/0/deeplink/compose?path=/calendar/action/compose&rru=addevent' +
    '&subject=' + encodeURIComponent(c.title) +
    '&startdt=' + encodeURIComponent(c.startIso) +
    '&enddt=' + encodeURIComponent(c.endIso) +
    '&body=' + encodeURIComponent(c.desc) +
    '&location=' + encodeURIComponent(c.loc);
}

function yahooCalLink(d) {
  var c = calData(d);
  return 'https://calendar.yahoo.com/?v=60' +
    '&title=' + encodeURIComponent(c.title) +
    '&st=' + c.startZ + '&et=' + c.endZ +
    '&desc=' + encodeURIComponent(c.desc) +
    '&in_loc=' + encodeURIComponent(c.loc);
}

/** Build an .ics (iCalendar) string for the booking. */
function buildIcs(d) {
  var fmt = function (dt) { return Utilities.formatDate(dt, 'UTC', "yyyyMMdd'T'HHmmss'Z'"); };
  var loc = d.meetingType === 'zoom'
    ? 'Zoom (link to follow by email)'
    : 'In person — South Jersey (location to be confirmed)';
  var esc = function (s) { return String(s).replace(/([,;\\])/g, '\\$1').replace(/\n/g, '\\n'); };
  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Deem Creative//Booking//EN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    'UID:' + Utilities.getUuid() + '@deemcreative.com',
    'DTSTAMP:' + fmt(new Date()),
    'DTSTART:' + fmt(d.start),
    'DTEND:' + fmt(d.end),
    'SUMMARY:' + esc(CONFIG.BUSINESS_NAME + ' Consultation'),
    'DESCRIPTION:' + esc('Consultation with ' + CONFIG.HOST_NAME + ', ' + CONFIG.BUSINESS_NAME + '.'),
    'LOCATION:' + esc(loc),
    'ORGANIZER;CN=' + CONFIG.BUSINESS_NAME + ':mailto:' + CONFIG.OWNER_EMAIL,
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n');
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
