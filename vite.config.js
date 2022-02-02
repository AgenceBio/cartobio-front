import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import Pages from "vite-plugin-pages";

// https://vitejs.dev/config/
export default defineConfig({
  envPrefix: 'VUE_APP_',
  plugins: [
    vue(),
    Pages({
      extendRoute (route, parent) {
        if (route.path.startsWith('/operateur') && route.path !== '/operateur/login') {
          return { ...route, meta: { requiresAuth: true } }
        }

        return route
      }
    }),
  ]
})
