import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { ArrowRight, Calendar } from 'lucide-react'
import { DeemCreativeLogoFull } from './DeemCreativeMark'
import { useBooking } from '../context/BookingContext'

export default function Hero() {
  const { open } = useBooking()

  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden bg-hero-gradient">
      {/* Decorative blurred orbs */}
      <div
        aria-hidden="true"
        className="absolute top-1/4 -right-32 w-96 h-96 rounded-full blur-3xl opacity-20"
        style={{ background: '#0D3472' }}
      />
      <div
        aria-hidden="true"
        className="absolute bottom-1/4 -left-32 w-80 h-80 rounded-full blur-3xl opacity-15"
        style={{ background: '#2B5BA8' }}
      />

      {/* Main content */}
      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 text-center">
        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-10 flex justify-center"
        >
          <DeemCreativeLogoFull />
        </motion.div>

        {/* Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.15 }}
          className="text-4xl sm:text-5xl md:text-6xl font-bold leading-tight tracking-tight mb-6"
        >
          Creative strategy, content, and storytelling{' '}
          <span className="text-gradient">for brands that want to connect with people.</span>
        </motion.h1>

        {/* Subheadline */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="text-lg md:text-xl text-white/70 max-w-3xl mx-auto mb-4 leading-relaxed"
        >
          Deem Creative helps startups, small businesses, nonprofits, and community-centered
          organizations turn stories, ideas, and missions into polished content, video assets,
          social campaigns, and digital systems.
        </motion.p>

        {/* Founder byline */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="text-sm text-brand-light mb-10 font-medium tracking-wide"
        >
          Founded by <span className="text-white">Michael Deem Jr.</span>
        </motion.p>

        {/* CTA buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12"
        >
          <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}>
            <Link
              to="/portfolio"
              className="flex items-center gap-2 px-8 py-3.5 rounded-lg border-2 border-white text-white font-semibold text-base hover:bg-white hover:text-brand-dark transition-all"
            >
              Explore the Work <ArrowRight size={18} />
            </Link>
          </motion.div>
          <motion.button
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.97 }}
            onClick={open}
            className="flex items-center gap-2 px-8 py-3.5 rounded-lg bg-brand-navy border-2 border-brand-accent text-white font-semibold text-base hover:bg-brand-accent transition-all cursor-pointer"
          >
            <Calendar size={18} /> Book a Consultation
          </motion.button>
        </motion.div>

        {/* Service tags row */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.7 }}
          className="flex flex-wrap items-center justify-center gap-2 text-xs text-white/50 font-medium"
        >
          {['Video Production', 'Social Media Strategy', 'Digital Storytelling', 'Website Support', 'Creative Operations'].map((item, i) => (
            <span key={item} className="flex items-center gap-2">
              {item}
              {i < 4 && <span className="text-brand-border">·</span>}
            </span>
          ))}
        </motion.div>
      </div>

      {/* Bottom fade */}
      <div
        aria-hidden="true"
        className="absolute bottom-0 left-0 right-0 h-32 pointer-events-none"
        style={{ background: 'linear-gradient(to top, #0A1628, transparent)' }}
      />
    </section>
  )
}
