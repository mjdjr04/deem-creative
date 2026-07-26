import { useEffect } from 'react'
import { useParams, Navigate } from 'react-router-dom'
import { Video, MapPin, Phone } from 'lucide-react'
import BookingFlow from '../components/BookingFlow'
import { MEETING_KINDS, PICKER_KINDS } from '../config/booking'
import { ANALYTICS_EVENTS } from '../config/analytics'

const MEETING_ICONS = { zoom: Video, 'in-person': MapPin, phone: Phone }

// Map a MEETING_KINDS entry to the config shape BookingFlow consumes.
// eslint-disable-next-line react-refresh/only-export-components -- RecruiterBookingPage reuses this builder; keeping it here avoids a third page-config file
export function buildBookingConfig(kind) {
  return {
    apiType: kind.apiType,
    bookingStartEvent: ANALYTICS_EVENTS.BOOKING_START,
    eyebrow: kind.eyebrow,
    pageTitle: kind.pageTitle,
    pageSubtitle: kind.pageSubtitle,
    session: kind.session,
    detailItems: (kind.detailItemsText || []).map(text => ({ icon: Video, text })),
    whatToExpect: kind.whatToExpect,
    meetingTypes: kind.meetingTypes,
    meetingIcons: MEETING_ICONS,
    confirmedMeetingLine: (type) => (kind.confirmedLines && kind.confirmedLines[type]) || '',
    fields: kind.fields,
  }
}

export default function BookingPage() {
  const { type } = useParams()
  const kind = type && MEETING_KINDS[type]
  const valid = kind && PICKER_KINDS.includes(type)

  useEffect(() => {
    if (valid) document.title = `${kind.session.title} — Deem Creative`
  }, [valid, kind])

  if (!valid) return <Navigate to="/booking" replace />
  return <BookingFlow config={buildBookingConfig(kind)} />
}
