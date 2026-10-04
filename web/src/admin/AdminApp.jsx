import { useEffect } from 'react'
import { isEnvBrowser } from '../lib/assets'
import { usePluginBridge } from '../lib/pluginBridge'
import { ConfigPanel } from './ConfigPanel'

/** Embedded in mri_Qadmin; outside the game (vite dev) it opens straight away. */
export default function AdminApp() {
  const { initialized, requestClose } = usePluginBridge()

  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && requestClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [requestClose])

  if (!initialized && !isEnvBrowser()) return null

  return (
    <div className="h-full w-full bg-background text-foreground">
      <ConfigPanel onClose={requestClose} />
    </div>
  )
}
