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
import { EXPERIENCE_SUMMARY, EXPERIENCE_STATS } from './experienceHighlights'
import { services } from './services'
import { skillGroups, coreSkills } from './skills'

// Home hero. The headline is the positioning line (it replaces a job title);
// the accent is the part shown in the gradient. The subheadline opens with
// the one-sentence summary.
export const heroDefaults = {
  headline: 'Filmmaker and builder',
  headlineAccent: 'for organizations that serve their communities.',
  subheadline:
    "I tell stories that make people care, then build the systems that turn that care into action. I'm Michael Deem Jr.: FOX Sports Digital alum, Director of Special Projects at the Boys & Girls Clubs of Cumberland County, and founder of Deem Creative.",
  chips: ['Story Films', 'Social That Grows', 'Events, Start to Finish', 'Small Tools', 'Systems & Workflow'],
}

export const aboutDefaults = {
  eyebrow: 'About',
  heading: 'Creative production meets operational structure.',
  paragraphs: [
    'Deem Creative is a creative strategy and storytelling studio helping startups, small businesses, nonprofits, and community-centered organizations create stronger content, clearer digital systems, and stories that connect with real people.',
    'Founded by Michael Deem Jr., Deem Creative combines experience in film and television, social media strategy, nonprofit communications, post-production, and creative operations — bringing polished execution and organized systems thinking to every engagement.',
  ],
  founderName: 'Michael Deem Jr.',
  founderTitle: 'Filmmaker & Builder · Founder, Deem Creative',
  linkedinUrl: 'https://linkedin.com/in/michael-deem-jr',
  // Empty = use the bundled headshot asset; admin can upload a replacement.
  headshot: '',
  // Profile-page intro — written for hiring managers getting to know Michael.
  // The shared About block above stays studio-focused for the public home page;
  // this block tells the personal/career story on the profile page.
  profile: {
    eyebrow: 'About Me',
    // Shown under Michael's name in the profile header.
    positioning: 'Filmmaker and builder for organizations that serve their communities.',
    heading: 'I tell stories that make people care, then build the systems that turn that care into action.',
    paragraphs: [
      "Small teams don't have a video person, a social person, a web person, and a project manager. They have one person who has to be all four. That's the job I've done everywhere I've worked, and it's the job I love.",
      "I edited for FOX Sports Digital during the World Cup build-up, grew the NJ Chamber of Commerce Foundation's Instagram views 462% from September to December 2025, and helped run the Bonner Foundation's 450-person national leadership institute. Today, as Director of Special Projects at the Boys & Girls Clubs of Cumberland County, I carry the Club's biggest projects from idea to finish line, from the gala's tribute film to the registration site, check-in, and thank-yous around it.",
      "I bring big-team craft and a small-team work ethic. I make the thing, I build the system behind it, and I follow up until it's done. I earned my B.A. in Film & Television with Honors from Rider University.",
    ],
    // Animated metric cards shown in the profile intro.
    stats: [
      { value: '462%', label: 'Instagram view growth, Sep–Dec 2025 · NJ Chamber Foundation' },
      { value: '125+', label: 'Registered guests at a gala I produced end to end' },
      { value: '450+', label: 'Attendees at a national institute I helped run' },
      { value: '5', label: 'In-house tools shipped for a small nonprofit team' },
    ],
    // Quick-fact chips ("at a glance").
    quickFacts: [
      'Based in the NJ / Philadelphia area',
      'Open to creative production & content strategy roles',
      'Film • Social • Brand storytelling',
      'Now: Director of Special Projects, BGCCC',
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
    title: 'Filmmaker & Builder',
    company: 'Deem Creative',
    phone: '(609) 381-1176',
    email: 'michael@deemcreative.com',
    website: 'https://deemcreative.com',
    address: '',
  },
  // Contact form (on the Contact page). Submissions save to your admin inbox
  // and the booking Apps Script emails you a branded alert for each one.
  contact: {
    heading: 'Send a Message',
    subtext: "Fill out the form and I'll get back to you, usually within 24 hours.",
  },
}

// Consultation booking emails (sent by the Google Apps Script, which reads
// these published templates from Supabase). {when}, {duration}, {format}, and
// {firstName} are filled in automatically when the email is sent.
export const emailsDefaults = {
  confirmation: {
    subject: "You're booked — Creative Consult with Deem Creative",
    heading: "You're booked!",
    intro: 'Thanks for scheduling a Creative Consult with Deem Creative. Here are the details:',
  },
  reminderDayBefore: {
    subject: 'Reminder: your Creative Consult with Deem Creative is tomorrow',
    heading: 'See you tomorrow',
    intro: 'A friendly reminder that your Creative Consult with Deem Creative is tomorrow:',
  },
  reminderDayOf: {
    subject: 'Reminder: your Creative Consult with Deem Creative is today',
    heading: 'See you today',
    intro: 'A friendly reminder that your Creative Consult with Deem Creative is today:',
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
  networking: {
    confirmation: {
      subject: "You're booked — networking chat with Michael Deem Jr.",
      heading: "You're booked!",
      intro: 'Thanks for setting up a networking chat with Michael Deem Jr. Looking forward to connecting. Here are the details:',
    },
    reminderDayBefore: {
      subject: 'Reminder: your networking chat with Michael Deem Jr. is tomorrow',
      heading: 'See you tomorrow',
      intro: 'A friendly reminder that your networking chat with Michael Deem Jr. is tomorrow:',
    },
    reminderDayOf: {
      subject: 'Reminder: your networking chat with Michael Deem Jr. is today',
      heading: 'See you today',
      intro: 'A friendly reminder that your networking chat with Michael Deem Jr. is today:',
    },
    zoomLine: 'Michael Deem Jr. will email you the Zoom link before the chat.',
    phoneLine: 'Michael Deem Jr. will call the number you provided at the scheduled time.',
  },
  strategy: {
    confirmation: {
      subject: "You're booked — Deem Creative Strategy Deep-Dive",
      heading: "You're booked!",
      intro: 'Thanks for scheduling a Strategy Deep-Dive with Deem Creative. Here are the details:',
    },
    reminderDayBefore: {
      subject: 'Reminder: your Deem Creative Strategy Deep-Dive is tomorrow',
      heading: 'See you tomorrow',
      intro: 'A friendly reminder that your Strategy Deep-Dive with Deem Creative is tomorrow:',
    },
    reminderDayOf: {
      subject: 'Reminder: your Deem Creative Strategy Deep-Dive is today',
      heading: 'See you today',
      intro: 'A friendly reminder that your Strategy Deep-Dive with Deem Creative is today:',
    },
    zoomLine: 'Michael Deem Jr. will email you the Zoom link before the session.',
    inPersonLine: 'Michael Deem Jr. will confirm the exact location with you (South Jersey area) before the session.',
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
  hero: heroDefaults,
  experience: {
    items: experiences,
    featuredProjects,
    summary: EXPERIENCE_SUMMARY,
    stats: EXPERIENCE_STATS,
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
export const SECTIONS = ['hero', 'about', 'projects', 'experience', 'services', 'skills', 'feed', 'emails', 'settings']
