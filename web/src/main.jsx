import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '@mriqbox/ui-kit/dist/style.css'
import './index.css'
import App from './App.jsx'
import { watchHandover } from './lib/handover'

// Suite colors, /uiconfig and the screen config arrive in the server.lua handover.
watchHandover()

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
