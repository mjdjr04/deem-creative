import { motion, useInView } from 'framer-motion'
import { useRef } from 'react'
import { Link } from 'react-router-dom'
import { Calendar, ArrowRight } from 'lucide-react'
import { useBooking } from '../context/BookingContext'

export default function ConsultCTA() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, amount: 0.3 })
  const { open } = useBooking()

  return (
    <section className="relative overflow-hidden py-24 md:py-36 section-divider" style={{ background: 'linear-gradient(135deg, #0D3472 0%, #0A1628 60%, #112040 100%)' }}>
      {/* Decorative orbs */}
      <div
        aria-hidden="true"
        className="absolute top-0 right-0 w-96 h-96 rounded-full blur-3xl opacity-20"
        style={{ background: '#2B5BA8' }}
      />
      <div
        aria-hidden="true"
        className="absolute bottom-0 left-0 w-64 h-64 rounded-full blur-3xl opacity-15"
        style={{ background: '#4A7EC7' }}
      />

      <div ref={ref} className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7 }}
        >
          <p className="text-brand-light text-sm font-semibold tracking-widest uppercase mb-6">
            Let's Work Together
          </p>
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-6 leading-tight">
            Have a story, a project, or a messy content system?{' '}
            <span className="text-gradient">Let's turn it into something clear.</span>
          </h2>
          <p className="text-white/65 text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed">
            Book a consultation to talk through your goals, current challenges, audience, and
            what kind of creative support would actually move the needle.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <motion.button
              onClick={open}
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.97 }}
              className="flex items-center gap-2 px-10 py-4 rounded-xl bg-white text-brand-dark font-bold text-base hover:bg-brand-light hover:text-white transition-all shadow-lg cursor-pointer"
            >
              <Calendar size={20} /> Book a Consultation
            </motion.button>
            <Link
              to="/portfolio"
              className="flex items-center gap-2 text-white/70 font-semibold text-base hover:text-white transition-colors"
            >
              See the work first <ArrowRight size={18} />
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
