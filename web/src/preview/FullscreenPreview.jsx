import { useEffect, useState } from 'react'
import { isEnvBrowser } from '../lib/assets'
import { DEV_CONFIG } from '../lib/devConfig'
import { fetchNui } from '../lib/nui'
import { applySuiteAccent, applySuiteBackground, applySuiteUiConfig } from '../lib/theme'
import { LoadScreen } from '../loadscreen/LoadScreen'
import { ScaledStage } from '../loadscreen/ScaledStage'

const STAGES = ['Iniciando o jogo', 'Preparando o mapa', 'Carregando o mapa', 'Carregando o mundo', 'Entrando na sessão']
const CYCLE_MS = 30000

/** The ui_page: the loadscreen over the game with the panel's draft, opened by the "Tela cheia" button; ESC goes back. */
export default function FullscreenPreview() {
  const [config, setConfig] = useState(isEnvBrowser() ? DEV_CONFIG : null)
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const onMessage = ({ data }) => {
      if (data?.action !== 'fullscreen') return
      const theme = data.theme || {}
      applySuiteAccent(theme.accentColor)
      applySuiteBackground(theme.backgroundColor)
      applySuiteUiConfig(theme.uiConfig)
      setProgress(0)
      setConfig(data.config)
    }
    window.addEventListener('message', onMessage)
    return () => window.removeEventListener('message', onMessage)
  }, [])

  useEffect(() => {
    if (!config) return
    const close = (e) => {
      if (e.key !== 'Escape' && e.key !== 'Backspace') return
      setConfig(null)
      fetchNui('closeFullscreen')
    }
    // Fake loading that loops, so the bar and the stage text can be checked.
    const timer = setInterval(() => setProgress((p) => (p >= 100 ? 0 : p + 100 / (CYCLE_MS / 100))), 100)
    window.addEventListener('keydown', close)
    return () => {
      clearInterval(timer)
      window.removeEventListener('keydown', close)
    }
  }, [config])

  if (!config) return null

  return (
    <ScaledStage className="h-screen w-screen">
      <LoadScreen config={config} progress={progress} stage={STAGES[Math.min(STAGES.length - 1, Math.floor(progress / 20))]} />
      <div className="pointer-events-none absolute left-1/2 top-6 -translate-x-1/2 rounded-md border border-border bg-card/70 px-3 py-1.5 text-xs text-muted-foreground">
        Prévia da tela de carregamento. ESC para voltar ao painel.
      </div>
    </ScaledStage>
  )
}
