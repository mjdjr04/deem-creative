import { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'
import { useBooking } from '../context/BookingContext'

const BOOKING_EMBED_SRC = 'https://calendar.google.com/calendar/appointments/schedules/AcZssZ2KiuMHhBfxKWeIO2PELmmSStH4pWLB3fxjgHZQpbIXewjduez9OlRPTp0WSh_zgoLDl_HCHVGc?gv=true'
const BOOKING_URL = 'https://calendar.app.google/CVSNo86SEqFK16JB7'

export default function BookingModal() {
  const { isOpen, close } = useBooking()

  useEffect(() => {
    if (isOpen) document.body.classList.add('modal-open')
    else document.body.classList.remove('modal-open')
    return () => document.body.classList.remove('modal-open')
  }, [isOpen])

  useEffect(() => {
    const onKey = e => e.key === 'Escape' && close()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [close])

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            key="booking-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50"
            onClick={close}
            aria-hidden="true"
          />

          {/* Modal panel */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
            <motion.div
              key="booking-panel"
              initial={{ opacity: 0, scale: 0.95, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 16 }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
              className="pointer-events-auto w-full max-w-2xl rounded-2xl bg-white border border-brand-border shadow-2xl overflow-hidden"
              role="dialog"
              aria-modal="true"
              aria-label="Book a Consultation"
            >
              {/* Header */}
              <div className="flex items-center justify-between px-5 py-3 bg-brand-dark border-b border-brand-border">
                <div>
                  <h2 className="text-white font-semibold text-base">Book a Consultation</h2>
                  <p className="text-white/50 text-xs">Schedule time with Michael Deem Jr.</p>
                </div>
                <div className="flex items-center gap-3">
                  <a
                    href={BOOKING_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-brand-light text-xs hover:text-white transition-colors"
                  >
                    Open in tab ↗
                  </a>
                  <button
                    onClick={close}
                    className="p-1.5 rounded-lg text-white/60 hover:text-white hover:bg-brand-surface transition-colors"
                    aria-label="Close booking modal"
                  >
                    <X size={18} />
                  </button>
                </div>
              </div>

              {/* Google Calendar Appointment Scheduling embed */}
              <div className="w-full bg-white">
                <iframe
                  src={BOOKING_EMBED_SRC}
                  style={{ border: 0 }}
                  width="100%"
                  height="600"
                  frameBorder="0"
                  title="Book a Consultation with Deem Creative"
                />
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  )
}
