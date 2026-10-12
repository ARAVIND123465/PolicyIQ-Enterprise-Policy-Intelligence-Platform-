import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { ChatProvider }    from './context/ChatContext'
import { AuthProvider, useAuth } from './context/AuthContext'
import ProtectedRoute      from './components/common/ProtectedRoute'
import AppLayout           from './layouts/AppLayout'

// Login Pages
import LoginPage           from './pages/Login'
import EmployeeLoginPage   from './pages/EmployeeLogin'
import HRLoginPage         from './pages/HRLogin'

// Employee Portal Pages
import EmployeeDashboard   from './pages/EmployeeDashboard'
import EmployeeProfile     from './pages/EmployeeProfile'
import CompanyPolicies     from './pages/CompanyPolicies'

// HR Portal Pages
import HRDashboard         from './pages/HRDashboard'
import HREmployeeDirectory from './pages/HREmployeeDirectory'
import HREmployeeDetail    from './pages/HREmployeeDetail'

// Shared & System Pages
import Chat                from './pages/Chat'
import Documents           from './pages/Documents'
import Admin               from './pages/Admin'
import History             from './pages/History'
import Settings            from './pages/Settings'

function RoleHomeRedirect() {
  const { user } = useAuth()
  if (!user) return <Navigate to="/login" replace />
  return <Navigate to={user.role === 'hr' ? '/hr/dashboard' : '/employee/dashboard'} replace />
}

export default function App() {
  return (
    <AuthProvider>
      <ChatProvider>
        <BrowserRouter>
          <Routes>
            {/* Public Login Routes */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/employee/login" element={<EmployeeLoginPage />} />
            <Route path="/hr/login" element={<HRLoginPage />} />

            {/* Authenticated Workspace */}
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <AppLayout />
                </ProtectedRoute>
              }
            >
              {/* Root redirect based on role */}
              <Route index element={<RoleHomeRedirect />} />

              {/* ── Employee Portal Routes ── */}
              <Route
                path="employee/dashboard"
                element={
                  <ProtectedRoute role="employee">
                    <EmployeeDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="employee/profile"
                element={
                  <ProtectedRoute role="employee">
                    <EmployeeProfile />
                  </ProtectedRoute>
                }
              />
              <Route
                path="employee/policies"
                element={
                  <ProtectedRoute role="employee">
                    <CompanyPolicies />
                  </ProtectedRoute>
                }
              />

              {/* ── HR Portal Routes ── */}
              <Route
                path="hr/dashboard"
                element={
                  <ProtectedRoute role="hr">
                    <HRDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="hr/employees"
                element={
                  <ProtectedRoute role="hr">
                    <HREmployeeDirectory />
                  </ProtectedRoute>
                }
              />
              <Route
                path="hr/employees/:id"
                element={
                  <ProtectedRoute role="hr">
                    <HREmployeeDetail />
                  </ProtectedRoute>
                }
              />
              <Route
                path="documents"
                element={
                  <ProtectedRoute role="hr">
                    <Documents />
                  </ProtectedRoute>
                }
              />
              <Route
                path="admin"
                element={
                  <ProtectedRoute role="hr">
                    <Admin />
                  </ProtectedRoute>
                }
              />

              {/* ── Shared AI Assistant & History Routes ── */}
              <Route path="chat" element={<Chat />} />
              <Route path="chat/:conversationId" element={<Chat />} />
              <Route
                path="history"
                element={
                  <ProtectedRoute role="employee">
                    <History />
                  </ProtectedRoute>
                }
              />

              {/* Shared Settings */}
              <Route path="settings" element={<Settings />} />
            </Route>

            {/* Catch-all */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </ChatProvider>
    </AuthProvider>
  )
}
