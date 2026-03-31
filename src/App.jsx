import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import Layout from './components/Layout'
import Login from './components/Login'
import Dashboard from './components/Dashboard'
import PaperTrading from './components/PaperTrading'
import TradingBot from './components/TradingBot'
import Strategies from './components/Strategies'

export default function App() {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen bg-terminal-bg flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!user) return <Login />

  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/trade" element={<PaperTrading />} />
        <Route path="/bot" element={<TradingBot />} />
        <Route path="/strategies" element={<Strategies />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Layout>
  )
}
