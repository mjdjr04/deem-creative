import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'
import { useContent } from '../context/ContentContext'
import { projects as localProjects } from '../data/projects'
import { CASE_STUDIES, visibleStats } from '../data/caseStudies'

const GALA_STILL = 'https://img.youtube.com/vi/8yVfb2hg0tk/maxresdefault.jpg'
// film-still.jpg is a wide banner crop, so it is only the fallback if YouTube's frame is missing.
const GALA_FALLBACK = '/assets/work/bgccc-gala/film-still.jpg'
const CLUBS_STILL = 'https://img.youtube.com/vi/vIKMqCUvkYM/mqdefault.jpg'

const cardBase =
  'group card-glow flex w-full flex-col text-left rounded-2xl bg-card-gradient border border-brand-border overflow-hidden hover:border-brand-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white'
const zoom = 'w-full h-full object-cover motion-safe:transition-transform motion-safe:duration-500 motion-safe:group-hover:scale-105'

// Case-study route when the record has one, otherwise the project modal.
function CardShell({ record, onProjectSelect, className, children }) {
  if (record.caseStudyPath) {
    return <Link to={record.caseStudyPath} className={`${cardBase} ${className}`}>{children}</Link>
  }
  return (
    <button type="button" onClick={() => onProjectSelect?.(record)} className={`${cardBase} ${className}`}>
      {children}
    </button>
  )
}

function GalaStill({ alt }) {
  const [src, setSrc] = useState(GALA_STILL)
  const fallback = () => setSrc(GALA_FALLBACK)
  return (
    <img
      src={src}
      alt={alt}
      loading="lazy"
      onError={fallback}
      onLoad={(e) => { if (e.currentTarget.naturalWidth <= 120) fallback() }}
      className={zoom}
    />
  )
}

export default function BuiltForBGCCC({ onProjectSelect }) {
  const content = useContent()
  // Published records first (admin edits win); the new projects aren't in
  // Supabase until the sync script runs, so fall back to the bundled ones.
  const published = content?.projects?.items ?? []
  const find = (id) =>
    (Array.isArray(published) && published.find((p) => p.id === id)) ||
    localProjects.find((p) => p.id === id) ||
    null

  const gala = find('bgccc-gala')
  const connect = find('bgccc-connect')
  const letters = find('bgccc-letter-builder')
  const clubs = find('boys-girls-clubs')
  if (!gala) return null

  const stats = visibleStats(CASE_STUDIES['bgccc-gala']?.stats).slice(0, 2)
  const side = [
    connect && { record: connect, src: connect.mediaUrl || '/assets/work/bgccc-connect/hero.jpg', alt: 'A staff contact page on a phone next to its QR code' },
    letters && { record: letters, src: letters.mediaUrl || '/assets/work/bgccc-letter-builder/hero.jpg', alt: 'A letter set on the Club letterhead' },
  ].filter(Boolean)

  return (
    <section
      aria-labelledby="bgccc-heading"
      className="py-24 md:py-32 section-divider"
      style={{ background: 'linear-gradient(135deg, #0D3472 0%, #0A1628 70%)' }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.6 }}
          className="mb-10 max-w-3xl"
        >
          <h2 id="bgccc-heading" className="text-3xl md:text-4xl font-bold text-white mb-3">
            Built for Boys &amp; Girls Clubs of Cumberland County
          </h2>
          <p className="text-white/75 text-lg">
            One partner, many problems solved. Film, an event system, and everyday tools for the staff.
          </p>
        </motion.div>

        <div className="grid gap-6 lg:grid-cols-[1.6fr_1fr]">
          <CardShell record={gala} onProjectSelect={onProjectSelect}>
            <div className="relative aspect-video overflow-hidden bg-black">
              <GalaStill alt="Still frame from the 2026 gala tribute film" />
            </div>
            <div className="p-6 md:p-7 flex flex-col flex-1">
              <h3 className="text-white font-bold text-xl md:text-2xl leading-snug mb-2 group-hover:text-brand-light transition-colors">
                {gala.title}
              </h3>
              <p className="text-white/70 leading-relaxed">{gala.brief}</p>
              {stats.length > 0 && (
                <dl className="flex gap-x-10 mt-5">
                  {stats.map((s) => (
                    <div key={s.label} className="flex flex-col-reverse">
                      <dt className="text-white/65 text-sm">{s.label}</dt>
                      <dd className="text-white text-3xl font-bold">{s.value}</dd>
                    </div>
                  ))}
                </dl>
              )}
              <span className="mt-6 inline-flex items-center gap-2 text-white font-semibold">
                Explore the project <ArrowRight size={16} aria-hidden="true" className="motion-safe:transition-transform motion-safe:group-hover:translate-x-1" />
              </span>
            </div>
          </CardShell>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-1 lg:grid-rows-2">
            {side.map(({ record, src, alt }) => (
              <CardShell key={record.id} record={record} onProjectSelect={onProjectSelect}>
                <div className="relative aspect-video lg:aspect-auto lg:flex-1 lg:min-h-36 overflow-hidden bg-black">
                  <img src={src} alt={alt} loading="lazy" className={`${zoom} lg:absolute lg:inset-0 object-top`} />
                </div>
                <div className="p-5">
                  <h3 className="text-white font-semibold text-lg leading-snug mb-1 group-hover:text-brand-light transition-colors">
                    {record.title}
                  </h3>
                  <p className="text-white/70 text-sm leading-relaxed line-clamp-2">{record.brief}</p>
                </div>
              </CardShell>
            ))}
          </div>
        </div>

        {clubs && (
          <CardShell record={clubs} onProjectSelect={onProjectSelect} className="mt-6 sm:flex-row">
            <div className="relative aspect-video sm:aspect-auto sm:w-64 shrink-0 overflow-hidden bg-black">
              <img src={CLUBS_STILL} alt="Still frame from the Open House impact video" loading="lazy" className={`${zoom} sm:absolute sm:inset-0`} />
            </div>
            <div className="p-5 sm:p-6">
              <h3 className="text-white font-semibold text-lg leading-snug mb-1 group-hover:text-brand-light transition-colors">
                {clubs.title}
              </h3>
              <p className="text-white/70 text-sm leading-relaxed line-clamp-2">{clubs.brief}</p>
              <p className="text-brand-light/80 text-xs font-medium mt-2">{clubs.role} · {clubs.year}</p>
            </div>
          </CardShell>
        )}
      </div>
    </section>
  )
}
