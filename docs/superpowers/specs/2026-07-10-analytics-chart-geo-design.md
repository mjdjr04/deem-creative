# Analytics: interactive traffic chart + first-party visitor location

**Date:** 2026-07-10
**Scope:** Enhance the existing admin Analytics tab (`/#/admin` → Analytics). No new
routes. No changes to the public marketing pages beyond a privacy-policy note.

## Goals

1. Replace the current static page-views bar chart with an **interactive** time-series
   chart that plots **page views** and **interactions** (high-intent events) together,
   with an **auto-scaling y-axis** that always fits actual traffic in the selected range.
2. Capture **first-party visitor location** (country + city/region) and surface it in the
   admin dashboard, since the site is static (GitHub Pages) and has no server to read IPs.

## 1. Interactive traffic chart

- New dependency-free component `TrafficChart` (pure SVG + React state), living in
  `AnalyticsEditor.jsx` (or a co-located file if it grows past ~120 lines).
- **Two series**, each toggleable via a legend chip: `Page views` (type `pageview`) and
  `Interactions` (type `event`), bucketed per day over the selected window.
- **Auto-scaling y-axis**: `max = Math.max(1, ...visibleSeries.flatMap(counts))`. Y scale
  and gridline labels derive from `max`, so the chart re-scales as traffic volume changes
  and when series are toggled. A few rounded y-axis tick labels are drawn.
- **Interactivity**: on pointer move over the plot, snap to the nearest day index; draw a
  vertical crosshair and a tooltip showing the day's date and each visible series' count.
  Pointer leave hides the crosshair/tooltip. Touch falls back to the static rendering.
- **Reacts to existing controls**: the 7/30/90-day range selector and the Refresh button
  already drive `days`/`rows`; the chart just consumes the derived daily buckets.
- Rendering approach: line/area per series over an SVG `viewBox`, responsive via
  `preserveAspectRatio`. Colors reuse `brand-accent` (page views) and a second brand tone
  (interactions) so it reads in the dark admin theme.

## 2. First-party visitor location

- **Schema** (`supabase/schema.sql` + idempotent migration `supabase/analytics-geo.sql`):
  `country` already exists. Add `city text` and `region text` as nullable columns via
  `alter table public.analytics_events add column if not exists …`. No RLS change (the
  existing anon-insert / authenticated-read policies already cover the new columns).
- **Capture** (`src/lib/analytics.js`):
  - One lookup **per session**, cached in `sessionStorage` under a versioned key, so
    repeated pageviews in a visit reuse the same result (no per-event API calls).
  - Free, no-key endpoint `https://ipwho.is/` → `{ country, city, region }`. Wrapped in a
    short timeout + try/catch. On any failure the geo fields are left `null` and events
    still log normally (**graceful degradation**; never block or throw in tracking).
  - Only runs when analytics consent is granted (tracking is already consent-gated) and is
    cookieless. Country/city/region are attached to every logged event (pageview + event).
- **Read** (`src/lib/contentApi.js`): `fetchAnalytics` adds `country, city, region` to its
  `select`.
- **Display** (`AnalyticsEditor.jsx`): two new `BarList`s — **Top countries** (by `country`)
  and **Top cities** (by `city`) — reusing the existing component and `countBy` helper.
- **Privacy** (`src/pages/PrivacyPage.jsx`): add a sentence noting approximate location
  (country/city) is collected via IP for first-party analytics, only after consent.

## Non-goals / notes

- Historical rows won't be back-filled with location; the location breakdowns populate
  going forward as consented visitors arrive.
- No map visualization in v1 — ranked lists only (YAGNI; can add later).
- City/region granularity is approximate (IP-based), which the privacy note states.

## Verification

- `npm run build` succeeds.
- Load the admin locally; insert a handful of synthetic `analytics_events` rows (varied
  days, types, countries/cities) and confirm: the chart auto-scales, series toggle,
  hover tooltip/crosshair work, and Top countries/cities lists populate.
- Confirm graceful degradation: with the geo endpoint unreachable, events still log.
