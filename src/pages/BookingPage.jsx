import { useState, useEffect, useMemo, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Calendar, Clock, Video, MapPin, ChevronLeft, ChevronRight,
  CheckCircle2, ArrowLeft, ExternalLink, Globe, Loader2,
} from 'lucide-react'
import { BOOKING_API_URL, GOOGLE_BOOKING_FALLBACK_URL, SESSION, MEETING_TYPES } from '../config/booking'

const WEEKDAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa']
const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]

const EMPTY_FORM = {
  firstName: '', lastName: '', email: '', phone: '',
  organization: '', projectOverview: '', materials: '', meetingType: '',
}

const dateKey = d =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`

const fadeUp = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -8 },
  transition: { duration: 0.3, ease: 'easeOut' },
}

function SessionDetails({ timezone }) {
  const items = [
    { icon: Clock, text: `${SESSION.durationMinutes} minutes` },
    { icon: Video, text: 'Zoom or in person — your choice' },
    { icon: Globe, text: timezone },
  ]
  return (
    <div>
      <p className="text-brand-light text-sm font-semibold tracking-widest uppercase mb-4">
        Deem Creative
      </p>
      <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">{SESSION.title}</h2>
      <p className="text-white/65 leading-relaxed mb-8">{SESSION.description}</p>
      <ul className="space-y-3 mb-8">
        {items.map(({ icon: Icon, text }) => (
          <li key={text} className="flex items-center gap-3 text-white/70 text-sm">
            <span className="w-9 h-9 rounded-lg bg-brand-navy border border-brand-accent/30 flex items-center justify-center text-brand-light flex-shrink-0">
              <Icon size={16} aria-hidden="true" />
            </span>
            {text}
          </li>
        ))}
      </ul>
      <div className="p-5 rounded-xl bg-brand-mid border border-brand-border">
        <h3 className="text-white font-semibold text-sm mb-3">What to expect:</h3>
        <ul className="space-y-2.5">
          {[
            'Clarify your goals and what success looks like',
            'Review your current content, systems, or creative challenges',
            'Walk away with clear next steps — no pressure',
          ].map(item => (
            <li key={item} className="flex items-start gap-2 text-white/60 text-sm">
              <span className="flex-shrink-0 mt-1.5" aria-hidden="true">
                <svg width="6" height="6" viewBox="0 0 6 6"><circle cx="3" cy="3" r="3" fill="#2B5BA8" /></svg>
              </span>
              {item}
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

function MonthCalendar({ viewDate, onNav, slotsByDay, selectedDay, onSelectDay }) {
  const year = viewDate.getFullYear()
  const month = viewDate.getMonth()
  const firstWeekday = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const cells = [
    ...Array.from({ length: firstWeekday }, () => null),
    ...Array.from({ length: daysInMonth }, (_, i) => new Date(year, month, i + 1)),
  ]

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-white font-semibold">{MONTHS[month]} {year}</h3>
        <div className="flex gap-1">
          <button
            onClick={() => onNav(-1)}
            className="p-2 rounded-lg text-white/60 hover:text-white hover:bg-brand-navy/50 transition-colors"
            aria-label="Previous month"
          >
            <ChevronLeft size={18} />
          </button>
          <button
            onClick={() => onNav(1)}
            className="p-2 rounded-lg text-white/60 hover:text-white hover:bg-brand-navy/50 transition-colors"
            aria-label="Next month"
          >
            <ChevronRight size={18} />
          </button>
        </div>
      </div>
      <div className="grid grid-cols-7 gap-1 mb-1">
        {WEEKDAYS.map(d => (
          <div key={d} className="text-center text-white/40 text-xs font-semibold py-1">{d}</div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {cells.map((date, i) => {
          if (!date) return <div key={`pad-${i}`} />
          const key = dateKey(date)
          const available = (slotsByDay[key] || []).length > 0
          const isSelected = selectedDay === key
          const isToday = date.getTime() === today.getTime()
          return (
            <button
              key={key}
              onClick={() => available && onSelectDay(key)}
              disabled={!available}
              aria-pressed={isSelected}
              className={`relative aspect-square rounded-lg text-sm font-medium transition-all ${
                isSelected
                  ? 'bg-brand-accent text-white shadow-lg scale-105'
                  : available
                    ? 'bg-brand-navy/40 text-white hover:bg-brand-navy hover:scale-105 cursor-pointer'
                    : 'text-white/20 cursor-default'
              } ${isToday && !isSelected ? 'ring-1 ring-brand-light/40' : ''}`}
            >
              {date.getDate()}
              {available && !isSelected && (
                <span
                  className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-brand-light"
                  aria-hidden="true"
                />
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}

function FallbackCard({ message }) {
  return (
    <motion.div {...fadeUp} className="text-center py-10 px-6">
      <div className="w-14 h-14 mx-auto mb-5 rounded-2xl bg-brand-navy border border-brand-accent/40 flex items-center justify-center text-brand-light">
        <Calendar size={26} aria-hidden="true" />
      </div>
      <h3 className="text-white font-semibold text-lg mb-2">Pick a time on Google Calendar</h3>
      <p className="text-white/55 text-sm max-w-sm mx-auto mb-7">{message}</p>
      <motion.a
        href={GOOGLE_BOOKING_FALLBACK_URL}
        target="_blank"
        rel="noopener noreferrer"
        whileHover={{ scale: 1.04 }}
        whileTap={{ scale: 0.97 }}
        className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-white text-brand-dark font-bold hover:bg-brand-light hover:text-white transition-all shadow-lg"
      >
        <Calendar size={18} /> Open Scheduling Page <ExternalLink size={14} />
      </motion.a>
      <p className="text-white/35 text-xs mt-5">
        Or email <a href="mailto:michael@deemcreative.com" className="text-brand-light hover:text-white transition-colors">michael@deemcreative.com</a>
      </p>
    </motion.div>
  )
}

const MEETING_ICONS = { zoom: Video, 'in-person': MapPin }

export default function BookingPage() {
  const [status, setStatus] = useState(BOOKING_API_URL ? 'loading' : 'unconfigured')
  const [slots, setSlots] = useState([])
  const [viewDate, setViewDate] = useState(() => { const d = new Date(); d.setDate(1); return d })
  const [selectedDay, setSelectedDay] = useState(null)
  const [selectedSlot, setSelectedSlot] = useState(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState(null)
  const [confirmation, setConfirmation] = useState(null)

  const timezone = useMemo(() => Intl.DateTimeFormat().resolvedOptions().timeZone, [])

  const loadAvailability = useCallback(async () => {
    if (!BOOKING_API_URL) return
    try {
      const res = await fetch(`${BOOKING_API_URL}?action=availability`)
      const data = await res.json()
      if (!data.ok) throw new Error(data.error || 'Bad response')
      setSlots(data.slots)
      // Open the calendar on the first month that has availability
      const first = (data.slots || [])
        .map(iso => new Date(iso))
        .filter(d => d > new Date())
        .sort((a, b) => a - b)[0]
      if (first) setViewDate(new Date(first.getFullYear(), first.getMonth(), 1))
      setStatus('ready')
    } catch {
      setStatus('error')
    }
  }, [])

  // All setState inside loadAvailability happens after the fetch resolves, not synchronously
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { loadAvailability() }, [loadAvailability])

  // Group ISO slots by the visitor's local calendar day
  const slotsByDay = useMemo(() => {
    const grouped = {}
    for (const iso of slots) {
      const d = new Date(iso)
      if (d <= new Date()) continue
      const key = dateKey(d)
      ;(grouped[key] ||= []).push(iso)
    }
    Object.values(grouped).forEach(list => list.sort())
    return grouped
  }, [slots])

  const formatTime = iso =>
    new Date(iso).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })

  const formatDay = key => {
    const [y, m, d] = key.split('-').map(Number)
    return new Date(y, m - 1, d).toLocaleDateString([], {
      weekday: 'long', month: 'long', day: 'numeric',
    })
  }

  const setField = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const handleSubmit = async e => {
    e.preventDefault()
    if (!form.meetingType) {
      setSubmitError('Please choose Zoom or in person.')
      return
    }
    setSubmitting(true)
    setSubmitError(null)
    try {
      // text/plain keeps this a "simple" CORS request, which Apps Script requires
      const res = await fetch(BOOKING_API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({
          action: 'book',
          start: selectedSlot,
          firstName: form.firstName.trim(),
          lastName: form.lastName.trim(),
          email: form.email.trim(),
          phone: form.phone.trim(),
          organization: form.organization.trim(),
          projectOverview: form.projectOverview.trim(),
          materials: form.materials.trim(),
          meetingType: form.meetingType,
          timezone,
        }),
      })
      const data = await res.json()
      if (!data.ok) {
        if (data.code === 'SLOT_TAKEN') {
          setSubmitError('That time was just booked by someone else. Please pick another slot.')
          setSelectedSlot(null)
          loadAvailability()
        } else {
          throw new Error(data.error || 'Booking failed')
        }
        return
      }
      setConfirmation(data)
    } catch {
      setSubmitError('Something went wrong while booking. Please try again, or use the email link below.')
    } finally {
      setSubmitting(false)
    }
  }

  const inputClass =
    'w-full px-4 py-3 rounded-xl bg-brand-dark border border-brand-border text-white text-sm placeholder:text-white/30 focus:border-brand-accent focus:outline-none focus:ring-1 focus:ring-brand-accent transition-colors'
  const labelClass =
    'block text-white/60 text-xs font-semibold uppercase tracking-widest mb-2'

  const confirmedMeetingLine = form.meetingType === 'in-person'
    ? "This is an in-person meeting — Michael will confirm the exact location (South Jersey area) with you."
    : "This is a Zoom meeting — Michael will email you the link before your meeting."

  return (
    <>
      {/* Page hero */}
      <section
        className="relative pt-24 pb-12 md:pt-32 md:pb-16 overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #060f1e 0%, #0D3472 50%, #060f1e 100%)' }}
      >
        <div
          aria-hidden="true"
          className="absolute top-0 left-0 w-80 h-80 rounded-full blur-3xl opacity-15"
          style={{ background: '#2B5BA8' }}
        />
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <p className="text-brand-light text-sm font-semibold tracking-widest uppercase mb-4">
              Deem Creative
            </p>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Book a Consultation
            </h1>
            <p className="text-white/65 text-xl max-w-2xl">
              Pick a time that works for you — it goes straight onto the calendar, and you'll
              get a confirmation email right away.
            </p>
          </motion.div>
        </div>
        <div
          aria-hidden="true"
          className="absolute bottom-0 left-0 right-0 h-16 pointer-events-none"
          style={{ background: 'linear-gradient(to top, #0A1628, transparent)' }}
        />
      </section>

      <section className="py-16 md:py-24 bg-brand-dark">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-[1fr,1.5fr] gap-10 lg:gap-16 items-start">

            <motion.div
              initial={{ opacity: 0, x: -24 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              <SessionDetails timezone={timezone} />
            </motion.div>

            {/* Booking widget */}
            <motion.div
              initial={{ opacity: 0, x: 24 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="rounded-2xl bg-brand-mid border border-brand-border p-6 md:p-8 overflow-hidden"
            >
              <AnimatePresence mode="wait">

                {status === 'unconfigured' && (
                  <FallbackCard
                    key="unconfigured"
                    message="Choose a time on the scheduling page and you'll receive a calendar invite right away."
                  />
                )}

                {status === 'error' && (
                  <FallbackCard
                    key="error"
                    message="Live availability couldn't be loaded right now, but you can still book through the scheduling page."
                  />
                )}

                {status === 'loading' && (
                  <motion.div key="loading" {...fadeUp} className="flex flex-col items-center justify-center py-20 text-white/50">
                    <Loader2 size={28} className="animate-spin mb-4 text-brand-light" aria-hidden="true" />
                    <p className="text-sm">Loading live availability…</p>
                  </motion.div>
                )}

                {status === 'ready' && confirmation && (
                  <motion.div key="confirmed" {...fadeUp} className="text-center py-8">
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: 'spring', stiffness: 260, damping: 18, delay: 0.1 }}
                      className="w-16 h-16 mx-auto mb-5 rounded-full bg-brand-navy border border-brand-accent flex items-center justify-center text-brand-light"
                    >
                      <CheckCircle2 size={32} aria-hidden="true" />
                    </motion.div>
                    <h3 className="text-white font-bold text-2xl mb-2">You're booked!</h3>
                    <p className="text-white/65 mb-1">
                      {new Date(confirmation.start).toLocaleDateString([], {
                        weekday: 'long', month: 'long', day: 'numeric',
                      })}
                    </p>
                    <p className="text-white/65 mb-6">
                      {formatTime(confirmation.start)} – {formatTime(confirmation.end)} ({timezone})
                    </p>
                    <p className="text-white/55 text-sm max-w-sm mx-auto mb-3">
                      A confirmation is on its way to{' '}
                      <span className="text-white">{form.email}</span>, and you'll get reminders
                      the day before and the day of.
                    </p>
                    <p className="text-brand-light/90 text-sm max-w-sm mx-auto">
                      {confirmedMeetingLine}
                    </p>
                  </motion.div>
                )}

                {status === 'ready' && !confirmation && !selectedSlot && (
                  <motion.div key="pick" {...fadeUp}>
                    <MonthCalendar
                      viewDate={viewDate}
                      onNav={dir => setViewDate(d => new Date(d.getFullYear(), d.getMonth() + dir, 1))}
                      slotsByDay={slotsByDay}
                      selectedDay={selectedDay}
                      onSelectDay={setSelectedDay}
                    />
                    <AnimatePresence>
                      {selectedDay && (
                        <motion.div
                          key={selectedDay}
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.3 }}
                          className="overflow-hidden"
                        >
                          <div className="pt-6 mt-6 border-t border-brand-border">
                            <p className="text-white/60 text-sm mb-4">
                              <span className="text-white font-semibold">{formatDay(selectedDay)}</span>
                              {' '}— times shown in {timezone}
                            </p>
                            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                              {(slotsByDay[selectedDay] || []).map(iso => (
                                <motion.button
                                  key={iso}
                                  whileHover={{ scale: 1.04 }}
                                  whileTap={{ scale: 0.96 }}
                                  onClick={() => setSelectedSlot(iso)}
                                  className="py-2.5 rounded-lg bg-brand-navy/40 border border-brand-border text-white text-sm font-medium hover:border-brand-accent hover:bg-brand-navy transition-colors cursor-pointer"
                                >
                                  {formatTime(iso)}
                                </motion.button>
                              ))}
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                )}

                {status === 'ready' && !confirmation && selectedSlot && (
                  <motion.div key="form" {...fadeUp}>
                    <button
                      onClick={() => setSelectedSlot(null)}
                      className="flex items-center gap-1.5 text-white/50 text-sm hover:text-white transition-colors mb-5"
                    >
                      <ArrowLeft size={15} aria-hidden="true" /> Change time
                    </button>
                    <div className="flex items-center gap-3 p-4 rounded-xl bg-brand-navy/40 border border-brand-accent/40 mb-6">
                      <Calendar size={18} className="text-brand-light flex-shrink-0" aria-hidden="true" />
                      <p className="text-white text-sm font-medium">
                        {formatDay(dateKey(new Date(selectedSlot)))} · {formatTime(selectedSlot)} ({timezone})
                      </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label htmlFor="bk-first" className={labelClass}>First name</label>
                          <input id="bk-first" type="text" required maxLength={100}
                            value={form.firstName}
                            onChange={e => setField('firstName', e.target.value)}
                            placeholder="Jane" className={inputClass} />
                        </div>
                        <div>
                          <label htmlFor="bk-last" className={labelClass}>Last name</label>
                          <input id="bk-last" type="text" required maxLength={100}
                            value={form.lastName}
                            onChange={e => setField('lastName', e.target.value)}
                            placeholder="Doe" className={inputClass} />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label htmlFor="bk-email" className={labelClass}>Email</label>
                          <input id="bk-email" type="email" required maxLength={200}
                            value={form.email}
                            onChange={e => setField('email', e.target.value)}
                            placeholder="you@company.com" className={inputClass} />
                        </div>
                        <div>
                          <label htmlFor="bk-phone" className={labelClass}>Phone</label>
                          <input id="bk-phone" type="tel" required maxLength={50}
                            value={form.phone}
                            onChange={e => setField('phone', e.target.value)}
                            placeholder="(555) 123-4567" className={inputClass} />
                        </div>
                      </div>

                      <div>
                        <label htmlFor="bk-org" className={labelClass}>Organization / Company</label>
                        <input id="bk-org" type="text" required maxLength={200}
                          value={form.organization}
                          onChange={e => setField('organization', e.target.value)}
                          placeholder="Your organization" className={inputClass} />
                      </div>

                      {/* Meeting type */}
                      <div>
                        <label className={labelClass}>Meeting type</label>
                        <div className="grid grid-cols-2 gap-3">
                          {MEETING_TYPES.map(mt => {
                            const Icon = MEETING_ICONS[mt.value]
                            const active = form.meetingType === mt.value
                            return (
                              <button
                                key={mt.value}
                                type="button"
                                onClick={() => setField('meetingType', mt.value)}
                                aria-pressed={active}
                                className={`text-left p-4 rounded-xl border transition-all ${
                                  active
                                    ? 'border-brand-accent bg-brand-navy/50 ring-1 ring-brand-accent'
                                    : 'border-brand-border bg-brand-dark hover:border-brand-accent/50'
                                }`}
                              >
                                <span className="flex items-center gap-2 text-white text-sm font-semibold mb-1">
                                  <Icon size={16} className="text-brand-light" aria-hidden="true" />
                                  {mt.label}
                                </span>
                                <span className="block text-white/45 text-xs leading-snug">{mt.blurb}</span>
                              </button>
                            )
                          })}
                        </div>
                      </div>

                      <div>
                        <label htmlFor="bk-overview" className={labelClass}>Brief project overview</label>
                        <textarea id="bk-overview" rows={3} required maxLength={2000}
                          value={form.projectOverview}
                          onChange={e => setField('projectOverview', e.target.value)}
                          placeholder="A few sentences about your project, goals, or what you need help with"
                          className={`${inputClass} resize-none`} />
                      </div>

                      <div>
                        <label htmlFor="bk-materials" className={labelClass}>
                          Materials to review beforehand <span className="normal-case text-white/35">(optional)</span>
                        </label>
                        <textarea id="bk-materials" rows={2} maxLength={2000}
                          value={form.materials}
                          onChange={e => setField('materials', e.target.value)}
                          placeholder="Links to your site, socials, brand docs, or anything I should look at"
                          className={`${inputClass} resize-none`} />
                      </div>

                      {submitError && (
                        <p className="text-red-400 text-sm" role="alert">{submitError}</p>
                      )}

                      <motion.button
                        type="submit"
                        disabled={submitting}
                        whileHover={!submitting ? { scale: 1.02 } : {}}
                        whileTap={!submitting ? { scale: 0.98 } : {}}
                        className="w-full flex items-center justify-center gap-2 py-4 rounded-xl bg-white text-brand-dark font-bold hover:bg-brand-light hover:text-white transition-all shadow-lg cursor-pointer disabled:opacity-60 disabled:cursor-wait"
                      >
                        {submitting
                          ? <><Loader2 size={18} className="animate-spin" aria-hidden="true" /> Booking…</>
                          : <><Calendar size={18} aria-hidden="true" /> Confirm Booking</>}
                      </motion.button>
                    </form>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </div>
        </div>
      </section>
    </>
  )
}
