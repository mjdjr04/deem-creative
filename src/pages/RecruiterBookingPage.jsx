import { useEffect } from 'react'
import BookingFlow from '../components/BookingFlow'
import { MEETING_KINDS } from '../config/booking'
import { ANALYTICS_EVENTS } from '../config/analytics'
import { buildBookingConfig } from './BookingPage'

const config = {
  ...buildBookingConfig(MEETING_KINDS.recruiter),
  bookingStartEvent: ANALYTICS_EVENTS.RECRUITER_BOOKING_START,
}

export default function RecruiterBookingPage() {
  useEffect(() => {
    document.title = 'Schedule a Hiring Call — Michael Deem Jr.'
  }, [])
  return <BookingFlow config={config} />
}
