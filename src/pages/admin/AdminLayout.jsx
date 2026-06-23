import { useState } from 'react'
import { NavLink, Outlet } from 'react-router-dom'
import {
  User, FolderKanban, Briefcase, Sparkles, Wrench, Settings,
  LogOut, ExternalLink, UploadCloud, CheckCircle2, Rss, Mail, CalendarClock, MessageSquare, BarChart3,
} from 'lucide-react'
import { useAdmin } from '../../context/AdminContext'
import PublishModal from './PublishModal'

const nav = [
  { to: 'about', label: 'About', icon: User },
  { to: 'projects', label: 'Projects', icon: FolderKanban },
  { to: 'experience', label: 'Experience', icon: Briefcase },
  { to: 'services', label: 'Services', icon: Wrench },
  { to: 'skills', label: 'Skills', icon: Sparkles },
  { to: 'feed', label: 'Feed', icon: Rss },
  { to: 'emails', label: 'Booking Emails', icon: CalendarClock },
  { to: 'messages', label: 'Messages', icon: Mail },
  { to: 'chats', label: 'Chat Logs', icon: MessageSquare },
  { to: 'analytics', label: 'Analytics', icon: BarChart3 },
  { to: 'settings', label: 'Settings', icon: Settings },
]

export default function AdminLayout() {
  const { signOut, dirty, session } = useAdmin()
  const [showPublish, setShowPublish] = useState(false)

  return (
    <div className="min-h-screen bg-brand-dark text-white flex">
      {/* Sidebar — stays in view while the editor scrolls */}
      <aside className="w-60 flex-shrink-0 border-r border-brand-border bg-brand-mid flex flex-col sticky top-0 h-screen self-start overflow-y-auto">
        <div className="p-5 border-b border-brand-border">
          <p className="text-white font-bold">Deem Creative</p>
          <p className="text-white/55 text-xs">Site Admin</p>
        </div>

        <nav className="flex-1 p-3 space-y-1">
          {nav.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={`/admin/${to}`}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-brand-navy text-white'
                    : 'text-white/60 hover:text-white hover:bg-brand-surface'
                }`
              }
            >
              <Icon size={17} />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="p-3 border-t border-brand-border space-y-1">
          <a
            href="#/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-white/60 hover:text-white hover:bg-brand-surface"
          >
            <ExternalLink size={17} /> View site
          </a>
          <button
            onClick={signOut}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-white/60 hover:text-white hover:bg-brand-surface"
          >
            <LogOut size={17} /> Sign out
          </button>
          <p className="px-3 pt-2 text-white/25 text-[11px] truncate">{session?.user?.email}</p>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top publish bar */}
        <header className="sticky top-0 z-10 flex items-center justify-between gap-4 px-8 py-4 border-b border-brand-border bg-brand-dark/90 backdrop-blur">
          <div className="flex items-center gap-2 text-sm">
            {dirty ? (
              <>
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                <span className="text-amber-300">You have unpublished changes</span>
              </>
            ) : (
              <>
                <CheckCircle2 size={16} className="text-green-400" />
                <span className="text-white/55">All changes published</span>
              </>
            )}
          </div>
          <button
            onClick={() => setShowPublish(true)}
            disabled={!dirty}
            className="inline-flex items-center gap-2 px-5 py-2 rounded-lg bg-green-600 border border-green-500 text-white text-sm font-semibold hover:bg-green-500 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <UploadCloud size={16} /> Publish All Changes
          </button>
        </header>

        {/* Editor outlet */}
        <main className="flex-1 p-8 max-w-4xl w-full">
          <Outlet />
        </main>
      </div>

      {showPublish && <PublishModal onClose={() => setShowPublish(false)} />}
    </div>
  )
}
