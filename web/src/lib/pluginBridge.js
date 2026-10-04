import { useCallback, useEffect, useState } from 'react'
import { applySuiteAccent, applySuiteBackground, applySuiteUiConfig } from './theme'

// Guest side of the mri_Qadmin plugin protocol (same contract as the other MRI plugins).
const isPluginMessage = (data) => typeof data?.type === 'string' && data.type.startsWith('mri-plugin/')

const sendToHost = (msg) => {
  if (window.self !== window.top) window.parent.postMessage(msg, '*')
}

export function usePluginBridge() {
  const [initialized, setInitialized] = useState(false)

  useEffect(() => {
    const onMessage = ({ data }) => {
      if (!isPluginMessage(data)) return
      if (data.type === 'mri-plugin/init' || data.type === 'mri-plugin/theme-changed') {
        applySuiteUiConfig(data.uiConfig, false)
        applySuiteAccent(data.accentColor)
        applySuiteBackground(data.backgroundColor ?? '')
        if (data.type === 'mri-plugin/init') setInitialized(true)
      }
    }
    window.addEventListener('message', onMessage)
    sendToHost({ type: 'mri-plugin/ready' })
    return () => window.removeEventListener('message', onMessage)
  }, [])

  const requestClose = useCallback(() => sendToHost({ type: 'mri-plugin/request-close' }), [])

  return { initialized, requestClose }
}
