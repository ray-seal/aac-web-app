// vite.config.ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Removed VitePWA and all its configuration, since you are now using Workbox CLI for service worker generation.
// If you want to re-enable VitePWA, do NOT use Workbox CLI, and only configure the plugin here.

export default defineConfig({
  plugins: [
    react()
    // VitePWA removed to avoid duplicate/conflicting service worker generation
  ],
  base: '/',
  build: {
    outDir: 'dist'
  }
})
