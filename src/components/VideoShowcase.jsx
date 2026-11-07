import { memo, useCallback, useEffect, useReducer, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Play, Pause, ChevronLeft, ChevronRight } from 'lucide-react'
import { SHOWCASE } from '../data/showcase'
import { projects as localProjects } from '../data/projects'
import { useContent } from '../context/ContentContext'
import { slideshowReducer, initialState, SLIDE_MS } from '../lib/slideshow'
import VideoOverlay from './VideoOverlay'

const still = (id, size) => `https://img.youtube.com/vi/${id}/${size}.jpg`
const reducedMotionQuery = () =>
  typeof window !== 'undefined' && window.matchMedia
    ? window.matchMedia('(prefers-reduced-motion: reduce)')
    : null

// YouTube serves a 120x90 grey placeholder (HTTP 200) when maxres is missing,
// so onError alone never fires; treat a tiny image as a failure too.
function Still({ id, scale, active, eager, kenBurns }) {
  const [size, setSize] = useState('maxresdefault')
  const fallback = (e) => {
    if (size === 'maxresdefault') setSize('hqdefault')
    else e.currentTarget.onerror = null
  }
  return (
    <img
      src={still(id, size)}
      alt=""
      loading={eager ? 'eager' : 'lazy'}
      decoding="async"
      onError={fallback}
      onLoad={(e) => { if (e.currentTarget.naturalWidth <= 120) fallback(e) }}
      className="absolute inset-0 w-full h-full object-cover"
      style={{
        transform: kenBurns ? `scale(${scale})` : undefined,
        transition: !active && kenBurns ? 'transform .9s ease' : undefined,
      }}
    />
  )
}

const Slide = memo(function Slide({ item, active, eager, scale, kenBurns, playing }) {
  const videoRef = useRef(null)
  useEffect(() => {
    const v = videoRef.current
    if (!v) return
    if (active && playing) v.play?.().catch(() => {})
    else v.pause?.()
  }, [active, playing])

  return (
    <div
      className={`absolute inset-0 transition-opacity duration-[900ms] ease-in-out motion-reduce:transition-none ${
        active ? 'opacity-100' : 'opacity-0 pointer-events-none'
      }`}
      aria-hidden={!active}
    >
      {item.previewSrc ? (
        <video
          ref={videoRef}
          src={item.previewSrc}
          muted
          playsInline
          autoPlay
          loop
          preload="metadata"
          onLoadedMetadata={(e) => {
            if (item.previewStart) e.currentTarget.currentTime = item.previewStart
          }}
          className="absolute inset-0 w-full h-full object-cover"
        />
      ) : (
        <Still id={item.youtubeId} scale={scale} active={active} eager={eager} kenBurns={kenBurns} />
      )}
    </div>
  )
})

