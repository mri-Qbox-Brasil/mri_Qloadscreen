/** A link is used as is; a bare file name points to config/<folder>/ in the resource. */
export function assetUrl(src, folder) {
  if (!src) return ''
  if (/^https?:\/\//i.test(src)) return src
  return `../config/${folder}/${src}`
}

export const isEnvBrowser = () => typeof window.invokeNative !== 'function' && !window.location.href.includes('cfx-nui-')

export function openUrl(url) {
  if (!url) return
  if (typeof window.invokeNative === 'function') window.invokeNative('openUrl', url)
  else window.open(url, '_blank')
}
