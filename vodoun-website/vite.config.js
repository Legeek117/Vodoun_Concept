import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': 'http://localhost:3001',
      '/uploads': 'http://localhost:3001',
    },
  },
  build: {
    target: 'es2020',
    rollupOptions: {
      output: {
        // Découpage acyclique : « three » pur isolé, tout le reste (React,
        // @react-three/fiber, gsap…) dans « vendor ». Un découpage qui sépare
        // React de @react-three/fiber crée un cycle vendor ↔ three qui casse
        // l'évaluation des modules sous Rollup (Vite 4).
        manualChunks(id) {
          if (id.includes('node_modules/three')) {
            return 'three'
          }
          if (id.includes('node_modules')) {
            return 'vendor'
          }
        },
      },
    },
    chunkSizeWarningLimit: 1000,
  },
})
