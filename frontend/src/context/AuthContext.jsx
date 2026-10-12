import { createContext, useContext, useState, useEffect } from 'react'

const AuthContext = createContext(null)

const ROLE_DEFAULTS = {
  employee: { role: 'employee', name: 'Employee', email: 'employee@company.com' },
  hr:       { role: 'hr',       name: 'HR Manager', email: 'hr@company.com'    },
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem('policyai_user')
      return stored ? JSON.parse(stored) : null
    } catch { return null }
  })

  useEffect(() => {
    if (user) localStorage.setItem('policyai_user', JSON.stringify(user))
    else       localStorage.removeItem('policyai_user')
  }, [user])

  const login = (identifier, password, role) => {
    // Accept any email/username and any password — no JWT required
    if (!identifier || !identifier.trim()) return { ok: false, error: 'Please enter your email or username.' }
    if (!password || !password.trim()) return { ok: false, error: 'Please enter your password.' }

    const trimmed = identifier.trim()
    const targetRole = role || 'employee'
    const defaults = ROLE_DEFAULTS[targetRole] || ROLE_DEFAULTS.employee

    let email = ''
    let displayName = ''

    if (trimmed.includes('@')) {
      email = trimmed.toLowerCase()
      const localPart = trimmed.split('@')[0]
      displayName = localPart.replace(/[._]/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
    } else {
      displayName = trimmed
      email = `${trimmed.toLowerCase().replace(/\s+/g, '.')}@company.com`
    }

    const userData = {
      username: trimmed,
      name: displayName,
      email: email,
      role: defaults.role,
    }
    setUser(userData)
    return { ok: true, user: userData }
  }

  const logout = () => setUser(null)

  return (
    <AuthContext.Provider value={{ user, login, logout, isHR: user?.role === 'hr' }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
