import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import { Calendar } from 'lucide-react'
import Services from '../components/Services'
import Process from '../components/Process'
import { useBooking } from '../context/BookingContext'

export default function ServicesPage() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, amount: 0.2 })
  const { open } = useBooking()

  return (
    <>
      {/* Page hero */}
      <section
        className="relative pt-24 pb-12 md:pt-32 md:pb-16 overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #060f1e 0%, #0D3472 50%, #060f1e 100%)' }}
      >
        <div
          aria-hidden="true"
          className="absolute top-0 left-0 w-80 h-80 rounded-full blur-3xl opacity-15"
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
              Services
            </h1>
            <p className="text-white/65 text-xl max-w-2xl">
              Creative strategy, video production, and digital systems — built for small teams
              with big stories. Click any service to see what's possible.
            </p>
          </motion.div>
        </div>
        <div
          aria-hidden="true"
          className="absolute bottom-0 left-0 right-0 h-16 pointer-events-none"
          style={{ background: 'linear-gradient(to top, #0A1628, transparent)' }}
        />
      </section>

      <section id="services">
        <Services />
      </section>
      <section id="process">
        <Process />
      </section>

      {/* Large book CTA at bottom of services page */}
      <section className="py-20 md:py-28 bg-brand-dark border-t border-brand-border">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.6 }}
          >
            <p className="text-brand-light text-sm font-semibold tracking-widest uppercase mb-5">
              Ready to get started?
            </p>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6 leading-tight">
              Let's build something worth talking about.
            </h2>
            <p className="text-white/60 text-lg mb-10 max-w-xl mx-auto">
              Book a free consultation to talk through your project, goals, and how Deem Creative can help.
            </p>
            <motion.button
              onClick={open}
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.97 }}
              className="inline-flex items-center gap-3 px-12 py-5 rounded-2xl bg-white text-brand-dark font-bold text-lg hover:bg-brand-light hover:text-white transition-all shadow-xl cursor-pointer"
            >
              <Calendar size={22} /> Book a Free Consultation
            </motion.button>
            <p className="mt-5 text-white/55 text-sm">No commitment required · Typically within 1–3 business days</p>
          </motion.div>
        </div>
      </section>
    </>
  )
}
