import { useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import Sidebar from '../components/sidebar/Sidebar'
import TopBar from '../components/layout/TopBar'
import RightPanel from '../components/layout/RightPanel'

const PAGES_WITH_RIGHT_PANEL = ['/chat']

export default function AppLayout() {
  const { pathname } = useLocation()
  const showRight = PAGES_WITH_RIGHT_PANEL.some((p) => pathname.startsWith(p))
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <div className="flex h-screen overflow-hidden bg-surface">
      {/* Left Sidebar (Desktop static + Mobile sliding drawer) */}
      <Sidebar isOpen={mobileMenuOpen} onClose={() => setMobileMenuOpen(false)} />

      {/* Main area */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <TopBar onOpenSidebar={() => setMobileMenuOpen(true)} />

        <div className="flex flex-1 overflow-hidden">
          {/* Page content */}
          <main className="flex-1 overflow-hidden flex flex-col min-w-0">
            <Outlet />
          </main>

          {/* Right panel — chat only (desktop) */}
          {showRight && (
            <aside className="hidden xl:flex flex-col w-[340px] border-l border-border bg-card overflow-y-auto">
              <RightPanel />
            </aside>
          )}
        </div>
      </div>
    </div>
  )
}
