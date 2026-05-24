import { Link } from 'react-router-dom'
import { Logo } from '@/ui/Logo'

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="site-footer-inner">
        <div className="site-footer-brand">
          <Logo size="sm" to="/" showText />
          <p className="site-footer-tagline">
            A living personal noticeboard for the open web. Local-first canvas, shareable everywhere.
          </p>
        </div>

        <div className="site-footer-columns">
          <div>
            <h3>Product</h3>
            <ul>
              <li>
                <Link to="/signup">Get started</Link>
              </li>
              <li>
                <Link to="/widgets">Widget library</Link>
              </li>
              <li>
                <Link to="/docs/protocol">Wall Live protocol</Link>
              </li>
            </ul>
          </div>
          <div>
            <h3>Resources</h3>
            <ul>
              <li>
                <a href="#canvas">Live canvas demo</a>
              </li>
              <li>
                <a href="#templates">Example walls</a>
              </li>
              <li>
                <a href="https://github.com" target="_blank" rel="noreferrer">
                  GitHub
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h3>Account</h3>
            <ul>
              <li>
                <Link to="/login">Log in</Link>
              </li>
              <li>
                <Link to="/signup">Sign up free</Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="site-footer-bottom">
          <p>© {new Date().getFullYear()} Wall. Built for creators who want one link that stays alive.</p>
        </div>
      </div>
    </footer>
  )
}
