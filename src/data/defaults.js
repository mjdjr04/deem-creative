// Canonical default content for the whole site.
//
// These values are the FALLBACK used when Supabase is not configured (or a
// section has not been seeded yet), and they are also the seed source the
// admin panel writes into Supabase on first run.
//
// Shape is organized by "section" — the same keys used as primary keys in the
// Supabase `site_content` table.

import {
  BOOKING_URL,
  SOCIAL_ACCOUNTS,
  CATEGORIES,
  FEATURED_PROJECT_IDS,
  projects,
} from './projects'
import { experiences, featuredProjects } from './experience'
import { services } from './services'
import { skillGroups, coreSkills } from './skills'

export const aboutDefaults = {
  eyebrow: 'About',
  heading: 'Creative production meets operational structure.',
  paragraphs: [
    'Deem Creative is a creative strategy and storytelling studio helping startups, small businesses, nonprofits, and community-centered organizations create stronger content, clearer digital systems, and stories that connect with real people.',
    'Founded by Michael Deem Jr., Deem Creative combines experience in film and television, social media strategy, nonprofit communications, post-production, and creative operations — bringing polished execution and organized systems thinking to every engagement.',
  ],
  founderName: 'Michael Deem Jr.',
  founderTitle: 'Founder / Creative Consultant',
  linkedinUrl: 'https://linkedin.com/in/michael-deem-jr',
  // Empty = use the bundled headshot asset; admin can upload a replacement.
  headshot: '',
  // Profile-page intro — written for hiring managers getting to know Michael.
  // The shared About block above stays studio-focused for the public home page;
  // this block tells the personal/career story on the profile page.
  profile: {
    eyebrow: 'About Me',
    heading: 'From the edit bay to the content calendar.',
    paragraphs: [
      "I'm a creative producer and content strategist who came up through film and television — and learned to tell stories that land just as well on a 60-foot screen as on a six-second scroll. I recently earned my B.A. in Film & Television from Rider University, with a concentration in production, directing, and post-production.",
      'My work lives where storytelling meets strategy. At FOX Sports, I edited and delivered social-first content that reached millions of viewers across global soccer and motorsports, and helped prep archival footage for broadcast on projects like the 1994 World Cup Reunion. At the New Jersey Chamber of Commerce Foundation, I lead multi-platform social strategy that has driven 462% growth in views and nearly 700% growth in audience interactions.',
      "What ties it together is a producer's instinct: I can hold the creative vision and the operational details at the same time — directing a shoot, cutting the edit, building the content calendar, and standing up the systems (Notion, Zapier, analytics) that keep it all running. I've brought that range to newsrooms, foundations, nonprofits, and small businesses, and I carry the same polish and structure into every team I join.",
    ],
    // Animated metric cards shown in the profile intro.
    stats: [
      { value: '462%', label: 'Instagram view growth at the NJ Chamber Foundation' },
      { value: 'Millions', label: 'Viewers reached through FOX Sports content' },
      { value: '8+', label: 'Production & media roles across film and nonprofit' },
      { value: 'B.A.', label: 'Film & Television — Rider University' },
    ],
    // Quick-fact chips ("at a glance").
    quickFacts: [
      'Based in the NJ / Philadelphia area',
      'Open to creative production & content strategy roles',
      'Film • Social • Brand storytelling',
      'Available immediately',
    ],
    // Recruiter call-to-action at the bottom of the profile page.
    cta: {
      heading: "Let's build something worth watching.",
      subtext:
        "Looking for a producer who can carry a project from concept to final cut — and grow the audience around it? I'd love to hear what you're working on.",
    },
  },
}

export const settingsDefaults = {
  bookingUrl: BOOKING_URL,
  // Empty = use the bundled logo; admin can upload a replacement.
  logo: '',
  email: 'michael@deemcreative.com',
  instagramUrl: 'https://instagram.com/deemcreative',
  linkedinUrl: 'https://linkedin.com/in/michael-deem-jr',
  tagline:
    'Creative strategy, content, and storytelling for brands that want to connect with people.',
  socialAccounts: { ...SOCIAL_ACCOUNTS },
  // Empty = no resume yet; admin uploads one.
  resumeUrl: '',
  resumeLabel: 'Download Resume (PDF)',
  // Downloadable contact card (vCard / .vcf).
  vcard: {
    firstName: 'Michael',
    lastName: 'Deem Jr.',
    title: 'Creative Producer & Content Strategist',
    company: 'Deem Creative',
    phone: '(929) 831-7254',
    email: 'michael@deemcreative.com',
    website: 'https://deemcreative.com',
    address: '',
  },
  // Contact form (on the Contact page). Submissions save to your admin inbox;
  // if a Formspree endpoint is set, they're also emailed to you.
  contact: {
    heading: 'Send a Message',
    subtext: "Fill out the form and I'll get back to you, usually within 24 hours.",
    formspreeEndpoint: '',
  },
}

// Consultation booking emails (sent by the Google Apps Script, which reads
// these published templates from Supabase). {when}, {duration}, {format}, and
// {firstName} are filled in automatically when the email is sent.
export const emailsDefaults = {
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

  // Recruiter / hiring-call emails. Same structure as above, geared toward
  // recruiters and hiring teams. {firstName}, {when}, {duration}, {format} fill
  // in automatically.
  recruiter: {
    confirmation: {
      subject: "You're booked — call with Michael Deem Jr.",
      heading: "You're booked!",
      intro: 'Thanks for scheduling a call with Michael Deem Jr. Looking forward to connecting. Here are the details:',
    },
    reminderDayBefore: {
      subject: 'Reminder: your call with Michael Deem Jr. is tomorrow',
      heading: 'See you tomorrow',
      intro: 'A friendly reminder that your call with Michael Deem Jr. is tomorrow:',
    },
    reminderDayOf: {
      subject: 'Reminder: your call with Michael Deem Jr. is today',
      heading: 'See you today',
      intro: 'A friendly reminder that your call with Michael Deem Jr. is today:',
    },
    zoomLine: 'Michael Deem Jr. will email you the Zoom link before the call.',
    phoneLine: 'Michael Deem Jr. will call the number you provided at the scheduled time.',
  },
}

// Full default content, keyed by section.
export const defaultContent = {
  about: aboutDefaults,
  projects: {
    items: projects,
    categories: CATEGORIES,
    featuredIds: FEATURED_PROJECT_IDS,
  },
  experience: {
    items: experiences,
    featuredProjects,
  },
  services: {
    items: services,
  },
  skills: {
    groups: skillGroups,
    core: coreSkills,
  },
  feed: {
    items: [],
  },
  emails: emailsDefaults,
  settings: settingsDefaults,
}

// The list of editable sections, in admin-nav order.
export const SECTIONS = ['about', 'projects', 'experience', 'services', 'skills', 'feed', 'emails', 'settings']
