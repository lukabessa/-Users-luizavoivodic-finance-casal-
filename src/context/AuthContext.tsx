import React, { createContext, useContext, useState, useCallback } from 'react'

export type Mode = 'couple' | 'solo'

interface Credentials { username: string; password: string }

interface AuthContextValue {
  isAuthenticated: boolean
  mode: Mode | null
  login: (username: string, password: string, mode: Mode) => boolean
  logout: () => void
  changeCredentials: (currentPass: string, newUsername: string, newPassword: string) => boolean
  username: string
}

const DEFAULTS: Record<Mode, Credentials> = {
  couple: { username: 'casal', password: '1234' },
  solo:   { username: 'eu',    password: '1234' },
}

function credsKey(mode: Mode) { return `finance-${mode}-creds` }
function sessionKey(mode: Mode) { return `finance-${mode}-session` }
const SESSION_MODE_KEY = 'finance-active-mode'

function getStoredCreds(mode: Mode): Credentials {
  try {
    const raw = localStorage.getItem(credsKey(mode))
    if (raw) return JSON.parse(raw)
  } catch {}
  return DEFAULTS[mode]
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [mode, setMode] = useState<Mode | null>(() => {
    const m = sessionStorage.getItem(SESSION_MODE_KEY) as Mode | null
    return m === 'couple' || m === 'solo' ? m : null
  })
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    const m = sessionStorage.getItem(SESSION_MODE_KEY) as Mode | null
    if (!m) return false
    return sessionStorage.getItem(sessionKey(m)) === 'true'
  })
  const [username, setUsername] = useState(() => {
    const m = sessionStorage.getItem(SESSION_MODE_KEY) as Mode | null
    return m ? (sessionStorage.getItem(`finance-${m}-user`) ?? '') : ''
  })

  const login = useCallback((user: string, pass: string, m: Mode): boolean => {
    const creds = getStoredCreds(m)
    if (user === creds.username && pass === creds.password) {
      sessionStorage.setItem(SESSION_MODE_KEY, m)
      sessionStorage.setItem(sessionKey(m), 'true')
      sessionStorage.setItem(`finance-${m}-user`, user)
      setMode(m)
      setIsAuthenticated(true)
      setUsername(user)
      return true
    }
    return false
  }, [])

  const logout = useCallback(() => {
    if (mode) {
      sessionStorage.removeItem(sessionKey(mode))
      sessionStorage.removeItem(`finance-${mode}-user`)
    }
    sessionStorage.removeItem(SESSION_MODE_KEY)
    setIsAuthenticated(false)
    setMode(null)
    setUsername('')
  }, [mode])

  const changeCredentials = useCallback((currentPass: string, newUsername: string, newPassword: string): boolean => {
    if (!mode) return false
    const creds = getStoredCreds(mode)
    if (currentPass !== creds.password) return false
    localStorage.setItem(credsKey(mode), JSON.stringify({ username: newUsername, password: newPassword }))
    sessionStorage.setItem(`finance-${mode}-user`, newUsername)
    setUsername(newUsername)
    return true
  }, [mode])

  return (
    <AuthContext.Provider value={{ isAuthenticated, mode, login, logout, changeCredentials, username }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}
