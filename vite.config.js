import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import Pages from "vite-plugin-pages"
import { resolve, join } from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  envPrefix: 'VUE_APP_',
  resolve: {
    alias: {
      '@': resolve(join(__dirname, 'src'))
    }
  },
  plugins: [
    vue(),
    Pages(),
  ]
})
