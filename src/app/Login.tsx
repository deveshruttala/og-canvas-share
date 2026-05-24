import { type FormEvent, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Logo } from '@/ui/Logo'
import { useAuthStore } from '@/store/auth.store'

export function Login() {
  const navigate = useNavigate()
  const login = useAuthStore((s) => s.login)
  const loading = useAuthStore((s) => s.loading)
  const error = useAuthStore((s) => s.error)
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault()
    try {
      await login(username, password)
      navigate('/edit')
    } catch {
      /* error in store */
    }
  }

  return (
    <div className="page-shell flex min-h-[100dvh] items-center justify-center p-6">
      <div className="surface-card w-full max-w-[400px] p-10">
        <Logo size="md" to="/" className="mb-6 [&_span]:text-[var(--text-primary)]" showText />
        <h1 className="font-display text-[32px] leading-tight">Open my wall</h1>
        <p className="mt-2 text-[var(--text-secondary)]">Welcome back.</p>

        <form onSubmit={onSubmit} className="mt-8 space-y-4">
          <div>
            <label className="text-xs font-semibold uppercase tracking-wide text-[var(--text-tertiary)]">
              Username
            </label>
            <input
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="mt-1 h-11 w-full rounded-[var(--r-md)] border border-[var(--bg-muted)] px-3 text-sm outline-none focus:ring-2 focus:ring-[var(--accent)]/30"
            />
          </div>
          <div>
            <label className="text-xs font-semibold uppercase tracking-wide text-[var(--text-tertiary)]">
              Password
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 h-11 w-full rounded-[var(--r-md)] border border-[var(--bg-muted)] px-3 text-sm outline-none focus:ring-2 focus:ring-[var(--accent)]/30"
            />
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <button type="submit" disabled={loading} className="btn-primary h-11 w-full">
            {loading ? 'Opening…' : 'Open my wall'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-[var(--text-secondary)]">
          New here?{' '}
          <Link to="/signup" className="text-[var(--accent-text)] hover:underline">
            Claim your wall
          </Link>
        </p>
      </div>
    </div>
  )
}
