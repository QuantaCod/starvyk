import { useState } from 'react'
import { Lock, Mail, BarChart2, Eye, EyeOff, ArrowRight, RotateCcw } from 'lucide-react'
import toast from 'react-hot-toast'
import styles from './AdminLogin.module.css'

export default function AdminLogin({ onLogin, onResetPassword }) {
  const [mode, setMode]       = useState('login') // 'login' | 'reset'
  const [email, setEmail]     = useState('')
  const [password, setPassword] = useState('')
  const [showPw, setShowPw]   = useState(false)
  const [loading, setLoading] = useState(false)
  const [shake, setShake]     = useState(false)
  const [resetSent, setResetSent] = useState(false)

  const triggerShake = () => {
    setShake(true)
    setTimeout(() => setShake(false), 600)
  }

  const handleLogin = async (e) => {
    e.preventDefault()
    setLoading(true)
    const result = await onLogin(email, password)
    setLoading(false)
    if (!result.success) {
      toast.error(result.error || 'Invalid credentials')
      triggerShake()
      setPassword('')
    }
  }

  const handleReset = async (e) => {
    e.preventDefault()
    if (!email) { toast.error('Enter your email first'); return }
    setLoading(true)
    const result = await onResetPassword(email)
    setLoading(false)
    if (result.success) {
      setResetSent(true)
      toast.success('Reset link sent — check your inbox')
    } else {
      toast.error(result.error || 'Failed to send reset email')
    }
  }

  return (
    <div className={styles.page}>
      <div className={`${styles.card} ${shake ? styles.shake : ''}`}>

        <div className={styles.logo}>
          <BarChart2 size={22} />
        </div>

        <div className={styles.header}>
          <h1 className={styles.title}>
            {mode === 'login' ? 'Admin Sign In' : 'Reset Password'}
          </h1>
          <p className={styles.sub}>DataViz Platform — restricted area</p>
        </div>

        {mode === 'login' ? (
          <form onSubmit={handleLogin} className={styles.form}>
            <div className={styles.field}>
              <label className={styles.label}><Mail size={11} /> Email</label>
              <input
                className={styles.input}
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="admin@example.com"
                required
                autoFocus
                autoComplete="email"
              />
            </div>

            <div className={styles.field}>
              <div className={styles.labelRow}>
                <label className={styles.label}><Lock size={11} /> Password</label>
                <button type="button" className={styles.forgotBtn} onClick={() => setMode('reset')}>
                  Forgot password?
                </button>
              </div>
              <div className={styles.inputWrap}>
                <input
                  className={styles.input}
                  type={showPw ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Your password"
                  required
                  autoComplete="current-password"
                />
                <button type="button" className={styles.eyeBtn} onClick={() => setShowPw(v => !v)}>
                  {showPw ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
            </div>

            <button type="submit" className={styles.submitBtn} disabled={loading || !email || !password}>
              {loading
                ? <span className={styles.btnSpinner} />
                : <><span>Sign In</span><ArrowRight size={14} /></>}
            </button>
          </form>
        ) : (
          <form onSubmit={handleReset} className={styles.form}>
            {resetSent ? (
              <div className={styles.resetSuccess}>
                <p>Check your inbox at <strong>{email}</strong> for a password reset link.</p>
              </div>
            ) : (
              <div className={styles.field}>
                <label className={styles.label}><Mail size={11} /> Your admin email</label>
                <input
                  className={styles.input}
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="admin@example.com"
                  required
                  autoFocus
                />
              </div>
            )}

            {!resetSent && (
              <button type="submit" className={styles.submitBtn} disabled={loading || !email}>
                {loading ? <span className={styles.btnSpinner} /> : 'Send Reset Link'}
              </button>
            )}

            <button type="button" className={styles.backToLogin} onClick={() => { setMode('login'); setResetSent(false) }}>
              <RotateCcw size={12} /> Back to sign in
            </button>
          </form>
        )}

        <p className={styles.hint}>
          Create your admin user in <code>Supabase → Authentication → Users</code>
        </p>
      </div>
    </div>
  )
}
