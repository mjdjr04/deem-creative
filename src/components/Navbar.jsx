import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Menu, X, ChevronDown } from 'lucide-react'
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
  {
    label: 'Portfolio',
    to: '/portfolio',
    children: [
      { label: 'Projects',     to: '/portfolio?section=projects' },
      { label: 'Social Media', to: '/portfolio?section=social' },
    ],
  },
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
    window.scrollTo(0, 0)
  }, [location.pathname])

  const closeMenu = () => setIsMenuOpen(false)

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
            {navLinks.map(link => {
              const linkClass = `relative px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                isActive(link.to)
                  ? 'text-white'
                  : 'text-white/70 hover:text-white hover:bg-brand-navy/30'
              }`
              const underline = isActive(link.to) && (
                <motion.span
                  layoutId="nav-active-underline"
                  transition={{ type: 'spring', stiffness: 380, damping: 32 }}
                  className="absolute inset-x-2.5 bottom-0 h-0.5 rounded-full bg-brand-light"
                  aria-hidden="true"
                />
              )

              if (link.children) {
                return (
                  <div key={link.to} className="relative group">
                    <Link to={link.to} className={linkClass}>
                      <span className="inline-flex items-center gap-1">
                        {link.label}
                        <ChevronDown size={14} className="transition-transform group-hover:rotate-180" />
                      </span>
                      {underline}
                    </Link>
                    {/* Dropdown — pt-2 bridges the hover gap to the panel */}
                    <div className="absolute left-0 top-full pt-2 opacity-0 invisible translate-y-1 transition-all duration-150 group-hover:opacity-100 group-hover:visible group-hover:translate-y-0 group-focus-within:opacity-100 group-focus-within:visible group-focus-within:translate-y-0">
                      <div className="min-w-[190px] rounded-xl bg-brand-dark/95 backdrop-blur-sm border border-brand-border shadow-xl p-1.5">
                        {link.children.map(child => (
                          <Link
                            key={child.to}
                            to={child.to}
                            className="block px-3 py-2 rounded-lg text-sm text-white/75 hover:text-white hover:bg-brand-navy/40 transition-colors"
                          >
                            {child.label}
                          </Link>
                        ))}
                      </div>
                    </div>
                  </div>
                )
              }

              return (
                <Link
                  key={link.to}
                  to={link.to}
                  aria-current={isActive(link.to) ? 'page' : undefined}
                  className={linkClass}
                >
                  {link.label}
                  {underline}
                </Link>
              )
            })}

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
                <div key={link.to} className="border-b border-brand-border/50">
                  <Link
                    to={link.to}
                    onClick={closeMenu}
                    aria-current={isActive(link.to) ? 'page' : undefined}
                    className={`block py-3 text-base font-medium transition-colors ${
                      isActive(link.to) ? 'text-white' : 'text-white/80 hover:text-white'
                    }`}
                  >
                    {link.label}
                  </Link>
                  {link.children && (
                    <div className="ml-3 mb-2 flex flex-col border-l border-brand-border/50">
                      {link.children.map(child => (
                        <Link
                          key={child.to}
                          to={child.to}
                          onClick={closeMenu}
                          className="py-2 pl-4 text-sm text-white/60 hover:text-white transition-colors"
                        >
                          {child.label}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
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
