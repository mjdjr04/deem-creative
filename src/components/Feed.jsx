import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import { useContent } from '../context/ContentContext'

function formatDate(d) {
  if (!d) return ''
  // Parse YYYY-MM-DD as a local date (avoid timezone shifting the day).
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(d)
  const date = m ? new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3])) : new Date(d)
  if (isNaN(date)) return d
  return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
}

function PostCard({ post, index }) {
  const photos = (post.photos || []).filter(Boolean)
  return (
    <motion.article
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{ duration: 0.5, delay: (index % 3) * 0.07 }}
      className="rounded-2xl bg-brand-mid border border-brand-border overflow-hidden hover:border-brand-accent/50 transition-colors"
    >
      {photos.length > 0 && (
        <div className={`grid gap-0.5 ${photos.length === 1 ? 'grid-cols-1' : 'grid-cols-2'}`}>
          {photos.slice(0, 4).map((url, i) => (
            <div key={i} className={`overflow-hidden ${photos.length === 3 && i === 0 ? 'col-span-2' : ''}`}>
              <img src={url} alt={post.title || 'Feed post'} className="w-full h-full object-cover aspect-video" />
            </div>
          ))}
        </div>
      )}
      <div className="p-5">
        {post.date && (
          <p className="text-brand-light text-xs font-medium tracking-wide uppercase mb-2">{formatDate(post.date)}</p>
        )}
        {post.title && <h3 className="text-white font-semibold text-lg mb-1.5">{post.title}</h3>}
        {post.caption && <p className="text-white/65 text-sm leading-relaxed whitespace-pre-line">{post.caption}</p>}
      </div>
    </motion.article>
  )
}

export default function Feed() {
  const posts = (useContent().feed?.items || []).filter((p) => p && (p.caption || p.title || (p.photos || []).length))
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, amount: 0.1 })

  if (posts.length === 0) return null

  return (
    <section className="py-24 md:py-32 bg-section-gradient section-divider">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 24 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="mb-12"
        >
          <p className="text-brand-light text-sm font-semibold tracking-widest uppercase mb-4">Feed</p>
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Latest Updates</h2>
          <p className="text-white/60 text-lg max-w-2xl">Recent work, behind-the-scenes, and moments from the field.</p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 items-start">
          {posts.map((post, i) => (
            <PostCard key={post.id || i} post={post} index={i} />
          ))}
        </div>
      </div>
    </section>
  )
}
