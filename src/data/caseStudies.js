// Case studies for /work/:slug. Slugs match caseStudyPath in projects.js.
// Images live under /assets/work/<slug>/ (supplied separately); the page
// shows a neutral placeholder until they exist.

const G = '/assets/work/bgccc-gala'
const C = '/assets/work/bgccc-connect'
const L = '/assets/work/bgccc-letter-builder'

export const CASE_STUDIES = {
  'bgccc-gala': {
    title: 'The 2026 Gala — from film to front door',
    client: 'Boys & Girls Clubs of Cumberland County',
    date: 'October 2026',
    summary:
      'I made the tribute film and built everything around the night: how guests registered, how sponsors sent in their ads, how staff checked people in at the door, and how every guest and sponsor was thanked afterward.',
    hero: { youtubeId: '8yVfb2hg0tk' },
    stats: [
      { value: '120+', label: 'guests' },
      { value: '12', label: 'sponsors' },
      { value: '1', label: 'person, start to finish' },
    ],
    chapters: [
      {
        id: 'film',
        label: 'The Film',
        heading: 'A tribute film that opened the night',
        problem: 'The gala needed one piece that told the room why the Club matters before anyone spoke.',
        built:
          'I made the tribute film in Premiere Pro and After Effects. It played for 120+ guests, and it lives on the thank-you page afterward.',
        images: [{ src: `${G}/film-still.jpg`, alt: 'Still frame from the 2026 gala tribute film' }],
      },
      {
        id: 'registration',
        label: 'Registration',
        heading: 'Tickets, tables and sponsorships in one form',
        problem: 'RSVPs and payments were scattered across email and paper.',
        built:
          'I built a registration site where guests pick tickets or a table and pay through DonorDock. Every registration logs to a Google Sheet and sends a confirmation automatically.',
        images: [{ src: `${G}/registration.jpg`, alt: 'The gala registration site on a phone and a laptop' }],
        link: { label: 'Visit the registration site', href: 'https://gala.bgccumberland.org' },
      },
      {
        id: 'program-book',
        label: 'Program Book',
        heading: 'Sponsor ads without the chasing',
        problem: 'Collecting ad artwork from a dozen sponsors by email meant a lot of follow-up.',
        built:
          'Each sponsor got a prefilled form, and the sheet tracks what has arrived and what is missing. Reminders go out on their own, and I laid out the book from what came in.',
        images: [{ src: `${G}/program-book.jpg`, alt: 'Pages from the gala program book' }],
      },
      {
        id: 'gala-night',
        label: 'Gala Night',
        heading: 'Check-in on a phone at the door',
        problem: 'A paper list at the door is slow, and it falls apart when a party arrives in pieces.',
        built:
          'I built a check-in screen that works on a phone, with every guest listed by name and parties merged. Staff tapped people in and every phone stayed in sync. Demo data shown.',
        images: [{ src: `${G}/check-in.jpg`, alt: 'Phone check-in screen with demo guest data' }],
      },
      {
        id: 'after',
        label: 'After the Night',
        heading: 'Thanking everyone, with the film and photos',
        problem: 'Thank-yous after an event are the first thing to slip.',
        built:
          'I turned the registration site into a thank-you page with the tribute film and the photo album. Then I sent the post-gala emails and a certificate to each sponsor.',
        images: [{ src: `${G}/thank-you.jpg`, alt: 'The gala thank-you page with the tribute video' }],
      },
    ],
    quote: null,
    next: 'bgccc-connect',
  },

  'bgccc-connect': {
    title: 'BGCCC Connect',
    client: 'Boys & Girls Clubs of Cumberland County',
    date: '2026',
    summary:
      'A contact page for each person on our team, reached by scanning a QR code. Save the contact in one tap, or share your own info back.',
    hero: { image: `${C}/hero.jpg`, alt: 'A staff contact page on a phone next to its QR code' },
    stats: [
      { value: '4', label: 'staff pages' },
      { value: '1', label: 'tap to save a contact' },
    ],
    chapters: [
      {
        id: 'contact-page',
        label: 'The Page',
        heading: 'One page per person, one QR code to reach it',
        problem: 'Business cards get lost and nobody types a phone number from one.',
        built:
          'I built a page for each staff member, plus a team directory at the root. Each page has its own QR code that I generated and checked by decoding it.',
        images: [{ src: `${C}/contact-page.jpg`, alt: 'A staff contact page on a phone' }],
        link: { label: 'Visit BGCCC Connect', href: 'https://connect.bgccumberland.org' },
      },
      {
        id: 'save-contact',
        label: 'Save Contact',
        heading: 'A contact card that works on iPhone and Android',
        problem: 'Most phones will not add a contact without the right file type and a tap.',
        built:
          'The save button opens a contact card with a photo and both phone lines, built to work on iPhone and Android.',
        images: [{ src: `${C}/save-contact.jpg`, alt: 'Phone prompt to create a new contact' }],
      },
      {
        id: 'share-back',
        label: 'Share Back',
        heading: 'The visitor can share their info too',
        problem: 'When someone scans, we usually learn nothing about them.',
        built:
          'A short form logs each submission to a spreadsheet and emails a branded alert to the staff member whose page it was.',
        images: [{ src: `${C}/share-form.jpg`, alt: 'The share-your-info form and the alert email it sends' }],
      },
    ],
    quote: null,
    next: 'bgccc-letter-builder',
  },

  'bgccc-letter-builder': {
    title: 'BGCCC Letter Builder',
    client: 'Boys & Girls Clubs of Cumberland County',
    date: '2026',
    summary:
      'An internal tool that turns a pasted draft into a finished letter on the Club’s letterhead. It is for our team only.',
    hero: { image: `${L}/hero.jpg`, alt: 'A letter set on the Club letterhead' },
    stats: [
      { value: '3', label: 'optional helpers' },
      { value: '1', label: 'page, no template to touch' },
    ],
    chapters: [
      {
        id: 'letterhead',
        label: 'Letterhead',
        heading: 'Paste a draft, get a letter on brand',
        problem: 'Setting a letter on the letterhead by hand took time and left room for mistakes.',
        built:
          'I built a single-page tool that sets pasted text on the letterhead. Nobody has to open or edit a template.',
        images: [{ src: `${L}/letterhead.jpg`, alt: 'Draft text set on the letterhead' }],
      },
      {
        id: 'pdf',
        label: 'PDF Output',
        heading: 'A real PDF with selectable text',
        problem: 'A screenshot of a letter cannot be searched, copied or read aloud.',
        built:
          'It downloads a PDF with selectable text, not a flattened image. A leadership roster is built in and feeds the signature dropdown.',
        images: [{ src: `${L}/pdf.jpg`, alt: 'The finished PDF with the signature dropdown' }],
      },
      {
        id: 'helpers',
        label: 'Helpers',
        heading: 'Three optional AI buttons',
        problem: 'Long drafts need splitting, and subject lines and proofreading take time.',
        built:
          'Optional buttons split a long draft, suggest a subject line and proofread. Each is off until someone clicks it.',
        images: [{ src: `${L}/helpers.jpg`, alt: 'The split, subject-line and proofread buttons' }],
      },
    ],
    quote: null,
    next: 'bgccc-gala',
  },
}

export const visibleStats = stats => (stats || []).filter(s => s && String(s.value).trim() !== '')

export const getCaseStudy = slug =>
  Object.prototype.hasOwnProperty.call(CASE_STUDIES, slug) ? CASE_STUDIES[slug] : null
