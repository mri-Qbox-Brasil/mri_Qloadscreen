import { useEffect, useState } from 'react'
import { isEnvBrowser } from './lib/assets'
import { DEV_CONFIG } from './lib/devConfig'
import { LoadScreen } from './loadscreen/LoadScreen'
import { ScaledStage } from './loadscreen/ScaledStage'

// FiveM init phases, in order, shown next to the loading text.
const STAGES = {
  INIT_CORE: 'Iniciando o jogo',
  INIT_BEFORE_MAP_LOADED: 'Preparando o mapa',
  MAP: 'Carregando o mapa',
  INIT_AFTER_MAP_LOADED: 'Carregando o mundo',
  INIT_SESSION: 'Entrando na sessão',
}

export default function App() {
  const config = window.nuiHandoverData?.config ?? DEV_CONFIG
  const [progress, setProgress] = useState(0)
  const [stage, setStage] = useState(isEnvBrowser() ? STAGES.MAP : '')

  useEffect(() => {
    const onMessage = ({ data }) => {
      switch (data?.eventName) {
        case 'loadProgress':
          // loadFraction restarts per phase; the bar only moves forward.
          setProgress((prev) => Math.max(prev, data.loadFraction * 100))
          break
        case 'startInitFunctionOrder':
          if (STAGES[data.type]) setStage(STAGES[data.type])
          break
        case 'startDataFileEntries':
          setStage(STAGES.MAP)
          break
      }
    }
    window.addEventListener('message', onMessage)

    let timer
    if (isEnvBrowser()) {
      timer = setInterval(() => setProgress((p) => (p >= 100 ? 100 : p + 0.5)), 100)
    }

    return () => {
      window.removeEventListener('message', onMessage)
      clearInterval(timer)
    }
  }, [])

  return (
    <ScaledStage className="h-screen w-screen">
      <LoadScreen config={config} progress={progress} stage={stage} />
    </ScaledStage>
  )
}
