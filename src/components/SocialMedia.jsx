import { useRef, useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence, useInView } from 'framer-motion'
import { Layers, X, ChevronLeft, ChevronRight, ChevronDown, ExternalLink } from 'lucide-react'
import { socialOrgs, postImages } from '../data/social'

const DEFAULT_VISIBLE = 4

// One graphic in the org grid. Single-image posts show the image; carousels
// show their cover slide with a slide-count badge. Clicking opens the lightbox.
function PostTile({ post, onOpen, index }) {
  const images = postImages(post)
  if (images.length === 0) return null
  const isCarousel = images.length > 1

  return (
    <motion.button
      type="button"
      onClick={() => onOpen(post, 0)}
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{ duration: 0.4, delay: (index % 4) * 0.05 }}
      className="group relative block overflow-hidden rounded-xl bg-brand-mid border border-brand-border hover:border-brand-accent/60 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-light transition-colors text-left"
    >
      {/* 3:4 portrait preview (Instagram-style) */}
      <div className="aspect-[3/4] overflow-hidden">
        <img
          src={images[0]}
          alt={post.title}
          loading="lazy"
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
      </div>

      {/* Carousel badge */}
      {isCarousel && (
        <span className="absolute top-2 right-2 flex items-center gap-1 rounded-full bg-brand-dark/80 backdrop-blur-sm px-2 py-1 text-[11px] font-semibold text-white">
          <Layers size={12} /> {images.length}
        </span>
      )}

      {/* Title overlay */}
      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-brand-dark/95 via-brand-dark/55 to-transparent p-3 pt-8">
        <p className="text-white text-sm font-semibold leading-snug line-clamp-2">{post.title}</p>
      </div>
    </motion.button>
  )
}

function OrgSection({ org, onOpen }) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, amount: 0.1 })
  const [expanded, setExpanded] = useState(false)

  // Curated "best" posts (top: true) lead; sort is stable so the rest keep order.
  const ordered = [...org.posts].sort((a, b) => (b.top ? 1 : 0) - (a.top ? 1 : 0))
  const hasMore = ordered.length > DEFAULT_VISIBLE
  const visible = expanded ? ordered : ordered.slice(0, DEFAULT_VISIBLE)
  const hiddenCount = ordered.length - DEFAULT_VISIBLE

  return (
    <div ref={ref} className="mb-16 last:mb-0">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.5 }}
        className="mb-7 border-l-2 border-brand-accent pl-4"
      >
        <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
          <h3 className="text-2xl font-bold text-white">{org.org}</h3>
          {org.period && (
            <span className="text-white/55 text-sm font-medium">{org.period}</span>
          )}
        </div>
        <p className="text-brand-light font-semibold mt-0.5">
          {org.role}
          {org.sub && <span className="text-white/55 font-normal"> · {org.sub}</span>}
        </p>
        {org.blurb && (
          <p className="text-white/60 text-[15px] leading-relaxed mt-3 max-w-3xl">{org.blurb}</p>
        )}
        {org.link && (
          <a
            href={org.link.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 mt-3 text-sm font-semibold text-brand-light hover:text-white transition-colors"
          >
            {org.link.label} <ExternalLink size={13} />
          </a>
        )}
      </motion.div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
        {visible.map((post, i) => (
          <PostTile key={post.title} post={post} onOpen={onOpen} index={i} />
        ))}
      </div>

      {hasMore && (
        <div className="mt-6">
          <button
            type="button"
            onClick={() => setExpanded((v) => !v)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-brand-border bg-brand-mid/60 text-white/80 text-sm font-semibold hover:border-brand-accent hover:text-white transition-colors"
          >
            {expanded ? 'Show less' : `View ${hiddenCount} more`}
            <ChevronDown size={16} className={`transition-transform ${expanded ? 'rotate-180' : ''}`} />
          </button>
        </div>
      )}
    </div>
  )
}

