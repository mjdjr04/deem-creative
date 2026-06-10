import { useState } from 'react'
import { HashRouter, Routes, Route } from 'react-router-dom'
import { BookingProvider } from './context/BookingContext'
import Navbar from './components/Navbar'
import Contact from './components/Contact'
import ProjectModal from './components/ProjectModal'
import BookingModal from './components/BookingModal'
import FloatingCTA from './components/FloatingCTA'
import HomePage from './pages/HomePage'
import PortfolioPage from './pages/PortfolioPage'
import ServicesPage from './pages/ServicesPage'
import ContactPage from './pages/ContactPage'

export default function App() {
  const [selectedProject, setSelectedProject] = useState(null)

  return (
    <BookingProvider>
      <HashRouter>
        <Navbar />
        <main>
          <Routes>
            <Route path="/" element={<HomePage onProjectSelect={setSelectedProject} />} />
            <Route path="/portfolio" element={<PortfolioPage onProjectSelect={setSelectedProject} />} />
            <Route path="/services" element={<ServicesPage />} />
            <Route path="/contact" element={<ContactPage />} />
          </Routes>
        </main>
        <section id="contact">
          <Contact />
        </section>
        <ProjectModal
          project={selectedProject}
          onClose={() => setSelectedProject(null)}
        />
        <BookingModal />
        <FloatingCTA />
      </HashRouter>
    </BookingProvider>
  )
}
