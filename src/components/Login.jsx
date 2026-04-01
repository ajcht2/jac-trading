import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { TrendingUp, ArrowRight, BarChart3, Bot, Wallet } from 'lucide-react'

export default function Login() {
  const { login } = useAuth()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (!name.trim()) { setError('Enter your name'); return }
    if (!email.trim() || !email.includes('@')) { setError('Enter a valid email'); return }

    setLoading(true)

    // Send notification email via EmailJS (free tier)
    try {
      await fetch('https://api.emailjs.com/api/v1.0/email/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          service_id: 'YOUR_SERVICE_ID',       // Replace with your EmailJS service ID
          template_id: 'YOUR_TEMPLATE_ID',     // Replace with your EmailJS template ID
          user_id: 'YOUR_PUBLIC_KEY',           // Replace with your EmailJS public key
          template_params: {
            from_name: name,
            from_email: email,
            message: `New JAC Trading user: ${name} (${email}) joined at ${new Date().toLocaleString()}`,
          },
        }),
      })
    } catch {
      // Don't block login if email fails
    }

    const capitalizedName = name.trim().split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ')
    login({ name: capitalizedName, email: email.trim(), joinedAt: new Date().toISOString() })
    setLoading(false)
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
          <div className="bg-terminal-panel border border-terminal-border rounded-2xl p-4 text-center">
            <BarChart3 size={24} className="text-accent mx-auto mb-2" />
            <p className="text-xs text-terminal-muted">Live Charts</p>
          </div>
          <div className="bg-terminal-panel border border-terminal-border rounded-2xl p-4 text-center">
            <Wallet size={24} className="text-gain mx-auto mb-2" />
            <p className="text-xs text-terminal-muted">Paper Trade</p>
          </div>
          <div className="bg-terminal-panel border border-terminal-border rounded-2xl p-4 text-center">
            <Bot size={24} className="text-purple-400 mx-auto mb-2" />
            <p className="text-xs text-terminal-muted">Algo Bot</p>
          </div>
        </div>

        {/* Login Form */}
        <div className="bg-terminal-panel border border-terminal-border rounded-2xl p-6 space-y-5">
          <div>
            <h2 className="text-lg font-semibold">Get Started</h2>
            <p className="text-sm text-terminal-muted mt-1">Enter your details to start trading with $100,000</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs text-terminal-muted uppercase tracking-wider">Name</label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Your name"
                autoFocus
                className="w-full mt-1.5 bg-terminal-bg border border-terminal-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/20 transition-all"
              />
            </div>

            <div>
              <label className="text-xs text-terminal-muted uppercase tracking-wider">Email</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@email.com"
                className="w-full mt-1.5 bg-terminal-bg border border-terminal-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/20 transition-all"
              />
            </div>

            {error && <p className="text-xs text-loss bg-loss/10 rounded-xl p-3">{error}</p>}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-accent hover:bg-accent/90 text-white font-semibold text-sm transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>Start Trading <ArrowRight size={16} /></>
              )}
            </button>
          </form>
        </div>

        <p className="text-center text-xs text-terminal-muted">
          Virtual trading only — no real money involved
        </p>
      </div>
    </div>
  )
}
