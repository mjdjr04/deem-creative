import { useEffect, useState } from 'react'
import { Link, Navigate, useParams } from 'react-router-dom'
import { ArrowLeft, ArrowRight, ExternalLink, ImageOff, Play } from 'lucide-react'
import { CASE_STUDIES, getCaseStudy, visibleStats } from '../data/caseStudies'

const still = id => `https://img.youtube.com/vi/${id}/maxresdefault.jpg`

function Placeholder({ alt, className = '' }) {
  return (
    <div
      role="img"
      aria-label={alt}
      className={`flex flex-col items-center justify-center gap-2 bg-brand-surface/60 text-white/40 text-xs ${className}`}
    >
      <ImageOff size={22} aria-hidden="true" />
      <span>Image coming soon</span>
    </div>
  )
}

function Img({ src, alt, className = '', eager = false }) {
  const [failed, setFailed] = useState(false)
  if (failed) return <Placeholder alt={alt} className={className} />
  return (
    <img
      src={src}
      alt={alt}
      loading={eager ? 'eager' : 'lazy'}
      onError={() => setFailed(true)}
      className={`object-cover ${className}`}
    />
  )
}

function Hero({ study }) {
  const [playing, setPlaying] = useState(false)
  const [stillFailed, setStillFailed] = useState(false)
  const { youtubeId } = study.hero

  if (!youtubeId) {
    return (
      <div className="max-w-6xl mx-auto aspect-[21/9] overflow-hidden md:rounded-2xl">
        <Img src={study.hero.image} alt={study.hero.alt || study.title} eager className="w-full h-full" />
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto aspect-video md:aspect-[21/9] relative overflow-hidden bg-black md:rounded-2xl">
      {playing ? (
        <iframe
          src={`https://www.youtube-nocookie.com/embed/${youtubeId}?autoplay=1&rel=0`}
          title={study.title}
          allow="autoplay; encrypted-media; picture-in-picture"
          allowFullScreen
          className="absolute inset-0 w-full h-full border-0"
        />
      ) : (
        <button
          type="button"
          onClick={() => setPlaying(true)}
          aria-label={`Play ${study.title}`}
          className="group absolute inset-0 w-full h-full"
        >
          {stillFailed ? (
            <div className="absolute inset-0 bg-brand-surface" />
          ) : (
            <img
              src={still(youtubeId)}
              alt=""
              onError={() => setStillFailed(true)}
              className="absolute inset-0 w-full h-full object-cover"
            />
          )}
          <span className="absolute inset-0 bg-black/25 group-hover:bg-black/10 transition-colors" />
          <span className="absolute inset-0 flex items-center justify-center">
            <span className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-white text-brand-dark flex items-center justify-center shadow-xl group-hover:scale-105 transition-transform">
              <Play size={28} className="ml-1" fill="currentColor" aria-hidden="true" />
            </span>
          </span>
        </button>
      )}
    </div>
  )
}

function useActiveChapter(ids) {
  const [active, setActive] = useState(ids[0])
  useEffect(() => {
    if (typeof IntersectionObserver === 'undefined') return
    const seen = new Map()
    const io = new IntersectionObserver(
      entries => {
        for (const e of entries) seen.set(e.target.id, e.isIntersecting)
        const first = ids.find(id => seen.get(`chapter-${id}`))
        if (first) setActive(first)
      },
      { rootMargin: '-20% 0px -60% 0px' },
    )
    ids.forEach(id => {
      const el = document.getElementById(`chapter-${id}`)
      if (el) io.observe(el)
    })
    return () => io.disconnect()
  }, [ids.join('|')]) // eslint-disable-line react-hooks/exhaustive-deps
  return active
}

function ChapterNav({ chapters, active }) {
  const go = (e, id) => {
    e.preventDefault()
    document.getElementById(`chapter-${id}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }
  return (
    <nav
      aria-label="Chapters"
      className="sticky top-16 z-20 -mx-4 px-4 py-2 bg-brand-dark/90 backdrop-blur md:static md:mx-0 md:px-0 md:py-0 md:bg-transparent md:backdrop-blur-none md:top-auto"
    >
      <ol className="flex gap-2 overflow-x-auto md:flex-col md:gap-1 md:overflow-visible md:sticky md:top-28">
        {chapters.map((c, i) => {
          const on = c.id === active
          return (
            <li key={c.id} className="flex-shrink-0">
              <a
                href={`#chapter-${c.id}`}
                onClick={e => go(e, c.id)}
                aria-current={on ? 'true' : undefined}
                className={`block whitespace-nowrap rounded-full md:rounded-none px-3 py-1.5 md:px-0 md:py-1 text-sm transition-colors border md:border-0 ${
                  on
                    ? 'text-white font-semibold border-brand-light bg-brand-accent/30'
                    : 'text-white/55 hover:text-white border-brand-border'
                }`}
              >
                <span className="text-brand-light/80 mr-1.5 tabular-nums">{String(i + 1).padStart(2, '0')}</span>
                {c.label}
              </a>
            </li>
          )
        })}
      </ol>
    </nav>
  )
}

