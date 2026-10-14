import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '@mriqbox/ui-kit/dist/style.css'
import '../index.css'
import FullscreenPreview from './FullscreenPreview'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <FullscreenPreview />
  </StrictMode>,
)
