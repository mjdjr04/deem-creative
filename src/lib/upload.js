import { supabase, MEDIA_BUCKET, isSupabaseConfigured } from './supabase'

const sanitize = (name) =>
  name
    .toLowerCase()
    .replace(/[^a-z0-9.]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80)

/**
 * Upload a File to the public `media` bucket and return its public URL.
 * @param {File} file
 * @param {string} folder - subfolder, e.g. 'projects', 'resume', 'about'
 */
export async function uploadFile(file, folder = 'uploads') {
  if (!isSupabaseConfigured) throw new Error('Supabase is not configured.')
  const path = `${folder}/${Date.now()}-${sanitize(file.name)}`
  const { error } = await supabase.storage
    .from(MEDIA_BUCKET)
    .upload(path, file, { cacheControl: '3600', upsert: false })
  if (error) throw error
  const { data } = supabase.storage.from(MEDIA_BUCKET).getPublicUrl(path)
  return data.publicUrl
}
