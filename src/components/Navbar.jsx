import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Menu, X } from 'lucide-react'
import { DeemCreativeMark } from './DeemCreativeMark'
import { useBooking } from '../context/BookingContext'

const LINKEDIN_URL = 'https://linkedin.com/in/michael-deem-jr'

const LinkedInIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
  </svg>
)

const navLinks = [
  { label: 'Home',      to: '/' },
  { label: 'Portfolio', to: '/portfolio' },
  { label: 'Services',  to: '/services' },
  { label: 'Contact',   to: '/contact' },
]

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const location = useLocation()
  const { open } = useBooking()

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 50)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    setIsMenuOpen(false)
    window.scrollTo(0, 0)
  }, [location.pathname])

  const isActive = (to) => {
    if (!to) return false
    if (to === '/') return location.pathname === '/'
    return location.pathname.startsWith(to)
  }

  return (
    <header
      className={`sticky top-0 z-40 transition-all duration-300 ${
        isScrolled
          ? 'bg-brand-dark/95 backdrop-blur-sm border-b border-brand-border shadow-lg'
          : 'bg-transparent'
      }`}
    >
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-20">

          {/* Logo — SVG icon only, no text */}
          <Link to="/" aria-label="Deem Creative home" className="flex items-center">
            <DeemCreativeMark className="h-9 md:h-11 w-auto" />
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map(link => (
              <Link
                key={link.to}
                to={link.to}
                className={`px-3 py-2 text-sm font-medium rounded-md transition-all ${
                  isActive(link.to)
                    ? 'text-white bg-brand-navy/50'
                    : 'text-white/70 hover:text-white hover:bg-brand-navy/30'
                }`}
              >
                {link.label}
              </Link>
            ))}

            {/* LinkedIn — highlighted with border */}
            <motion.a
              href={LINKEDIN_URL}
              target="_blank"
              rel="noopener noreferrer"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.96 }}
              className="ml-1 flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-white border border-brand-accent bg-brand-navy/40 hover:bg-brand-accent transition-colors"
              aria-label="Connect on LinkedIn"
            >
              <LinkedInIcon />
              <span>LinkedIn</span>
            </motion.a>

            {/* Book CTA */}
            <motion.button
              onClick={open}
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              className="ml-2 px-5 py-2.5 rounded-lg bg-white text-brand-dark text-sm font-bold hover:bg-brand-light hover:text-white transition-all cursor-pointer"
            >
              Book a Consultation
            </motion.button>
          </div>

          {/* Mobile hamburger */}
          <button
            className="md:hidden p-2 text-white/80 hover:text-white"
            onClick={() => setIsMenuOpen(v => !v)}
            aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={isMenuOpen}
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </nav>

      {/* Mobile menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            key="mobile-menu"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden md:hidden bg-brand-dark/98 border-b border-brand-border"
          >
            <div className="px-4 pb-6 pt-2 flex flex-col gap-1">
              {navLinks.map(link => (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`py-3 text-base font-medium border-b border-brand-border/50 transition-colors ${
                    isActive(link.to) ? 'text-white' : 'text-white/80 hover:text-white'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
              <a
                href={LINKEDIN_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 py-3 text-base font-semibold text-white border-b border-brand-border/50"
              >
                <LinkedInIcon /> Connect on LinkedIn
              </a>
              <button
                onClick={() => { setIsMenuOpen(false); open() }}
                className="mt-4 w-full py-3 rounded-lg bg-white text-brand-dark font-bold hover:bg-brand-light hover:text-white transition-all"
              >
                Book a Consultation
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}
