import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import Pages from "vite-plugin-pages"
import { resolve, join, sep } from 'path'
import { sentryVitePlugin } from "@sentry/vite-plugin"

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')

  return {
    envPrefix: 'VUE_APP_',

    build: {
      sourcemap: true,
    },

    plugins: [
      vue(),
      Pages({ extensions: ['vue'] }),
      // @see https://github.com/getsentry/sentry-javascript-bundler-plugins/tree/main/packages/vite-plugin#configuration
      env.SENTRY_AUTH_TOKEN && sentryVitePlugin({
        url: 'https://sentry.incubateur.net/',
        org: "betagouv",
        project: "cartobio-front",
        include: "./dist",
        // Auth tokens can be obtained from https://sentry.incubateur.net/settings/account/api/auth-tokens/
        // and needs the `project:releases` and `org:read` scopes
        authToken: env.SENTRY_AUTH_TOKEN,
      })
    ],

    resolve: {
      alias: {
        '@gouvfr/dsfr': resolve(join(__dirname, 'node_modules', '@gouvfr', 'dsfr', 'dist')),
        '@/': resolve(join(__dirname, 'src')) + sep,
        'styles': resolve(join(__dirname, 'src', 'styles'))
      },
    },

    server: {
      port: 3000
    }
  }
})
