import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { ChatProvider }    from './context/ChatContext'
import { AuthProvider }    from './context/AuthContext'
import ProtectedRoute      from './components/common/ProtectedRoute'
import AppLayout           from './layouts/AppLayout'
import LoginPage           from './pages/Login'
import Chat                from './pages/Chat'
import Documents           from './pages/Documents'
import Admin               from './pages/Admin'
import History             from './pages/History'
import Settings            from './pages/Settings'

export default function App() {
  return (
    <AuthProvider>
      <ChatProvider>
        <BrowserRouter>
          <Routes>
            {/* Public */}
            <Route path="/login" element={<LoginPage />} />

            {/* Protected — any authenticated user */}
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <AppLayout />
                </ProtectedRoute>
              }
            >
              {/* Default redirect by role is handled inside ProtectedRoute / Login */}
              <Route index element={<Navigate to="/chat" replace />} />

              {/* Employee routes */}
              <Route path="chat" element={
                <ProtectedRoute role="employee"><Chat /></ProtectedRoute>
              } />
              <Route path="chat/:conversationId" element={
                <ProtectedRoute role="employee"><Chat /></ProtectedRoute>
              } />
              <Route path="history" element={
                <ProtectedRoute role="employee"><History /></ProtectedRoute>
              } />

              {/* HR routes */}
              <Route path="documents" element={
                <ProtectedRoute role="hr"><Documents /></ProtectedRoute>
              } />
              <Route path="admin" element={
                <ProtectedRoute role="hr"><Admin /></ProtectedRoute>
              } />

              {/* Shared */}
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

