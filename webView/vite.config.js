import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
   server: {
    host: '0.0.0.0',
    allowedHosts: ['ec2-3-87-119-123.compute-1.amazonaws.com'],
    port: 5173
  },
})
