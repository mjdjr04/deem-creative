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
  services: 'Services | Deem Creative',
  contact: 'Contact | Deem Creative',
  booking: 'Book a Meeting | Deem Creative',
  'booking/networking': 'Book a Networking Chat | Deem Creative',
  'booking/consultation': 'Book a Consultation | Deem Creative',
  'booking/strategy': 'Book a Strategy Session | Deem Creative',
  hire: 'Book a Recruiter Call | Deem Creative',
  privacy: 'Privacy | Deem Creative',
}

const shell = readFileSync(join(DIST, 'index.html'), 'utf8')
copyFileSync(join(DIST, 'index.html'), join(DIST, '404.html'))

for (const [route, title] of Object.entries(ROUTES)) {
  const url = `${SITE}/${route}/`
  const html = shell
    .replace(/(<meta property="og:url" content=")[^"]*/, `$1${url}`)
    .replace(/(<meta property="og:title" content=")[^"]*/, `$1${title}`)
    .replace(/(<meta name="twitter:title" content=")[^"]*/, `$1${title}`)
    .replace(/<title>[^<]*<\/title>/, `<title>${title}</title>`)
  mkdirSync(join(DIST, route), { recursive: true })
  writeFileSync(join(DIST, route, 'index.html'), html)
}

console.log(`prerendered ${Object.keys(ROUTES).length} routes + 404.html`)
