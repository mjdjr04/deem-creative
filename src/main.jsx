import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

// Back-compat for the old hash-router URLs. The site now uses clean paths
// (/profile instead of /#/profile), but links shared before the switch use
// "#/...". Rewrite those to the clean path BEFORE React mounts so the router
// renders the right page. Runs once on load; new navigation never uses hashes.
if (window.location.hash.startsWith('#/')) {
  const cleanPath = window.location.hash.slice(1) // "#/profile" -> "/profile"
  window.history.replaceState(null, '', cleanPath)
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
