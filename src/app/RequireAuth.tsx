import { useEffect, useState, type ReactNode } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuthStore } from '@/store/auth.store'
import { PageLoader } from '@/ui/PageLoader'

export function RequireAuth({ children }: { children: ReactNode }) {
  const user = useAuthStore((s) => s.user)
  const fetchMe = useAuthStore((s) => s.fetchMe)
  const [ready, setReady] = useState(false)
  const location = useLocation()

  useEffect(() => {
    void fetchMe().finally(() => setReady(true))
  }, [fetchMe])

  if (!ready) return <PageLoader />
  if (!user) return <Navigate to="/login" replace state={{ from: location.pathname }} />
  return children
}
