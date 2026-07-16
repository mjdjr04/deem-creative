import { useEffect, useImperativeHandle, useRef } from 'react'
import { TURNSTILE_SITE_KEY } from '../config/turnstile'

// Loads Cloudflare's Turnstile script once, shared across widgets.
let scriptPromise = null
function loadTurnstileScript() {
  if (scriptPromise) return scriptPromise
  scriptPromise = new Promise((resolve, reject) => {
    if (window.turnstile) { resolve(); return }
    const s = document.createElement('script')
    s.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit'
    s.async = true
    s.defer = true
    s.onload = () => resolve()
    s.onerror = reject
    document.head.appendChild(s)
  })
  return scriptPromise
}

/**
 * Renders a Cloudflare Turnstile widget. Calls onToken(token) when solved and
 * onToken('') when it expires or errors. Renders nothing (and requires nothing)
 * when no site key is configured, so the forms work before setup is finished.
 */
export default function Turnstile({ onToken, controlRef }) {
  const containerRef = useRef(null)
  const widgetIdRef = useRef(null)
  // Keep the latest callback without re-rendering the widget.
  const onTokenRef = useRef(onToken)
  useEffect(() => { onTokenRef.current = onToken }, [onToken])

  // Expose reset() so a form can clear the single-use token after each submit.
  useImperativeHandle(controlRef, () => ({
    reset() {
      try {
        if (widgetIdRef.current && window.turnstile) window.turnstile.reset(widgetIdRef.current)
      } catch { /* ignore */ }
      onTokenRef.current?.('')
    },
  }), [])

  useEffect(() => {
    if (!TURNSTILE_SITE_KEY) return
    let cancelled = false

    loadTurnstileScript()
      .then(() => {
        if (cancelled || !window.turnstile || !containerRef.current) return
        widgetIdRef.current = window.turnstile.render(containerRef.current, {
          sitekey: TURNSTILE_SITE_KEY,
          theme: 'dark',
          callback: (token) => onTokenRef.current?.(token),
          'expired-callback': () => onTokenRef.current?.(''),
          'error-callback': () => onTokenRef.current?.(''),
        })
      })
      .catch(() => { /* script blocked — form still works via other gates */ })

    return () => {
      cancelled = true
      try {
        if (widgetIdRef.current && window.turnstile) window.turnstile.remove(widgetIdRef.current)
      } catch { /* ignore */ }
    }
  }, [])

  if (!TURNSTILE_SITE_KEY) return null
  return <div ref={containerRef} className="mt-1" />
}
