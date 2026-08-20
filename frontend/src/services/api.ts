import axios from 'axios'
import { tokenStore } from '../features/auth/tokenStore'

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8080/api/v1',
  headers: { 'Content-Type': 'application/json' },
  timeout: 15_000,
})

api.interceptors.request.use((config) => {
  const token = tokenStore.get()?.accessToken
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

let refreshing: Promise<string> | null = null
api.interceptors.response.use((response) => response, async (error) => {
  const original = error.config
  if (error.response?.status !== 401 || original?._retry || original?.url?.includes('/auth/refresh')) return Promise.reject(error)
  const session = tokenStore.get()
  if (!session) return Promise.reject(error)
  original._retry = true
  refreshing ??= axios.post(`${api.defaults.baseURL}/auth/refresh`, { refreshToken: session.refreshToken })
    .then(({ data }) => { tokenStore.set(data); return data.accessToken })
    .finally(() => { refreshing = null })
  try { original.headers.Authorization = `Bearer ${await refreshing}`; return api(original) }
  catch (refreshError) { tokenStore.clear(); window.dispatchEvent(new Event('careerpilot:session-expired')); return Promise.reject(refreshError) }
})
