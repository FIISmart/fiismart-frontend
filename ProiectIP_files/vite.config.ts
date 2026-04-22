import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  server: {
    proxy: {
      // Orice cerere care începe cu /api va fi trimisă la backend-ul Java
      '/api': {
        target: 'http://localhost:8081',
        changeOrigin: true,
        secure: false,
      }
    }
  }
})