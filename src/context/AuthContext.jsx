import { createContext, useContext, useState, useEffect } from 'react'
import { supabase } from '../services/supabase'

const AuthContext = createContext()

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // Check for existing session on load
  useEffect(() => {
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

    // Listen for auth changes
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

    const { data, error: authError } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: {
        data: { name: capitalizedName },
      },
    })

    if (authError) {
      if (authError.message.includes('already registered')) {
        setError('This email is already registered. Please sign in.')
      } else {
        setError(authError.message)
      }
      return false
    }

    // Create portfolio in database
    if (data.user) {
      await supabase.from('portfolios').upsert({
        user_id: data.user.id,
        cash: 100000,
        positions: {},
        transactions: [],
      })

      // Send notification email via EmailJS (optional)
      try {
        await fetch('https://api.emailjs.com/api/v1.0/email/send', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            service_id: 'YOUR_SERVICE_ID',
            template_id: 'YOUR_TEMPLATE_ID',
            user_id: 'YOUR_PUBLIC_KEY',
            template_params: {
              from_name: capitalizedName,
              from_email: email,
              message: `New JAC Trading user: ${capitalizedName} (${email}) joined at ${new Date().toLocaleString()}`,
            },
          }),
        })
      } catch {}
    }

    return true
  }

  const signIn = async (email, password) => {
    setError('')
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
    await supabase.auth.signOut()
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
