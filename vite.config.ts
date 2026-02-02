import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'הפורטל שלי',
        short_name: 'פורטל',
        description: 'מערכת ניהול אישית',
        theme_color: '#2563EB',
        background_color: '#f3f4f6',
        display: 'standalone',
        orientation: 'portrait',
        start_url: '/',
        icons: [
          {
            src: 'https://cdn-icons-png.flaticon.com/512/3135/3135715.png', // Temporary generic icon
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      }
    })
  ],
  build: {
    outDir: 'dist',
  }
})