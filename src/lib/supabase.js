import { createClient } from '@supabase/supabase-js'

// Vite exposes env vars prefixed with VITE_ to the client bundle.
// The anon key is SAFE to ship publicly — Row Level Security (RLS) in
// Supabase is what actually protects writes. See ADMIN_SETUP.md.
const url = import.meta.env.VITE_SUPABASE_URL
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// The site must keep working even before Supabase is configured (it falls
// back to the bundled default content in src/data/*). So we only create the
// client when both values are present.
export const isSupabaseConfigured = Boolean(url && anonKey)

export const supabase = isSupabaseConfigured
  ? createClient(url, anonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
    })
  : null

// Name of the public Storage bucket used for media + resume uploads.
export const MEDIA_BUCKET = 'media'

/**
 * Returns a public URL for a stored file path, or the value unchanged if it is
 * already an absolute URL / local asset path.
 */
export function publicUrl(pathOrUrl) {
  if (!pathOrUrl) return pathOrUrl
  if (/^(https?:)?\/\//.test(pathOrUrl) || pathOrUrl.startsWith('/')) {
    return pathOrUrl
  }
  if (!supabase) return pathOrUrl
  const { data } = supabase.storage.from(MEDIA_BUCKET).getPublicUrl(pathOrUrl)
  return data?.publicUrl ?? pathOrUrl
}
