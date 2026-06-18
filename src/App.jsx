import { useState, lazy, Suspense } from 'react'
import { HashRouter, Routes, Route, useLocation } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { BookingProvider } from './context/BookingContext'
import { ContentProvider } from './context/ContentContext'
import Navbar from './components/Navbar'
import Contact from './components/Contact'
import ProjectModal from './components/ProjectModal'
import FloatingCTA from './components/FloatingCTA'
import ChatWidget from './components/ChatWidget'
import ScrollProgress from './components/ScrollProgress'
import HomePage from './pages/HomePage'
import PortfolioPage from './pages/PortfolioPage'
import ServicesPage from './pages/ServicesPage'
import ContactPage from './pages/ContactPage'
import BookingPage from './pages/BookingPage'
import ProfilePage from './pages/ProfilePage'

// Admin is code-split so its Supabase client + editors never load on the
// public site — only when someone visits /#/admin.
const AdminPage = lazy(() => import('./pages/admin/AdminPage'))

const pageTransition = {
  initial: { opacity: 0, y: 14 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -10 },
  transition: { duration: 0.35, ease: [0.22, 1, 0.36, 1] },
}

function AnimatedRoutes({ onProjectSelect }) {
  const location = useLocation()
  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div key={location.pathname} {...pageTransition}>
        <Routes location={location}>
          <Route path="/" element={<HomePage onProjectSelect={onProjectSelect} />} />
          <Route path="/portfolio" element={<PortfolioPage onProjectSelect={onProjectSelect} />} />
          <Route path="/services" element={<ServicesPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/booking" element={<BookingPage />} />
        </Routes>
      </motion.div>
    </AnimatePresence>
  )
}

// The public-facing site (navbar, contact, floating CTA, project modal).
function PublicSite() {
  const [selectedProject, setSelectedProject] = useState(null)
  return (
    <BookingProvider>
      <ScrollProgress />
      <Navbar />
      <main>
        <AnimatedRoutes onProjectSelect={setSelectedProject} />
      </main>
      <section id="contact">
        <Contact />
      </section>
      <ProjectModal
        project={selectedProject}
        onClose={() => setSelectedProject(null)}
      />
      <FloatingCTA />
      <ChatWidget onOpenProject={setSelectedProject} />
    </BookingProvider>
  )
}

export default function App() {
  return (
    <HashRouter>
      <ContentProvider>
        <Routes>
          {/* Admin panel — standalone, no public chrome. Visit /#/admin */}
          <Route
            path="/admin/*"
            element={
              <Suspense fallback={<div className="min-h-screen bg-brand-dark" />}>
                <AdminPage />
              </Suspense>
            }
          />
          {/* Shareable full-profile page — standalone, not in the navbar. Visit /#/profile */}
          <Route path="/profile" element={<ProfilePage />} />
          {/* Everything else renders the public site */}
          <Route path="*" element={<PublicSite />} />
        </Routes>
      </ContentProvider>
    </HashRouter>
  )
}
