import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    // enable host mode (listen on all interfaces) so the app is reachable from other devices on your LAN
    host: true,
    // optional: set a fixed port or HMR host if needed
    // port: 5173,
    // hmr: { host: '192.168.x.x' },
  },
})
