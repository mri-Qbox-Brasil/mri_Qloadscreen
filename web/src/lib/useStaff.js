import { useEffect, useState } from 'react'

// Empty member list: public org members (API) plus the user-stats list (includes private members).
const GITHUB_PUBLIC_MEMBERS_URL = 'https://api.github.com/orgs/mri-Qbox-Brasil/public_members?per_page=100'
const GITHUB_MEMBERS_JSON_URL = 'https://raw.githubusercontent.com/mri-Qbox-Brasil/user-stats/main/public/members.json'

let githubCache = null

function fetchGithubStaff() {
  if (githubCache) return githubCache
  const fetchJson = (url) => fetch(url).then((res) => (res.ok ? res.json() : []))
  githubCache = Promise.allSettled([fetchJson(GITHUB_PUBLIC_MEMBERS_URL), fetchJson(GITHUB_MEMBERS_JSON_URL)]).then((results) => {
    const byLogin = new Map()
    results.forEach((result) => {
      if (result.status !== 'fulfilled' || !Array.isArray(result.value)) return
      result.value.forEach((member) => {
        const key = member?.login?.toLowerCase()
        if (key && !byLogin.has(key)) byLogin.set(key, { image: member.avatar_url, name: member.login })
      })
    })
    return [...byLogin.values()]
  })
  return githubCache
}

export function useStaff(staff) {
  const enabled = Boolean(staff?.enabled)
  // Lua sends an empty table as {} through the handover.
  const members = Array.isArray(staff?.members) ? staff.members.filter((m) => m.name || m.image) : []
  const configured = members.length > 0
  const [github, setGithub] = useState([])

  useEffect(() => {
    if (!enabled || configured) return
    let cancelled = false
    fetchGithubStaff().then((list) => !cancelled && setGithub(list))
    return () => {
      cancelled = true
    }
  }, [enabled, configured])

  if (!enabled) return []
  return configured ? members : github
}
