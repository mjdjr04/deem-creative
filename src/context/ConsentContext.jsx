import { createContext, useContext, useCallback, useEffect, useState } from 'react'

// Visitor cookie/storage consent. Two categories:
//   • essential  — always on (needed for the site to work; no tracking)
//   • analytics  — opt-in (custom Supabase analytics, GA4, Cloudflare)
//
// The choice is stored in localStorage so it persists and so we never re-prompt
// someone who already decided. Until a choice is made, no analytics layer runs.

const STORAGE_KEY = 'dc_consent_v1'
const ConsentContext = createContext(null)

function readStored() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw)
    if (parsed && typeof parsed.analytics === 'boolean') return parsed
  } catch {
    /* ignore malformed / unavailable storage */
  }
  return null
}

export function ConsentProvider({ children }) {
  // `null` = no decision yet (show the banner).
  const [consent, setConsentState] = useState(() => readStored())
  // Lets the visitor re-open the banner from the footer to change their choice.
  const [bannerOpen, setBannerOpen] = useState(false)

  const persist = useCallback((next) => {
    setConsentState(next)
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
    } catch {
      /* storage may be unavailable (private mode) — keep in-memory only */
    }
  }, [])

  const acceptAll = useCallback(() => {
    persist({ analytics: true, decidedAt: new Date().toISOString() })
    setBannerOpen(false)
  }, [persist])

  const declineNonEssential = useCallback(() => {
    persist({ analytics: false, decidedAt: new Date().toISOString() })
    setBannerOpen(false)
  }, [persist])

  const openBanner = useCallback(() => setBannerOpen(true), [])
  const closeBanner = useCallback(() => setBannerOpen(false), [])

  // Broadcast consent changes so the analytics loaders can react (e.g. start
  // GA4 the moment someone accepts, without a page reload).
  useEffect(() => {
    window.dispatchEvent(new CustomEvent('dc:consent', { detail: consent }))
  }, [consent])

  const value = {
    consent,
    analyticsAllowed: consent?.analytics === true,
    decided: consent !== null,
    showBanner: consent === null || bannerOpen,
    acceptAll,
    declineNonEssential,
    openBanner,
    closeBanner,
  }

  return <ConsentContext.Provider value={value}>{children}</ConsentContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export function useConsent() {
  const ctx = useContext(ConsentContext)
  if (!ctx) throw new Error('useConsent must be used within ConsentProvider')
  return ctx
}
