/**
 * Application entry — mounts React root, global styles, router, and toast host.
 */
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Toaster } from 'react-hot-toast'
import { AppRoutes } from '@/app/routes'
import '@/styles/tokens.css'
import '@/styles.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AppRoutes />
    <Toaster
      position="bottom-center"
      containerClassName="!bottom-24 sm:!bottom-8"
      toastOptions={{
        className: 'text-sm !bg-neutral-800 !text-white !border !border-white/10',
      }}
    />
  </StrictMode>,
)
