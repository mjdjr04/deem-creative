import { useRef, useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { motion, useInView } from 'framer-motion'
import PortfolioExplorer from '../components/PortfolioExplorer'
import Feed from '../components/Feed'
import SocialMedia from '../components/SocialMedia'

export default function PortfolioPage({ onProjectSelect }) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, amount: 0.2 })
  const { search } = useLocation()

  // Scroll to the section requested by the navbar dropdown (?section=projects|social).
  useEffect(() => {
    const section = new URLSearchParams(search).get('section')
    if (!section) return
    const t = setTimeout(() => {
      document.getElementById(section)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }, 80)
    return () => clearTimeout(t)
  }, [search])

  return (
    <>
      {/* Page hero */}
      <section
        className="relative pt-24 pb-12 md:pt-32 md:pb-16 overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #060f1e 0%, #0D3472 50%, #060f1e 100%)' }}
      >
        <div
          aria-hidden="true"
          className="absolute top-0 right-0 w-96 h-96 rounded-full blur-3xl opacity-15"
          style={{ background: '#2B5BA8' }}
        />
        <div ref={ref} className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6 }}
          >
            <p className="text-brand-light text-sm font-semibold tracking-widest uppercase mb-4">
              Deem Creative
            </p>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Portfolio
            </h1>
            <p className="text-white/65 text-xl max-w-2xl">
              A look at the creative work — video production, social media strategy,
              nonprofit storytelling, digital systems, and more.
            </p>
          </motion.div>
        </div>
        {/* Bottom fade */}
        <div
          aria-hidden="true"
          className="absolute bottom-0 left-0 right-0 h-16 pointer-events-none"
          style={{ background: 'linear-gradient(to top, #0A1628, transparent)' }}
        />
      </section>

      <div id="projects" className="scroll-mt-20">
        <PortfolioExplorer onProjectSelect={onProjectSelect} />
      </div>
      <Feed />
      <div id="social" className="scroll-mt-20">
        <SocialMedia />
      </div>
    </>
  )
}
