import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  //  base: '/exitramp/',
   plugins: [react()],
   server: {
    host: '0.0.0.0',
    allowedHosts: ['exitramp.co', 'test.exitramp.co'],
    port: 5173
  },
})
