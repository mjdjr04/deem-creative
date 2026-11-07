import { useRef, useState } from 'react'
import { Play } from 'lucide-react'
import { HERO_LOOP_SRC, REEL_YOUTUBE_ID } from '../data/showcase'
import VideoOverlay from './VideoOverlay'

const TRIBUTE_ID = '8yVfb2hg0tk'
const LOCAL_STILL = '/assets/work/bgccc-gala/film-still.jpg'

// Quiet full-bleed layer behind a hero: the silent loop when one exists,
// otherwise the gala tribute still with a slow push-in. Reduced motion gets a
// static frame either way. A dark wash keeps the overlaid text readable.
export default function HeroBackdrop() {
  const [src, setSrc] = useState(`https://img.youtube.com/vi/${TRIBUTE_ID}/maxresdefault.jpg`)
  const fallback = () => setSrc((cur) => (cur === LOCAL_STILL ? cur : LOCAL_STILL))

  return (
    <div aria-hidden="true" className="absolute inset-0 overflow-hidden">
      {HERO_LOOP_SRC ? (
        <video
          src={HERO_LOOP_SRC}
          poster={LOCAL_STILL}
          autoPlay
          muted
          loop
          playsInline
          className="absolute inset-0 w-full h-full object-cover motion-reduce:hidden"
        />
      ) : null}
      <img
        src={src}
        alt=""
        decoding="async"
        onError={fallback}
        onLoad={(e) => { if (e.currentTarget.naturalWidth <= 120) fallback() }}
        className={`absolute inset-0 w-full h-full object-cover ${HERO_LOOP_SRC ? 'hidden motion-reduce:block' : 'hero-drift'}`}
      />
      <div
        className="absolute inset-0"
        style={{ background: 'linear-gradient(180deg, rgba(6,15,30,0.9) 0%, rgba(6,15,30,0.86) 45%, rgba(10,22,40,0.96) 100%)' }}
      />
    </div>
  )
}

// Shown only once a reel exists (REEL_YOUTUBE_ID); opens the film in the same
// overlay the showcase uses.
export function WatchReelButton({ className = '' }) {
  const [open, setOpen] = useState(false)
  const openerRef = useRef(null)
  if (!REEL_YOUTUBE_ID) return null
  return (
    <>
      <button
        type="button"
        ref={openerRef}
        onClick={() => setOpen(true)}
        className={`inline-flex items-center gap-2 rounded-lg bg-white text-brand-dark font-bold text-base px-8 py-3.5 hover:bg-brand-light hover:text-white transition-colors cursor-pointer ${className}`}
      >
        <Play size={16} fill="currentColor" aria-hidden="true" /> Watch the reel
      </button>
      {open && (
        <VideoOverlay
          item={{ youtubeId: REEL_YOUTUBE_ID, title: 'The Deem Creative reel' }}
          onClose={() => setOpen(false)}
          returnFocusRef={openerRef}
        />
      )}
    </>
  )
}
