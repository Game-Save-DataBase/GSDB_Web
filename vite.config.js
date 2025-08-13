import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  css:{
    preprocessorOptions:{
      scss:{
        quietDeps: true
      }
    }
  },
  build: {
    outDir: 'dist'
  },
  server: {
    port: 3000, 
    hmr: false
  },
  base: './'
})
