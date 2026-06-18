import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import { useContent } from '../context/ContentContext'

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.04 } },
}
const tag = {
  hidden: { opacity: 0, scale: 0.85 },
  show:   { opacity: 1, scale: 1, transition: { duration: 0.3 } },
}

export default function Skills() {
  const { groups: skillGroups, core: coreSkills } = useContent().skills
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, amount: 0.1 })

  return (
    <section className="py-24 md:py-32 bg-brand-dark section-divider">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 24 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="mb-14"
        >
          <p className="text-brand-light text-sm font-semibold tracking-widest uppercase mb-4">
            Skills & Tools
          </p>
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            What's in the toolkit
          </h2>
          <p className="text-white/60 text-lg max-w-2xl">
            From video editing suites to content management systems — the tools and skills behind the work.
          </p>
        </motion.div>

        {/* Core skills — prominent tags */}
        <div className="mb-14">
          <h3 className="text-white/50 text-xs font-semibold tracking-widest uppercase mb-5">
            Core Competencies
          </h3>
          <motion.div
            variants={container}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.2 }}
            className="flex flex-wrap gap-2.5"
          >
            {coreSkills.map(skill => (
              <motion.span
                key={skill}
                variants={tag}
                className="px-4 py-2 rounded-full bg-brand-navy/60 border border-brand-accent/40 text-white/80 text-sm font-medium hover:border-brand-accent hover:text-white transition-colors cursor-default"
              >
                {skill}
              </motion.span>
            ))}
          </motion.div>
        </div>

        {/* Tool categories */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {skillGroups.map((group, i) => (
            <motion.div
              key={group.category}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.5, delay: i * 0.07 }}
              className="rounded-xl bg-brand-mid border border-brand-border p-5 hover:border-brand-accent/50 transition-colors"
            >
              <h3 className="text-brand-light text-sm font-semibold tracking-wide mb-4 uppercase">
                {group.category}
              </h3>
              <div className="flex flex-wrap gap-2">
                {group.skills.map(skill => (
                  <span
                    key={skill}
                    className="px-2.5 py-1 rounded-md bg-brand-surface border border-brand-border text-white/65 text-xs"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
