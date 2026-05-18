import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { PortfolioProvider } from './context/PortfolioContext'
import { PriceProvider } from './context/PriceContext'
import { BotProvider } from './context/BotContext'
import App from './App'
import './index.css'

// Reload the page as soon as a new service-worker takes control.
// Together with skipWaiting/clientsClaim in vite.config, this guarantees
// users get the latest JS bundle on every deploy (no stuck-on-old-cache
// problem on iOS Safari).
if ('serviceWorker' in navigator) {
  let reloaded = false
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (reloaded) return
    reloaded = true
    window.location.reload()
  })
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <PortfolioProvider>
          <PriceProvider>
            <BotProvider>
              <App />
            </BotProvider>
          </PriceProvider>
        </PortfolioProvider>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
)
