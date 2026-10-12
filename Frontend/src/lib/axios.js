import axios from 'axios'

// Single-origin deployment: the API lives under /api on the same host,
// so a relative baseURL works in production with zero configuration.
// Local dev uses the Vite proxy (vite.config.js) to forward /api to the
// backend. VITE_API_URL remains as an explicit override when needed
// (e.g. pointing a dev build at a staging API).
function resolveBaseURL() {
  const raw = (import.meta.env.VITE_API_URL || '').trim()
  if (!raw) return '/api'
  if (/^https?:\/\//i.test(raw)) return raw
  return `https://${raw}/api`
}

const api = axios.create({
  baseURL: resolveBaseURL(),
  withCredentials: true
})

export default api