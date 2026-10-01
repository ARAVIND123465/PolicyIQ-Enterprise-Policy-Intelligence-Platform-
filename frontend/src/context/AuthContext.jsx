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

  const login = (username, password, role) => {
    // Accept any username and password — only role matters
    if (!username.trim()) return { ok: false, error: 'Please enter a username.' }
    if (!password.trim()) return { ok: false, error: 'Please enter a password.' }

    const defaults = ROLE_DEFAULTS[role]
    setUser({
      username: username.trim(),
      name: username.trim(),
      email: `${username.trim().toLowerCase().replace(/\s+/g, '.')}@company.com`,
      role: defaults.role,
    })
    return { ok: true }
  }

  const logout = () => setUser(null)

  return (
    <AuthContext.Provider value={{ user, login, logout, isHR: user?.role === 'hr' }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
