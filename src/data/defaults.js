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
    title: 'Creative Producer • Film & Digital Content Strategy',
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
