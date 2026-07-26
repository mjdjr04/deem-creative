import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Coffee, MessageSquare, Compass, Clock, ArrowRight } from 'lucide-react'
import { MEETING_KINDS, PICKER_KINDS } from '../config/booking'

// Icon per meeting kind (recruiter isn't in the picker).
const KIND_ICONS = {
  networking: Coffee,
  consultation: MessageSquare,
  strategy: Compass,
}

export default function BookingLanding() {
  useEffect(() => {
    document.title = 'Book a Meeting — Deem Creative'
  }, [])

  return (
    <div className="min-h-screen bg-brand-dark text-white px-6 py-20 sm:py-28">
      <div className="max-w-3xl mx-auto">
        <p className="text-brand-light text-sm font-semibold tracking-widest uppercase mb-4">Deem Creative</p>
        <h1 className="text-4xl md:text-5xl font-bold mb-4">Book a meeting</h1>
        <p className="text-white/65 text-lg sm:text-xl max-w-2xl mb-12">
          Pick the kind of conversation that fits. Every option lands straight on the calendar with an instant confirmation.
        </p>

        <div className="grid gap-4">
          {PICKER_KINDS.map(key => {
            const kind = MEETING_KINDS[key]
            const Icon = KIND_ICONS[key]
            return (
              <Link
                key={key}
                to={`/booking/${key}`}
                className="group flex items-center gap-5 rounded-2xl border border-white/10 bg-white/[0.03] p-6 transition hover:border-brand-light/50 hover:bg-white/[0.06]"
              >
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-brand-light/15 text-brand-light">
                  {Icon ? <Icon size={22} /> : null}
                </span>
                <span className="flex-1">
                  <span className="flex items-center gap-3">
                    <span className="text-xl font-bold">{kind.session.title}</span>
                    <span className="inline-flex items-center gap-1 text-white/50 text-sm">
                      <Clock size={14} /> {kind.session.durationMinutes} min
                    </span>
                  </span>
                  <span className="mt-1 block text-white/60">{kind.pickerBlurb}</span>
                </span>
                <ArrowRight size={20} className="shrink-0 text-white/30 transition group-hover:translate-x-1 group-hover:text-brand-light" />
              </Link>
            )
          })}
        </div>
      </div>
    </div>
  )
}
