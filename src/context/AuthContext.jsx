import { createContext, useContext, useState, useEffect } from 'react'
import { supabase, isSupabaseConfigured } from '../services/supabase'

const AuthContext = createContext()
const LOCAL_KEY = 'jac_trading_user'

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!isSupabaseConfigured) {
      try {
        const saved = localStorage.getItem(LOCAL_KEY)
        if (saved) setUser(JSON.parse(saved))
      } catch {}
      setLoading(false)
      return
    }

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser({
          id: session.user.id,
          email: session.user.email,
          name: session.user.user_metadata?.name || session.user.email.split('@')[0],
        })
      }
      setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUser({
          id: session.user.id,
          email: session.user.email,
          name: session.user.user_metadata?.name || session.user.email.split('@')[0],
        })
      } else {
        setUser(null)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  const signUp = async (name, email, password) => {
    setError('')
    const capitalizedName = name.trim().split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ')

    if (!isSupabaseConfigured) {
      const userData = { id: Date.now().toString(), name: capitalizedName, email: email.trim() }
      setUser(userData)
      localStorage.setItem(LOCAL_KEY, JSON.stringify(userData))
      return true
    }

    const { data, error: authError } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: { data: { name: capitalizedName } },
    })

    if (authError) {
      if (authError.message.includes('already registered')) {
        setError('This email is already registered. Please sign in.')
      } else {
        setError(authError.message)
      }
      return false
    }

    if (data.user) {
      try {
        await supabase.from('portfolios').upsert({
          user_id: data.user.id,
          name: capitalizedName,
          cash: 100000,
          positions: {},
          transactions: [],
        })
      } catch {}
    }

    return true
  }

  const signIn = async (email, password) => {
    setError('')

    if (!isSupabaseConfigured) {
      setError('Supabase not configured')
      return false
    }

    const { error: authError } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    })

    if (authError) {
      if (authError.message.includes('Invalid login')) {
        setError('Wrong email or password.')
      } else {
        setError(authError.message)
      }
      return false
    }
    return true
  }

  const logout = async () => {
    if (isSupabaseConfigured) {
      await supabase.auth.signOut()
    }
    localStorage.removeItem(LOCAL_KEY)
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, loading, error, setError, signUp, signIn, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
