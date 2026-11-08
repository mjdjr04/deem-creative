export const BOOKING_URL = 'https://calendar.app.google/CVSNo86SEqFK16JB7'

// The three ways in, in display order. Each service names its door; anything
// with a missing or unknown door is shown under the studio door.
export const DOORS = [
  { id: 'hire', heading: 'Hire me', intro: 'Bring me onto your team.' },
  { id: 'studio', heading: 'Work with Deem Creative', intro: 'Bring me a project.' },
  { id: 'crew', heading: 'On set and in the room', intro: 'Put me on your crew, or in front of your group.' },
]

export function groupServices(items) {
  const list = (Array.isArray(items) ? items : []).filter(Boolean)
  const known = new Set(DOORS.map((d) => d.id))
  return DOORS.map((d) => ({
    door: d.id,
    heading: d.heading,
    intro: d.intro,
    items: list.filter((s) => (known.has(s.door) ? s.door : 'studio') === d.id),
  })).filter((g) => g.items.length > 0)
}

// Legacy fields (title, iconName, description, bestFor, deliverables, ctaUrl)
// are kept on every item so older builds of the site still render them.
export const services = [
  {
    id: 'join-your-team',
    door: 'hire',
    title: 'Bring me onto your team',
    iconName: 'Briefcase',
    description:
      'I’m looking for full-time roles in social video, content production, creative operations, and special projects. You get someone who can shoot it, cut it, post it, measure it, and build the tracker that keeps it all on schedule.',
    bestFor: 'Hiring managers and recruiters filling a content, creative, or special-projects role.',
    deliverables: [
      'Social-first video: shooting, editing, vertical cutdowns',
      'Content calendars, publishing, and performance reporting',
      'Event production from planning to follow-up',
      'Websites, internal tools, and workflow automation',
      'Grant research and proposal coordination',
    ],
    proof: 'FOX Sports Digital · NJ Chamber Foundation Instagram views +462% · Director of Special Projects, Boys & Girls Clubs of Cumberland County',
    ctaUrl: '/hire',
  },
  {
    id: 'story-films',
    door: 'studio',
    title: 'Story films',
    iconName: 'Film',
    description:
      'Tribute films, impact videos, donor appeals, and short documentaries that tell the room why you matter before anyone speaks.',
    bestFor: 'Nonprofits, schools, and foundations with a big moment coming up.',
    deliverables: [
      'Interview and documentary-style films',
      'Tribute and honoree videos',
      'Impact and donor-appeal videos',
      'Social cut-downs planned from the same shoot',
      'Post-production for footage you already have',
    ],
    proof: 'The 2026 Gala tribute film · Open House impact video · One Lens, One Voice · award-winning HOSA PSAs',
    ctaUrl: BOOKING_URL,
  },
  {
    id: 'whole-event',
    door: 'studio',
    title: 'The whole event, start to finish',
    iconName: 'CalendarCheck',
    description:
      'The film, the registration site, sponsor ads and program book, check-in on a phone, and the thank-yous after. One person, one system, nothing dropped.',
    bestFor: 'Galas, banquets, anniversaries, and award nights.',
    deliverables: [
      'Registration and sponsorship site',
      'Sponsor ad collection with reminders',
      'Printed and digital program book',
      'Phone check-in for the door',
      'Thank-you page, emails, and sponsor certificates',
    ],
    proof: 'Brighter Futures Gala: 125+ registered guests, 18 sponsor certificates · APO Pi Rho 60th Anniversary Banquet',
    ctaUrl: BOOKING_URL,
  },
  {
    id: 'social-growth',
    door: 'studio',
    title: 'Social that grows',
    iconName: 'TrendingUp',
    description:
      'An audit, content pillars, recurring series your audience looks forward to, and a calendar your team can actually keep, plus monthly numbers that tell us what to make next.',
    bestFor: 'Organizations posting a lot and hearing nothing back.',
    deliverables: [
      'Social audit across your active platforms',
      'Content pillars and recurring series',
      'Monthly content calendars',
      'Graphics, short-form video, and captions',
      'Monthly performance review',
    ],
    proof: 'NJ Chamber of Commerce Foundation: Instagram views +462% and interactions +696%, Sep–Dec 2025',
    ctaUrl: BOOKING_URL,
  },
  {
    id: 'small-tools',
    door: 'studio',
    title: 'Small tools, built for your team',
    iconName: 'Wrench',
    description:
      'QR contact pages, letterhead and document builders, intake forms, booking flows, dashboards, and automations: the small, specific tools that remove a chore every day.',
    bestFor: 'Small staffs doing big-organization work by hand.',
    deliverables: [
      'QR contact pages with one-tap save',
      'Branded document and letter builders',
      'Intake, registration, and booking forms',
      'Simple dashboards and trackers',
      'Email and spreadsheet automations',
    ],
    proof: 'BGCCC Connect · Letter Builder · the gala platform · a daily grant-lead finder · a casting dashboard for an indie feature',
    ctaUrl: BOOKING_URL,
  },
  {
    id: 'systems-setup',
    door: 'studio',
    title: 'Systems and workflow setup',
    iconName: 'Layers',
    description:
      'Notion workspaces, Zapier automations, Google Drive structure, content calendars, and the training that makes people actually use them.',
    bestFor: 'Teams with scattered files, missed handoffs, and three versions of every document.',
    deliverables: [
      'Notion workspaces and templates',
      'Zapier and Google Workspace automations',
      'Shared-drive folder structure and naming',
      'Onboarding guides and training sessions',
    ],
    proof: 'Notion rollout across 18 Bonner Foundation programs · BGCCC records system',
    ctaUrl: BOOKING_URL,
  },
  {
    id: 'grant-support',
    door: 'studio',
    title: 'Special projects and grant support',
    iconName: 'FileText',
    description:
      'Research, proposal coordination, budgets, and the binder that gets the application out the door on time.',
    bestFor: 'Small nonprofits with a deadline and no grants office.',
    deliverables: [
      'Funder research and a running leads list',
      'Proposal writing and coordination',
      'Budgets and supporting documents',
      'Submission checklists and binders',
    ],
    proof: 'Five grant proposals in one summer at BGCCC, including a $75,000 TD Charitable Foundation proposal',
    ctaUrl: BOOKING_URL,
  },
  {
    id: 'on-set',
    door: 'crew',
    title: 'On set and in the edit',
    iconName: 'Clapperboard',
    description:
      'Production coordination, directing, editing, script supervision, PA work, and casting tools for independent productions.',
    bestFor: 'Indie films, documentaries, and productions that need one more reliable person.',
    deliverables: [
      'Production coordination and scheduling',
      'Directing and editing',
      'Continuity and script supervision',
      'Self-tape and casting review tools',
    ],
    proof: 'FOX Sports Digital post · It Lies Within (production coordinator) · One Lens, One Voice (director) · Vineland Fire Safety video',
    ctaUrl: BOOKING_URL,
  },
  {
    id: 'workshops',
    door: 'crew',
    title: 'Workshops and talks',
    iconName: 'Presentation',
    description: 'Youth filmmaking workshops and talks on storytelling and service.',
    bestFor: 'Schools, youth programs, and conferences.',
    deliverables: [
      'Hands-on youth filmmaking workshops',
      'Talks on storytelling and telling your own story',
      'Session facilitation and panels',
    ],
    proof: 'Taught 30+ high-school filmmakers at the Halsey Foundation · “Passion to Practice: Tell Your Story” at the Bonner Summer Leadership Institute',
    ctaUrl: BOOKING_URL,
  },
]
