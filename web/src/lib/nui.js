import { isEnvBrowser } from './assets'

// Fixed name: inside the mri_Qadmin iframe there is no GetParentResourceName.
const RESOURCE = 'mri_Qloadscreen'

export async function fetchNui(eventName, data) {
  if (isEnvBrowser()) return undefined
  const resp = await fetch(`https://${RESOURCE}/${eventName}`, {
    method: 'post',
    headers: { 'Content-Type': 'application/json; charset=UTF-8' },
    body: JSON.stringify(data ?? {}),
  })
  return resp.json()
}
