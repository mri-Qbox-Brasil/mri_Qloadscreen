import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '@mriqbox/ui-kit/dist/style.css'
import './index.css'
import App from './App.jsx'
import { applySuiteAccent, applySuiteBackground, applySuiteUiConfig } from './lib/theme'

// Suite colors and /uiconfig arrive in the server.lua handover; applied before the first paint.
const handover = window.nuiHandoverData
applySuiteAccent(handover?.accentColor)
applySuiteBackground(handover?.backgroundColor)
applySuiteUiConfig(handover?.uiConfig)

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
