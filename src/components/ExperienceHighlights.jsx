import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { useContent } from '../context/ContentContext'
import { typeLabel } from './Experience'
import {
  EXPERIENCE_SUMMARY,
  EXPERIENCE_STATS,
  pickHighlights,
} from '../data/experienceHighlights'

const reveal = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5 } },
}
const stagger = { show: { transition: { staggerChildren: 0.07 } } }

// Home-page summary of the experience: bio, headline numbers, four role
// highlights, and a link to the full timeline at /experience. Motion is plain
// framer-motion, so the app-level MotionConfig reducedMotion="user" applies.
export default function ExperienceHighlights() {
  const experience = useContent().experience
  const items = experience.items
  const summary = (experience.summary || '').trim() || EXPERIENCE_SUMMARY
  const stats = (Array.isArray(experience.stats) ? experience.stats : []).filter((s) => s && s.value)
  const shownStats = stats.length ? stats : EXPERIENCE_STATS
  const highlights = pickHighlights(items)

  return (
    <section className="py-20 sm:py-24 md:py-32 bg-section-gradient section-divider">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6 }}
          className="mb-10 sm:mb-12"
        >
          <p className="text-brand-light text-sm font-semibold tracking-widest uppercase mb-4">
            Experience
          </p>
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-5">
            Highlights from the work so far
          </h2>
          <p className="text-white/70 text-lg leading-relaxed max-w-3xl">{summary}</p>
        </motion.div>

        <motion.dl
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.2 }}
          variants={stagger}
          className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mb-10 sm:mb-12"
        >
          {shownStats.map((stat) => (
            <motion.div
              key={stat.value}
              variants={reveal}
              className="rounded-xl bg-brand-mid border border-brand-border p-4 sm:p-5"
            >
              <dt className="text-3xl sm:text-4xl font-bold text-white mb-1.5">{stat.value}</dt>
              <dd className="text-white/55 text-xs sm:text-sm leading-snug">{stat.label}</dd>
            </motion.div>
          ))}
        </motion.dl>

        {highlights.length > 0 && (
          <motion.ul
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.1 }}
            variants={stagger}
            className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5 mb-10"
          >
            {highlights.map(({ item, line }) => {
              const badge = typeLabel[item.type] || typeLabel.past
              return (
                <motion.li
                  key={item.id}
                  variants={reveal}
                  className="rounded-xl bg-brand-mid border border-brand-border p-5 sm:p-6 hover:border-brand-accent/50 transition-colors"
                >
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 mb-2">
                    {item.type === 'current' && (
                      <span className={`px-2.5 py-0.5 rounded-full border text-xs font-medium ${badge.color}`}>
                        {badge.label}
                      </span>
                    )}
                    <span className="text-white/55 text-xs">
                      {item.startDate} — {item.endDate}
                    </span>
                  </div>
                  <h3 className="text-white font-semibold text-lg mb-0.5">{item.role}</h3>
                  <p className="text-brand-light text-sm font-medium mb-3">{item.organization}</p>
                  <p className="text-white/70 text-sm leading-relaxed">{line}</p>
                </motion.li>
              )
            })}
          </motion.ul>
        )}

        <Link
          to="/experience"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-white text-brand-dark font-semibold text-sm hover:bg-brand-light hover:text-white transition-colors"
        >
          See the full timeline <ArrowRight size={16} aria-hidden="true" />
        </Link>
      </div>
    </section>
  )
}
