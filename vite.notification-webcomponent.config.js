import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import Pages from "vite-plugin-pages"
import { resolve, join } from 'path'

// https://vitejs.dev/config/
export default defineConfig(({ command, mode }) => ({
  envPrefix: 'VUE_APP_',

  base: '/notification-webcomponent/',
  root: 'src/notification-webcomponent',
  envDir: __dirname,

  build: {
    outDir: join(__dirname, 'dist', 'notification-webcomponent'),
    ...(mode === 'lib' ? { lib: {
      entry: resolve(__dirname, 'src/notification-webcomponent/main.js'),
      name: 'NotificationCartobio',
      fileName: (format) => `notification-cartobio.${format}.js`,
    } } : {}),
  },

  plugins: [ vue(), Pages() ],

  resolve: {
    alias: [
      { find: '@gouvfr/dsfr', replacement: resolve(join(__dirname, 'node_modules', '@gouvfr', 'dsfr', 'dist')) },
      { find: 'styles', replacement: resolve(join(__dirname, 'src', 'styles')) },
      { find: '/import', replacement: resolve(join(__dirname, 'public', 'import')) }
    ],
  },

  server: {
    fs: {
      allow: [__dirname]
    }
  }
}))
