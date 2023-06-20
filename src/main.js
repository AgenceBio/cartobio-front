import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { createRouter, createWebHistory } from 'vue-router'
import { createHead } from '@unhead/vue'
import * as Sentry from '@sentry/vue'
import routes from '~pages'
import Matomo from 'vue-matomo'

import { useUserStore } from '@/stores/index.js'
import App from './App.vue'
import { version } from "../package.json"

const { VUE_APP_MATOMO_SITE_ID:siteId = '245', VUE_APP_API_ENDPOINT } = import.meta.env
const { VUE_APP_SENTRY_DSN } = import.meta.env

const pinia = createPinia()
const head = createHead()

const router = createRouter({
  routes,
  history: createWebHistory(),
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition
    }
    else if (to.hash) {
      return { el: to.hash, behavior: 'smooth' }
    }
    else {
      return { top: 0, behavior: 'smooth' }
    }
  }
})

const app = createApp(App)
  .use(router)
  .use(head)
  .use(pinia)
  .use(Matomo, {
    router,
    siteId,
    domains: ['cartobio.agencebio.org', 'cartobio-preprod.agencebio.org'],
    enableLinkTracking: true,
    discardHashTag: true,
    enableHeartBeatTimer: 15,
    trackerUrl: 'https://cartobio.agencebio.org/s/',
    trackerScriptUrl: 'https://cartobio.agencebio.org/s/index.js',
  })

const userStore = useUserStore()
userStore.enablePersistance()

router.isReady().then(() => {
  if (import.meta.env.PROD && VUE_APP_SENTRY_DSN) {
    let release = version.replace("v", "")

    if (import.meta.env.VUE_APP_ENVIRONMENT !== 'production') {
      release = `${release}-dev-${import.meta.env.VUE_APP_GIT_COMMIT_SHA}`
    }

    try {
      Sentry.init({
        app,
        dsn: VUE_APP_SENTRY_DSN,
        environment: import.meta.env.VUE_APP_ENVIRONMENT,
        integrations: [
          new Sentry.BrowserTracing({
            routingInstrumentation: Sentry.vueRouterInstrumentation(router),
            tracingOrigins: ['cartobio.agencebio.org', 'cartobio-preprod.agencebio.org', /^.+--cartobio-dev.netlify.app$/],
          }),
        ],
        logErrors: true,
        tracesSampleRate: 0.3,
        release,
      })
    }
    catch (error) {
      console.error("Failed to initialize Sentry client %o", error)
    }
  }

  app.mount('#app')
  window.head = head
})

router.beforeEach(async (to, from) => {
  if (to.path === '/login/agencebio') {
    // forwards the user selected tab to the callback URI
    // this way, we come back to the same tab
    const qs = new URLSearchParams({ ...to.query, returnto: from.redirectedFrom?.fullPath ?? '/certification/exploitations' })
    window.location = `${VUE_APP_API_ENDPOINT}/auth-provider/agencebio/login?${qs.toString()}`
    return false
  }

  if (to.meta.requiredRoles && !to.meta.requiredRoles.includes(userStore.role)) {
    return { path: '/login', query: { mode: 'certification' } }
  }

  if (to.meta.requiresAuth && !userStore.isLogged) {
    return { path: '/login', replace: true }
  }

  if (to.path === '/login' && userStore.isLogged) {
    return { path: '/', replace: true }
  }
})

