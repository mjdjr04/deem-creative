/**
 * Appointment Email Automation — thank-you emails (Google Apps Script)
 * ────────────────────────────────────────────────────────────────────────────
 * SEPARATE Apps Script project from the booking API in Code.gs. This one is
 * standalone (NOT the web app the website calls) and does ONE job: on an hourly
 * time-based trigger, it thanks clients who booked through a channel that does
 * NOT go through the booking API's doPost — e.g. Google Appointment Scheduling
 * or manually-added calendar invites.
 *
 * Because site bookings are already emailed a confirmation by Code.gs → doPost,
 * their event titles are deliberately kept OUT of THANKYOU_TITLES so nobody gets
 * emailed twice.
 *
 * Setup:
 *   • Script Property GEMINI_API_KEY  — Gemini key (managed in Google AI Studio,
 *     NOT hardcoded here). Used by generateAIEmail(); falls back to a hand-written
 *     template if absent/failing.
 *   • One time-based trigger on processNewBookings (hourly).
 *
 * Reminder emails (day-before / day-of) are NOT handled here — those live in the
 * separate "Deem Creative Booking" project (Code.gs → sendReminders). Do not add
 * a sendReminders trigger to this project or clients get duplicate reminders.
 * ────────────────────────────────────────────────────────────────────────────
 */

// Event titles this automation should thank. MUST NOT overlap the booking API's
// titles (Code.gs → CONFIG.TYPES: "Deem Creative Consultation …", "Call with …").
var THANKYOU_TITLES = [
  'Creative Strategy Session',
  'Meeting with Michael Deem Jr.',
  'Quick Chat with Michael',
];

function processNewBookings() {
  var now = new Date();
  // 2h window covers an hourly trigger even if it fires late; the 'thankYouSent'
  // tag prevents any duplicate send from the overlap.
  var lookback = new Date(now.getTime() - 2 * 60 * 60 * 1000);
  var cal = CalendarApp.getDefaultCalendar();

  // This Calendar read is the storage op that threw RESOURCE_EXHAUSTED on 6/30 —
  // retry transient Google backend blips instead of failing the run.
  var events = withRetry(function () {
    return cal.getEvents(lookback, new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000));
  });

  var myEmail = Session.getActiveUser().getEmail();

  events.forEach(function (event) {
    var title = event.getTitle();
    var isTarget = THANKYOU_TITLES.some(function (t) { return title.indexOf(t) !== -1; });
    if (!isTarget) return;
    if (event.getDateCreated() < lookback) return;        // only freshly-created
    if (event.getTag('thankYouSent') === 'true') return;  // already emailed — idempotent

    var description = event.getDescription() || '';
    var nameMatch = description.match(/Booked by\s+([^\n<]+)/);
    var firstName = nameMatch ? nameMatch[1].trim().split(' ')[0] : 'there';

    // Prefer an email in the description; fall back to the first non-host guest,
    // then to the event creator.
    var guestEmail = '';
    var emailMatch = description.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
    if (emailMatch) {
      guestEmail = emailMatch[0];
    } else {
      var other = event.getGuestList(true)
        .filter(function (g) { return g.getEmail() !== myEmail; })[0];
      guestEmail = other ? other.getEmail() : (event.getCreators()[0] || '');
    }
    if (!guestEmail || guestEmail === myEmail) return;

    var subject = 'Thank you for booking, ' + firstName + '! | ' + title;
    var html;
    try {
      html = generateAIEmail(description, title, firstName);
    } catch (e) {
      console.warn('AI unavailable, sending fallback: ' + e);
      html = thankYouFallback(firstName);
    }
    GmailApp.sendEmail(guestEmail, subject, '', { htmlBody: html });
    event.setTag('thankYouSent', 'true');   // guard against re-send next run
    console.log('Thank-you email sent to ' + guestEmail);
  });
}

/** Hand-written thank-you used whenever the AI call is unavailable. */
function thankYouFallback(firstName) {
  return 'Dear ' + firstName + ',<br><br>' +
    'Thank you for booking an appointment with me. I am looking forward to our session and ' +
    'learning more about your goals and projects.<br><br>' +
    'How would you prefer to meet? I am available to meet <b>in person (South Jersey area)</b>, ' +
    'via <b>Zoom</b>, or over the <b>phone</b>. Please let me know which option works best for you ' +
    'prior to our scheduled time. If you would prefer to meet in person, please suggest a location ' +
    'that is convenient for you.<br><br>' +
    'Best regards,<br><br>' +
    '<b>Michael Deem Jr.</b><br>michael@deemcreative.com<br>(929) 831-7254';
}

/** Draft the thank-you with Gemini. Throws on any failure so the caller falls back. */
function generateAIEmail(description, eventTitle, firstName) {
  var key = PropertiesService.getScriptProperties().getProperty('GEMINI_API_KEY');
  if (!key) throw new Error('GEMINI_API_KEY not set in Script Properties');

  var url = 'https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent?key=' + key;
  var prompt =
    'Context: A client named ' + firstName + ' booked "' + eventTitle + '".\n' +
    'Booking description: "' + description + '".\n\n' +
    'Write a professional thank-you email with this exact flow:\n' +
    '1. Greeting: "Dear ' + firstName + ',"\n' +
    '2. Thank them for booking and say you look forward to the session. Only reference ' +
    'specific project details if they actually appear in the description above — never ' +
    'invent a project, nonprofit, topic, or detail that is not explicitly stated. If the ' +
    'description has no specifics, keep this sentence general.\n' +
    '3. Meeting question, verbatim: "How would you prefer to meet? I am able to meet in ' +
    'person (South Jersey area), over Zoom, or over the phone. Please let me know before our ' +
    'meeting what works best for you. If you would like to meet in person, please let me know ' +
    'where would work best for you."\n' +
    '4. Closing: "Best regards," then on separate lines Michael Deem Jr., ' +
    'michael@deemcreative.com, (929) 831-7254.\n\n' +
    'Tone: professional, helpful, grammatically perfect. Return ONLY HTML using <br> for ' +
    'spacing — no markdown, no code fences.';

  var response = UrlFetchApp.fetch(url, {
    method: 'post',
    contentType: 'application/json',
    muteHttpExceptions: true,
    payload: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
  });
  var json = JSON.parse(response.getContentText());

  if (json.candidates && json.candidates[0] && json.candidates[0].content &&
      json.candidates[0].content.parts && json.candidates[0].content.parts[0]) {
    return json.candidates[0].content.parts[0].text
      .replace(/^```html\s*/i, '').replace(/```\s*$/, '').trim();
  }
  throw new Error('Gemini returned no usable content');
}

/**
 * Retry `fn` on transient Google backend errors — e.g. RESOURCE_EXHAUSTED /
 * "a server error occurred while reading from storage" / internal errors —
 * with exponential backoff. Real bugs (anything else) throw immediately.
 */
function withRetry(fn, opts) {
  opts = opts || {};
  var tries = opts.tries || 4;
  var delayMs = opts.delayMs || 1000;
  var lastErr;
  for (var i = 0; i < tries; i++) {
    try {
      return fn();
    } catch (err) {
      lastErr = err;
      var msg = String(err);
      if (msg.indexOf('RESOURCE_EXHAUSTED') === -1 &&
          msg.indexOf('reading from storage') === -1 &&
          msg.indexOf('Internal error') === -1) {
        throw err;                 // not transient — surface the real error
      }
      Utilities.sleep(delayMs);
      delayMs *= 2;                // back off: 1s, 2s, 4s…
    }
  }
  throw lastErr;                    // retries exhausted — let the trigger notify you
}
