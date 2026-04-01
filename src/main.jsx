import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { PortfolioProvider } from './context/PortfolioContext'
import { PriceProvider } from './context/PriceContext'
import { BotProvider } from './context/BotContext'
import App from './App'
import './index.css'

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
