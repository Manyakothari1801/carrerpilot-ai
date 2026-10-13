import axios from 'axios'

type ApiErrorBody = { message?: string }

export function authErrorMessage(error: unknown, mode: 'login' | 'register'): string {
  if (!axios.isAxiosError<ApiErrorBody>(error)) return 'Something unexpected happened. Please try again.'
  if (error.code === 'ECONNABORTED') return 'The server took too long to respond. Please try again.'
  if (!error.response) return 'Cannot reach the server. Check your connection and try again.'
  if (mode === 'login' && error.response.status === 401) return 'Email or password is incorrect.'
  if (error.response.status === 429) return 'Too many attempts. Please wait before trying again.'
  if (error.response.status >= 500) return 'The server is temporarily unavailable. Please try again shortly.'
  return error.response.data?.message ?? 'Unable to continue.'
}

export function requestErrorMessage(error: unknown, fallback: string): string {
  if (!axios.isAxiosError<ApiErrorBody>(error)) return fallback
  if (error.code === 'ECONNABORTED') return 'The request timed out. Your saved data was not removed; please try again.'
  if (!error.response) return 'Cannot reach the server. Check your connection and try again.'
  if (error.response.status >= 500) return 'The server is temporarily unavailable. Please try again shortly.'
  return error.response.data?.message ?? fallback
}
