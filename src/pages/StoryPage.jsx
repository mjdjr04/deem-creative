import { useEffect } from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import PageHero from '../components/PageHero'
import { STORIES } from '../data/stories'
import { WHITEPAPER } from '../data/whitepaper'

const reveal = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.15 },
  transition: { duration: 0.6 },
}

export default function StoryPage() {
  useEffect(() => {
    document.title = 'My Story | Michael Deem Jr.'
  }, [])

  return (
    <>
      <PageHero eyebrow="My Story" title="Where I started, what changed, how I work, and where I’m going.">
        Four short stories behind the work.
      </PageHero>

      {/* Chapter links */}
      <nav aria-label="Stories" className="bg-brand-dark border-b border-brand-border">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-wrap gap-2">
          {STORIES.map((s, i) => (
            <a
              key={s.id}
              href={`#${s.id}`}
              className="px-3 py-1.5 rounded-full border border-brand-border text-white/70 text-sm hover:border-brand-accent hover:text-white transition-colors"
            >
              <span className="text-brand-light/70 mr-1.5">0{i + 1}</span>
              {s.label}
            </a>
          ))}
        </div>
      </nav>

      <div className="bg-brand-dark">
        {STORIES.map((story, i) => (
          <section key={story.id} id={story.id} className="scroll-mt-24 py-16 md:py-24 section-divider">
            <motion.article {...reveal} className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
              <p className="text-brand-light text-sm font-semibold tracking-widest uppercase mb-3">
                0{i + 1} · {story.label} Story
              </p>
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-8 leading-tight">{story.title}</h2>
              {(story.paragraphs || []).map((p, j) => (
                <p key={j} className="text-white/75 text-lg leading-relaxed mb-5">{p}</p>
              ))}
              {story.steps && (
                <ol className="mt-8 space-y-6">
                  {story.steps.map((step, j) => (
                    <li key={step.title} className="flex gap-4">
                      <span
                        aria-hidden="true"
                        className="flex-shrink-0 w-10 h-10 rounded-full bg-brand-navy border border-brand-accent/40 text-brand-light font-bold flex items-center justify-center"
                      >
                        {j + 1}
                      </span>
                      <div>
                        <h3 className="text-white font-semibold text-lg mb-1">{step.title}</h3>
                        <p className="text-white/70 leading-relaxed">{step.body}</p>
                      </div>
                    </li>
                  ))}
                </ol>
              )}
            </motion.article>
          </section>
        ))}
      </div>

      <section className="py-16 md:py-20 bg-section-gradient section-divider">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row gap-4">
          <Link
            to={`/writing/${WHITEPAPER.slug}`}
            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-white text-brand-dark font-semibold text-sm hover:bg-brand-light hover:text-white transition-colors"
          >
            Read “{WHITEPAPER.title}” <ArrowRight size={16} aria-hidden="true" />
          </Link>
          <Link
            to="/services"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg border border-brand-accent text-white font-semibold text-sm hover:bg-brand-navy transition-colors"
          >
            Ways to work with me <ArrowRight size={16} aria-hidden="true" />
          </Link>
        </div>
      </section>
    </>
  )
}