// Full-screen lightbox for viewing a post's slides. Nav arrows flank the image.
function Lightbox({ post, startIndex, onClose }) {
  const images = post ? postImages(post) : []
  const [i, setI] = useState(startIndex || 0)

  const prev = useCallback(
    () => setI((v) => (v - 1 + images.length) % images.length),
    [images.length]
  )
  const next = useCallback(() => setI((v) => (v + 1) % images.length), [images.length])

  useEffect(() => {
    if (!post) return
    const onKey = (e) => {
      if (e.key === 'Escape') onClose()
      else if (e.key === 'ArrowLeft') prev()
      else if (e.key === 'ArrowRight') next()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [post, onClose, prev, next])

  if (!post) return null
  const isCarousel = images.length > 1

  const arrowBtn =
    'flex-shrink-0 p-1.5 sm:p-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors'

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      onClick={onClose}
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/90 backdrop-blur-sm p-4 sm:p-8"
    >
      {/* Close */}
      <button
        type="button"
        onClick={onClose}
        aria-label="Close"
        className="absolute top-4 right-4 z-10 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
      >
        <X size={22} />
      </button>

      {/* Content */}
      <div
        onClick={(e) => e.stopPropagation()}
        className="flex flex-col items-center w-full max-w-4xl"
      >
        {/* Arrows directly flanking the image for easy navigation */}
        <div className="flex items-center justify-center gap-2 sm:gap-4 w-full">
          {isCarousel && (
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); prev() }}
              aria-label="Previous slide"
              className={arrowBtn}
            >
              <ChevronLeft className="w-6 h-6 sm:w-7 sm:h-7" />
            </button>
          )}

          <AnimatePresence mode="wait">
            <motion.img
              key={images[i]}
              src={images[i]}
              alt={`${post.title}${isCarousel ? ` — slide ${i + 1}` : ''}`}
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.18 }}
              className="max-h-[72vh] w-auto max-w-full object-contain rounded-lg shadow-2xl"
            />
          </AnimatePresence>

          {isCarousel && (
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); next() }}
              aria-label="Next slide"
              className={arrowBtn}
            >
              <ChevronRight className="w-6 h-6 sm:w-7 sm:h-7" />
            </button>
          )}
        </div>

        <div className="mt-4 text-center max-w-2xl">
          <div className="flex items-center justify-center gap-3">
            <h4 className="text-white font-semibold text-lg">{post.title}</h4>
            {isCarousel && (
              <span className="text-white/55 text-sm font-medium tabular-nums">
                {i + 1} / {images.length}
              </span>
            )}
          </div>
          {post.description && (
            <p className="text-white/60 text-sm mt-1.5 leading-relaxed">{post.description}</p>
          )}
        </div>
      </div>
    </motion.div>
  )
}

export default function SocialMedia({ containerClass = 'max-w-7xl' }) {
  const [active, setActive] = useState(null) // { post, index }
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, amount: 0.1 })

  const open = (post, index) => setActive({ post, index })
  const close = () => setActive(null)

  if (!socialOrgs.length) return null

  return (
    <section className="py-24 md:py-32 bg-brand-dark border-t border-brand-border">
      <div className={`${containerClass} mx-auto px-4 sm:px-6 lg:px-8`}>
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 24 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="mb-14"
        >
          <p className="text-brand-light text-sm font-semibold tracking-widest uppercase mb-4">
            Social Media
          </p>
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Social Media & Content Design</h2>
          <p className="text-white/60 text-lg max-w-2xl">
            Graphics, carousels, and campaigns produced across roles — organized by organization.
            Click any post to view it full-size; multi-slide carousels expand to swipe through.
          </p>
        </motion.div>

        {socialOrgs.map((org) => (
          <OrgSection key={org.id} org={org} onOpen={open} />
        ))}
      </div>

      <AnimatePresence>
        {active && (
          <Lightbox
            key={`${active.post.title}-${active.index}`}
            post={active.post}
            startIndex={active.index}
            onClose={close}
          />
        )}
      </AnimatePresence>
    </section>
  )
}