function Chapter({ chapter, index, slug }) {
  const flip = index % 2 === 1
  return (
    <section id={`chapter-${chapter.id}`} className="scroll-mt-32 grid md:grid-cols-2 gap-6 md:gap-10 items-center">
      <div className={flip ? 'md:order-2' : ''}>
        <div className="aspect-[4/3] overflow-hidden rounded-xl border border-brand-border">
          <Img
            src={chapter.images[0].src}
            alt={chapter.images[0].alt}
            className="w-full h-full"
            key={`${slug}-${chapter.id}`}
          />
        </div>
      </div>
      <div>
        <p className="text-brand-light text-xs font-semibold tracking-widest uppercase mb-2">
          {String(index + 1).padStart(2, '0')} · {chapter.label}
        </p>
        <h2 className="text-white text-xl md:text-2xl font-bold mb-3">{chapter.heading}</h2>
        <p className="text-white/65 leading-relaxed mb-2">
          <span className="text-white font-semibold">The problem: </span>
          {chapter.problem}
        </p>
        <p className="text-white/65 leading-relaxed">
          <span className="text-white font-semibold">What I built: </span>
          {chapter.built}
        </p>
        {chapter.link && (
          <a
            href={chapter.link.href}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 mt-4 text-brand-light hover:text-white text-sm font-semibold transition-colors"
          >
            {chapter.link.label}
            <ExternalLink size={14} aria-hidden="true" />
          </a>
        )}
      </div>
    </section>
  )
}

export default function CaseStudyPage() {
  const { slug } = useParams()
  const study = getCaseStudy(slug)
  const ids = study ? study.chapters.map(c => c.id) : []
  const active = useActiveChapter(ids)

  useEffect(() => {
    if (study) window.scrollTo(0, 0)
  }, [slug, study])

  if (!study) return <Navigate to="/portfolio" replace />

  const stats = visibleStats(study.stats)
  const next = CASE_STUDIES[study.next]

  return (
    <article>
      <div className="pt-20 md:pt-28" style={{ background: 'linear-gradient(180deg, #060f1e 0%, #0A1628 100%)' }}>
        <Hero study={study} />
      </div>

      <header className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-8">
        <p className="text-brand-light text-sm font-semibold tracking-widest uppercase mb-3">
          {study.client} · {study.date}
        </p>
        <h1 className="text-3xl md:text-5xl font-bold text-white mb-4">{study.title}</h1>
        <p className="text-white/65 text-lg max-w-2xl leading-relaxed">{study.summary}</p>
        {stats.length > 0 && (
          <dl className="flex flex-wrap gap-x-10 gap-y-4 mt-8 py-5 border-y border-white/10">
            {stats.map(s => (
              <div key={s.label}>
                <dd className="text-white text-3xl font-bold order-first">{s.value}</dd>
                <dt className="text-white/55 text-sm">{s.label}</dt>
              </div>
            ))}
          </dl>
        )}
      </header>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-16 grid md:grid-cols-[11rem_1fr] gap-6 md:gap-10">
        <ChapterNav chapters={study.chapters} active={active} />
        <div className="grid gap-14 md:gap-20 min-w-0">
          {study.chapters.map((c, i) => (
            <Chapter key={c.id} chapter={c} index={i} slug={slug} />
          ))}
        </div>
      </div>

      {study.quote && (
        <blockquote className="max-w-3xl mx-auto px-4 pb-16 text-center">
          <p className="text-white/80 italic text-xl leading-relaxed">“{study.quote.text}”</p>
          <footer className="text-white/55 text-sm mt-3">
            {study.quote.name}, {study.quote.title}
          </footer>
        </blockquote>
      )}

      <footer className="bg-brand-mid border-t border-brand-border">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex items-center justify-between gap-4">
          <Link to="/portfolio" className="inline-flex items-center gap-2 text-white/65 hover:text-white transition-colors">
            <ArrowLeft size={16} aria-hidden="true" /> All work
          </Link>
          {next && (
            <Link to={`/work/${study.next}`} className="text-right group">
              <span className="block text-brand-light text-[11px] font-semibold tracking-widest uppercase">
                Next project
              </span>
              <span className="inline-flex items-center gap-2 text-white font-bold group-hover:text-brand-light transition-colors">
                {next.title} <ArrowRight size={16} aria-hidden="true" />
              </span>
            </Link>
          )}
        </div>
      </footer>
    </article>
  )
}
