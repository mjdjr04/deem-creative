import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Link } from 'react-router-dom'
import { Mail, Phone, FileText, ExternalLink, Download, ChevronDown, Wrench, CheckCircle, Calendar, Check } from 'lucide-react'
import { useContent } from '../context/ContentContext'
import { DeemCreativeMark } from '../components/DeemCreativeMark'
import VCardButton from '../components/VCardButton'
import ProjectMediaInline from '../components/ProjectMediaInline'
import Experience from '../components/Experience'
import Skills from '../components/Skills'
import SocialMedia from '../components/SocialMedia'
import ContactForm from '../components/ContactForm'
import defaultHeadshot from '../assets/headshot.jpeg'
import { fullName } from '../lib/vcard'
import { aboutDefaults } from '../data/defaults'
import { trackEvent } from '../lib/analytics'
import { ANALYTICS_EVENTS } from '../config/analytics'

const LinkedInIcon = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
  </svg>
)

const reveal = {
  hidden: { opacity: 0, y: 28 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } },
}

function Section({ children, className = '' }) {
  return (
    <motion.section
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount: 0.15 }}
      variants={reveal}
      className={className}
    >
      {children}
    </motion.section>
  )
}

function ProfileProjectCard({ project, index }) {
  const [open, setOpen] = useState(false)
  const link = project.socialLinks?.[0]?.url
  return (
    <motion.div
      variants={reveal}
      whileHover={{ y: -3 }}
      className={`rounded-2xl bg-brand-mid border overflow-hidden transition-colors ${open ? 'border-brand-accent' : 'border-brand-border hover:border-brand-accent/50'}`}
    >
      <button onClick={() => setOpen((v) => !v)} className="w-full text-left p-5 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <span className="w-7 h-7 rounded-md flex items-center justify-center text-xs font-bold text-white flex-shrink-0" style={{ background: project.accentColor || '#2B5BA8' }}>
              {String(index + 1).padStart(2, '0')}
            </span>
            <h3 className="text-white font-semibold">{project.title}</h3>
            {project.year && <span className="text-white/55 text-xs">{project.year}</span>}
          </div>
          {project.role && <p className="text-brand-light text-sm">{project.role}</p>}
          {project.brief && <p className="text-white/55 text-sm mt-1 leading-relaxed">{project.brief}</p>}
        </div>
        <ChevronDown size={20} className={`text-white/55 flex-shrink-0 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="px-5 pb-5 space-y-4 border-t border-brand-border pt-4">
              <ProjectMediaInline project={project} />
              {project.description && <p className="text-white/65 text-sm leading-relaxed">{project.description}</p>}

              {project.outcomes?.length > 0 && (
                <ul className="space-y-1.5">
                  {project.outcomes.map((o, i) => (
                    <li key={i} className="flex items-center gap-2 text-white/60 text-sm">
                      <CheckCircle size={14} className="text-brand-light flex-shrink-0" />
                      {o}
                    </li>
                  ))}
                </ul>
              )}

              {project.tools?.length > 0 && (
                <div className="flex items-center gap-2 flex-wrap">
                  <Wrench size={14} className="text-white/55" />
                  {project.tools.map((t) => (
                    <span key={t} className="px-2 py-0.5 rounded bg-brand-surface border border-brand-border text-white/55 text-xs">{t}</span>
                  ))}
                </div>
              )}

              {link && (
                <a href={link} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-brand-light text-sm hover:text-white">
                  <ExternalLink size={14} /> {project.socialLinks[0].label || 'View'}
                </a>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

export default function ProfilePage() {
  const content = useContent()
  const { settings, projects, about } = content
  const vc = settings.vcard || {}
  const name = fullName(vc) || 'Michael Deem Jr.'
  const headshot = about.headshot || defaultHeadshot

  useEffect(() => {
    document.title = `${name} — Profile`
  }, [name])

  const featured = projects.items.filter((p) => p.featured)
  const selected = featured.length ? featured : projects.items

  const intro = about.profile || aboutDefaults.profile
  const introParagraphs = (intro?.paragraphs || []).map((p) => p.trim()).filter(Boolean)
  const stats = (intro?.stats || []).filter((s) => s && (s.value || s.label))
  const quickFacts = (intro?.quickFacts || []).map((f) => (f || '').trim()).filter(Boolean)
  const cta = intro?.cta || {}

  const btn = 'inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold transition-colors'

  return (
    <div className="bg-brand-dark min-h-screen">
      {/* Header */}
      <header className="bg-hero-gradient">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-20">
          <DeemCreativeMark className="h-9 mb-10" />
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="flex flex-col sm:flex-row items-start sm:items-center gap-6"
          >
            <div className="relative flex-shrink-0">
              <div className="absolute -inset-1 rounded-full opacity-40 blur-lg" style={{ background: 'linear-gradient(135deg, #2B5BA8, #0D3472)' }} aria-hidden="true" />
              <img src={headshot} alt={name} className="relative w-28 h-28 md:w-32 md:h-32 rounded-full object-cover object-top border-2 border-brand-accent/50" />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-white mb-1">{name}</h1>
              <p className="text-brand-light text-base md:text-lg">{vc.title}</p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="flex flex-wrap gap-3 mt-8"
          >
            {settings.resumeUrl && (
              <a
                href={settings.resumeUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => trackEvent(ANALYTICS_EVENTS.RESUME_DOWNLOAD, { from: 'profile_header' })}
                className={`${btn} bg-white text-brand-dark hover:bg-brand-light hover:text-white`}
              >
                <FileText size={16} /> {settings.resumeLabel || 'Download Resume'}
              </a>
            )}
            <VCardButton className={`${btn} border border-brand-accent text-white hover:bg-brand-navy`} />
            {about.linkedinUrl && (
              <a href={about.linkedinUrl} target="_blank" rel="noopener noreferrer" className={`${btn} border border-brand-border text-white/80 hover:border-brand-accent hover:text-white`}>
                <LinkedInIcon size={16} /> LinkedIn
              </a>
            )}
            {vc.email && (
              <a href={`mailto:${vc.email}`} className={`${btn} border border-brand-border text-white/80 hover:border-brand-accent hover:text-white`}>
                <Mail size={16} /> Email
              </a>
            )}
            {vc.phone && (
              <a href={`tel:${vc.phone.replace(/[^\d+]/g, '')}`} className={`${btn} border border-brand-border text-white/80 hover:border-brand-accent hover:text-white`}>
                <Phone size={16} /> {vc.phone}
              </a>
            )}
          </motion.div>
        </div>
      </header>

      {/* Profile intro — written for hiring managers */}
      {introParagraphs.length > 0 && (
        <Section className="py-16 sm:py-20 md:py-28 bg-brand-dark section-divider">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <p className="text-brand-light text-sm font-semibold tracking-widest uppercase mb-4">
              {intro.eyebrow}
            </p>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-8 leading-tight max-w-3xl">
              {intro.heading}
            </h2>

            <div className="grid lg:grid-cols-[1fr_minmax(0,20rem)] gap-10 lg:gap-14 items-start">
              {/* Narrative */}
              <div className="max-w-3xl">
                {introParagraphs.map((para, i) => (
                  <p
                    key={i}
                    className={`text-white/70 text-base sm:text-lg leading-relaxed ${
                      i === introParagraphs.length - 1 ? '' : 'mb-5'
                    }`}
                  >
                    {para}
                  </p>
                ))}

                {/* Quick-fact chips */}
                {quickFacts.length > 0 && (
                  <motion.div
                    initial="hidden"
                    whileInView="show"
                    viewport={{ once: true, amount: 0.3 }}
                    variants={{ show: { transition: { staggerChildren: 0.06 } } }}
                    className="flex flex-wrap gap-2.5 mt-8"
                  >
                    {quickFacts.map((fact) => (
                      <motion.span
                        key={fact}
                        variants={reveal}
                        className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-mid border border-brand-border text-white/75 text-sm"
                      >
                        <Check size={14} className="text-brand-light flex-shrink-0" />
                        {fact}
                      </motion.span>
                    ))}
                  </motion.div>
                )}
              </div>

              {/* Animated stat cards */}
              {stats.length > 0 && (
                <motion.div
                  initial="hidden"
                  whileInView="show"
                  viewport={{ once: true, amount: 0.2 }}
                  variants={{ show: { transition: { staggerChildren: 0.08 } } }}
                  className="grid grid-cols-2 lg:grid-cols-1 gap-3 sm:gap-4"
                >
                  {stats.map((stat, i) => (
                    <motion.div
                      key={i}
                      variants={reveal}
                      whileHover={{ y: -3 }}
                      className="rounded-2xl bg-brand-mid border border-brand-border p-4 sm:p-5 hover:border-brand-accent/50 transition-colors"
                    >
                      <p className="text-2xl sm:text-3xl font-bold text-white mb-1">{stat.value}</p>
                      <p className="text-white/55 text-xs sm:text-sm leading-snug">{stat.label}</p>
                    </motion.div>
                  ))}
                </motion.div>
              )}
            </div>
          </div>
        </Section>
      )}

      {/* Reused public sections (already animate on scroll) */}
      <Experience collapsible />
      <Skills />

      {/* Interactive selected projects */}
      {selected.length > 0 && (
        <Section className="py-16 sm:py-20 md:py-28 bg-brand-dark section-divider">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <p className="text-brand-light text-sm font-semibold tracking-widest uppercase mb-4">Work</p>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-3">Selected Projects</h2>
            <p className="text-white/55 text-sm mb-10">Tap any project to expand details and media.</p>
            <motion.div
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, amount: 0.1 }}
              variants={{ show: { transition: { staggerChildren: 0.06 } } }}
              className="space-y-4"
            >
              {selected.map((p, i) => <ProfileProjectCard key={p.id} project={p} index={i} />)}
            </motion.div>
          </div>
        </Section>
      )}

      {/* Social media work */}
      <SocialMedia containerClass="max-w-5xl" />

      {/* Embedded resume */}
      {settings.resumeUrl && (
        <Section className="py-16 sm:py-20 md:py-28 bg-section-gradient section-divider">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between gap-4 mb-8">
              <h2 className="text-3xl md:text-4xl font-bold text-white">Resume</h2>
              <a href={settings.resumeUrl} target="_blank" rel="noopener noreferrer" className={`${btn} border border-brand-accent text-brand-light hover:bg-brand-navy hover:text-white`}>
                <Download size={15} /> Download PDF
              </a>
            </div>
            <object data={settings.resumeUrl} type="application/pdf" className="w-full rounded-xl border border-brand-border h-[70vh] sm:h-[80vh] lg:h-[85vh]">
              <p className="text-white/60 text-sm p-6">
                Your browser can’t display the embedded PDF.{' '}
                <a href={settings.resumeUrl} className="text-brand-light underline">Download the resume instead.</a>
              </p>
            </object>
          </div>
        </Section>
      )}

      {/* Send me a message */}
      <Section className="py-16 sm:py-20 md:py-28 bg-brand-dark section-divider">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-brand-light text-sm font-semibold tracking-widest uppercase mb-4">Contact</p>
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-3 leading-tight">Send me a message</h2>
          <p className="text-white/55 text-sm mb-8">
            Prefer to write? Drop a note and I&apos;ll get back to you, usually within 24 hours.
          </p>
          <ContactForm />
        </div>
      </Section>

      {/* Recruiter CTA */}
      <Section className="py-16 sm:py-20 md:py-28 bg-hero-gradient section-divider">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-brand-light text-sm font-semibold tracking-widest uppercase mb-4">
            Get in touch
          </p>
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4 leading-tight">
            {cta.heading || "Let's work together."}
          </h2>
          {cta.subtext && (
            <p className="text-white/65 text-base sm:text-lg leading-relaxed mb-9 max-w-2xl mx-auto">
              {cta.subtext}
            </p>
          )}
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Link to="/hire" className={`${btn} bg-white text-brand-dark hover:bg-brand-light hover:text-white`}>
              <Calendar size={16} /> Schedule a hiring call
            </Link>
            {vc.email && (
              <a
                href={`mailto:${vc.email}`}
                onClick={() => trackEvent(ANALYTICS_EVENTS.EMAIL_CLICK, { from: 'profile_cta' })}
                className={`${btn} border border-brand-accent text-white hover:bg-brand-navy`}
              >
                <Mail size={16} /> Email me
              </a>
            )}
            {settings.resumeUrl && (
              <a
                href={settings.resumeUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => trackEvent(ANALYTICS_EVENTS.RESUME_DOWNLOAD, { from: 'profile_cta' })}
                className={`${btn} border border-brand-border text-white/80 hover:border-brand-accent hover:text-white`}
              >
                <Download size={16} /> Resume
              </a>
            )}
            <VCardButton className={`${btn} border border-brand-border text-white/80 hover:border-brand-accent hover:text-white`} />
            {about.linkedinUrl && (
              <a
                href={about.linkedinUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => trackEvent(ANALYTICS_EVENTS.OUTBOUND_LINKEDIN, { from: 'profile_cta' })}
                className={`${btn} border border-brand-border text-white/80 hover:border-brand-accent hover:text-white`}
              >
                <LinkedInIcon size={16} /> LinkedIn
              </a>
            )}
          </div>
        </div>
      </Section>

      {/* Footer */}
      <footer className="border-t border-brand-border bg-brand-dark">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-white/55 text-sm text-center sm:text-left">{name} · {vc.email}</p>
          <VCardButton />
        </div>
      </footer>
    </div>
  )
}
