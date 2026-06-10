import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import { Search, Map, Hammer, RefreshCw, Rocket } from 'lucide-react'

const steps = [
  {
    number: '01',
    title: 'Discovery',
    icon: Search,
    description: 'Understand your goals, audience, current content situation, and the biggest opportunities to move forward.',
  },
  {
    number: '02',
    title: 'Strategy',
    icon: Map,
    description: 'Map out the right creative direction, platforms, deliverables, and priorities — before any work begins.',
  },
  {
    number: '03',
    title: 'Build',
    icon: Hammer,
    description: 'Create the content, systems, videos, website updates, or campaign materials — executed with precision.',
  },
  {
    number: '04',
    title: 'Refine',
    icon: RefreshCw,
    description: 'Review together, revise, organize, and make sure every piece is polished and on-brand.',
  },
  {
    number: '05',
    title: 'Launch',
    icon: Rocket,
    description: 'Publish, deliver, or hand off final assets with a clear next-step plan so the momentum continues.',
  },
]

export default function Process() {
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
          className="mb-14 text-center max-w-2xl mx-auto"
        >
          <p className="text-brand-light text-sm font-semibold tracking-widest uppercase mb-4">
            Process
          </p>
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            How We'll Work Together
          </h2>
          <p className="text-white/60 text-lg">
            A clear, collaborative process from first conversation to final delivery.
          </p>
        </motion.div>

        {/* Desktop: horizontal flow */}
        <div className="hidden lg:flex items-start gap-0">
          {steps.map((step, i) => {
            const Icon = step.icon
            return (
              <motion.div
                key={step.number}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="flex-1 flex flex-col items-center text-center px-4"
              >
                {/* Connector line + circle */}
                <div className="relative w-full flex items-center justify-center mb-6">
                  {/* Left connector */}
                  {i > 0 && (
                    <div
                      aria-hidden="true"
                      className="absolute right-1/2 top-6 left-0 h-px border-t-2 border-dashed border-brand-border"
                    />
                  )}
                  {/* Right connector */}
                  {i < steps.length - 1 && (
                    <div
                      aria-hidden="true"
                      className="absolute left-1/2 top-6 right-0 h-px border-t-2 border-dashed border-brand-border"
                    />
                  )}
                  <div className="relative z-10 w-12 h-12 rounded-full bg-brand-navy border-2 border-brand-accent flex items-center justify-center">
                    <Icon size={20} className="text-brand-light" aria-hidden="true" />
                  </div>
                </div>
                <span className="text-brand-accent text-xs font-bold tracking-widest mb-1">{step.number}</span>
                <h3 className="text-white font-semibold text-base mb-2">{step.title}</h3>
                <p className="text-white/60 text-sm leading-relaxed">{step.description}</p>
              </motion.div>
            )
          })}
        </div>

        {/* Mobile: vertical stack */}
        <div className="lg:hidden relative">
          <div aria-hidden="true" className="absolute left-6 top-0 bottom-0 w-px bg-brand-border" />
          <div className="space-y-8">
            {steps.map((step, i) => {
              const Icon = step.icon
              return (
                <motion.div
                  key={step.number}
                  initial={{ opacity: 0, x: -16 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, amount: 0.4 }}
                  transition={{ duration: 0.5, delay: i * 0.07 }}
                  className="relative pl-16"
                >
                  <div
                    aria-hidden="true"
                    className="absolute left-0 top-0 w-12 h-12 rounded-full bg-brand-navy border-2 border-brand-accent flex items-center justify-center"
                  >
                    <Icon size={20} className="text-brand-light" />
                  </div>
                  <span className="text-brand-accent text-xs font-bold tracking-widest block mb-1">{step.number}</span>
                  <h3 className="text-white font-semibold text-lg mb-2">{step.title}</h3>
                  <p className="text-white/60 text-sm leading-relaxed">{step.description}</p>
                </motion.div>
              )
            })}
          </div>
        </div>

        {/* Systems visual */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-16 flex flex-wrap items-center justify-center gap-3 text-sm font-medium text-white/60"
        >
          {['Story', 'Strategy', 'Content', 'Systems', 'Launch'].map((word, i) => (
            <span key={word} className="flex items-center gap-3">
              <span className="text-white/90">{word}</span>
              {i < 4 && <span className="text-brand-accent text-lg" aria-hidden="true">→</span>}
            </span>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
