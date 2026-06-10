import { motion, useInView } from 'framer-motion'
import { useRef } from 'react'
import { Mail, Calendar } from 'lucide-react'
import { Link } from 'react-router-dom'
import { DeemCreativeMark } from './DeemCreativeMark'
import { useBooking } from '../context/BookingContext'

const navLinks = [
  { label: 'Home',      to: '/' },
  { label: 'Portfolio', to: '/portfolio' },
  { label: 'Services',  to: '/services' },
  { label: 'Contact',   to: '/contact' },
]

const InstagramIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
  </svg>
)
const LinkedInIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
  </svg>
)

const socialLinks = [
  { label: 'Instagram', href: 'https://instagram.com/deemcreative', Icon: InstagramIcon },
  { label: 'LinkedIn',  href: 'https://linkedin.com/in/michael-deem-jr', Icon: LinkedInIcon },
]

export default function Contact() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, amount: 0.2 })
  const { open } = useBooking()

  return (
    <footer className="bg-brand-dark section-divider">
      <div ref={ref} className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-12"
        >
          {/* Column 1: Brand */}
          <div>
            <DeemCreativeMark className="h-10 mb-5" />
            <p className="text-white/60 text-sm leading-relaxed mb-6 max-w-xs">
              Creative strategy, content, and storytelling for brands that want to connect with people.
            </p>
            <div className="flex gap-3">
              {socialLinks.map(link => (
                <a
                  key={link.label}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={link.label}
                  className="w-9 h-9 rounded-lg bg-brand-mid border border-brand-border flex items-center justify-center text-white/60 hover:text-white hover:border-brand-accent transition-colors"
                >
                  <link.Icon />
                </a>
              ))}
              <a
                href="mailto:michael@deemcreative.com"
                aria-label="Email Deem Creative"
                className="w-9 h-9 rounded-lg bg-brand-mid border border-brand-border flex items-center justify-center text-white/60 hover:text-white hover:border-brand-accent transition-colors"
              >
                <Mail size={16} aria-hidden="true" />
              </a>
            </div>
          </div>

          {/* Column 2: Navigation */}
          <div>
            <h3 className="text-white/50 text-xs font-semibold tracking-widest uppercase mb-5">
              Navigation
            </h3>
            <ul className="space-y-3">
              {navLinks.map(link => (
                <li key={link.to}>
                  <Link
                    to={link.to}
                    className="text-white/65 text-sm hover:text-white transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: CTA */}
          <div>
            <h3 className="text-white/50 text-xs font-semibold tracking-widest uppercase mb-5">
              Work Together
            </h3>
            <p className="text-white/60 text-sm leading-relaxed mb-5">
              Ready to build something? Book a consultation and let's talk through your goals.
            </p>
            <motion.button
              onClick={open}
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.97 }}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-brand-navy border border-brand-accent text-white text-sm font-semibold hover:bg-brand-accent transition-colors cursor-pointer"
            >
              <Calendar size={15} /> Book a Consultation
            </motion.button>

            <div className="mt-6 pt-6 border-t border-brand-border">
              <p className="text-white/40 text-xs">michael@deemcreative.com</p>
              <p className="text-white/40 text-xs mt-1">@deemcreative</p>
            </div>
          </div>
        </motion.div>
      </div>

      <div className="border-t border-brand-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-white/35 text-xs">
            © {new Date().getFullYear()} Deem Creative. All rights reserved.
          </p>
          <p className="text-white/35 text-xs">
            Founded by Michael Deem Jr.
          </p>
        </div>
      </div>
    </footer>
  )
}
