import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import { Mail, Calendar, ExternalLink, MapPin, Phone } from 'lucide-react'
import { useBooking } from '../context/BookingContext'

const LINKEDIN_URL = 'https://linkedin.com/in/michael-deem-jr'
const INSTAGRAM_URL = 'https://instagram.com/deemcreative'

const LinkedInIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
  </svg>
)
const InstagramIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
  </svg>
)

const contactMethods = [
  {
    icon: Mail,
    label: 'Email',
    value: 'michael@deemcreative.com',
    href: 'mailto:michael@deemcreative.com',
    description: 'Best for project inquiries and questions',
  },
  {
    icon: Phone,
    label: 'Phone',
    value: '(929) 831-7254',
    href: 'tel:+19298317254',
    description: 'Available by call or text',
  },
  {
    icon: LinkedInIcon,
    label: 'LinkedIn',
    value: 'linkedin.com/in/michael-deem-jr',
    href: LINKEDIN_URL,
    description: 'Connect professionally',
    external: true,
  },
  {
    icon: InstagramIcon,
    label: 'Instagram',
    value: '@deemcreative',
    href: INSTAGRAM_URL,
    description: 'See what Deem Creative is working on',
    external: true,
  },
  {
    icon: MapPin,
    label: 'Based in',
    value: 'New Jersey / Los Angeles',
    description: 'Available for remote and hybrid engagements nationwide',
  },
]

export default function ContactPage() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, amount: 0.15 })
  const { open } = useBooking()

  return (
    <>
      {/* Page hero */}
      <section
        className="relative pt-24 pb-12 md:pt-32 md:pb-16 overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #060f1e 0%, #0D3472 50%, #060f1e 100%)' }}
      >
        <div
          aria-hidden="true"
          className="absolute top-0 left-0 w-80 h-80 rounded-full blur-3xl opacity-15"
          style={{ background: '#2B5BA8' }}
        />
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <p className="text-brand-light text-sm font-semibold tracking-widest uppercase mb-4">
              Deem Creative
            </p>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Get in Touch
            </h1>
            <p className="text-white/65 text-xl max-w-2xl">
              Ready to start a project, ask a question, or just explore what's possible?
              Reach out — response time is typically within 24 hours.
            </p>
          </motion.div>
        </div>
        <div
          aria-hidden="true"
          className="absolute bottom-0 left-0 right-0 h-16 pointer-events-none"
          style={{ background: 'linear-gradient(to top, #0A1628, transparent)' }}
        />
      </section>

      {/* Contact content */}
      <section className="py-24 md:py-32 bg-brand-dark">
        <div ref={ref} className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 lg:gap-20">

            {/* Left: Contact methods */}
            <motion.div
              initial={{ opacity: 0, x: -24 }}
              animate={isInView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-2xl font-bold text-white mb-8">Contact</h2>
              <div className="space-y-6">
                {contactMethods.map((method, i) => {
                  const Icon = method.icon
                  const inner = (
                    <div
                      className={`card-glow flex items-start gap-4 p-5 rounded-xl bg-brand-mid border border-brand-border ${method.href ? 'hover:border-brand-accent cursor-pointer' : ''}`}
                    >
                      <div className="w-10 h-10 rounded-lg bg-brand-navy border border-brand-accent/30 flex items-center justify-center text-brand-light flex-shrink-0">
                        <Icon size={20} />
                      </div>
                      <div className="min-w-0">
                        <p className="text-white/50 text-xs font-semibold uppercase tracking-widest mb-0.5">{method.label}</p>
                        <p className="text-white font-medium text-sm mb-1">{method.value}</p>
                        <p className="text-white/50 text-xs">{method.description}</p>
                      </div>
                      {method.external && (
                        <ExternalLink size={14} className="text-brand-border flex-shrink-0 mt-1" aria-hidden="true" />
                      )}
                    </div>
                  )
                  return method.href ? (
                    <motion.a
                      key={method.label}
                      href={method.href}
                      target={method.external ? '_blank' : undefined}
                      rel={method.external ? 'noopener noreferrer' : undefined}
                      initial={{ opacity: 0, y: 16 }}
                      animate={isInView ? { opacity: 1, y: 0 } : {}}
                      transition={{ duration: 0.4, delay: 0.1 + i * 0.07 }}
                    >
                      {inner}
                    </motion.a>
                  ) : (
                    <motion.div
                      key={method.label}
                      initial={{ opacity: 0, y: 16 }}
                      animate={isInView ? { opacity: 1, y: 0 } : {}}
                      transition={{ duration: 0.4, delay: 0.1 + i * 0.07 }}
                    >
                      {inner}
                    </motion.div>
                  )
                })}
              </div>
            </motion.div>

            {/* Right: Booking CTA */}
            <motion.div
              initial={{ opacity: 0, x: 24 }}
              animate={isInView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.15 }}
              className="flex flex-col"
            >
              <h2 className="text-2xl font-bold text-white mb-4">Book a Consultation</h2>
              <p className="text-white/65 leading-relaxed mb-6">
                The best way to get started is a 30-minute consultation call. We'll talk through
                your goals, current challenges, audience, and what kind of creative support would
                actually move the needle.
              </p>

              <div className="p-6 rounded-2xl bg-brand-mid border border-brand-border mb-6">
                <h3 className="text-white font-semibold mb-4">What to expect on a consultation call:</h3>
                <ul className="space-y-3">
                  {[
                    'Clarify your goals and what success looks like',
                    'Review your current content, systems, or creative challenges',
                    'Identify what type of support makes the most impact',
                    'Walk away with clear next steps — no pressure',
                  ].map((item, i) => (
                    <li key={i} className="flex items-start gap-2 text-white/65 text-sm">
                      <span className="flex-shrink-0 flex items-center" style={{paddingTop:"0.2em"}} aria-hidden="true"><svg width="6" height="6" viewBox="0 0 6 6" fill="none"><circle cx="3" cy="3" r="3" fill="#2B5BA8"/></svg></span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>

              <motion.button
                onClick={open}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className="flex items-center justify-center gap-3 w-full py-4 px-8 rounded-xl bg-white text-brand-dark font-bold text-base hover:bg-brand-light hover:text-white transition-all shadow-lg cursor-pointer mb-4"
              >
                <Calendar size={20} /> Book a Free Consultation
              </motion.button>

              <p className="text-white/35 text-xs text-center">
                Typically available within 1–3 business days
              </p>
            </motion.div>
          </div>
        </div>
      </section>
    </>
  )
}
