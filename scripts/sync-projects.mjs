// Sync the portfolio-refresh project records and the "Creative Consult" booking
// email wording into the Supabase drafts.
//
//   node scripts/sync-projects.mjs                  dry run: prints the diff only
//   node scripts/sync-projects.mjs --write          update draft_data (aborts if updated_at moved)
//   node scripts/sync-projects.mjs --write --publish   then call RPC publish_all
//                                                   (refuses if other sections have unpublished
//                                                   drafts, unless --allow-other-drafts)
//
// Reads VITE_SUPABASE_URL and SUPABASE_SECRET_KEY from .env.local. The secret
// key is only ever handed to the Supabase client; it is never printed.

import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import { createClient } from '@supabase/supabase-js'
import { createServer } from 'vite'
import { runSync, StaleWriteError } from './lib/syncRunner.mjs'
import { OLD_EMAIL_DEFAULTS } from './lib/mergeEmails.mjs'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const IDS = ['bgccc-gala', 'bgccc-connect', 'bgccc-letter-builder', 'boys-girls-clubs']

function readEnv(file) {
  const env = {}
  for (const line of readFileSync(file, 'utf8').split('\n')) {
    const m = /^\s*([A-Z0-9_]+)\s*=\s*(.*?)\s*$/.exec(line)
    if (m) env[m[1]] = m[2].replace(/^(['"])(.*)\1$/, '$2')
  }
  return env
}

function makeStore(url, key) {
  const db = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } })
  return {
    async readSections(sections) {
      const { data, error } = await db.from('site_content').select('section, draft_data, updated_at').in('section', sections)
      if (error) throw new Error(`read failed: ${error.message}`)
      return Object.fromEntries((data ?? []).map((r) => [r.section, r]))
    },
    async updateDraft(section, draft, expectedUpdatedAt) {
      // The updated_at filter makes the write itself conditional, closing the
      // gap between the re-check and the update.
      const { data, error } = await db
        .from('site_content')
        .update({ draft_data: draft })
        .eq('section', section)
        .eq('updated_at', expectedUpdatedAt)
        .select('section')
      if (error) throw new Error(`update ${section} failed: ${error.message}`)
      if (!data?.length) throw new StaleWriteError(section, expectedUpdatedAt, '(changed during write)')
    },
    async listSections() {
      const { data, error } = await db.from('site_content').select('section, draft_data, published_data')
      if (error) throw new Error(`read failed: ${error.message}`)
      return data ?? []
    },
    async publishAll() {
      const { error } = await db.rpc('publish_all')
      if (error) throw new Error(`publish_all failed: ${error.message}`)
    },
  }
}

const args = new Set(process.argv.slice(2))
const unknown = [...args].filter((a) => a !== '--write' && a !== '--publish' && a !== '--allow-other-drafts')
if (unknown.length) {
  console.error(`Unknown option: ${unknown.join(' ')}`)
  process.exit(2)
}

const env = readEnv(join(ROOT, '.env.local'))
const url = env.VITE_SUPABASE_URL
const key = env.SUPABASE_SECRET_KEY
if (!url || !key) {
  console.error('Missing VITE_SUPABASE_URL or SUPABASE_SECRET_KEY in .env.local')
  process.exit(1)
}

// src/data uses extensionless imports, so load it through Vite rather than bare Node.
const vite = await createServer({ root: ROOT, logLevel: 'silent', appType: 'custom', server: { middlewareMode: true } })
try {
  const { projects } = await vite.ssrLoadModule('/src/data/projects.js')
  const { emailsDefaults } = await vite.ssrLoadModule('/src/data/defaults.js')
  await runSync({
    store: makeStore(url, key),
    projectDefaults: projects,
    ids: IDS,
    emailsOld: OLD_EMAIL_DEFAULTS,
    emailsNew: emailsDefaults,
    write: args.has('--write'),
    publish: args.has('--publish'),
    allowOtherDrafts: args.has('--allow-other-drafts'),
  })
} catch (err) {
  console.error(`${err.name === 'Error' ? 'Error' : err.name}: ${err.message}`)
  process.exitCode = 1
} finally {
  await vite.close()
}
