import { useState, useEffect } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import Layout from './components/Layout'
import Login from './components/Login'
import Onboarding from './components/Onboarding'
import Dashboard from './components/Dashboard'
import PaperTrading from './components/PaperTrading'
import TradingBot from './components/TradingBot'
import Strategies from './components/Strategies'
import News from './components/News'
import Leaderboard from './components/Leaderboard'

export default function App() {
  const { user, loading } = useAuth()
  const [showOnboarding, setShowOnboarding] = useState(false)

  // Check if user has seen onboarding
  useEffect(() => {
    if (user?.id) {
      const seen = localStorage.getItem(`jac_onboarding_${user.id}`)
      if (!seen) setShowOnboarding(true)
    }
  }, [user?.id])

  const completeOnboarding = (dontShowAgain) => {
    if (dontShowAgain && user?.id) {
      localStorage.setItem(`jac_onboarding_${user.id}`, 'true')
    }
    setShowOnboarding(false)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-terminal-bg flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!user) return <Login />

  return (
    <>
      {showOnboarding && <Onboarding onComplete={completeOnboarding} />}
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/trade" element={<PaperTrading />} />
          <Route path="/bot" element={<TradingBot />} />
          <Route path="/strategies" element={<Strategies />} />
          <Route path="/news" element={<News />} />
        <Route path="/leaderboard" element={<Leaderboard />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Layout>
    </>
  )
}
