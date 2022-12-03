import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import Pages from "vite-plugin-pages"
import { resolve, join, sep } from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  envPrefix: 'VUE_APP_',

  plugins: [
    vue(),
    Pages({ extensions: ['vue'] }),
  ],

  resolve: {
    alias: {
      '@gouvfr/dsfr': resolve(join(__dirname, 'node_modules', '@gouvfr', 'dsfr', 'dist')),
      '@/': resolve(join(__dirname, 'src')) + sep,
      'styles': resolve(join(__dirname, 'src', 'styles'))
    },
  },

  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '')
      }
    }
  }
})
