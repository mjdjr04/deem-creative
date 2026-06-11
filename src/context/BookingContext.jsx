import { createContext, useContext, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'

// Every "Book a Consultation" button on the site calls open(), which now
// routes to the in-site /booking page instead of opening an iframe modal.
const BookingContext = createContext()

export function BookingProvider({ children }) {
  const navigate = useNavigate()
  const value = useMemo(
    () => ({ open: () => navigate('/booking') }),
    [navigate]
  )
  return (
    <BookingContext.Provider value={value}>
      {children}
    </BookingContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components -- tiny context module; hook + provider belong together
export const useBooking = () => useContext(BookingContext)
