/** Route-level code splitting — keeps landing/auth routes free of editor bundle. */
import { lazy, Suspense, type ReactNode } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Landing } from '@/app/Landing'
import { RequireAuth } from '@/app/RequireAuth'
import { PageLoader } from '@/ui/PageLoader'

const Editor = lazy(() => import('@/app/Editor').then((m) => ({ default: m.Editor })))
const PublicViewer = lazy(() => import('@/app/PublicViewer').then((m) => ({ default: m.PublicViewer })))
const EmbedView = lazy(() => import('@/app/EmbedView').then((m) => ({ default: m.EmbedView })))
const Login = lazy(() => import('@/app/Login').then((m) => ({ default: m.Login })))
const Signup = lazy(() => import('@/app/Signup').then((m) => ({ default: m.Signup })))
const WidgetDirectoryPage = lazy(() =>
  import('@/app/WidgetDirectoryPage').then((m) => ({ default: m.WidgetDirectoryPage })),
)
const WidgetPublicPage = lazy(() =>
  import('@/app/WidgetPublicPage').then((m) => ({ default: m.WidgetPublicPage })),
)
const WidgetEmbedPage = lazy(() =>
  import('@/app/WidgetEmbedPage').then((m) => ({ default: m.WidgetEmbedPage })),
)
const WidgetEditPage = lazy(() => import('@/app/WidgetEditPage').then((m) => ({ default: m.WidgetEditPage })))
const ProtocolDocsPage = lazy(() =>
  import('@/app/ProtocolDocsPage').then((m) => ({ default: m.ProtocolDocsPage })),
)
const SpotifyCallback = lazy(() =>
  import('@/app/SpotifyCallback').then((m) => ({ default: m.default })),
)

function Lazy({ children }: { children: ReactNode }) {
  return <Suspense fallback={<PageLoader />}>{children}</Suspense>
}

export function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/edit" element={<Lazy><RequireAuth><Editor /></RequireAuth></Lazy>} />
        <Route path="/u/:username" element={<Lazy><PublicViewer /></Lazy>} />
        <Route path="/signup" element={<Lazy><Signup /></Lazy>} />
        <Route path="/login" element={<Lazy><Login /></Lazy>} />
        <Route path="/embed/:username" element={<Lazy><EmbedView /></Lazy>} />
        <Route path="/widgets" element={<Lazy><WidgetDirectoryPage /></Lazy>} />
        <Route path="/w/:widgetId" element={<Lazy><WidgetPublicPage /></Lazy>} />
        <Route path="/w/:widgetId/embed" element={<Lazy><WidgetEmbedPage /></Lazy>} />
        <Route path="/w/:widgetId/edit" element={<Lazy><WidgetEditPage /></Lazy>} />
        <Route path="/docs/protocol" element={<Lazy><ProtocolDocsPage /></Lazy>} />
        <Route path="/oauth/spotify/callback" element={<Lazy><SpotifyCallback /></Lazy>} />
      </Routes>
    </BrowserRouter>
  )
}
