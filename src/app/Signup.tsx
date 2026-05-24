import { type FormEvent, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Logo } from '@/ui/Logo'
import { useAuthStore } from '@/store/auth.store'

export function Signup() {
  const navigate = useNavigate()
  const signup = useAuthStore((s) => s.signup)
  const loading = useAuthStore((s) => s.loading)
  const error = useAuthStore((s) => s.error)
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [email, setEmail] = useState('')

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
    <div className="page-shell flex min-h-[100dvh] items-center justify-center p-6">
      <div className="surface-card w-full max-w-[400px] p-10">
        <Logo size="md" to="/" className="mb-6 [&_span]:text-[var(--text-primary)]" showText />
        <h1 className="font-display text-[32px] leading-tight">Claim your wall</h1>
        <p className="mt-2 text-[var(--text-secondary)]">Free forever. Your wall, your data.</p>

        <form onSubmit={onSubmit} className="mt-8 space-y-4">
          <div>
            <label className="text-xs font-semibold uppercase tracking-wide text-[var(--text-tertiary)]">
              Username
            </label>
            <div className="mt-1 flex overflow-hidden rounded-[var(--r-md)] border border-[var(--bg-muted)]">
              <span className="flex items-center bg-[var(--bg-subtle)] px-3 text-xs text-[var(--text-tertiary)]">
                wall.app/u/
              </span>
              <input
                required
                minLength={3}
                maxLength={24}
                pattern="[a-z0-9-]+"
                value={username}
                onChange={(e) => setUsername(e.target.value.toLowerCase())}
                className="h-11 flex-1 px-3 text-sm outline-none focus:ring-2 focus:ring-[var(--accent)]/30"
              />
            </div>
          </div>
          <div>
            <label className="text-xs font-semibold uppercase tracking-wide text-[var(--text-tertiary)]">
              Password
            </label>
            <input
              type="password"
              required
              minLength={10}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 h-11 w-full rounded-[var(--r-md)] border border-[var(--bg-muted)] px-3 text-sm outline-none focus:ring-2 focus:ring-[var(--accent)]/30"
            />
          </div>
          <div>
            <label className="text-xs font-semibold uppercase tracking-wide text-[var(--text-tertiary)]">
              Email (optional)
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 h-11 w-full rounded-[var(--r-md)] border border-[var(--bg-muted)] px-3 text-sm outline-none focus:ring-2 focus:ring-[var(--accent)]/30"
            />
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <button type="submit" disabled={loading} className="btn-primary h-11 w-full">
            {loading ? 'Creating…' : 'Create my wall'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-[var(--text-secondary)]">
          Already have one?{' '}
          <Link to="/login" className="text-[var(--accent-text)] hover:underline">
            Log in
          </Link>
        </p>
      </div>
    </div>
  )
}
