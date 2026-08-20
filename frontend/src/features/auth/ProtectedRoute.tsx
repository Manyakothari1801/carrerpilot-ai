import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from './AuthContext'
import type { Role } from './types'

export function ProtectedRoute({ role }: { role?: Role }) {
  const { user, ready } = useAuth()
  if (!ready) return <div className="grid min-h-screen place-items-center bg-slate-950 text-cyan-300">Loading your workspace…</div>
  if (!user) return <Navigate to="/login" replace />
  if (role && user.role !== role) return <Navigate to={user.role === 'ADMIN' ? '/admin' : '/student/dashboard'} replace />
  return <Outlet />
}
