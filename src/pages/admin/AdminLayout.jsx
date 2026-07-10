import { useState } from 'react'
import { NavLink, Outlet } from 'react-router-dom'
import {
  User, FolderKanban, Briefcase, Sparkles, Wrench, Settings,
  LogOut, ExternalLink, UploadCloud, CheckCircle2, Rss, Mail, CalendarClock, MessageSquare, BarChart3,
  Menu, X,
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
  const [drawerOpen, setDrawerOpen] = useState(false)

  return (
    <div className="min-h-screen bg-brand-dark text-white md:flex">
      {/* Backdrop — only on mobile when the drawer is open */}
      {drawerOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/60 md:hidden"
          aria-hidden="true"
          onClick={() => setDrawerOpen(false)}
        />
      )}

      {/* Sidebar — a fixed off-canvas drawer on mobile, a sticky column on md+ */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 flex flex-col border-r border-brand-border bg-brand-mid overflow-y-auto transition-transform duration-200 ease-out
          md:static md:z-auto md:w-60 md:h-screen md:sticky md:top-0 md:self-start md:flex-shrink-0 md:translate-x-0
          ${drawerOpen ? 'translate-x-0' : '-translate-x-full'}`}
      >
        <div className="flex items-center justify-between p-5 border-b border-brand-border">
          <div>
            <p className="text-white font-bold">Deem Creative</p>
            <p className="text-white/55 text-xs">Site Admin</p>
          </div>
          {/* Close button — mobile only */}
          <button
            onClick={() => setDrawerOpen(false)}
            className="md:hidden p-1.5 -mr-1.5 rounded-lg text-white/60 hover:text-white hover:bg-brand-surface"
            aria-label="Close menu"
          >
            <X size={20} />
          </button>
        </div>

        <nav className="flex-1 p-3 space-y-1">
          {nav.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={`/admin/${to}`}
              onClick={() => setDrawerOpen(false)}
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
            href="/"
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
        {/* Top bar — hamburger (mobile) + publish status/action */}
        <header className="sticky top-0 z-20 flex items-center gap-3 px-4 md:px-8 py-3 md:py-4 border-b border-brand-border bg-brand-dark/90 backdrop-blur">
          <button
            onClick={() => setDrawerOpen(true)}
            className="md:hidden p-2 -ml-2 rounded-lg text-white/70 hover:text-white hover:bg-brand-surface"
            aria-label="Open menu"
          >
            <Menu size={20} />
          </button>

          <div className="flex items-center gap-2 text-sm min-w-0 flex-1">
            {dirty ? (
              <>
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse flex-shrink-0" />
                <span className="text-amber-300 truncate">
                  <span className="hidden sm:inline">You have unpublished changes</span>
                  <span className="sm:hidden">Unpublished changes</span>
                </span>
              </>
            ) : (
              <>
                <CheckCircle2 size={16} className="text-green-400 flex-shrink-0" />
                <span className="text-white/55 truncate">
                  <span className="hidden sm:inline">All changes published</span>
                  <span className="sm:hidden">Published</span>
                </span>
              </>
            )}
          </div>

          <button
            onClick={() => setShowPublish(true)}
            disabled={!dirty}
            className="inline-flex items-center gap-2 px-3 sm:px-5 py-2 rounded-lg bg-green-600 border border-green-500 text-white text-sm font-semibold hover:bg-green-500 transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex-shrink-0"
          >
            <UploadCloud size={16} />
            <span className="hidden sm:inline">Publish All Changes</span>
            <span className="sm:hidden">Publish</span>
          </button>
        </header>

        {/* Editor outlet */}
        <main className="flex-1 p-4 md:p-8 max-w-4xl w-full">
          <Outlet />
        </main>
      </div>

      {showPublish && <PublishModal onClose={() => setShowPublish(false)} />}
    </div>
  )
}
