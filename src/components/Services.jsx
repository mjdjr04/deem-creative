import { useState, useRef } from 'react'
import { motion, AnimatePresence, useInView } from 'framer-motion'
import { ChevronDown, Calendar } from 'lucide-react'
import * as Icons from 'lucide-react'
import { useContent } from '../context/ContentContext'
import { useBooking } from '../context/BookingContext'

function ServiceCard({ service }) {
  const [expanded, setExpanded] = useState(false)
  const { open } = useBooking()
  const Icon = Icons[service.iconName] || Icons.Star

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.5 }}
      whileHover={!expanded ? { y: -2 } : {}}
      className={`card-glow rounded-2xl bg-brand-mid border overflow-hidden ${
        expanded ? 'border-brand-accent' : 'border-brand-border hover:border-brand-accent/50'
      }`}
    >
      <button
        onClick={() => setExpanded(v => !v)}
        className="w-full text-left p-6 flex items-start gap-4"
        aria-expanded={expanded}
      >
        <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-brand-navy border border-brand-accent/30 flex items-center justify-center">
          <Icon size={22} className="text-brand-light" aria-hidden="true" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-white font-semibold text-lg mb-2 leading-snug">{service.title}</h3>
          <p className="text-white/65 text-sm leading-relaxed">{service.description}</p>
          <p className="mt-3 text-brand-light/80 text-xs font-medium">
            Best for: {service.bestFor}
          </p>
        </div>
        <ChevronDown
          size={20}
          className={`text-brand-light/60 flex-shrink-0 mt-1 transition-transform duration-200 ${expanded ? 'rotate-180' : ''}`}
          aria-hidden="true"
        />
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div
            key="detail"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <div className="px-6 pb-6 border-t border-brand-border pt-4">
              <h4 className="text-brand-light text-xs font-semibold uppercase tracking-widest mb-3">
                What's Possible
              </h4>
              <ul className="space-y-2 mb-6">
                {service.deliverables.map((d, i) => (
                  <li key={i} className="flex items-start gap-2 text-white/65 text-sm">
                    <span className="flex-shrink-0 flex items-center" style={{paddingTop:"0.2em"}} aria-hidden="true"><svg width="6" height="6" viewBox="0 0 6 6" fill="none"><circle cx="3" cy="3" r="3" fill="#2B5BA8"/></svg></span>
                    {d}
                  </li>
                ))}
              </ul>
              <motion.button
                onClick={e => { e.stopPropagation(); open() }}
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.97 }}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-brand-navy border border-brand-accent text-white text-sm font-semibold hover:bg-brand-accent transition-colors cursor-pointer"
              >
                <Calendar size={15} /> Book a Consultation
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

export default function Services() {
  const services = useContent().services.items
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, amount: 0.1 })

  return (
    <section className="py-24 md:py-32 bg-section-gradient section-divider">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 24 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="mb-14 max-w-2xl"
        >
          <p className="text-brand-light text-sm font-semibold tracking-widest uppercase mb-4">
            Services
          </p>
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Services built for small teams with big stories.
          </h2>
          <p className="text-white/60 text-lg">
            Deem Creative helps startups, small businesses, nonprofits, and community-centered
            organizations build stronger content, clearer digital systems, and more meaningful
            audience connections.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {services.map(service => (
            <ServiceCard key={service.id} service={service} />
          ))}
        </div>
      </div>
    </section>
  )
}
