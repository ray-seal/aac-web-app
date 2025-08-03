// vite.config.ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'Speakly',
        short_name: 'Speakly',
        description: '',
        theme_color: '#ffffff',
        background_color: '#ffffff',
        display: 'standalone',
        start_url: '/',
        icons: [
          {
            "src": "/aac-96x96.png",
            "sizes": "96x96",
            "type": "image/png"
          },
          {
            "src": "/aac-192x192.png",
            "sizes": "192x192",
            "type": "image/png"
          },
          {
            "src": "/aac-512x512.png",
            "sizes": "512x512",
            "type": "image/png"
          }
        ]
      }
    })
  ],
  base: '/',
  build: {
    outDir: 'dist'
  }
})
