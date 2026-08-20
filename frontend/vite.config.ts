import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [react(), tailwindcss(), VitePWA({
    registerType: 'autoUpdate',
    includeAssets: ['icon.svg'],
    manifest: {
      name: 'CareerPilot AI', short_name: 'CareerPilot', description: 'Career intelligence for students',
      theme_color: '#020617', background_color: '#020617', display: 'standalone', start_url: '/',
      icons: [{ src: '/icon.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'any maskable' }],
    },
    workbox: {
      navigateFallback: '/index.html',
      runtimeCaching: [{ urlPattern: /\/api\//, handler: 'NetworkOnly', method: 'GET' }],
    },
  })],
  server: { port: 5173 },
})
