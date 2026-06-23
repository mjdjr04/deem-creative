import { useRef, useState } from 'react'
import { motion, AnimatePresence, useInView } from 'framer-motion'
import { Film, Palette, Megaphone, Settings, Globe, Sparkles } from 'lucide-react'
import { useContent } from '../context/ContentContext'

// Map a category name to an icon by keyword, with a sensible fallback so
// admin-added categories still get something nice.
function iconFor(category = '') {
  const c = category.toLowerCase()
  if (/(video|post|production|film|edit|motion)/.test(c)) return Film
  if (/(design|creative|graphic|brand|photo)/.test(c)) return Palette
  if (/(social|market|content|campaign)/.test(c)) return Megaphone
  if (/(ops|operation|system|workflow|automation)/.test(c)) return Settings
  if (/(web|digital|site|dev|code)/.test(c)) return Globe
  return Sparkles
}

const chip = {
  hidden: { opacity: 0, y: 8, scale: 0.96 },
  show:   { opacity: 1, y: 0, scale: 1, transition: { duration: 0.25 } },
}

export default function Skills() {
  const { groups: skillGroups = [], core: coreSkills = [] } = useContent().skills
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, amount: 0.1 })
  const [active, setActive] = useState(0)

  const activeGroup = skillGroups[active] || skillGroups[0]

  return (
    <section className="py-20 sm:py-24 md:py-32 bg-brand-dark section-divider">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">

        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 24 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="mb-10 sm:mb-14"
        >
          <p className="text-brand-light text-sm font-semibold tracking-widest uppercase mb-4">
            Skills & Tools
          </p>
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            What&apos;s in the toolkit
          </h2>
          <p className="text-white/60 text-base sm:text-lg max-w-2xl">
            Pick a focus area to see the hard skills and tools behind it — from
            production suites to content systems.
          </p>
        </motion.div>

        {/* Core competencies — engaging animated pills */}
        {coreSkills.length > 0 && (
          <div className="mb-12 sm:mb-16">
            <h3 className="text-white/55 text-xs font-semibold tracking-widest uppercase mb-5">
              Core Competencies
            </h3>
            <motion.div
              variants={{ show: { transition: { staggerChildren: 0.04 } } }}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, amount: 0.2 }}
              className="flex flex-wrap gap-2.5"
            >
              {coreSkills.map((skill) => (
                <motion.span
                  key={skill}
                  variants={chip}
                  whileHover={{ y: -3, scale: 1.04 }}
                  className="px-4 py-2 rounded-full bg-brand-navy/60 border border-brand-accent/40 text-white/85 text-sm font-medium hover:border-brand-accent hover:bg-brand-navy transition-colors cursor-default"
                >
                  {skill}
                </motion.span>
              ))}
            </motion.div>
          </div>
        )}

        {/* Interactive category explorer */}
        {skillGroups.length > 0 && (
          <div className="grid md:grid-cols-[minmax(0,18rem)_1fr] gap-6 lg:gap-8">

            {/* Topic selector — horizontal scroll row on mobile, list on desktop */}
            <div
              className="flex md:flex-col gap-2 overflow-x-auto md:overflow-visible -mx-4 px-4 md:mx-0 md:px-0 scrollbar-hide"
              role="tablist"
              aria-label="Skill categories"
            >
              {skillGroups.map((group, i) => {
                const Icon = iconFor(group.category)
                const selected = i === active
                return (
                  <button
                    key={group.category + i}
                    role="tab"
                    aria-selected={selected}
                    onClick={() => setActive(i)}
                    className={`group flex items-center gap-3 flex-shrink-0 md:flex-shrink md:w-full text-left px-4 py-3 rounded-xl border transition-colors ${
                      selected
                        ? 'bg-brand-navy/60 border-brand-accent text-white'
                        : 'bg-brand-mid border-brand-border text-white/70 hover:border-brand-accent/50 hover:text-white'
                    }`}
                  >
                    <span
                      className={`flex-shrink-0 w-9 h-9 rounded-lg flex items-center justify-center transition-colors ${
                        selected ? 'bg-brand-accent text-white' : 'bg-brand-surface text-brand-light group-hover:text-white'
                      }`}
                    >
                      <Icon size={18} />
                    </span>
                    <span className="flex-1 min-w-0">
                      <span className="block text-sm font-semibold leading-tight whitespace-nowrap md:whitespace-normal">
                        {group.category}
                      </span>
                      <span className="block text-xs text-white/55">
                        {(group.skills || []).length} skills
                      </span>
                    </span>
                  </button>
                )
              })}
            </div>

            {/* Skills panel for the active category */}
            <div className="rounded-2xl bg-brand-mid border border-brand-border p-5 sm:p-7 min-h-[14rem]">
              <AnimatePresence mode="wait">
                <motion.div
                  key={active}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="flex items-center gap-3 mb-5">
                    {(() => {
                      const Icon = iconFor(activeGroup?.category)
                      return (
                        <span className="w-10 h-10 rounded-lg bg-brand-navy/60 border border-brand-accent/40 flex items-center justify-center text-brand-light">
                          <Icon size={20} />
                        </span>
                      )
                    })()}
                    <h3 className="text-white text-lg font-semibold">{activeGroup?.category}</h3>
                  </div>

                  <motion.div
                    variants={{ show: { transition: { staggerChildren: 0.045 } } }}
                    initial="hidden"
                    animate="show"
                    className="flex flex-wrap gap-2.5"
                  >
                    {(activeGroup?.skills || []).map((skill) => (
                      <motion.span
                        key={skill}
                        variants={chip}
                        whileHover={{ y: -2 }}
                        className="px-3.5 py-2 rounded-lg bg-brand-surface border border-brand-border text-white/80 text-sm hover:border-brand-accent hover:text-white transition-colors"
                      >
                        {skill}
                      </motion.span>
                    ))}
                  </motion.div>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        )}
      </div>
    </section>
  )
}
