import { defineConfig, loadEnv, searchForWorkspaceRoot } from 'vite'
import vue from '@vitejs/plugin-vue'
import Pages from "vite-plugin-pages"
import { resolve, join, sep } from 'path'

const cwd = process.cwd()

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  loadEnv(mode, process.cwd(), '')

  return {
    envPrefix: 'VUE_APP_',

    build: {
      sourcemap: true,
    },

    plugins: [
      vue(),
      Pages({ extensions: ['vue'] }),
    ],

    resolve: {
      alias: [
        { find: '@gouvfr/dsfr', replacement: resolve(join(__dirname, 'node_modules', '@gouvfr', 'dsfr', 'dist')) },
        { find: '@/', replacement: resolve(join(__dirname, 'src')) + sep },
        { find: 'styles', replacement: resolve(join(__dirname, 'src', 'styles')) }
      ],
    },

    server: {
      host: '127.0.0.1',
      port: 3000,
      fs: {
        allow:[
            searchForWorkspaceRoot(cwd),
            resolve(cwd, '@gouvfr/dsfr'),
        ]
      }
    },

    test: {
      environment: 'jsdom',
      setupFiles: [
        './tests-setup.js'
      ]
    }
  }
})
