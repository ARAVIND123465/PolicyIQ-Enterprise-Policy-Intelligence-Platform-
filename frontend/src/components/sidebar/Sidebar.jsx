import { NavLink, useNavigate } from 'react-router-dom'
import {
  MessageSquare, Clock, FileText, ShieldCheck, Settings,
  Plus, ChevronRight, LogOut, User, X
} from 'lucide-react'
import { useChat } from '../../context/ChatContext'
import { useAuth } from '../../context/AuthContext'

const EMPLOYEE_NAV = [
  { to: '/chat',     label: 'Chat',         icon: MessageSquare },
  { to: '/history',  label: 'Chat History', icon: Clock         },
  { to: '/settings', label: 'Settings',     icon: Settings      },
]

const HR_NAV = [
  { to: '/documents', label: 'Documents',   icon: FileText      },
  { to: '/admin',     label: 'Admin',       icon: ShieldCheck   },
  { to: '/settings',  label: 'Settings',    icon: Settings      },
]

export default function Sidebar({ isOpen = false, onClose }) {
  const { startNewConversation } = useChat()
  const { user, logout, isHR } = useAuth()
  const navigate = useNavigate()

  const NAV = isHR ? HR_NAV : EMPLOYEE_NAV

  const handleNew = () => {
    startNewConversation()
    navigate('/chat')
    onClose?.()
  }

  const handleLogout = () => {
    logout()
    navigate('/login', { replace: true })
    onClose?.()
  }

  const handleNavClick = () => {
    onClose?.()
  }

  const initials = user?.name
    ? user.name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
    : user?.role === 'hr' ? 'HR' : 'U'

  const content = (
    <div className="flex flex-col h-full bg-white">
      {/* Brand */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-primary-600 flex items-center justify-center flex-shrink-0 shadow-sm">
            <ShieldCheck className="w-5 h-5 text-white" strokeWidth={2} />
          </div>
          <div>
            <p className="text-sm font-semibold text-ink leading-tight">PolicyAI</p>
            <p className="text-[11px] text-ink-secondary leading-tight">Company Policy Assistant</p>
          </div>
        </div>

        {/* Mobile close button */}
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="md:hidden p-1.5 rounded-lg text-ink-tertiary hover:text-ink hover:bg-muted"
            aria-label="Close menu"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* New Chat Button — only for employees */}
      {!isHR && (
        <div className="px-4 py-3 border-b border-border">
          <button
            id="sidebar-new-chat"
            type="button"
            onClick={handleNew}
            className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl
                       bg-primary-600 hover:bg-primary-700 active:bg-primary-800
                       text-white text-sm font-medium transition-colors duration-150 shadow-sm cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>New Chat</span>
          </button>
        </div>
      )}

      {/* Role badge */}
      <div className="px-4 pt-3.5 pb-1">
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium
          ${isHR ? 'bg-violet-50 text-violet-700 border border-violet-200' : 'bg-blue-50 text-blue-700 border border-blue-200'}`}
        >
          {isHR ? <ShieldCheck className="w-3 h-3" /> : <User className="w-3 h-3" />}
          {isHR ? 'HR Manager' : 'Employee'}
        </span>
      </div>

      {/* Navigation */}
      <nav className="px-3 py-2 space-y-1">
        {NAV.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            id={`nav-${label.toLowerCase().replace(/\s+/g, '-')}`}
            onClick={handleNavClick}
          >
            {({ isActive }) => (
              <span className={isActive ? 'nav-item-active' : 'nav-item'}>
                <Icon className="w-4 h-4 flex-shrink-0" />
                <span>{label}</span>
                {isActive && <ChevronRight className="w-3 h-3 ml-auto text-primary-400" />}
              </span>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Spacer */}
      <div className="flex-1" />

      {/* User Profile + Logout */}
      <div className="px-4 py-4 border-t border-border space-y-1.5">
        <div className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-muted transition-colors duration-150">
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0
            ${isHR ? 'bg-violet-100' : 'bg-primary-100'}`}
          >
            <span
              className={`text-xs font-semibold ${isHR ? 'text-violet-700' : 'text-primary-700'}`}
            >
              {initials}
            </span>
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold text-ink truncate">{user?.name || 'User'}</p>
            <p className="text-[10px] text-ink-secondary truncate">{user?.email}</p>
          </div>
        </div>

        <button
          id="btn-logout"
          type="button"
          onClick={handleLogout}
          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold
                     text-ink-secondary hover:text-danger hover:bg-red-50
                     transition-all duration-150 cursor-pointer"
        >
          <LogOut className="w-4 h-4" />
          <span>Sign out</span>
        </button>
      </div>
    </div>
  )

  return (
    <>
      {/* Desktop static sidebar */}
      <aside className="hidden md:flex flex-col w-[260px] flex-shrink-0 border-r border-border bg-white h-full">
        {content}
      </aside>

      {/* Mobile Drawer Overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          {/* Backdrop */}
          <div
            onClick={onClose}
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs transition-opacity animate-fade-in"
          />

          {/* Sliding drawer */}
          <div className="relative w-[280px] max-w-[85vw] h-full z-10 shadow-2xl animate-slide-in-r">
            {content}
          </div>
        </div>
      )}
    </>
  )
}
