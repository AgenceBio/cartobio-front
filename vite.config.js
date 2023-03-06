import { defineConfig, loadEnv, searchForWorkspaceRoot } from 'vite'
import vue from '@vitejs/plugin-vue'
import Pages from "vite-plugin-pages"
import { resolve, join, sep } from 'path'
import { sentryVitePlugin } from "@sentry/vite-plugin"

const cwd = process.cwd()

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
    }
  }
})
