import { type FormEvent, useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Logo } from '@/ui/Logo'
import { useAuthStore } from '@/store/auth.store'
import '@/styles/landing.css'

export function Signup() {
  const navigate = useNavigate()
  const signup = useAuthStore((s) => s.signup)
  const fetchMe = useAuthStore((s) => s.fetchMe)
  const loading = useAuthStore((s) => s.loading)
  const error = useAuthStore((s) => s.error)
  const user = useAuthStore((s) => s.user)
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [email, setEmail] = useState('')

  useEffect(() => {
    void fetchMe()
  }, [fetchMe])

  useEffect(() => {
    if (user) navigate('/edit', { replace: true })
  }, [user, navigate])

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault()
    try {
      await signup(username, password, email || undefined)
      navigate('/edit')
    } catch {
      /* error in store */
    }
  }

  return (
    <div className="landing-page auth-page">
      <div className="auth-card">
        <Logo size="md" to="/" className="mb-6 site-logo" showText />
        <h1 className="font-display">Claim your wall</h1>
        <p className="auth-card-lead">Free forever. Your wall, your data.</p>

        <form onSubmit={onSubmit} className="auth-form">
          <div className="auth-field">
            <label htmlFor="signup-username">Username</label>
            <div className="auth-input-group">
              <span className="auth-input-prefix">wall.app/u/</span>
              <input
                id="signup-username"
                required
                minLength={3}
                maxLength={24}
                pattern="[a-z0-9-]+"
                value={username}
                onChange={(e) => setUsername(e.target.value.toLowerCase())}
                placeholder="yourname"
                autoComplete="username"
                className="auth-input"
              />
            </div>
          </div>

          <div className="auth-field">
            <label htmlFor="signup-password">Password</label>
            <input
              id="signup-password"
              type="password"
              required
              minLength={10}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="At least 10 characters"
              autoComplete="new-password"
              className="auth-input"
            />
          </div>

          <div className="auth-field">
            <label htmlFor="signup-email">Email (optional)</label>
            <input
              id="signup-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              autoComplete="email"
              className="auth-input"
            />
          </div>

          {error && <p className="auth-error">{error}</p>}

          <button type="submit" disabled={loading} className="btn-neon auth-submit">
            {loading ? 'Creating…' : 'Create my wall'}
          </button>
        </form>

        <p className="auth-footer">
          Already have one? <Link to="/login">Log in</Link>
        </p>
      </div>
    </div>
  )
}

