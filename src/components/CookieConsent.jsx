import { AnimatePresence, motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { Cookie, X } from 'lucide-react'
import { useConsent } from '../context/ConsentContext'

// Bottom-of-screen consent banner. Shows until the visitor chooses, and can be
// re-opened later from the footer ("Cookie settings"). Declining keeps all
// non-essential analytics (custom, GA4, Cloudflare) off.
export default function CookieConsent() {
  const { showBanner, acceptAll, declineNonEssential, decided, closeBanner } = useConsent()

  return (
    <AnimatePresence>
      {showBanner && (
        <motion.div
          role="dialog"
          aria-modal="false"
          aria-label="Cookie consent"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 40 }}
          transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          className="fixed inset-x-0 bottom-0 z-[60] px-4 pb-4 sm:px-6 sm:pb-6"
        >
          <div className="max-w-3xl mx-auto rounded-2xl bg-brand-mid/95 backdrop-blur border border-brand-border shadow-2xl p-5 sm:p-6">
            <div className="flex items-start gap-4">
              <span className="hidden sm:flex w-10 h-10 rounded-xl bg-brand-navy border border-brand-accent/40 items-center justify-center text-brand-light flex-shrink-0">
                <Cookie size={20} aria-hidden="true" />
              </span>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-3">
                  <h2 className="text-white font-semibold text-base mb-1">We value your privacy</h2>
                  {decided && (
                    <button
                      onClick={closeBanner}
                      aria-label="Close cookie settings"
                      className="text-white/55 hover:text-white p-1 -mt-1 -mr-1"
                    >
                      <X size={18} />
                    </button>
                  )}
                </div>
                <p className="text-white/65 text-sm leading-relaxed">
                  We use essential cookies to make this site work. With your
                  permission, we also use analytics (our own, Google Analytics,
                  and Cloudflare) to understand how visitors use the site. You can
                  decline non-essential cookies — the site works either way. See our{' '}
                  <Link to="/privacy" onClick={closeBanner} className="text-brand-light underline hover:text-white">
                    Privacy &amp; Cookie Policy
                  </Link>.
                </p>

                <div className="flex flex-col sm:flex-row gap-3 mt-5">
                  <button
                    onClick={acceptAll}
                    className="order-1 sm:order-2 px-5 py-2.5 rounded-lg bg-white text-brand-dark text-sm font-bold hover:bg-brand-light hover:text-white transition-colors"
                  >
                    Accept all
                  </button>
                  <button
                    onClick={declineNonEssential}
                    className="order-2 sm:order-1 px-5 py-2.5 rounded-lg border border-brand-border text-white/80 text-sm font-semibold hover:border-brand-accent hover:text-white transition-colors"
                  >
                    Decline non-essential
                  </button>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
