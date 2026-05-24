import { Link } from 'react-router-dom'
import { Logo } from '@/ui/Logo'
import { useAuthStore } from '@/store/auth.store'

type SiteHeaderProps = {
  marketing?: boolean
}

export function SiteHeader({ marketing = true }: SiteHeaderProps) {
  const user = useAuthStore((s) => s.user)

  return (
    <header className="site-header">
      <div className="site-header-inner">
        <Logo size="md" to="/" className="site-logo" />

        {marketing && (
          <nav className="site-nav hidden items-center gap-8 md:flex" aria-label="Main">
            <a href="#features" className="site-nav-link">
              Features
            </a>
            <a href="#canvas" className="site-nav-link">
              Live canvas
            </a>
            <a href="#templates" className="site-nav-link">
              Templates
            </a>
            <Link to="/widgets" className="site-nav-link">
              Widgets
            </Link>
          </nav>
        )}

        <div className="site-header-actions">
          {user ? (
            <Link to="/edit" className="btn-neon text-sm">
              Open editor
            </Link>
          ) : (
            <>
              <Link to="/login" className="site-nav-link hidden sm:inline">
                Log in
              </Link>
              <Link to="/signup" className="btn-neon text-sm">
                Get started free
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  )
}
