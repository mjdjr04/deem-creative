import { useRef, useState, useEffect } from 'react'
import { motion, AnimatePresence, useInView } from 'framer-motion'
import { X, ArrowRight, Calendar } from 'lucide-react'
import { useContent } from '../context/ContentContext'

function formatDate(d) {
  if (!d) return ''
  // Parse YYYY-MM-DD as a local date (avoid timezone shifting the day).
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(d)
  const date = m ? new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3])) : new Date(d)
  if (isNaN(date)) return d
  return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
}

// The short blurb shown on a card: the AI/admin description, else a truncated caption.
function previewText(post) {
  if (post.description) return post.description.trim()
  const c = (post.caption || '').trim()
  if (c.length <= 160) return c
  return c.slice(0, 160).replace(/\s+\S*$/, '') + '…'
}

function PostCard({ post, index, onOpen }) {
  const cover = (post.photos || []).filter(Boolean)[0]
  const blurb = previewText(post)
  return (
    <motion.button
      type="button"
      onClick={() => onOpen(post)}
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{ duration: 0.5, delay: (index % 3) * 0.07 }}
      whileHover={{ y: -4 }}
      className="group text-left rounded-2xl bg-brand-mid border border-brand-border overflow-hidden hover:border-brand-accent/60 transition-colors flex flex-col"
    >
      {cover && (
        <div className="overflow-hidden">
          <img
            src={cover}
            alt={post.title || 'Feed post'}
            loading="lazy"
            className="w-full aspect-video object-cover group-hover:scale-[1.03] transition-transform duration-500"
          />
        </div>
      )}
      <div className="p-5 flex flex-col flex-1">
        {post.date && (
          <p className="text-brand-light text-xs font-medium tracking-wide uppercase mb-2">{formatDate(post.date)}</p>
        )}
        {post.title && <h3 className="text-white font-semibold text-lg mb-1.5 leading-snug">{post.title}</h3>}
        {blurb && <p className="text-white/65 text-sm leading-relaxed line-clamp-3">{blurb}</p>}
        <span className="mt-4 inline-flex items-center gap-1.5 text-brand-light text-sm font-semibold group-hover:text-white transition-colors">
          Read more
          <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
        </span>
      </div>
    </motion.button>
  )
}

function PostModal({ post, onClose }) {
  const photos = (post.photos || []).filter(Boolean)

  // Lock background scroll + close on Escape while the modal is open.
  useEffect(() => {
    document.body.classList.add('modal-open')
    const onKey = (e) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.classList.remove('modal-open')
      window.removeEventListener('keydown', onKey)
    }
  }, [onClose])

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
      className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-start sm:items-center justify-center overflow-y-auto p-0 sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-label={post.title || 'Post'}
    >
      <motion.article
        initial={{ opacity: 0, y: 24, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 24, scale: 0.98 }}
        transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
        onClick={(e) => e.stopPropagation()}
        className="relative w-full sm:max-w-2xl bg-brand-mid sm:rounded-2xl border border-brand-border min-h-screen sm:min-h-0 sm:my-auto"
      >
        <button
          onClick={onClose}
          aria-label="Close"
          className="absolute top-3 right-3 z-10 w-9 h-9 rounded-full bg-brand-dark/70 backdrop-blur border border-brand-border flex items-center justify-center text-white/80 hover:text-white hover:border-brand-accent transition-colors"
        >
          <X size={18} />
        </button>

        {photos.length > 0 && (
          <div className={`grid gap-0.5 sm:rounded-t-2xl overflow-hidden ${photos.length === 1 ? 'grid-cols-1' : 'grid-cols-2'}`}>
            {photos.map((url, i) => (
              <div key={i} className={`overflow-hidden ${photos.length % 2 === 1 && i === 0 ? 'col-span-2' : ''}`}>
                <img src={url} alt={`${post.title || 'Post'} — image ${i + 1}`} className="w-full h-full object-cover" />
              </div>
            ))}
          </div>
        )}

        <div className="p-6 sm:p-7">
          {post.date && (
            <p className="inline-flex items-center gap-1.5 text-brand-light text-xs font-medium tracking-wide uppercase mb-3">
              <Calendar size={13} /> {formatDate(post.date)}
            </p>
          )}
          {post.title && <h2 className="text-2xl font-bold text-white mb-3 leading-tight">{post.title}</h2>}
          {post.caption && (
            <p className="text-white/75 text-base leading-relaxed whitespace-pre-line">{post.caption}</p>
          )}
        </div>
      </motion.article>
    </motion.div>
  )
}

export default function Feed() {
  const posts = (useContent().feed?.items || []).filter(
    (p) => p && (p.caption || p.title || (p.photos || []).length),
  )
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, amount: 0.1 })
  const [active, setActive] = useState(null)

  if (posts.length === 0) return null

  return (
    <section id="feed" className="scroll-mt-20 py-20 sm:py-24 md:py-32 bg-section-gradient section-divider">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 24 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="mb-10 sm:mb-12"
        >
          <p className="text-brand-light text-sm font-semibold tracking-widest uppercase mb-4">Feed</p>
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Latest Updates</h2>
          <p className="text-white/60 text-base sm:text-lg max-w-2xl">
            Recent work, behind-the-scenes, and moments from the field. Tap any post to read the full story.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch">
          {posts.map((post, i) => (
            <PostCard key={post.id || i} post={post} index={i} onOpen={setActive} />
          ))}
        </div>
      </div>

      <AnimatePresence>
        {active && <PostModal post={active} onClose={() => setActive(null)} />}
      </AnimatePresence>
    </section>
  )
}
