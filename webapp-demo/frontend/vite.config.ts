import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    // No host override — defaults to localhost. Pass --host <ip> on the
    // CLI (e.g. via deploy.sh) to expose the dev server on a specific
    // interface such as a Tailscale IP.
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      },
    },
  },
})
