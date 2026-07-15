# Blocking abusive visitors

There are two layers of blocking available for the site. Use the in-app block for
convenience; use Cloudflare when you need a block someone can't trivially evade.

## 1. In-app soft block (built in)

In the admin **Visitors** tab, expand any visit or visitor and click
**"Block this visitor."** That visitor's browser can no longer submit the
contact form (the submission is silently ignored). Unblock the same way.

**What it does well:** instantly stops a specific repeat spammer with one click,
no infrastructure.

**Its limit:** it targets an anonymous per-browser id. A determined person can
clear their browser data, use incognito, or switch browsers/devices to get a new
id and bypass it. For that, use Cloudflare.

> Requires the one-time migration `supabase/blocked-visitors.sql` (run it in the
> Supabase SQL editor). Until then, the Block buttons appear but have no effect.

## 2. Cloudflare hard block (network level)

This blocks by IP / country / other signals **before** the request ever reaches
the site — the real, hard-to-bypass block. It only works if your domain's DNS is
proxied through Cloudflare (the orange-cloud icon), which it is if you use
Cloudflare Web Analytics on a Cloudflare-managed domain.

### Block a specific IP address

1. First, find the IP. Cloudflare logs it, but the simplest path: in the admin
   Visitors tab, note the visitor's **city/country** and rough visit time, then
   cross-reference in Cloudflare.
2. Go to **dash.cloudflare.com → your domain → Security → WAF → Tools**
   (older UIs: **Security → Tools → IP Access Rules**).
3. Under **IP Access Rules**, enter the IP address, set the action to **Block**,
   scope **This website**, and add a note. Save.

That IP now gets a Cloudflare block page instead of your site.

### Block by country or add a challenge

- **Security → WAF → Custom rules → Create rule.**
- Example — challenge everyone outside the US:
  `(ip.geoip.country ne "US")` → action **Managed Challenge**.
- Example — block a country entirely:
  `(ip.geoip.country eq "XX")` → action **Block**.

### Stop form spam at the edge (recommended long-term)

Cloudflare's **Turnstile** (free) is the robust anti-bot for the contact form —
a privacy-friendly CAPTCHA alternative with no puzzles. Adding it is a separate
task: it needs a Turnstile site key + secret and a small serverless verify step
(a Supabase Edge Function or the existing Apps Script). Ask and I'll wire it up.

### Rate limiting

**Security → WAF → Rate limiting rules** can cap requests per IP to the contact
path — another edge-level defense that needs no code.
