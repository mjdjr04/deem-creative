import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import { ExternalLink, Paperclip } from 'lucide-react'
import { useContent } from '../context/ContentContext'

const typeLabel = {
  current:   { label: 'Current',   color: 'text-green-400 border-green-400/30 bg-green-400/10' },
  past:      { label: 'Past',      color: 'text-brand-light border-brand-border bg-brand-surface' },
  education: { label: 'Education', color: 'text-purple-400 border-purple-400/30 bg-purple-400/10' },
}

function ExperienceCard({ exp, index }) {
  const badge = typeLabel[exp.type] || typeLabel.past
  const allHighlights = exp.highlights || []

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.5, delay: index * 0.07 }}
      className="relative pl-12"
    >
      {/* Dot */}
      <div
        aria-hidden="true"
        className="absolute left-0 top-1.5 w-8 h-8 rounded-full bg-brand-mid border-2 border-brand-navy flex items-center justify-center"
      >
        <div className="w-2.5 h-2.5 rounded-full bg-brand-accent" />
      </div>

      {/* Card */}
      <div className="rounded-xl bg-brand-mid border border-brand-border overflow-hidden hover:border-brand-accent/50 transition-colors">
        <div className="p-5">
          <div className="flex flex-wrap items-center gap-3 mb-2">
            <span className={`px-2.5 py-0.5 rounded-full border text-xs font-medium ${badge.color}`}>
              {badge.label}
            </span>
            {exp.orgType && (
              <span className="text-white/30 text-xs">{exp.orgType}</span>
            )}
            <span className="text-white/40 text-xs">{exp.startDate} — {exp.endDate}</span>
          </div>
          <h3 className="text-white font-semibold text-lg mb-0.5">{exp.role}</h3>
          <p className="text-brand-light text-sm font-medium mb-0.5">{exp.organization}</p>
          {exp.location && (
            <p className="text-white/35 text-xs mb-3">{exp.location}</p>
          )}

          {/* Description — plain text, no bullet */}
          {exp.description && (
            <p className="text-white/55 text-sm mb-2">{exp.description}</p>
          )}

          {/* Bullet points — dots vertically centered with their text */}
          {allHighlights.length > 0 && (
            <ul className="space-y-1.5">
              {allHighlights.map((h, j) => (
                <li key={j} className="flex items-center gap-2 text-white/55 text-sm">
                  <span className="flex-shrink-0 flex items-center" aria-hidden="true"><svg width="6" height="6" viewBox="0 0 6 6" fill="none"><circle cx="3" cy="3" r="3" fill="#2B5BA8"/></svg></span>
                  {h}
                </li>
              ))}
            </ul>
          )}

          {/* Photo */}
          {exp.photo && (
            <div className="mt-4 rounded-lg overflow-hidden border border-brand-border">
              <img
                src={exp.photo}
                alt={exp.photoAlt || exp.organization}
                className="w-full h-48 object-cover"
              />
            </div>
          )}

          {/* Website link */}
          {exp.website && (
            <div className="mt-4">
              <a
                href={exp.website}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-brand-light text-xs hover:text-white transition-colors"
              >
                <ExternalLink size={12} aria-hidden="true" />
                {exp.websiteLabel || exp.website}
              </a>
            </div>
          )}

          {/* PDF attachment */}
          {exp.attachment && (
            <div className="mt-3">
              <a
                href={exp.attachment.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-brand-border text-brand-light text-xs hover:border-brand-accent hover:text-white transition-colors"
              >
                <Paperclip size={12} aria-hidden="true" />
                {exp.attachment.label}
              </a>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  )
}

export default function Experience() {
  const experiences = useContent().experience.items
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, amount: 0.1 })

  return (
    <section className="py-24 md:py-32 bg-section-gradient section-divider">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">

        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 24 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="mb-14"
        >
          <p className="text-brand-light text-sm font-semibold tracking-widest uppercase mb-4">
            Background
          </p>
          <h2 className="text-3xl md:text-4xl font-bold text-white">
            Experience Highlights
          </h2>
        </motion.div>

        {/* Timeline */}
        <div className="relative">
          {/* Vertical line */}
          <div
            aria-hidden="true"
            className="absolute left-4 top-0 bottom-0 w-px bg-brand-border"
          />

          <div className="space-y-10">
            {experiences.map((exp, i) => (
              <ExperienceCard key={exp.id} exp={exp} index={i} />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
