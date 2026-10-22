import { applySuiteAccent, applySuiteBackground, applySuiteUiConfig } from './theme'

const listeners = new Set()
let applied = null

function apply(data) {
  applied = data
  applySuiteAccent(data.accentColor)
  applySuiteBackground(data.backgroundColor)
  applySuiteUiConfig(data.uiConfig)
  console.info(`[mri_Qloadscreen] handover: accent ${data.accentColor || 'none'}, uiConfig ${data.uiConfig ? 'ok' : 'missing'}`)
  listeners.forEach((fn) => fn(data))
}

/** Server handover (suite colors, /uiconfig, screen config); the client may inject it after the bundle runs, so keep looking for a while. */
export function watchHandover() {
  if (window.nuiHandoverData) return apply(window.nuiHandoverData)

  const started = Date.now()
  const timer = setInterval(() => {
    if (window.nuiHandoverData) {
      clearInterval(timer)
      apply(window.nuiHandoverData)
    } else if (Date.now() - started > 10000) {
      clearInterval(timer)
      console.info('[mri_Qloadscreen] handover: not received')
    }
  }, 100)
}

export function getHandover() {
  return applied
}

export function onHandover(fn) {
  listeners.add(fn)
  return () => listeners.delete(fn)
}
