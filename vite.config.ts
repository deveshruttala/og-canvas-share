import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import { wallProxyPlugin } from './vite-proxy-plugin'
import { wallImageSearchProxyPlugin } from './vite-image-search-proxy'
import { wallAudioSearchProxyPlugin } from './vite-audio-search-proxy'

export default defineConfig({
  plugins: [react(), wallProxyPlugin(), wallImageSearchProxyPlugin(), wallAudioSearchProxyPlugin()],
  base: process.env.VITE_BASE || '/',
  server: {
    proxy: {
      '/openverse-api': {
        target: 'https://api.openverse.org',
        changeOrigin: true,
        followRedirects: true,
        rewrite: (path) => path.replace(/^\/openverse-api/, ''),
      },
      '/microlink-api': {
        target: 'https://api.microlink.io',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/microlink-api/, ''),
      },
    },
  },
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
