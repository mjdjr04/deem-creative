import { supabase, isSupabaseConfigured } from './supabase'
import { defaultContent, SECTIONS } from '../data/defaults'
import { BOOKING_API_URL } from '../config/booking'

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

// ---------------------------------------------------------------------------
// Contact form messages
// ---------------------------------------------------------------------------

/** Public: store a contact-form submission. */
export async function submitMessage({ name, email, phone, company, message }) {
  if (!isSupabaseConfigured) throw new Error('Supabase is not configured.')
  const { error } = await supabase
    .from('messages')
    .insert({ name, email, phone, company, message })
  if (error) throw error
}

/** Admin: list all messages, newest first. */
export async function fetchMessages() {
  if (!isSupabaseConfigured) return []
  const { data, error } = await supabase
    .from('messages')
    .select('id, name, email, phone, company, message, read, created_at')
    .order('created_at', { ascending: false })
  if (error) throw error
  return data ?? []
}

/** Admin: mark a message read/unread. */
export async function setMessageRead(id, read) {
  const { error } = await supabase.from('messages').update({ read }).eq('id', id)
  if (error) throw error
}

/** Admin: delete a message. */
export async function deleteMessage(id) {
  const { error } = await supabase.from('messages').delete().eq('id', id)
  if (error) throw error
}

// ---------------------------------------------------------------------------
// Chatbot logs
// ---------------------------------------------------------------------------

/** Public: log one chatbot exchange (best-effort — never throws to the caller). */
export async function logChat({ sessionId, question, answer }) {
  if (!isSupabaseConfigured) return
  try {
    await supabase.from('chats').insert({ session_id: sessionId, question, answer })
  } catch {
    /* logging is best-effort */
  }
}

/** Admin: list chat exchanges, newest first. */
export async function fetchChats() {
  if (!isSupabaseConfigured) return []
  const { data, error } = await supabase
    .from('chats')
    .select('id, session_id, question, answer, created_at')
    .order('created_at', { ascending: false })
  if (error) throw error
  return data ?? []
}

/** Admin: delete one chat row. */
export async function deleteChat(id) {
  const { error } = await supabase.from('chats').delete().eq('id', id)
  if (error) throw error
}

/** Admin: delete every row in a conversation. */
export async function deleteChatSession(sessionId) {
  const { error } = await supabase.from('chats').delete().eq('session_id', sessionId)
  if (error) throw error
}

// ---------------------------------------------------------------------------
// Analytics (first-party page views + events)
// ---------------------------------------------------------------------------

/** Admin: fetch raw analytics rows for the last `days` days (capped). */
export async function fetchAnalytics({ days = 30 } = {}) {
  if (!isSupabaseConfigured) return []
  const since = new Date(Date.now() - days * 86400000).toISOString()
  const { data, error } = await supabase
    .from('analytics_events')
    .select('type, name, path, referrer_host, visitor_id, session_id, device, browser, os, created_at')
    .gte('created_at', since)
    .order('created_at', { ascending: false })
    .limit(20000)
  if (error) throw error
  return data ?? []
}

/**
 * Admin: send a reply email from the owner's address via the Google Apps Script.
 * The script verifies the included Supabase session token before sending, so
 * only a logged-in admin can use it.
 */
export async function sendReply({ to, subject, body }) {
  if (!isSupabaseConfigured) throw new Error('Supabase is not configured.')
  if (!BOOKING_API_URL) throw new Error('Email sender is not configured (booking Apps Script URL missing).')
  const { data } = await supabase.auth.getSession()
  const token = data?.session?.access_token
  if (!token) throw new Error('You appear to be signed out. Please sign in again.')

  // text/plain keeps this a "simple" CORS request, which Apps Script requires.
  const res = await fetch(BOOKING_API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'text/plain;charset=utf-8' },
    body: JSON.stringify({ action: 'reply', to, subject, body, token }),
  })
  const result = await res.json()
  if (!result.ok) throw new Error(result.error || 'Send failed')
}
