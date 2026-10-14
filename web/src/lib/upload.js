import { fetchNui } from './nui'

/** First base that answers the ping within 1s; localhost comes first in the list. */
async function pickBase(urls) {
  for (const base of urls) {
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), 1000)
    try {
      const res = await fetch(`${base}/ping`, { mode: 'cors', signal: controller.signal })
      if (res.ok) return base
    } catch {
      // next base
    } finally {
      clearTimeout(timer)
    }
  }
  return null
}

/**
 * Sends a file to config/<kind>/ on the server, in parts; resolves to the saved file name.
 * `onProgress` gets 0..1.
 */
export async function uploadFile(file, kind, onProgress) {
  const start = await fetchNui('uploadStart', { kind, name: file.name, size: file.size })
  if (!start?.ok) throw new Error(start?.error || 'o servidor recusou o envio')

  const base = await pickBase(start.urls || [])
  if (!base) throw new Error('o servidor não respondeu pelo HTTP (porta ou web_baseUrl)')

  const total = Math.max(1, Math.ceil(file.size / start.partBytes))
  let last = null
  for (let part = 1; part <= total; part++) {
    const body = file.slice((part - 1) * start.partBytes, part * start.partBytes)
    const res = await fetch(`${base}/upload/${start.token}/${part}/${total}`, { method: 'POST', mode: 'cors', body })
    last = await res.json().catch(() => null)
    if (!res.ok || !last?.ok) throw new Error(last?.error || `falha no envio (${res.status})`)
    onProgress?.(part / total)
  }
  return last.name || start.name
}
