import { useState, type FormEvent, type ReactNode } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import axios from 'axios'
import { useAuth } from '../features/auth/AuthContext'

export function AuthPage({ mode }: { mode: 'login' | 'register' }) {
  const { user, login, register } = useAuth(); const navigate = useNavigate()
  const [form, setForm] = useState({ fullName: '', email: '', password: '', confirmPassword: '' }); const [error, setError] = useState(''); const [busy, setBusy] = useState(false)
  if (user) return <Navigate to={user.role === 'ADMIN' ? '/admin' : '/student/dashboard'} replace />
  const submit = async (event: FormEvent) => { event.preventDefault(); setError(''); setBusy(true); try { if (mode === 'login') await login(form.email, form.password); else await register(form.fullName, form.email, form.password, form.confirmPassword); navigate('/student/dashboard') } catch (err) { setError(axios.isAxiosError(err) ? err.response?.data?.message ?? 'Unable to continue' : 'Unable to continue') } finally { setBusy(false) } }
  return <AuthShell title={mode === 'login' ? 'Welcome back' : 'Start building your career'} subtitle={mode === 'login' ? 'Sign in to your career workspace.' : 'Create your secure student account.'}>
    <form onSubmit={submit} className="space-y-4">
      {mode === 'register' && <Field label="Full name" value={form.fullName} onChange={value => setForm({ ...form, fullName: value })} autoComplete="name" />}
      <Field label="Email" type="email" value={form.email} onChange={value => setForm({ ...form, email: value })} autoComplete="email" />
      <Field label="Password" type="password" value={form.password} onChange={value => setForm({ ...form, password: value })} autoComplete={mode === 'login' ? 'current-password' : 'new-password'} />
      {mode === 'register' && <Field label="Confirm password" type="password" value={form.confirmPassword} onChange={value => setForm({ ...form, confirmPassword: value })} autoComplete="new-password" />}
      {error && <p role="alert" className="error-message">{error}</p>}
      <button className="primary-button w-full" disabled={busy}>{busy ? 'Please wait…' : mode === 'login' ? 'Sign in' : 'Create account'}</button>
    </form>
    <div className="mt-6 flex justify-between text-sm text-slate-400"><Link to={mode === 'login' ? '/register' : '/login'}>{mode === 'login' ? 'Create account' : 'Already registered?'}</Link>{mode === 'login' && <Link to="/forgot-password">Forgot password?</Link>}</div>
  </AuthShell>
}

export function AuthShell({ title, subtitle, children }: { title: string; subtitle: string; children: ReactNode }) { return <main className="grid min-h-screen bg-slate-950 text-white lg:grid-cols-2"><section className="hidden bg-cyan-400/5 p-16 lg:flex lg:flex-col lg:justify-between"><Logo /><div><p className="eyebrow">Career intelligence, made personal</p><h2 className="mt-5 max-w-xl text-5xl font-semibold leading-tight">Turn your potential into a practical career plan.</h2></div><p className="text-sm text-slate-500">Secure by design · Student focused</p></section><section className="grid place-items-center p-6"><div className="w-full max-w-md"><div className="mb-8 lg:hidden"><Logo /></div><h1 className="text-3xl font-semibold">{title}</h1><p className="mt-2 text-slate-400">{subtitle}</p><div className="mt-8">{children}</div></div></section></main> }
export function Logo() { return <div className="text-xl font-semibold">CareerPilot <span className="text-cyan-400">AI</span></div> }
function Field({ label, type = 'text', value, onChange, autoComplete }: { label: string; type?: string; value: string; onChange: (value: string) => void; autoComplete?: string }) { return <label className="block text-sm text-slate-300">{label}<input required type={type} value={value} onChange={event => onChange(event.target.value)} autoComplete={autoComplete} className="input mt-2" /></label> }
