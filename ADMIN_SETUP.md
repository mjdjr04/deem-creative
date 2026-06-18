# Deem Creative — Admin Panel Setup

Your site now has a built-in admin panel at **`https://deemcreative.com/#/admin`**
(and `http://localhost:5173/#/admin` while developing). From it you can create,
edit, reorder, and delete everything on the site — projects, about, experience,
services, skills, résumé, and settings — then push it all live with one
**Publish All Changes** button.

The panel saves edits as a **draft** the moment you click *Save draft*, and only
shows them to the public when you click **Publish All Changes** and confirm.

This is a one-time, ~10-minute setup. Follow it once and you're done forever.

---

## What you'll set up

A free **Supabase** project provides three things:
1. A database that stores your content (drafts + published versions).
2. Secure login (your email + password).
3. File storage for media and your résumé.

---

## Step 1 — Create your Supabase project

1. Go to **https://supabase.com** and click **Start your project** → sign in with
   GitHub or email (free).
2. Click **New project**.
   - **Name:** `deem-creative`
   - **Database Password:** generate a strong one and save it somewhere safe
     (you won't need it day-to-day).
   - **Region:** pick the one closest to you (e.g. *East US*).
3. Click **Create new project** and wait ~2 minutes for it to finish setting up.

## Step 2 — Create the database tables

1. In the left sidebar, click **SQL Editor** → **New query**.
2. Open the file **`supabase/schema.sql`** in this project, copy its entire
   contents, and paste it into the editor.
3. Click **Run** (bottom right). You should see *Success. No rows returned.*
   This creates the content table, security rules, the publish function, and
   the media storage bucket. It's safe to run more than once.

## Step 3 — Create your admin login

1. In the left sidebar, click **Authentication** → **Users** → **Add user** →
   **Create new user**.
2. Enter:
   - **Email:** `michaeldeem9@gmail.com`
   - **Password:** `Angrybirds1?*`
   - ✅ Check **Auto Confirm User** (so you can log in immediately).
3. Click **Create user**.

> This email + password is what you'll type to log into `/#/admin`. You can
> change the password anytime from this same Authentication screen. (Tip: also
> turn **off** "Allow new users to sign up" under Authentication → Providers →
> Email, so you're the only possible account.)

## Step 4 — Connect your site to Supabase

1. In Supabase, click **Project Settings** (gear icon) → **API**.
2. Copy two values:
   - **Project URL** (looks like `https://abcd1234.supabase.co`)
   - **anon public** key (a long string under *Project API keys*)
3. In this project, create a file named **`.env.local`** in the root folder
   (next to `package.json`). Use `.env.example` as a template:

   ```
   VITE_SUPABASE_URL=https://YOUR-PROJECT-ref.supabase.co
   VITE_SUPABASE_ANON_KEY=YOUR-ANON-PUBLIC-KEY
   ```

   Paste your two values in. Save the file.

> The anon key is **safe to be public** — it's designed to ship in the website.
> The security rules from Step 2 are what actually protect your data: anyone can
> *read* your published site, but only your logged-in account can *change* it.

## Step 5 — Try it locally

```bash
npm run dev
```

Open **http://localhost:5173/#/admin**, log in with your email + password, and
you'll see the admin panel. The first time you log in, it automatically fills in
all your current site content so you can start editing right away.

Make an edit → **Save draft** → **Publish All Changes** → confirm. Refresh the
public site and your change is live.

## Step 6 — Publish the site itself

Your site deploys with:

```bash
npm run deploy
```

This builds the site (picking up your `.env.local`) and pushes it to GitHub
Pages. After it finishes, the admin panel is live at
`https://deemcreative.com/#/admin`.

---

## How it works day-to-day

| Action | What happens |
| --- | --- |
| **Save draft** (in any editor) | Stores your edit privately. The public site does **not** change yet. |
| **Publish All Changes** (top bar) | Pops up a confirmation, then makes *all* saved drafts live instantly. |
| The amber **"unpublished changes"** dot | Tells you that you have saved drafts that aren't live yet. |
| Uploading media / résumé | Files upload to Supabase storage; the public link is stored automatically. |

You can edit from any device — phone or computer — just go to `/#/admin` and log
in. Changes go live the moment you publish; no redeploy needed.

---

## Contact form — extra setup

The contact form (on your Contact page) saves every submission to a **Messages**
tab in your admin. Two quick steps enable it:

**1. Add the messages table** (one time). In Supabase → SQL Editor → New query,
paste and run:

```sql
create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  name text, email text, message text,
  read boolean not null default false,
  created_at timestamptz not null default now()
);
alter table public.messages enable row level security;
drop policy if exists "anyone can submit a message" on public.messages;
drop policy if exists "authenticated read messages" on public.messages;
drop policy if exists "authenticated update messages" on public.messages;
drop policy if exists "authenticated delete messages" on public.messages;
create policy "anyone can submit a message" on public.messages for insert to anon, authenticated with check (true);
create policy "authenticated read messages" on public.messages for select to authenticated using (true);
create policy "authenticated update messages" on public.messages for update to authenticated using (true) with check (true);
create policy "authenticated delete messages" on public.messages for delete to authenticated using (true);
```

(This is also included in `supabase/schema.sql`.)

**2. (Optional) Get emailed too — Formspree.** To also receive submissions by
email at michael@deemcreative.com:
1. Go to **https://formspree.io**, sign up (free), and create a new form.
2. Set the form's email to `michael@deemcreative.com`.
3. Copy the form's endpoint (looks like `https://formspree.io/f/abcdwxyz`).
4. In your admin → **Settings → Contact Form**, paste it into **Formspree
   endpoint**, then Save and Publish.

Without Formspree, messages still arrive safely in your admin **Messages** tab.

---

## Your shareable profile page

There's a private, full-profile page for job applications at
**`https://deemcreative.com/#/profile`** — it's not in the navbar, so only people
you share the link with will see it. It pulls your About, full experience, skills,
selected projects, embedded resume, and contact card. Fill in **Settings →
Contact Card** and upload a **Resume** to get the most out of it.

---

## Troubleshooting

- **"Admin not connected yet" screen** → your `.env.local` is missing or has a
  typo. Double-check both values and restart `npm run dev`.
- **Can't log in** → confirm the user exists in Supabase → Authentication →
  Users, and that **Auto Confirm** was checked when you created it.
- **Edits don't show on the public site** → make sure you clicked **Publish All
  Changes** (saving a draft alone doesn't publish).
- **Lost the anon key** → it's always in Project Settings → API.
