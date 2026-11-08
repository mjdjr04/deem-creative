import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { ArrowRight, FileText } from 'lucide-react'
import { STORIES } from '../data/stories'
import { WHITEPAPER } from '../data/whitepaper'

const reveal = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5 } },
}

// Home-page doorway to /story and the whitepaper.
export default function StoryTeaser() {
  return (
    <section className="py-20 sm:py-24 bg-brand-dark section-divider">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <p className="text-brand-light text-sm font-semibold tracking-widest uppercase mb-4">My Story</p>
        <h2 className="text-3xl md:text-4xl font-bold text-white mb-10 max-w-3xl leading-tight">
          Four short stories behind the work.
        </h2>

        <motion.ol
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.2 }}
          variants={{ show: { transition: { staggerChildren: 0.07 } } }}
          className="grid sm:grid-cols-2 gap-4 mb-10"
        >
          {STORIES.map((s, i) => (
            <motion.li key={s.id} variants={reveal}>
              <Link
                to={`/story#${s.id}`}
                className="group block h-full rounded-xl bg-brand-mid border border-brand-border p-5 hover:border-brand-accent transition-colors"
              >
                <p className="text-brand-light/80 text-xs font-semibold tracking-widest uppercase mb-2">
                  0{i + 1} · {s.label}
                </p>
                <p className="text-white font-semibold text-lg leading-snug">{s.title}</p>
                <span className="mt-3 inline-flex items-center gap-1 text-brand-light/80 text-sm group-hover:text-white transition-colors">
                  Read <ArrowRight size={14} aria-hidden="true" />
                </span>
              </Link>
            </motion.li>
          ))}
        </motion.ol>

        <Link
          to={`/writing/${WHITEPAPER.slug}`}
          className="group flex items-start gap-4 rounded-xl border border-brand-accent/60 bg-brand-navy/30 p-5 hover:bg-brand-navy/60 transition-colors"
        >
          <FileText size={22} className="text-brand-light flex-shrink-0 mt-0.5" aria-hidden="true" />
          <span>
            <span className="block text-brand-light/80 text-xs font-semibold tracking-widest uppercase mb-1">Whitepaper</span>
            <span className="block text-white font-semibold text-lg">{WHITEPAPER.title}</span>
            <span className="block text-white/60 text-sm mt-1">{WHITEPAPER.subtitle}</span>
          </span>
          <ArrowRight size={18} className="ml-auto text-brand-light/70 group-hover:translate-x-0.5 transition-transform flex-shrink-0 mt-1" aria-hidden="true" />
        </Link>
      </div>
    </section>
  )
}
