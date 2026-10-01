import { Search, Bell, Menu } from 'lucide-react'
import { useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

const PAGE_TITLES = {
  '/chat':      'Chat',
  '/history':   'Chat History',
  '/documents': 'Documents',
  '/admin':     'Admin',
  '/settings':  'Settings',
}

export default function TopBar({ onOpenSidebar }) {
  const { pathname } = useLocation()
  const { user, isHR } = useAuth()
  const base = '/' + pathname.split('/')[1]
  const title = PAGE_TITLES[base] || 'PolicyAI'

  const initials = user?.name
    ? user.name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
    : user?.role === 'hr' ? 'HR' : 'U'

  return (
    <header className="flex items-center justify-between h-14 px-4 sm:px-6 bg-white border-b border-border flex-shrink-0 z-10">
      {/* Left — Hamburger menu (mobile) + Breadcrumb */}
      <div className="flex items-center gap-2.5">
        {onOpenSidebar && (
          <button
            type="button"
            onClick={onOpenSidebar}
            className="md:hidden p-1.5 -ml-1 rounded-lg text-ink-secondary hover:text-ink hover:bg-muted transition-colors cursor-pointer"
            aria-label="Open navigation menu"
          >
            <Menu className="w-5 h-5" />
          </button>
        )}

        <div className="flex items-center gap-1.5 sm:gap-2">
          <span className="text-xs text-ink-secondary font-medium hidden sm:inline">PolicyAI</span>
          <span className="text-xs text-ink-tertiary hidden sm:inline">/</span>
          <span className="text-xs sm:text-sm font-semibold text-ink">{title}</span>
        </div>
      </div>

      {/* Right */}
      <div className="flex items-center gap-2">
        {/* Search (desktop only) */}
        <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 bg-muted rounded-lg border border-border w-56 cursor-text">
          <Search className="w-3.5 h-3.5 text-ink-tertiary flex-shrink-0" />
          <span className="text-xs text-ink-tertiary">Search policies…</span>
        </div>

        {/* Notifications */}
        <button className="btn-icon relative" aria-label="Notifications">
          <Bell className="w-4 h-4" />
          <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-primary-500" />
        </button>

        {/* User chip */}
        <div className="flex items-center gap-2 pl-1 sm:pl-2 pr-2 sm:pr-3 py-1.5 rounded-lg hover:bg-muted cursor-pointer transition-colors">
          <div
            className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0
            ${isHR ? 'bg-violet-100 text-violet-700' : 'bg-primary-100 text-primary-700'}`}
          >
            <span className="text-[10px] font-bold">{initials}</span>
          </div>
          <span className="text-xs font-semibold text-ink hidden sm:block max-w-[120px] truncate">
            {user?.name || 'User'}
          </span>
        </div>
      </div>
    </header>
  )
}
