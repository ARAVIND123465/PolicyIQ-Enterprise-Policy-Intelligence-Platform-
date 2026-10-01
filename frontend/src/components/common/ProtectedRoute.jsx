import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

/**
 * Wraps routes that require authentication.
 * Optionally restrict to a specific role: <ProtectedRoute role="hr">
 */
export default function ProtectedRoute({ children, role }) {
  const { user } = useAuth()
  const location = useLocation()

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  if (role && user.role !== role) {
    // Wrong role → redirect to their home
    return <Navigate to={user.role === 'hr' ? '/documents' : '/chat'} replace />
  }

  return children
}
