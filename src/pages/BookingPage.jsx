import { Video, MapPin } from 'lucide-react'
import BookingFlow from '../components/BookingFlow'
import { SESSION, MEETING_TYPES, CONSULTATION_FIELDS } from '../config/booking'
import { ANALYTICS_EVENTS } from '../config/analytics'

const config = {
  apiType: 'consultation',
  bookingStartEvent: ANALYTICS_EVENTS.BOOKING_START,
  eyebrow: 'Deem Creative',
  pageTitle: 'Book a Consultation',
  pageSubtitle:
    "Pick a time that works for you — it goes straight onto the calendar, and you'll get a confirmation email right away.",
  session: SESSION,
  detailItems: [{ icon: Video, text: 'Zoom or in person — your choice' }],
  whatToExpect: [
    'Clarify your goals and what success looks like',
    'Review your current content, systems, or creative challenges',
    'Walk away with clear next steps — no pressure',
  ],
  meetingTypes: MEETING_TYPES,
  meetingIcons: { zoom: Video, 'in-person': MapPin },
  confirmedMeetingLine: (type) =>
    type === 'in-person'
      ? 'This is an in-person meeting — Michael will confirm the exact location (South Jersey area) with you.'
      : 'This is a Zoom meeting — Michael will email you the link before your meeting.',
  fields: CONSULTATION_FIELDS,
}

export default function BookingPage() {
  return <BookingFlow config={config} />
}
