import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '@mriqbox/ui-kit/dist/style.css'
import '../index.css'
import AdminApp from './AdminApp'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AdminApp />
  </StrictMode>,
)
