import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

const ADMIN_EMAIL = import.meta.env.VITE_ADMIN_EMAIL

export function useAdminAuth() {
  const [user, setUser]           = useState(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [loading, setLoading]     = useState(true)
  const [error, setError]         = useState(null)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      const u = session?.user ?? null
      setUser(u)
      setIsAuthenticated(isAdmin(u))
      setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      const u = session?.user ?? null
      setUser(u)
      setIsAuthenticated(isAdmin(u))
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  function isAdmin(u) {
    if (!u) return false
    if (ADMIN_EMAIL) return u.email === ADMIN_EMAIL
    return true
  }

  const login = async (email, password) => {
    setError(null)
    setLoading(true)
    const { data, error: err } = await supabase.auth.signInWithPassword({ email, password })
    setLoading(false)
    if (err) {
      setError(err.message)
      return { success: false, error: err.message }
    }
    if (!isAdmin(data.user)) {
      await supabase.auth.signOut()
      const msg = 'You do not have admin access.'
      setError(msg)
      return { success: false, error: msg }
    }
    return { success: true }
  }

  const logout = async () => {
    await supabase.auth.signOut()
    setUser(null)
    setIsAuthenticated(false)
  }

  const resetPassword = async (email) => {
    const { error: err } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/admin`,
    })
    if (err) return { success: false, error: err.message }
    return { success: true }
  }

  return { user, isAuthenticated, loading, error, login, logout, resetPassword }
}
