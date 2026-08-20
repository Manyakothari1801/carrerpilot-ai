import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { api } from '../../services/api'
import { tokenStore } from './tokenStore'
import type { AuthResponse, UserSummary } from './types'

interface AuthValue {
  user: UserSummary | null; ready: boolean
  login(email: string, password: string): Promise<void>
  register(fullName: string, email: string, password: string, confirmPassword: string): Promise<void>
  logout(all?: boolean): Promise<void>
}
const AuthContext = createContext<AuthValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserSummary | null>(tokenStore.get()?.user ?? null)
  const [ready, setReady] = useState(false)
  useEffect(() => {
    const verify = async () => {
      if (!tokenStore.get()) return setReady(true)
      try { setUser((await api.get<UserSummary>('/auth/me')).data) } catch { tokenStore.clear(); setUser(null) } finally { setReady(true) }
    }
    void verify()
    const expired = () => setUser(null); window.addEventListener('careerpilot:session-expired', expired)
    return () => window.removeEventListener('careerpilot:session-expired', expired)
  }, [])
  const accept = (session: AuthResponse) => { tokenStore.set(session); setUser(session.user) }
  const value = useMemo<AuthValue>(() => ({ user, ready,
    login: async (email, password) => accept((await api.post<AuthResponse>('/auth/login', { email, password })).data),
    register: async (fullName, email, password, confirmPassword) => accept((await api.post<AuthResponse>('/auth/register', { fullName, email, password, confirmPassword })).data),
    logout: async (all = false) => { const session=tokenStore.get(); try { if (session) await api.post(all?'/auth/logout-all':'/auth/logout', all?{}:{refreshToken:session.refreshToken}) } finally { tokenStore.clear(); setUser(null) } },
  }), [user, ready])
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() { const value=useContext(AuthContext); if (!value) throw new Error('AuthProvider missing'); return value }
