import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { useConsent } from '../context/ConsentContext'
import { setAnalyticsAllowed, trackPageview, updatePresencePath } from '../lib/analytics'

// Bridges consent state + router navigation into the analytics core:
//   • flips analytics on/off whenever consent changes
//   • logs a page view on every route change (once allowed)
export default function AnalyticsManager() {
  const { analyticsAllowed } = useConsent()
  const location = useLocation()

  // Enable/disable the tracker when consent changes.
  useEffect(() => {
    setAnalyticsAllowed(analyticsAllowed)
  }, [analyticsAllowed])

  // Log a page view on navigation (and on the first allowed render), and update
  // the visitor's current page in live presence.
  useEffect(() => {
    if (!analyticsAllowed) return
    trackPageview(location.pathname + (location.search || ''))
    updatePresencePath(location.pathname)
  }, [analyticsAllowed, location.pathname, location.search])

  return null
}
