import {
  applyUiConfig,
  isHexColor,
  setAccentOverride,
  setBackgroundOverride,
  setSuiteAccent,
  setSuiteBackground,
} from '@mriqbox/ui-kit'

/**
 * Suite style from the ox_lib /uiconfig. `withOverrides = false` inside mri_Qadmin:
 * the host already sends the resolved accent and background.
 */
export function applySuiteUiConfig(cfg, withOverrides = true) {
  if (!cfg || typeof cfg !== 'object') return
  applyUiConfig(cfg)
  if (withOverrides) {
    setAccentOverride(cfg.accentColor)
    setBackgroundOverride(cfg.backgroundColor)
  }
  document.documentElement.setAttribute('data-theme', cfg.theme === 'glass' ? 'glass' : 'dark')
}

export function applySuiteAccent(hex) {
  if (isHexColor(hex)) setSuiteAccent(hex)
}

export function applySuiteBackground(hex) {
  setSuiteBackground(typeof hex === 'string' ? hex : '')
}
