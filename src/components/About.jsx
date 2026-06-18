import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { useContent } from '../context/ContentContext'
import defaultHeadshot from '../assets/headshot.jpeg'

const LinkedInIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
  </svg>
)

export default function About() {
  const about = useContent().about
  const headshot = about.headshot || defaultHeadshot
  const LINKEDIN_URL = about.linkedinUrl
  const paragraphs = (about.paragraphs || []).map((p) => p.trim()).filter(Boolean)
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, amount: 0.2 })

  const fadeLeft = {
    hidden: { opacity: 0, x: -30 },
    show:   { opacity: 1, x: 0, transition: { duration: 0.7, ease: 'easeOut' } },
  }
  const fadeRight = {
    hidden: { opacity: 0, x: 30 },
    show:   { opacity: 1, x: 0, transition: { duration: 0.7, ease: 'easeOut', delay: 0.15 } },
  }

  return (
    <section className="py-24 md:py-32 bg-brand-dark section-divider">
      <div ref={ref} className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-2 gap-12 lg:gap-20 items-center">

          {/* Visual side — headshot */}
          <motion.div
            variants={fadeLeft}
            initial="hidden"
            animate={isInView ? 'show' : 'hidden'}
            className="flex justify-center md:justify-start"
          >
            <div className="relative">
              {/* Outer glow ring */}
              <div
                aria-hidden="true"
                className="absolute -inset-1 rounded-full opacity-40 blur-lg"
                style={{ background: 'linear-gradient(135deg, #2B5BA8, #0D3472)' }}
              />
              {/* Headshot circle */}
              <div className="relative w-64 h-64 md:w-72 md:h-72 lg:w-80 lg:h-80 rounded-full overflow-hidden border-2 border-brand-accent/50">
                <img
                  src={headshot}
                  alt="Michael Deem Jr. — Founder of Deem Creative"
                  className="w-full h-full object-cover object-top"
                />
              </div>
              {/* Decorative accent dot */}
              <div
                aria-hidden="true"
                className="absolute -bottom-4 -right-4 w-20 h-20 rounded-full blur-2xl opacity-30"
                style={{ background: '#2B5BA8' }}
              />
            </div>
          </motion.div>

          {/* Text side */}
          <motion.div
            variants={fadeRight}
            initial="hidden"
            animate={isInView ? 'show' : 'hidden'}
          >
            <p className="text-brand-light text-sm font-semibold tracking-widest uppercase mb-4">
              {about.eyebrow}
            </p>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6 leading-tight">
              {about.heading}
            </h2>
            {paragraphs.map((para, i) => (
              <p
                key={i}
                className={`text-white/70 text-lg leading-relaxed ${
                  i === paragraphs.length - 1 ? 'mb-8' : 'mb-6'
                }`}
              >
                {para}
              </p>
            ))}

            {/* Founder card — links to the full profile page */}
            <Link
              to="/profile"
              className="group flex items-center gap-4 p-4 rounded-xl bg-brand-mid border border-brand-border mb-5 hover:border-brand-accent transition-colors"
            >
              <div className="w-12 h-12 rounded-full overflow-hidden border border-brand-accent/50 flex-shrink-0">
                <img
                  src={headshot}
                  alt={about.founderName}
                  className="w-full h-full object-cover object-top"
                />
              </div>
              <div className="flex-1">
                <p className="text-white font-semibold">{about.founderName}</p>
                <p className="text-brand-light text-sm">{about.founderTitle}</p>
              </div>
              <span className="flex items-center gap-1 text-brand-light/70 text-xs font-medium group-hover:text-white transition-colors">
                View profile
                <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
              </span>
            </Link>

            {/* LinkedIn CTA */}
            <motion.a
              href={LINKEDIN_URL}
              target="_blank"
              rel="noopener noreferrer"
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.97 }}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg border border-brand-accent text-brand-light text-sm font-semibold hover:bg-brand-navy hover:text-white transition-colors"
            >
              <LinkedInIcon /> Connect on LinkedIn
            </motion.a>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
