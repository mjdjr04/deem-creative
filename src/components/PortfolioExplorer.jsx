import { useState, useRef } from 'react'
import { motion, AnimatePresence, useInView } from 'framer-motion'
import { useContent } from '../context/ContentContext'
import ProjectCard from './ProjectCard'

export default function PortfolioExplorer({ onProjectSelect }) {
  const content = useContent()
  const projects = content.projects.items
  const CATEGORIES = content.projects.categories
  const [activeCategory, setActiveCategory] = useState('All')
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, amount: 0.1 })

  // Sort newest-first by the year field (most recent work leads).
  const startYear = (p) => {
    const m = /(\d{4})/.exec(p.year || '')
    return m ? Number(m[1]) : 0
  }
  const sorted = [...projects].sort((a, b) => startYear(b) - startYear(a))

  const filtered = activeCategory === 'All'
    ? sorted
    : sorted.filter(p => p.category === activeCategory)

  return (
    <section className="py-24 md:py-32 bg-section-gradient section-divider">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Section header */}
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 24 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="mb-12"
        >
          <p className="text-brand-light text-sm font-semibold tracking-widest uppercase mb-4">
            Portfolio
          </p>
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Featured Projects
          </h2>
          <p className="text-white/60 text-lg max-w-2xl">
            Click a category to filter work by creative area.
          </p>
        </motion.div>

        {/* Category tabs */}
        <div className="flex flex-wrap gap-2 mb-10">
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all border ${
                activeCategory === cat
                  ? 'bg-brand-navy border-brand-accent text-white'
                  : 'bg-transparent border-brand-border text-white/60 hover:text-white hover:border-brand-accent'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Project grid */}
        <motion.div
          layout
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch"
        >
          <AnimatePresence mode="popLayout">
            {filtered.map(project => (
              <ProjectCard
                key={project.id}
                project={project}
                onClick={onProjectSelect}
              />
            ))}
          </AnimatePresence>
        </motion.div>

        {filtered.length === 0 && (
          <div className="text-center py-16 text-white/40">
            No projects in this category yet.
          </div>
        )}
      </div>
    </section>
  )
}
