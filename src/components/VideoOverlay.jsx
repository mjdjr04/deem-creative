import { useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { X } from 'lucide-react'

const FOCUSABLE = 'a[href],button:not([disabled]),iframe,[tabindex]:not([tabindex="-1"])'

// Full-video dialog: youtube-nocookie embed, Esc closes, focus is trapped
// while open and handed back to the opener on close.
export default function VideoOverlay({ item, onClose, returnFocusRef, nextTitle }) {
  const dialogRef = useRef(null)
  const closeRef = useRef(null)
  const onCloseRef = useRef(onClose)
  useEffect(() => { onCloseRef.current = onClose })

  useEffect(() => {
    const returnTo = returnFocusRef?.current ?? document.activeElement
    closeRef.current?.focus()
    document.body.classList.add('modal-open')

    const onKeyDown = (e) => {
      if (e.key === 'Escape') {
        e.stopPropagation()
        onCloseRef.current()
        return
      }
      if (e.key !== 'Tab' || !dialogRef.current) return
      const nodes = [...dialogRef.current.querySelectorAll(FOCUSABLE)]
      if (nodes.length === 0) return
      const first = nodes[0]
      const last = nodes[nodes.length - 1]
      const active = document.activeElement
      if (e.shiftKey && (active === first || !dialogRef.current.contains(active))) {
        e.preventDefault()
        last.focus()
      } else if (!e.shiftKey && (active === last || !dialogRef.current.contains(active))) {
        e.preventDefault()
        first.focus()
      }
    }
    // Focus that escapes the dialog (e.g. out of the cross-origin iframe) is pulled back.
    const onFocusIn = (e) => {
      if (dialogRef.current && !dialogRef.current.contains(e.target)) closeRef.current?.focus()
    }
    document.addEventListener('keydown', onKeyDown, true)
    document.addEventListener('focusin', onFocusIn)
    return () => {
      document.removeEventListener('keydown', onKeyDown, true)
      document.removeEventListener('focusin', onFocusIn)
      document.body.classList.remove('modal-open')
      if (returnTo && typeof returnTo.focus === 'function') returnTo.focus()
    }
  }, [returnFocusRef])

  return createPortal(
    <div
      className="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-[rgba(3,8,18,0.92)]"
      onMouseDown={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-label={item.title}
        className="w-full max-w-[1100px]"
      >
        <div className="flex items-center justify-between gap-4 mb-3">
          <strong className="text-white font-semibold">{item.title}</strong>
          <button
            ref={closeRef}
            type="button"
            onClick={onClose}
            aria-label="Close video"
            className="inline-flex items-center gap-2 rounded-full border border-white/40 px-4 py-2 text-sm text-white hover:bg-white/10 transition-colors"
          >
            Close <X size={14} aria-hidden="true" />
          </button>
        </div>
        <div className="relative aspect-video bg-black rounded-xl overflow-hidden">
          <iframe
            className="absolute inset-0 w-full h-full border-0"
            src={`https://www.youtube-nocookie.com/embed/${item.youtubeId}?autoplay=1&rel=0`}
            title={item.title}
            allow="autoplay; fullscreen; encrypted-media; picture-in-picture"
            allowFullScreen
          />
        </div>
        {nextTitle && (
          <p className="mt-3 text-sm text-white/70">Up next in the reel: {nextTitle}</p>
        )}
      </div>
    </div>,
    document.body,
  )
}
