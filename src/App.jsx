import { useState, useEffect } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import Layout from './components/Layout'
import Login from './components/Login'
import Landing from './components/Landing'
import ErrorBoundary from './components/ErrorBoundary'
import Onboarding from './components/Onboarding'
import Dashboard from './components/Dashboard'
import PaperTrading from './components/PaperTrading'
import TradingBot from './components/TradingBot'
import Strategies from './components/Strategies'
import MergersAcquisitions from './components/MergersAcquisitions'
import LboModel from './components/LboModel'
import ValuationTool from './components/ValuationTool'
import Courses from './components/Courses'
import News from './components/News'
import Leaderboard from './components/Leaderboard'

export default function App() {
  const { user, loading } = useAuth()
  const [showOnboarding, setShowOnboarding] = useState(false)
  const [showLogin, setShowLogin] = useState(false)

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

  if (!user) {
    return (
      <ErrorBoundary>
        {showLogin
          ? <Login onBack={() => setShowLogin(false)} />
          : <Landing onGetStarted={() => setShowLogin(true)} />}
      </ErrorBoundary>
    )
  }

  return (
    <ErrorBoundary>
      {showOnboarding && <Onboarding onComplete={completeOnboarding} />}
      <Layout>
        <ErrorBoundary>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/trade" element={<PaperTrading />} />
            <Route path="/bot" element={<TradingBot />} />
            <Route path="/strategies" element={<Strategies />} />
            <Route path="/m-and-a" element={<MergersAcquisitions />} />
            <Route path="/lbo" element={<LboModel />} />
            <Route path="/valuation" element={<ValuationTool />} />
            <Route path="/courses" element={<Courses />} />
            <Route path="/news" element={<News />} />
            <Route path="/leaderboard" element={<Leaderboard />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </ErrorBoundary>
      </Layout>
    </ErrorBoundary>
  )
}
