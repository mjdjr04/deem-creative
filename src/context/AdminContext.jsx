import { createContext, useContext, useCallback, useEffect, useRef, useState } from 'react'
import { supabase, isSupabaseConfigured } from '../lib/supabase'
import {
  fetchAdminContent,
  seedMissingSections,
  saveDraft,
  publishAll as publishAllApi,
  hasUnpublishedChanges,
} from '../lib/contentApi'
import { SECTIONS } from '../data/defaults'

const AdminContext = createContext(null)

export function AdminProvider({ children }) {
  const [session, setSession] = useState(null)
  // When Supabase isn't configured there's no auth to wait for.
  const [authReady, setAuthReady] = useState(() => !isSupabaseConfigured)

  const [drafts, setDrafts] = useState(null)
  const [published, setPublished] = useState(null)
  const [loading, setLoading] = useState(false)
  const [loadError, setLoadError] = useState(null)
  const loadStartedRef = useRef(false)

  // --- Content lifecycle (only once authenticated) ----------------------
  const loadContent = useCallback(async () => {
    if (loadStartedRef.current) return
    loadStartedRef.current = true
    setLoading(true)
    setLoadError(null)
    try {
      const { drafts: d, published: p, present } = await fetchAdminContent()
      // Seed any sections that don't exist yet, then re-read so state is exact.
      if (present.size < SECTIONS.length) {
        await seedMissingSections(present)
        const reread = await fetchAdminContent()
        setDrafts(reread.drafts)
        setPublished(reread.published)
      } else {
        setDrafts(d)
        setPublished(p)
      }
    } catch (e) {
      setLoadError(e.message || String(e))
      loadStartedRef.current = false // allow retry
    } finally {
      setLoading(false)
    }
  }, [])

  // --- Auth lifecycle ---------------------------------------------------
  // State is set from async callbacks (resolved promise / auth events), so it
  // never runs synchronously during the effect body.
  useEffect(() => {
    if (!isSupabaseConfigured) return
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session)
      setAuthReady(true)
      if (data.session) loadContent()
    })
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => {
      setSession(s)
      if (s) loadContent()
    })
    return () => sub.subscription.unsubscribe()
  }, [loadContent])

  const signIn = useCallback(async (email, password) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw error
  }, [])

  const signOut = useCallback(async () => {
    await supabase.auth.signOut()
    loadStartedRef.current = false
    setDrafts(null)
    setPublished(null)
  }, [])

  // --- Editing ----------------------------------------------------------
  // Save a section's draft to Supabase and update local state.
  const saveSection = useCallback(async (section, data) => {
    await saveDraft(section, data)
    setDrafts((prev) => ({ ...prev, [section]: data }))
  }, [])

  const publishAll = useCallback(async () => {
    await publishAllApi()
    setPublished(drafts) // drafts are now live
  }, [drafts])

  const dirty =
    drafts && published ? hasUnpublishedChanges(drafts, published) : false

  return (
    <AdminContext.Provider
      value={{
        configured: isSupabaseConfigured,
        session,
        authReady,
        signIn,
        signOut,
        drafts,
        published,
        loading,
        loadError,
        reload: loadContent,
        saveSection,
        publishAll,
        dirty,
      }}
    >
      {children}
    </AdminContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAdmin() {
  const ctx = useContext(AdminContext)
  if (!ctx) throw new Error('useAdmin must be used within AdminProvider')
  return ctx
}
