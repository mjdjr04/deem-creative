import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import { projects, FEATURED_PROJECT_IDS } from '../data/projects'
import ProjectCard from './ProjectCard'

const featured = FEATURED_PROJECT_IDS
  .map(id => projects.find(p => p.id === id))
  .filter(Boolean)

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
}
const item = {
  hidden: { opacity: 0, y: 24 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.5 } },
}

export default function FeaturedWork({ onProjectSelect }) {
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
          className="mb-12"
        >
          <p className="text-brand-light text-sm font-semibold tracking-widest uppercase mb-4">
            Featured Work
          </p>
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Selected Projects
          </h2>
          <p className="text-white/60 text-lg max-w-2xl">
            A curated look at the work Deem Creative has produced for clients, organizations, and partners.
          </p>
        </motion.div>

        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.1 }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {featured.map(project => (
            <motion.div key={project.id} variants={item} className="h-full">
              <ProjectCard project={project} onClick={onProjectSelect} />
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
