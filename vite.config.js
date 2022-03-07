import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import Pages from "vite-plugin-pages";

// https://vitejs.dev/config/
export default defineConfig({
  envPrefix: 'VUE_APP_',
  plugins: [
    vue(),
    Pages(),
  ]
})
