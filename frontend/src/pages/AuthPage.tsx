import { useState, type FormEvent, type ReactNode } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { useAuth } from '../features/auth/AuthContext'
import { authErrorMessage } from '../services/apiError'
import { useTheme } from '../components/ThemeProvider'
import { AppIcon } from '../components/AppIcon'
import cosmoImage from '../assets/Cheerful Kawaii Astronaut Mascot.png'

export function AuthPage({ mode }: { mode: 'login' | 'register' }) {
  const { user, login, register } = useAuth(); const navigate = useNavigate()
  const [form, setForm] = useState({ fullName: '', email: '', password: '', confirmPassword: '' }); const [error, setError] = useState(''); const [busy, setBusy] = useState(false)
  if (user) return <Navigate to={user.role === 'ADMIN' ? '/admin' : '/student/dashboard'} replace />
  const submit = async (event: FormEvent) => { event.preventDefault(); if (busy) return; setError(''); setBusy(true); try { if (mode === 'login') await login(form.email, form.password); else await register(form.fullName, form.email, form.password, form.confirmPassword); navigate('/student/dashboard') } catch (err) { setError(authErrorMessage(err,mode)) } finally { setBusy(false) } }
  return <AuthShell title={mode === 'login' ? 'Welcome back' : 'Start building your career'} subtitle={mode === 'login' ? 'Sign in to your career workspace.' : 'Create your secure student account.'}>
    <form onSubmit={submit} className="auth-form">
      {mode === 'register' && <Field label="Full name" value={form.fullName} onChange={value => setForm({ ...form, fullName: value })} autoComplete="name" />}
      <Field label="Email" type="email" value={form.email} onChange={value => setForm({ ...form, email: value })} autoComplete="email" />
      <Field label="Password" type="password" value={form.password} onChange={value => setForm({ ...form, password: value })} autoComplete={mode === 'login' ? 'current-password' : 'new-password'} />
      {mode === 'register' && <Field label="Confirm password" type="password" value={form.confirmPassword} onChange={value => setForm({ ...form, confirmPassword: value })} autoComplete="new-password" />}
      {error && <p role="alert" className="error-message">{error}</p>}
      <button className="auth-submit" disabled={busy}><span>{busy ? 'Please wait…' : mode === 'login' ? 'Sign in' : 'Create account'}</span><span aria-hidden="true">→</span></button>
    </form>
    <div className="auth-form-links"><Link to={mode === 'login' ? '/register' : '/login'}>{mode === 'login' ? 'Create account' : 'Already registered?'}</Link>{mode === 'login' && <Link to="/forgot-password">Forgot password?</Link>}</div>
  </AuthShell>
}

export function AuthShell({ title, subtitle, children }: { title: string; subtitle: string; children: ReactNode }) {
  const { resolvedTheme, setPreference } = useTheme()
  return <main className="auth-shell">
    <div className="auth-space-decor" aria-hidden="true">
      <span className="auth-orbit-line" />
      <span className="auth-planet auth-planet-one"><i /></span>
      <span className="auth-planet auth-planet-two"><i /></span>
      <span className="auth-moon" />
      <span className="auth-cloud auth-cloud-one" />
      <span className="auth-cloud auth-cloud-two" />
      {[1,2,3,4,5,6,7,8].map(value => <span className={`auth-star auth-star-${value}`} key={value}>✦</span>)}
    </div>
    <section className="auth-story">
      <Logo />
      <div className="auth-hero-copy">
        <span className="auth-kicker">✦ AI-powered career intelligence</span>
        <h2>Move from uncertainty to a <em>career plan</em> you can act on.</h2>
        <p>Analyze your strengths, sharpen your resume, and prepare for every opportunity in one trusted workspace.</p>
        <div className="auth-proof"><span>Evidence-led guidance</span><span>Private by design</span><span>Built for students</span></div>
      </div>
      <div className="auth-hero-cosmo" aria-hidden="true">
        <span>Let’s build<br/>your future! ✦</span>
        <img src={cosmoImage} alt="" />
      </div>
      <p className="auth-story-caption">Intelligent Career Guidance and Resume Optimization Platform Using AI</p>
    </section>
    <section className="auth-form-panel">
      <button className="auth-theme" aria-label={`Switch to ${resolvedTheme === 'dark' ? 'light' : 'dark'} mode`} onClick={() => setPreference(resolvedTheme === 'dark' ? 'light' : 'dark')}><AppIcon name={resolvedTheme === 'dark' ? 'sun' : 'moon'} /></button>
      <div className="auth-mobile-brand"><Logo /></div>
      <div className="auth-card-wrap">
        <div className="auth-card-cosmo" aria-hidden="true"><img src={cosmoImage} alt="" /></div>
        <div className="auth-welcome-bubble" aria-hidden="true">{title === 'Welcome back' ? 'Welcome back! ♥' : 'Ready to launch? ✦'}</div>
        <div className="auth-form-card">
          <p className="eyebrow">Student access</p>
          <h1>{title}</h1>
          <p className="auth-form-subtitle">{subtitle}</p>
          <div className="auth-form-content">{children}</div>
        </div>
      </div>
    </section>
  </main>
}
export function Logo({ compact = false }: { compact?: boolean }) { return <div className="brand-logo" aria-label="Career Guidance AI"><span className="brand-mark">CG</span>{!compact && <span className="brand-wordmark">Career Guidance <strong>AI</strong></span>}</div> }
function Field({ label, type = 'text', value, onChange, autoComplete }: { label: string; type?: string; value: string; onChange: (value: string) => void; autoComplete?: string }) {
  const [visible,setVisible]=useState(false)
  const password=type==='password'
  const icon = password ? 'lock' : type === 'email' ? 'mail' : 'person'
  return <label className="auth-field">{label}<span className="auth-input-wrap"><FieldIcon name={icon}/><input required type={password&&visible?'text':type} value={value} onChange={event => onChange(event.target.value)} autoComplete={autoComplete} className={`input auth-input ${password?'has-action':''}`} />{password&&<button type="button" className="password-toggle" aria-label={visible?'Hide password':'Show password'} onClick={()=>setVisible(value=>!value)}>{visible?'Hide':'Show'}</button>}</span></label>
}

function FieldIcon({ name }: { name: 'mail' | 'lock' | 'person' }) {
  return <span className="auth-input-icon" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">{name === 'mail' ? <><rect x="3" y="5" width="18" height="14" rx="3"/><path d="m4 7 8 6 8-6"/></> : name === 'lock' ? <><rect x="4" y="10" width="16" height="11" rx="3"/><path d="M8 10V7a4 4 0 0 1 8 0v3M12 14v3"/></> : <><circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/></>}</svg></span>
}
