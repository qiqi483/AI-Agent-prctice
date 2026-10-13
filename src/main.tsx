import React from 'react'
import ReactDOM from 'react-dom/client'
import { HashRouter } from 'react-router-dom'
import { MotionConfig } from 'framer-motion'
import App from './App'
import { getTheme } from './lib/storage'
import './styles/tokens.css'
import './styles/global.css'

document.documentElement.dataset.theme = getTheme()

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <HashRouter>
      <MotionConfig reducedMotion="user">
        <App />
      </MotionConfig>
    </HashRouter>
  </React.StrictMode>,
)
