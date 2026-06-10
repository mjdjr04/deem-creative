import { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Calendar, Wrench, CheckCircle } from 'lucide-react'
import { DeemCreativeMark } from './DeemCreativeMark'
import { useBooking } from '../context/BookingContext'

function ModalMedia({ project, onClose }) {
  if (project.mediaType === 'video' && project.mediaUrl) {
    return (
      <div className="relative w-full overflow-hidden bg-black" style={{ paddingTop: '56.25%' }}>
        <iframe
          src={project.mediaUrl}
          title={project.title}
          allow="autoplay"
          allowFullScreen
          style={{
            position: 'absolute',
            top: '-5%',
            left: 0,
            width: '100%',
            height: '115%',
            border: 'none',
          }}
        />
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-brand-dark/70 text-white hover:bg-brand-dark transition-colors z-10"
          aria-label="Close project details"
        >
          <X size={18} />
        </button>
      </div>
    )
  }

  if (project.mediaType === 'image' && project.mediaUrl) {
    return (
      <div className="relative w-full aspect-video overflow-hidden">
        <img
          src={project.mediaUrl}
          alt={project.mediaAlt || project.title}
          className="w-full h-full object-cover"
        />
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-brand-dark/70 text-white hover:bg-brand-dark transition-colors"
          aria-label="Close project details"
        >
          <X size={18} />
        </button>
      </div>
    )
  }

  // Gradient placeholder
  return (
    <div
      className="relative w-full aspect-video flex items-center justify-center"
      style={{ background: `linear-gradient(135deg, ${project.accentColor || '#112040'} 0%, #1A2E4A 100%)` }}
    >
      <DeemCreativeMark className="w-24 h-auto opacity-10" />
      <button
        onClick={onClose}
        className="absolute top-4 right-4 p-2 rounded-full bg-brand-dark/70 text-white hover:bg-brand-dark transition-colors"
        aria-label="Close project details"
      >
        <X size={18} />
      </button>
    </div>
  )
}

export default function ProjectModal({ project, onClose }) {
  const { open: openBooking } = useBooking()

  useEffect(() => {
    if (project) {
      document.body.classList.add('modal-open')
    } else {
      document.body.classList.remove('modal-open')
    }
    return () => document.body.classList.remove('modal-open')
  }, [project])

  useEffect(() => {
    const onKey = e => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  return (
    <AnimatePresence>
      {project && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50"
            onClick={onClose}
            aria-hidden="true"
          />

          {/* Modal panel */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
            <motion.div
              key="modal"
              initial={{ opacity: 0, scale: 0.95, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 16 }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
              className="pointer-events-auto w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl bg-brand-mid border border-brand-border shadow-2xl"
              role="dialog"
              aria-modal="true"
              aria-label={project.title}
            >
              <ModalMedia project={project} onClose={onClose} />

              {/* Content */}
              <div className="p-6 md:p-8">
                <div className="flex items-center gap-3 mb-3">
                  <span className="px-2.5 py-1 rounded-full bg-brand-surface border border-brand-border text-brand-light text-xs font-medium">
                    {project.category}
                  </span>
                  <span className="text-white/40 text-xs">{project.year}</span>
                </div>

                <h2 className="text-2xl md:text-3xl font-bold text-white mb-1">
                  {project.title}
                </h2>
                <p className="text-brand-light text-sm mb-1 font-medium">{project.client}</p>
                <p className="text-white/50 text-sm mb-6">Role: {project.role}</p>

                <p className="text-white/75 leading-relaxed mb-8 text-base">
                  {project.description}
                </p>

                {/* Outcomes */}
                {project.outcomes && project.outcomes.length > 0 && (
                  <div className="mb-8">
                    <h3 className="flex items-center gap-2 text-sm font-semibold text-brand-light uppercase tracking-widest mb-4">
                      <CheckCircle size={14} /> Outcomes
                    </h3>
                    <ul className="space-y-2">
                      {project.outcomes.map((outcome, i) => (
                        <li key={i} className="flex items-start gap-2 text-white/70 text-sm">
                          <span className="text-brand-accent mt-0.5 flex-shrink-0" aria-hidden="true">▸</span>
                          {outcome}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Tools */}
                {project.tools && project.tools.length > 0 && (
                  <div className="mb-8">
                    <h3 className="flex items-center gap-2 text-sm font-semibold text-brand-light uppercase tracking-widest mb-4">
                      <Wrench size={14} /> Tools Used
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {project.tools.map(tool => (
                        <span
                          key={tool}
                          className="px-3 py-1 rounded-full bg-brand-surface border border-brand-border text-white/70 text-xs"
                        >
                          {tool}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Social / external links */}
                {project.socialLinks && project.socialLinks.length > 0 && (
                  <div className="mb-8 flex flex-wrap gap-2">
                    {project.socialLinks.map(link => (
                      <a
                        key={link.label}
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-1.5 rounded-lg border border-brand-border text-brand-light text-xs hover:border-brand-accent hover:text-white transition-colors"
                      >
                        {link.label} ↗
                      </a>
                    ))}
                  </div>
                )}

                {/* CTA */}
                <div className="pt-4 border-t border-brand-border">
                  <p className="text-white/60 text-sm mb-4">
                    Want to create something like this for your organization?
                  </p>
                  <motion.button
                    onClick={openBooking}
                    whileHover={{ scale: 1.04 }}
                    whileTap={{ scale: 0.97 }}
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-brand-navy border border-brand-accent text-white font-semibold text-sm hover:bg-brand-accent transition-colors cursor-pointer"
                  >
                    <Calendar size={16} /> Book a Consultation
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  )
}
