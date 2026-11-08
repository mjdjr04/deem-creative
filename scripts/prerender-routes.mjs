// GitHub Pages only returns 200 for paths that exist as files; every other
// deep link falls through to 404.html (which renders the app, but with a 404
// status). Link checkers like LinkedIn's reject 404s, so give each public
// route its own index.html with a matching og:url.
import { readFileSync, writeFileSync, mkdirSync, copyFileSync } from 'node:fs'
import { join } from 'node:path'

const SITE = 'https://deemcreative.com'
const DIST = 'dist'

const ROUTES = {
  portfolio: 'Portfolio | Deem Creative',
  services: {
    title: 'Work With Me | Michael Deem Jr.',
    description: 'Hire me, bring me a project, or put me on set: story films, whole events, social that grows, small tools, and systems.',
  },
  story: {
    title: 'My Story | Michael Deem Jr.',
    description: 'Where I started, what changed, how I work, and where I’m going: four short stories behind the work.',
  },
  'writing/after-the-applause': {
    title: 'After the Applause | Michael Deem Jr.',
    description: 'Event storytelling for small nonprofits, from the film to the follow-up. A whitepaper by Michael Deem Jr.',
  },
  contact: 'Contact | Deem Creative',
  experience: {
    title: 'Experience | Michael Deem Jr.',
    description: "Michael Deem Jr.'s full timeline: every role, internship, and degree, newest first.",
  },
  booking: 'Book a Meeting | Deem Creative',
  'booking/networking': 'Book a Networking Chat | Deem Creative',
  'booking/consultation': 'Book a Creative Consult | Deem Creative',
  'booking/strategy': 'Book a Strategy Session | Deem Creative',
  hire: 'Book a Recruiter Call | Deem Creative',
  privacy: 'Privacy | Deem Creative',
  'work/bgccc-gala': 'The 2026 Gala: From Film to Front Door | Deem Creative',
  'work/bgccc-connect': 'BGCCC Connect | Deem Creative',
  'work/bgccc-letter-builder': 'BGCCC Letter Builder | Deem Creative',
}

const shell = readFileSync(join(DIST, 'index.html'), 'utf8')
copyFileSync(join(DIST, 'index.html'), join(DIST, '404.html'))

for (const [route, entry] of Object.entries(ROUTES)) {
  const { title, description } = typeof entry === 'string' ? { title: entry } : entry
  const url = `${SITE}/${route}/`
  const html = shell
    .replace(/(<meta property="og:url" content=")[^"]*/, `$1${url}`)
    .replace(/(<meta property="og:title" content=")[^"]*/, `$1${title}`)
    .replace(/(<meta name="twitter:title" content=")[^"]*/, `$1${title}`)
    .replace(/<title>[^<]*<\/title>/, `<title>${title}</title>`)
  const page = description
    ? html
        .replace(/(<meta name="description" content=")[^"]*/, `$1${description}`)
        .replace(/(<meta property="og:description" content=")[^"]*/, `$1${description}`)
        .replace(/(<meta name="twitter:description" content=")[^"]*/, `$1${description}`)
    : html
  mkdirSync(join(DIST, route), { recursive: true })
  writeFileSync(join(DIST, route, 'index.html'), page)
}

console.log(`prerendered ${Object.keys(ROUTES).length} routes + 404.html`)
