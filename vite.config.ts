import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  base: process.env.VITE_BASE || '/',
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules/tldraw') || id.includes('node_modules/@tldraw')) {
            return 'tldraw'
          }
          if (id.includes('node_modules/framer-motion')) {
            return 'motion'
          }
          if (id.includes('node_modules/lucide-react')) {
            return 'lucide'
          }
          if (id.includes('node_modules/qrcode')) {
            return 'qrcode'
          }
        },
      },
    },
  },
})
