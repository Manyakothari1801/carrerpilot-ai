import type { AuthResponse } from './types'

const KEY = 'careerpilot.session'
export const tokenStore = {
  get: (): AuthResponse | null => { try { return JSON.parse(sessionStorage.getItem(KEY) ?? 'null') } catch { return null } },
  set: (session: AuthResponse) => sessionStorage.setItem(KEY, JSON.stringify(session)),
  clear: () => sessionStorage.removeItem(KEY),
}
