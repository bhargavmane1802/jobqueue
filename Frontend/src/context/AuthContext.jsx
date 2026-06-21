import { createContext, useContext, useState, useEffect } from 'react'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem('nexus_token'))
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('nexus_user')
    return saved ? JSON.parse(saved) : null
  })

  const login = (jwtToken) => {
    // Decode payload
    const payload = JSON.parse(atob(jwtToken.split('.')[1]))
    setToken(jwtToken)
    setUser({ id: payload.id, username: payload.username, role: payload.role, email: payload.email })
    localStorage.setItem('nexus_token', jwtToken)
    localStorage.setItem('nexus_user', JSON.stringify({
      id: payload.id, username: payload.username, role: payload.role, email: payload.email
    }))
  }

  const logout = () => {
    setToken(null)
    setUser(null)
    localStorage.removeItem('nexus_token')
    localStorage.removeItem('nexus_user')
  }

  return (
    <AuthContext.Provider value={{ token, user, login, logout, isAuthenticated: !!token }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
