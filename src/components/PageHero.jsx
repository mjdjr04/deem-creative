import { motion } from 'framer-motion'

// The dark gradient header used by the inner pages (Experience, Services,
// Story, Writing).
export default function PageHero({ eyebrow, title, children }) {
  return (
    <section
      className="relative pt-24 pb-12 md:pt-32 md:pb-16 overflow-hidden"
      style={{ background: 'linear-gradient(135deg, #060f1e 0%, #0D3472 50%, #060f1e 100%)' }}
    >
      <div aria-hidden="true" className="absolute top-0 left-0 w-80 h-80 rounded-full blur-3xl opacity-15" style={{ background: '#2B5BA8' }} />
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
          <p className="text-brand-light text-sm font-semibold tracking-widest uppercase mb-4">{eyebrow}</p>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 max-w-4xl leading-tight">{title}</h1>
          {children && <div className="text-white/65 text-xl max-w-2xl">{children}</div>}
        </motion.div>
      </div>
      <div aria-hidden="true" className="absolute bottom-0 left-0 right-0 h-16 pointer-events-none" style={{ background: 'linear-gradient(to top, #0A1628, transparent)' }} />
    </section>
  )
}
