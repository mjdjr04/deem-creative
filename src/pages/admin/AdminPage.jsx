import { Routes, Route, Navigate } from 'react-router-dom'
import { AdminProvider, useAdmin } from '../../context/AdminContext'
import Login from './Login'
import AdminLayout from './AdminLayout'
import AboutEditor from './editors/AboutEditor'
import ProjectsEditor from './editors/ProjectsEditor'
import ExperienceEditor from './editors/ExperienceEditor'
import ServicesEditor from './editors/ServicesEditor'
import SkillsEditor from './editors/SkillsEditor'
import FeedEditor from './editors/FeedEditor'
import EmailsEditor from './editors/EmailsEditor'
import MessagesEditor from './editors/MessagesEditor'
import ChatsEditor from './editors/ChatsEditor'
import AnalyticsEditor from './editors/AnalyticsEditor'
import SettingsEditor from './editors/SettingsEditor'
import { Loader2 } from 'lucide-react'

function NotConfigured() {
  return (
    <div className="min-h-screen bg-brand-dark flex items-center justify-center px-6">
      <div className="max-w-md text-center">
        <h1 className="text-2xl font-bold text-white mb-3">Admin not connected yet</h1>
        <p className="text-white/60 text-sm leading-relaxed mb-4">
          Your admin panel needs a Supabase connection before it can be used. Add your
          <code className="px-1.5 py-0.5 mx-1 rounded bg-brand-mid text-brand-light text-xs">VITE_SUPABASE_URL</code>
          and
          <code className="px-1.5 py-0.5 mx-1 rounded bg-brand-mid text-brand-light text-xs">VITE_SUPABASE_ANON_KEY</code>
          to a <code className="px-1.5 py-0.5 mx-1 rounded bg-brand-mid text-brand-light text-xs">.env.local</code> file.
        </p>
        <p className="text-white/55 text-xs">See <strong>ADMIN_SETUP.md</strong> in your project for the step-by-step walkthrough.</p>
      </div>
    </div>
  )
}

function Gate() {
  const { configured, authReady, session, loading, loadError } = useAdmin()

  if (!configured) return <NotConfigured />

  if (!authReady) {
    return (
      <div className="min-h-screen bg-brand-dark flex items-center justify-center">
        <Loader2 className="animate-spin text-brand-light" />
      </div>
    )
  }

  if (!session) return <Login />

  if (loadError) {
    return (
      <div className="min-h-screen bg-brand-dark flex items-center justify-center px-6">
        <div className="max-w-md text-center">
          <h1 className="text-xl font-bold text-white mb-2">Couldn’t load content</h1>
          <p className="text-red-300 text-sm">{loadError}</p>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-brand-dark flex items-center justify-center">
        <Loader2 className="animate-spin text-brand-light" />
      </div>
    )
  }

  return (
    <Routes>
      <Route element={<AdminLayout />}>
        <Route index element={<Navigate to="/admin/about" replace />} />
        <Route path="about" element={<AboutEditor />} />
        <Route path="projects" element={<ProjectsEditor />} />
        <Route path="experience" element={<ExperienceEditor />} />
        <Route path="services" element={<ServicesEditor />} />
        <Route path="skills" element={<SkillsEditor />} />
        <Route path="feed" element={<FeedEditor />} />
        <Route path="emails" element={<EmailsEditor />} />
        <Route path="messages" element={<MessagesEditor />} />
        <Route path="chats" element={<ChatsEditor />} />
        <Route path="analytics" element={<AnalyticsEditor />} />
        <Route path="settings" element={<SettingsEditor />} />
        <Route path="*" element={<Navigate to="/admin/about" replace />} />
      </Route>
    </Routes>
  )
}

export default function AdminPage() {
  return (
    <AdminProvider>
      <Gate />
    </AdminProvider>
  )
}
