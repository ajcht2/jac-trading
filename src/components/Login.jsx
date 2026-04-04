import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { ArrowRight, BarChart3, Bot, Wallet, Lock, Mail, User } from 'lucide-react'

export default function Login() {
  const { signUp, signIn, resetPassword, error, setError } = useAuth()
  const [mode, setMode] = useState('signup') // 'signup', 'signin', or 'forgot'
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [signupSuccess, setSignupSuccess] = useState(false)
  const [resetSent, setResetSent] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    if (mode === 'forgot') {
      if (!email.trim() || !email.includes('@')) { setError('Enter your email'); setLoading(false); return }
      const success = await resetPassword(email)
      if (success) setResetSent(true)
    } else if (mode === 'signup') {
      if (!name.trim()) { setError('Enter your name'); setLoading(false); return }
      if (!email.trim() || !email.includes('@')) { setError('Enter a valid email'); setLoading(false); return }
      if (password.length < 6) { setError('Password must be at least 6 characters'); setLoading(false); return }

      const success = await signUp(name, email, password)
      if (success) setSignupSuccess(true)
    } else {
      if (!email.trim()) { setError('Enter your email'); setLoading(false); return }
      if (!password) { setError('Enter your password'); setLoading(false); return }

      await signIn(email, password)
    }

    setLoading(false)
  }

  const switchMode = () => {
    setMode(mode === 'signup' ? 'signin' : 'signup')
    setError('')
    setSignupSuccess(false)
    setResetSent(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6 relative">
      <div className="fixed inset-0 z-0" style={{
        backgroundImage: 'url(/city-bg.jpg)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}>
        <div className="absolute inset-0 bg-terminal-bg/70" />
      </div>
      <div className="w-full max-w-md space-y-8 relative z-10">
        {/* Logo */}
        <div className="text-center">
          <img src="/logo.png" alt="JAC Trading" className="w-36 h-36 mx-auto rounded-2xl" style={{ backgroundColor: '#0b0e14' }} />
          <p className="text-terminal-muted mt-3 text-sm">Paper Trading Dashboard & Championship</p>
        </div>

        {/* Features */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-terminal-panel/80 backdrop-blur border border-terminal-border rounded-2xl p-4 text-center">
            <BarChart3 size={24} className="text-accent mx-auto mb-2" />
            <p className="text-xs text-terminal-muted">Live Charts</p>
          </div>
          <div className="bg-terminal-panel/80 backdrop-blur border border-terminal-border rounded-2xl p-4 text-center">
            <Wallet size={24} className="text-gain mx-auto mb-2" />
            <p className="text-xs text-terminal-muted">Paper Trade</p>
          </div>
          <div className="bg-terminal-panel/80 backdrop-blur border border-terminal-border rounded-2xl p-4 text-center">
            <Bot size={24} className="text-purple-400 mx-auto mb-2" />
            <p className="text-xs text-terminal-muted">Algo Bot</p>
          </div>
        </div>

        {/* Auth Form */}
        <div className="bg-terminal-panel/90 backdrop-blur border border-terminal-border rounded-2xl p-6 space-y-5">
          {/* Mode Toggle */}
          <div className="flex rounded-xl overflow-hidden border border-terminal-border">
            <button onClick={() => { setMode('signup'); setError(''); setSignupSuccess(false) }}
              className={`flex-1 py-2.5 text-sm font-semibold transition-all ${mode === 'signup' ? 'bg-accent/20 text-accent' : 'text-terminal-muted hover:text-terminal-text'}`}
            >Sign Up</button>
            <button onClick={() => { setMode('signin'); setError(''); setSignupSuccess(false) }}
              className={`flex-1 py-2.5 text-sm font-semibold transition-all ${mode === 'signin' ? 'bg-accent/20 text-accent' : 'text-terminal-muted hover:text-terminal-text'}`}
            >Sign In</button>
          </div>

          {signupSuccess ? (
            <div className="text-center space-y-3 py-4">
              <div className="w-16 h-16 rounded-full bg-gain/10 flex items-center justify-center mx-auto">
                <Mail size={28} className="text-gain" />
              </div>
              <h3 className="font-semibold text-lg">Check your email</h3>
              <p className="text-sm text-terminal-muted">We sent a confirmation link to <span className="text-terminal-text font-medium">{email}</span>. Click it to activate your account.</p>
              <button onClick={() => { setMode('signin'); setSignupSuccess(false) }}
                className="text-sm text-accent hover:underline mt-2"
              >Already confirmed? Sign in →</button>
            </div>
          ) : resetSent ? (
            <div className="text-center space-y-3 py-4">
              <div className="w-16 h-16 rounded-full bg-accent/10 flex items-center justify-center mx-auto">
                <Mail size={28} className="text-accent" />
              </div>
              <h3 className="font-semibold text-lg">Reset link sent</h3>
              <p className="text-sm text-terminal-muted">Check your inbox at <span className="text-terminal-text font-medium">{email}</span> for a password reset link.</p>
              <button onClick={() => { setMode('signin'); setResetSent(false); setError('') }}
                className="text-sm text-accent hover:underline mt-2"
              >Back to Sign In →</button>
            </div>
          ) : mode === 'forgot' ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <h2 className="text-lg font-semibold">Reset Password</h2>
                <p className="text-sm text-terminal-muted mt-1">Enter your email and we'll send you a reset link</p>
              </div>
              <div>
                <label className="text-xs text-terminal-muted uppercase tracking-wider">Email</label>
                <div className="relative mt-1.5">
                  <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-terminal-muted" />
                  <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                    placeholder="you@email.com" autoFocus
                    className="w-full bg-terminal-bg border border-terminal-border rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/20 transition-all"
                  />
                </div>
              </div>
              {error && <p className="text-xs text-loss bg-loss/10 rounded-xl p-3">{error}</p>}
              <button type="submit" disabled={loading}
                className="w-full py-3 rounded-xl bg-accent hover:bg-accent/90 text-white font-semibold text-sm transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <>Send Reset Link <ArrowRight size={16} /></>}
              </button>
              <p className="text-center text-xs text-terminal-muted">
                <button type="button" onClick={() => { setMode('signin'); setError('') }} className="text-accent hover:underline">Back to Sign In</button>
              </p>
            </form>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <h2 className="text-lg font-semibold">
                  {mode === 'signup' ? 'Create Account' : 'Welcome Back'}
                </h2>
                <p className="text-sm text-terminal-muted mt-1">
                  {mode === 'signup' ? 'Start trading with $100,000 virtual cash' : 'Sign in to your trading account'}
                </p>
              </div>

              {mode === 'signup' && (
                <div>
                  <label className="text-xs text-terminal-muted uppercase tracking-wider">Name</label>
                  <div className="relative mt-1.5">
                    <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-terminal-muted" />
                    <input type="text" value={name} onChange={e => setName(e.target.value)}
                      placeholder="Your name" autoFocus
                      className="w-full bg-terminal-bg border border-terminal-border rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/20 transition-all"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="text-xs text-terminal-muted uppercase tracking-wider">Email</label>
                <div className="relative mt-1.5">
                  <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-terminal-muted" />
                  <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                    placeholder="you@email.com" autoFocus={mode === 'signin'}
                    className="w-full bg-terminal-bg border border-terminal-border rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/20 transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs text-terminal-muted uppercase tracking-wider">Password</label>
                <div className="relative mt-1.5">
                  <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-terminal-muted" />
                  <input type="password" value={password} onChange={e => setPassword(e.target.value)}
                    placeholder={mode === 'signup' ? 'Min 6 characters' : 'Your password'}
                    className="w-full bg-terminal-bg border border-terminal-border rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/20 transition-all"
                  />
                </div>
              </div>

              {error && <p className="text-xs text-loss bg-loss/10 rounded-xl p-3">{error}</p>}

              <button type="submit" disabled={loading}
                className="w-full py-3 rounded-xl bg-accent hover:bg-accent/90 text-white font-semibold text-sm transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>{mode === 'signup' ? 'Create Account' : 'Sign In'} <ArrowRight size={16} /></>
                )}
              </button>

              <p className="text-center text-xs text-terminal-muted">
                {mode === 'signup' ? (
                  <>Already have an account? <button type="button" onClick={switchMode} className="text-accent hover:underline">Sign in</button></>
                ) : (
                  <span className="space-y-2 block">
                    <span className="block">Don't have an account? <button type="button" onClick={switchMode} className="text-accent hover:underline">Sign up</button></span>
                    <button type="button" onClick={() => { setMode('forgot'); setError('') }} className="text-accent hover:underline block mx-auto">Forgot password?</button>
                  </span>
                )}
              </p>
            </form>
          )}
        </div>

        <p className="text-center text-xs text-terminal-muted">
          Virtual trading only — no real money involved
        </p>
      </div>
    </div>
  )
}