export default function VideoShowcase({ items = SHOWCASE, onProjectSelect }) {
  const navigate = useNavigate()
  const content = useContent()
  const n = items.length
  const [state, dispatch] = useReducer(slideshowReducer, n, (count) =>
    initialState(count, !!reducedMotionQuery()?.matches),
  )
  const [overlay, setOverlay] = useState(null) // index of the film in the overlay
  const sectionRef = useRef(null)
  const stageRef = useRef(null)
  const openerRef = useRef(null)

  const { index, elapsedMs, paused, reducedMotion } = state
  const item = items[index]

  // prefers-reduced-motion, live
  useEffect(() => {
    const mq = reducedMotionQuery()
    if (!mq) return
    const onChange = () => dispatch({ type: 'reducedMotion', value: mq.matches })
    onChange()
    mq.addEventListener?.('change', onChange)
    return () => mq.removeEventListener?.('change', onChange)
  }, [])

  // Clock: one rAF loop feeding dt into the pure reducer.
  useEffect(() => {
    if (reducedMotion || n < 2) return
    let raf
    let last = performance.now()
    const frame = (now) => {
      dispatch({ type: 'tick', dtMs: Math.min(now - last, 250) })
      last = now
      raf = requestAnimationFrame(frame)
    }
    raf = requestAnimationFrame(frame)
    return () => cancelAnimationFrame(raf)
  }, [reducedMotion, n])

  // Pause: tab hidden
  useEffect(() => {
    const onVis = () =>
      dispatch({ type: document.hidden ? 'pause' : 'resume', reason: 'hidden' })
    onVis()
    document.addEventListener('visibilitychange', onVis)
    return () => document.removeEventListener('visibilitychange', onVis)
  }, [])

  // Pause: less than 25% of the stage visible
  useEffect(() => {
    const el = sectionRef.current
    if (!el || typeof IntersectionObserver === 'undefined') return
    const io = new IntersectionObserver(
      ([entry]) =>
        dispatch({
          type: entry.intersectionRatio < 0.25 ? 'pause' : 'resume',
          reason: 'offscreen',
        }),
      { threshold: [0, 0.25, 0.5, 1] },
    )
    io.observe(stageRef.current || el)
    return () => io.disconnect()
  }, [])

  // Pause: overlay open
  useEffect(() => {
    dispatch({ type: overlay === null ? 'resume' : 'pause', reason: 'overlay' })
  }, [overlay])

  const openFilm = (i, e) => {
    openerRef.current = e.currentTarget
    dispatch({ type: 'go', index: i })
    setOverlay(i)
  }
  const closeOverlay = useCallback(() => setOverlay(null), [])

  // "About this project": case-study route if the record has one, else the modal.
  const publishedItems = content?.projects?.items ?? content?.projects ?? []
  const record =
    (Array.isArray(publishedItems) && publishedItems.find((p) => p.id === item.projectId)) ||
    localProjects.find((p) => p.id === item.projectId) ||
    null
  const canAbout = !!record && (!!record.caseStudyPath || typeof onProjectSelect === 'function')
  const onAbout = () => {
    if (!record) return
    if (record.caseStudyPath) navigate(record.caseStudyPath)
    else onProjectSelect?.(record)
  }
  const description = record?.brief || record?.summary || record?.shortDescription || ''

  const onBlur = (e) => {
    if (!e.currentTarget.contains(e.relatedTarget)) dispatch({ type: 'resume', reason: 'focus' })
  }
  const onKeyDown = (e) => {
    if (e.key === 'ArrowRight') dispatch({ type: 'next' })
    else if (e.key === 'ArrowLeft') dispatch({ type: 'prev' })
  }

  const userPaused = paused.has('user')
  const playing = paused.size === 0 && !reducedMotion
  const progress = Math.min(1, elapsedMs / SLIDE_MS)
  const kenBurns = !reducedMotion
  const pad = (v) => String(v).padStart(2, '0')

  const ctrlBtn =
    'inline-flex items-center justify-center w-11 h-11 min-[700px]:w-9 min-[700px]:h-9 rounded-full bg-black/55 text-white hover:bg-black/75 transition-colors'

  return (
    <section
      ref={sectionRef}
      aria-labelledby="video-showcase-heading"
      className="py-24 md:py-32 bg-brand-dark section-divider"
      onKeyDown={onKeyDown}
    >
      <div className="max-w-[1100px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <p className="text-brand-light text-sm font-semibold tracking-widest uppercase mb-4">
            01 · Video
          </p>
          <h2 id="video-showcase-heading" className="text-3xl md:text-4xl font-bold text-white mb-3">
            Watch the work
          </h2>
          <p className="text-white/70 text-lg">
            {n} films for nonprofits, schools and community partners.
          </p>
        </div>

        <div
          ref={stageRef}
          role="group"
          aria-roledescription="carousel"
          aria-label="Featured films"
          className="relative aspect-video rounded-[14px] overflow-hidden bg-black shadow-[0_20px_60px_rgba(0,0,0,0.5)]"
          onMouseEnter={() => dispatch({ type: 'pause', reason: 'hover' })}
          onMouseLeave={() => dispatch({ type: 'resume', reason: 'hover' })}
          onFocus={(e) => {
            // keyboard focus only; a mouse click must not leave the show frozen
            let visible = true
            try { visible = e.target.matches(':focus-visible') } catch { /* older engines */ }
            if (visible) dispatch({ type: 'pause', reason: 'focus' })
          }}
          onBlur={onBlur}
        >
          {items.map((it, i) => (
            <Slide
              key={it.youtubeId}
              item={it}
              active={i === index}
              eager={i === index || i === (index + 1) % n}
              scale={i === index ? 1 + 0.08 * progress : 1}
              kenBurns={kenBurns}
              playing={playing}
            />
          ))}

          <div
            aria-hidden="true"
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                'linear-gradient(90deg,rgba(6,14,28,.92) 0%,rgba(6,14,28,.35) 50%,transparent 75%),linear-gradient(0deg,rgba(6,14,28,.85),transparent 40%)',
            }}
          />

          <div className="absolute left-4 bottom-[50px] max-w-[85%] min-[700px]:left-8 min-[700px]:bottom-16 min-[700px]:max-w-[48%]">
            <p className="text-xs font-bold tracking-[0.15em] text-brand-light">
              {pad(index + 1)} / {pad(n)} · {item.caption}
            </p>
            <h3 className="mt-2 mb-2 text-[22px] min-[700px]:text-[34px] font-bold leading-[1.05] text-white">
              {item.title}
            </h3>
            {description && (
              <p className="hidden min-[700px]:block mb-4 text-[15px] text-white/75">{description}</p>
            )}
            <div className="mt-3 min-[700px]:mt-0 flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={(e) => openFilm(index, e)}
                aria-label={`Watch full video: ${item.title}`}
                className="inline-flex items-center gap-2 rounded-full bg-white text-brand-dark font-bold text-sm px-[18px] py-[11px] hover:bg-white/90 transition-colors"
              >
                <Play size={14} fill="currentColor" aria-hidden="true" /> Watch full video
              </button>
              {canAbout && (
                <button
                  type="button"
                  onClick={onAbout}
                  aria-label={`About this project: ${item.title}`}
                  className="inline-flex items-center rounded-full border border-white/40 text-white font-bold text-sm px-[18px] py-[11px] hover:bg-white/10 transition-colors"
                >
                  About this project
                </button>
              )}
            </div>
          </div>

          <div className="absolute top-4 right-4 flex gap-1.5">
            <button type="button" className={ctrlBtn} aria-label="Previous film" onClick={() => dispatch({ type: 'prev' })}>
              <ChevronLeft size={18} aria-hidden="true" />
            </button>
            {!reducedMotion && (
              <button
                type="button"
                className={ctrlBtn}
                aria-label={userPaused ? 'Play slideshow' : 'Pause slideshow'}
                aria-pressed={userPaused}
                onClick={() => dispatch({ type: userPaused ? 'resume' : 'pause', reason: 'user' })}
              >
                {userPaused ? <Play size={16} aria-hidden="true" /> : <Pause size={16} aria-hidden="true" />}
              </button>
            )}
            <button type="button" className={ctrlBtn} aria-label="Next film" onClick={() => dispatch({ type: 'next' })}>
              <ChevronRight size={18} aria-hidden="true" />
            </button>
          </div>

          <div className="absolute left-4 right-4 bottom-2 min-[700px]:left-8 min-[700px]:right-8 min-[700px]:bottom-[18px] flex gap-1.5">
            {items.map((it, i) => (
              <button
                key={it.youtubeId}
                type="button"
                onClick={() => dispatch({ type: 'go', index: i })}
                aria-label={`Go to film ${i + 1} of ${n}: ${it.title}`}
                aria-current={i === index ? 'true' : undefined}
                className="group flex-1 py-2 cursor-pointer"
              >
                <span className="block h-[3px] rounded-sm bg-white/25 overflow-hidden">
                  <span
                    className="block h-full bg-white"
                    style={{
                      width: i < index ? '100%' : i === index ? `${reducedMotion ? 100 : progress * 100}%` : '0%',
                    }}
                  />
                </span>
              </button>
            ))}
          </div>
        </div>

        <div className="mt-3.5 flex gap-2.5 overflow-x-auto snap-x scrollbar-hide min-[700px]:grid min-[700px]:grid-cols-7 min-[700px]:overflow-visible pb-1 pt-1">
          {items.map((it, i) => (
            <button
              key={it.youtubeId}
              type="button"
              onClick={(e) => openFilm(i, e)}
              aria-label={`Watch ${it.title}`}
              aria-current={i === index ? 'true' : undefined}
              className={`group relative shrink-0 basis-[38%] snap-start min-[700px]:basis-auto aspect-video rounded-lg overflow-hidden bg-black outline outline-2 outline-offset-0 transition-[outline-color,transform] duration-300 ${
                i === index ? 'outline-white -translate-y-[3px]' : 'outline-transparent'
              }`}
            >
              <img
                src={still(it.youtubeId, 'mqdefault')}
                alt=""
                loading="lazy"
                className={`w-full h-full object-cover transition-opacity duration-300 group-hover:opacity-100 ${
                  i === index ? 'opacity-100' : 'opacity-55'
                }`}
              />
              <span className="absolute left-2.5 right-2.5 bottom-2 text-left text-[10.5px] font-bold text-white [text-shadow:0_1px_3px_#000]">
                {it.title}
              </span>
            </button>
          ))}
        </div>
      </div>

      {overlay !== null && (
        <VideoOverlay
          item={items[overlay]}
          nextTitle={n > 1 ? items[(overlay + 1) % n].title : null}
          onClose={closeOverlay}
          returnFocusRef={openerRef}
        />
      )}
    </section>
  )
}
