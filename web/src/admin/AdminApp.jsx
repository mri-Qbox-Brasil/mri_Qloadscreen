import { usePluginBridgeGuest } from '@mriqbox/ui-kit'
import { isEnvBrowser } from '../lib/assets'
import { ConfigPanel } from './ConfigPanel'

/** Embedded in mri_Qadmin (the kit bridge applies its theme and closes on ESC); outside the game (vite dev) it opens straight away. */
export default function AdminApp() {
  const { initialized, requestClose } = usePluginBridgeGuest()

  if (!initialized && !isEnvBrowser()) return null

  return (
    <div className="h-full w-full bg-background text-foreground">
      <ConfigPanel onClose={requestClose} />
    </div>
  )
}
