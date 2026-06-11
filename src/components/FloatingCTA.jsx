import { useState, useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Calendar } from 'lucide-react'
import { useBooking } from '../context/BookingContext'

export default function FloatingCTA() {
  const [isVisible, setIsVisible] = useState(false)
  const { open } = useBooking()
  const location = useLocation()
  const onBookingPage = location.pathname === '/booking'

  useEffect(() => {
    const onScroll = () => {
      setIsVisible(window.scrollY > window.innerHeight * 0.8)
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <AnimatePresence>
      {isVisible && !onBookingPage && (
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.9 }}
          transition={{ duration: 0.2 }}
          className="fixed bottom-6 right-6 z-30"
        >
          <motion.button
            onClick={open}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center gap-2 px-4 py-3 rounded-full bg-brand-navy border border-brand-accent text-white text-sm font-semibold shadow-2xl hover:bg-brand-accent transition-colors cursor-pointer"
            aria-label="Book a consultation with Deem Creative"
          >
            <Calendar size={16} aria-hidden="true" />
            <span className="hidden sm:inline">Book a Consultation</span>
            <span className="sm:hidden">Book</span>
          </motion.button>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
