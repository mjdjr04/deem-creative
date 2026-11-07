import { supabase, isSupabaseConfigured } from './supabase'
import { defaultContent, SECTIONS } from '../data/defaults'

// Deep clone helper so callers never mutate the shared defaults.
const clone = (v) => JSON.parse(JSON.stringify(v))

const isPlainObject = (v) => v && typeof v === 'object' && !Array.isArray(v)

// Fill in any keys that are missing (undefined) from `stored` using `def`,
// recursing into nested objects. Existing values — including empty strings and
// arrays — are always kept. This lets newly-added content fields (e.g. vcard,
// contact, logo) pick up sensible defaults without overwriting real edits, and
// without needing to rewrite the database.
function deepMergeDefaults(def, stored) {
  if (stored === undefined || stored === null) return clone(def)
  if (!isPlainObject(def) || !isPlainObject(stored)) return stored
  const out = { ...stored }
  for (const key of Object.keys(def)) {
    out[key] = deepMergeDefaults(def[key], stored[key])
  }
  return out
}

/**
 * Fetch all PUBLISHED content for the public site.
 * Returns an object keyed by section. Any section missing from Supabase
 * (or if Supabase isn't configured) falls back to the bundled defaults.
 */
export async function fetchPublishedContent() {
  const result = clone(defaultContent)
  if (!isSupabaseConfigured) return result

  const { data, error } = await supabase
    .from('site_content')
    .select('section, published_data')
  if (error || !data) return result

  for (const row of data) {
    if (row.published_data != null && SECTIONS.includes(row.section)) {
      result[row.section] = deepMergeDefaults(defaultContent[row.section], row.published_data)
    }
  }
  return result
}

/**
 * Fetch all rows (draft + published) for the admin panel.
 * Returns { drafts, published } objects keyed by section, defaults-filled.
 */
export async function fetchAdminContent() {
  const drafts = clone(defaultContent)
  const published = clone(defaultContent)
  const present = new Set()
  if (!isSupabaseConfigured) return { drafts, published, present }

  const { data, error } = await supabase
    .from('site_content')
    .select('section, draft_data, published_data')
  if (error) throw error

  for (const row of data ?? []) {
    if (!SECTIONS.includes(row.section)) continue
    present.add(row.section)
    if (row.draft_data != null) drafts[row.section] = deepMergeDefaults(defaultContent[row.section], row.draft_data)
    if (row.published_data != null) published[row.section] = deepMergeDefaults(defaultContent[row.section], row.published_data)
  }
  return { drafts, published, present }
}

/**
 * Ensure every section exists as a row, seeded from bundled defaults.
 * Only inserts sections that are missing — never overwrites existing edits.
 */
export async function seedMissingSections(present) {
  if (!isSupabaseConfigured) return
  const missing = SECTIONS.filter((s) => !present.has(s))
  if (missing.length === 0) return
  const rows = missing.map((section) => ({
    section,
    draft_data: defaultContent[section],
    published_data: defaultContent[section],
  }))
  const { error } = await supabase.from('site_content').upsert(rows)
  if (error) throw error
}

/** Save a section's DRAFT data (admin edits). */
export async function saveDraft(section, data) {
  if (!isSupabaseConfigured) throw new Error('Supabase is not configured.')
  const { error } = await supabase
    .from('site_content')
    .upsert({ section, draft_data: data }, { onConflict: 'section' })
  if (error) throw error
}

/** Promote every draft to published in one atomic server-side call. */
export async function publishAll() {
  if (!isSupabaseConfigured) throw new Error('Supabase is not configured.')
  const { error } = await supabase.rpc('publish_all')
  if (error) throw error
}

/** True if any section's draft differs from its published copy. */
export function hasUnpublishedChanges(drafts, published) {
  return SECTIONS.some(
    (s) => JSON.stringify(drafts[s]) !== JSON.stringify(published[s]),
  )
}
