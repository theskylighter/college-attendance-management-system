import axios from 'axios'

// VITE_API_URL is baked in at build time on Render.
// Accepts either a full URL (https://api.example.com/api) or a bare
// hostname from Render's fromService wiring (my-api.onrender.com),
// in which case https:// + /api are added automatically.
function resolveBaseURL() {
  const raw = (import.meta.env.VITE_API_URL || '').trim()
  if (!raw) return 'http://localhost:3000/api'
  if (/^https?:\/\//i.test(raw)) return raw
  return `https://${raw}/api`
}

const api = axios.create({
  baseURL: resolveBaseURL(),
  withCredentials: true
})

export default api