import { type FormEvent, useEffect, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Logo } from '@/ui/Logo'
import { useAuthStore } from '@/store/auth.store'
import '@/styles/landing.css'

export function Login() {
  const navigate = useNavigate()
  const location = useLocation()
  const login = useAuthStore((s) => s.login)
  const fetchMe = useAuthStore((s) => s.fetchMe)
  const loading = useAuthStore((s) => s.loading)
  const error = useAuthStore((s) => s.error)
  const user = useAuthStore((s) => s.user)
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')

  useEffect(() => {
    void fetchMe()
  }, [fetchMe])

  useEffect(() => {
    if (user) {
      const from = (location.state as { from?: string } | null)?.from ?? '/edit'
      navigate(from, { replace: true })
    }
  }, [user, location.state, navigate])

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault()
    try {
      await login(username, password)
      const from = (location.state as { from?: string } | null)?.from ?? '/edit'
      navigate(from, { replace: true })
    } catch {
      /* error in store */
    }
  }

  return (
    <div className="landing-page auth-page">
      <div className="auth-card">
        <Logo size="md" to="/" className="mb-6 site-logo" showText />
        <h1 className="font-display">Open my wall</h1>
        <p className="auth-card-lead">Welcome back.</p>

        <form onSubmit={onSubmit} className="auth-form">
          <div className="auth-field">
            <label htmlFor="login-username">Username</label>
            <input
              id="login-username"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value.toLowerCase())}
              placeholder="yourname"
              autoComplete="username"
              className="auth-input"
            />
          </div>
          <div className="auth-field">
            <label htmlFor="login-password">Password</label>
            <input
              id="login-password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Your password"
              autoComplete="current-password"
              className="auth-input"
            />
          </div>
          {error && <p className="auth-error">{error}</p>}
          <button type="submit" disabled={loading} className="btn-neon auth-submit">
            {loading ? 'Opening…' : 'Open my wall'}
          </button>
        </form>

        <p className="auth-footer">
          New here? <Link to="/signup">Claim your wall</Link>
        </p>
      </div>
    </div>
  )
}
