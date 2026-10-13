import axios from 'axios'
import { tokenStore } from '../features/auth/tokenStore'

const configuredBaseUrl = import.meta.env.VITE_API_BASE_URL?.trim()
if (!configuredBaseUrl) {
  throw new Error('VITE_API_BASE_URL is required. Configure the public backend API URL before starting the web app.')
}

export const api = axios.create({
  baseURL: configuredBaseUrl.replace(/\/+$/, ''),
  headers: { 'Content-Type': 'application/json' },
  timeout: 15_000,
})

api.interceptors.request.use((config) => {
  const token = tokenStore.get()?.accessToken
  if (token) config.headers.Authorization = `Bearer ${token}`
  config.headers['X-Request-Id'] ??= crypto.randomUUID()
  return config
})

let refreshing: Promise<string> | null = null
api.interceptors.response.use((response) => response, async (error) => {
  const original = error.config
  const publicAuthRequest = /\/auth\/(login|register|refresh|forgot-password|reset-password)(?:$|\?)/.test(original?.url ?? '')
  if (error.response?.status !== 401 || original?._retry || publicAuthRequest) return Promise.reject(error)
  const session = tokenStore.get()
  if (!session) return Promise.reject(error)
  original._retry = true
  refreshing ??= axios.post(`${api.defaults.baseURL}/auth/refresh`, { refreshToken: session.refreshToken }, { timeout: 15_000, headers: { 'X-Request-Id': crypto.randomUUID() } })
    .then(({ data }) => { tokenStore.set(data); return data.accessToken })
    .finally(() => { refreshing = null })
  try { original.headers.Authorization = `Bearer ${await refreshing}`; return api(original) }
  catch (refreshError) { tokenStore.clear(); window.dispatchEvent(new Event('careerpilot:session-expired')); return Promise.reject(refreshError) }
})
