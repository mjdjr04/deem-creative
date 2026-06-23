import { useEffect } from 'react'
import { Video, Phone, Briefcase } from 'lucide-react'
import BookingFlow from '../components/BookingFlow'
import { RECRUITER_SESSION, RECRUITER_MEETING_TYPES, RECRUITER_FIELDS } from '../config/booking'
import { ANALYTICS_EVENTS } from '../config/analytics'

const config = {
  apiType: 'recruiter',
  bookingStartEvent: ANALYTICS_EVENTS.RECRUITER_BOOKING_START,
  eyebrow: 'For recruiters & hiring teams',
  pageTitle: 'Schedule a Hiring Call',
  pageSubtitle:
    "Considering me for a role? Grab a time below — it lands straight on my calendar and you'll get an instant confirmation.",
  session: RECRUITER_SESSION,
  detailItems: [
    { icon: Briefcase, text: 'Recruiters, hiring managers & teams' },
    { icon: Video, text: 'Zoom or phone — your choice' },
  ],
  whatToExpect: [
    'Walk through the role, team, and what you’re looking for',
    'How my film, social, and creative-strategy background fits',
    'Clear next steps — references, portfolio deep-dives, or a follow-up',
  ],
  meetingTypes: RECRUITER_MEETING_TYPES,
  meetingIcons: { zoom: Video, phone: Phone },
  confirmedMeetingLine: (type) =>
    type === 'phone'
      ? "This is a phone call — Michael will call the number you provided at the scheduled time."
      : 'This is a Zoom call — Michael will email you the link before the meeting.',
  fields: RECRUITER_FIELDS,
}

export default function RecruiterBookingPage() {
  useEffect(() => {
    document.title = 'Schedule a Hiring Call — Michael Deem Jr.'
  }, [])
  return <BookingFlow config={config} />
}
