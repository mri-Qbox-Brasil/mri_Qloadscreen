import {
  applyUiConfig,
  isHexColor,
  setAccentOverride,
  setBackgroundOverride,
  setSuiteAccent,
  setSuiteBackground,
} from '@mriqbox/ui-kit'

/** Suite style from the ox_lib /uiconfig; inside mri_Qadmin the kit plugin bridge applies the host theme. */
export function applySuiteUiConfig(cfg) {
  if (!cfg || typeof cfg !== 'object') return
  applyUiConfig(cfg)
  setAccentOverride(cfg.accentColor)
  setBackgroundOverride(cfg.backgroundColor)
  document.documentElement.setAttribute('data-theme', cfg.theme === 'glass' ? 'glass' : 'dark')
}

export function applySuiteAccent(hex) {
  if (isHexColor(hex)) setSuiteAccent(hex)
}

export function applySuiteBackground(hex) {
  setSuiteBackground(typeof hex === 'string' ? hex : '')
}
