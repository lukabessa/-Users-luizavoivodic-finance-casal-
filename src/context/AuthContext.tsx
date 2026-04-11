import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import type { User, Session } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'

export type Mode = 'couple' | 'solo'

interface AuthContextValue {
  user: User | null
  session: Session | null
  isAuthenticated: boolean
  mode: Mode | null
  loading: boolean
  email: string
  login: (email: string, password: string) => Promise<string | null>
  signup: (email: string, password: string, mode: Mode) => Promise<string | null>
  logout: () => Promise<void>
  changePassword: (newPassword: string) => Promise<string | null>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Restore session on mount
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session)
      setUser(data.session?.user ?? null)
      setLoading(false)
    })

    // Listen for auth changes (login/logout from any tab)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession)
      setUser(newSession?.user ?? null)
    })

    return () => subscription.unsubscribe()
  }, [])

  const login = useCallback(async (email: string, password: string): Promise<string | null> => {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) return error.message
    return null
  }, [])

  const signup = useCallback(async (email: string, password: string, mode: Mode): Promise<string | null> => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { mode } },
    })
    if (error) return error.message
    return null
  }, [])

  const logout = useCallback(async () => {
    await supabase.auth.signOut()
  }, [])

  const changePassword = useCallback(async (newPassword: string): Promise<string | null> => {
    const { error } = await supabase.auth.updateUser({ password: newPassword })
    if (error) return error.message
    return null
  }, [])

  const mode = (user?.user_metadata?.mode as Mode) ?? null
  const email = user?.email ?? ''
  const isAuthenticated = !!user

  return (
    <AuthContext.Provider value={{
      user, session, isAuthenticated, mode, loading, email,
      login, signup, logout, changePassword,
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}
