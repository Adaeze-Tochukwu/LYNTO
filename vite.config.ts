import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'
import fs from 'fs'

// Cloudflare Pages SPA routing: serve 404.html (copy of index.html) for unknown paths
function cloudflarePagesSpa() {
  return {
    name: 'cloudflare-pages-spa',
    closeBundle() {
      fs.copyFileSync('dist/index.html', 'dist/404.html')
    },
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss(), cloudflarePagesSpa()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
