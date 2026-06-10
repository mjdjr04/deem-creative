# Deem Creative — Portfolio & Services Website

A modern, responsive portfolio and creative consultancy website for **Deem Creative**, founded by Michael Deem Jr.

**Live URL (after deployment):** `https://[your-github-username].github.io/deem-creative/`

---

## Tech Stack

- **React 19** + **Vite 8**
- **Tailwind CSS v3** — utility-first styling with brand color tokens
- **Framer Motion** — scroll reveals, portfolio filter, modal, hero animations
- **Lucide React** — icons
- **@fontsource/inter** — self-hosted Inter typography
- **gh-pages** — GitHub Pages deployment

---

## Running Locally

**Prerequisites:** Node.js 18+

```bash
npm install
npm run dev
```

Open `http://localhost:5173/deem-creative/`

---

## Updating Content

All content is in `src/data/`. No component changes needed for most updates.

### Projects — `src/data/projects.js`

Add a project to the `projects` array. To feature it, add its `id` to `FEATURED_PROJECT_IDS`. Replace placeholder media by setting `mediaUrl` and following the `TODO` comments in `ProjectCard.jsx` and `ProjectModal.jsx`.

### Services — `src/data/services.js`

Edit any entry. `iconName` maps to a [Lucide icon name](https://lucide.dev/icons/).

### Skills — `src/data/skills.js`

Edit `skillGroups` (tool categories) or `coreSkills` (competency tags).

### Experience — `src/data/experience.js`

Edit `experiences`. Type: `'current'`, `'past'`, or `'education'`.

### Consultation Booking Link

Search for `BOOKING_URL` in `src/data/projects.js` and `src/data/services.js`.

---

## Adding Real Project Media

1. Add image to `public/assets/projects/project-name.jpg`
2. In `src/data/projects.js`, set `mediaUrl: '/deem-creative/assets/projects/project-name.jpg'`
3. In `ProjectCard.jsx` and `ProjectModal.jsx`, find the `TODO` comment and uncomment the `<img>` tag

---

## Social & Contact Links

In `src/components/Contact.jsx`, search for `TODO` comments to update:
- LinkedIn URL
- GitHub URL
- Business email address

---

## Deploying to GitHub Pages

### One-time setup

1. Create GitHub repo named `deem-creative`
2. Update `"homepage"` in `package.json` with your GitHub username
3. Confirm `base: '/deem-creative/'` in `vite.config.js` matches your repo name
4. Push code, then run `npm run deploy`
5. In GitHub repo Settings → Pages → Source: `gh-pages` branch

### Every subsequent update

```bash
npm run deploy
```

---

## Project Structure

```
src/
├── assets/logo/              — Deem Creative logo
├── components/               — All UI components
│   ├── Navbar.jsx            — Sticky nav with mobile hamburger
│   ├── Hero.jsx              — Cinematic opening section
│   ├── About.jsx             — Studio + founder introduction
│   ├── PortfolioExplorer.jsx — Category tabs + filtered project grid
│   ├── ProjectCard.jsx       — Reusable project card
│   ├── ProjectModal.jsx      — Case study modal
│   ├── FeaturedWork.jsx      — Curated project grid
│   ├── Experience.jsx        — Work history timeline
│   ├── Skills.jsx            — Tools and skill badges
│   ├── Services.jsx          — Expandable service cards
│   ├── Process.jsx           — 5-step visual flow
│   ├── ConsultCTA.jsx        — Consultation call-to-action
│   ├── Contact.jsx           — Footer + social links
│   └── FloatingCTA.jsx       — Sticky floating booking button
└── data/                     — All editable content
    ├── projects.js
    ├── services.js
    ├── skills.js
    └── experience.js
```
