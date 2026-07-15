import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { useConsent } from '../context/ConsentContext'
import { setAnalyticsAllowed, setPresenceEnabled, trackPageview, updatePresencePath } from '../lib/analytics'

// Bridges consent state + router navigation into the analytics core:
//   • flips analytics on/off whenever consent changes
//   • logs a page view on every route change (once allowed)
// The admin panel is never tracked: the owner's own visits would otherwise
// pollute Top Pages and inflate every stat, and show the owner in "Live".
export default function AnalyticsManager() {
  const { analyticsAllowed } = useConsent()
  const location = useLocation()
  const isAdmin = location.pathname.startsWith('/admin')

  // Enable/disable the tracker when consent changes.
  useEffect(() => {
    setAnalyticsAllowed(analyticsAllowed)
  }, [analyticsAllowed])

  // Presence is on only for consented, non-admin views.
  useEffect(() => {
    setPresenceEnabled(analyticsAllowed && !isAdmin)
  }, [analyticsAllowed, isAdmin])

  // Log a page view on navigation (and on the first allowed render), and update
  // the visitor's current page in live presence — public routes only.
  useEffect(() => {
    if (!analyticsAllowed || isAdmin) return
    trackPageview(location.pathname + (location.search || ''))
    updatePresencePath(location.pathname)
  }, [analyticsAllowed, isAdmin, location.pathname, location.search])

  return null
}
