import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vite.dev/config/
// O base do GitHub Pages é definido no build: `vite build --base=/piano-app/`
export default defineConfig({
  base: '/',
  plugins: [vue()],
  server: {
    port: 5173,
    open: true,
  },
})
