import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { createRouter, createWebHistory } from 'vue-router'
import { createHead } from '@unhead/vue'
import * as Sentry from '@sentry/vue'
import routes from '~pages'
import Matomo from 'vue-matomo'

import store from './store.js'
import { useUserStore } from '@/stores/index.js'
import { getOperatorParcelles } from './cartobio-api.js'
import App from './App.vue'

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
  if (VUE_APP_SENTRY_DSN) {
    try {
      Sentry.init({
        app,
        dsn: VUE_APP_SENTRY_DSN,
        environment: import.meta.env.MODE,
        integrations: [
          new Sentry.BrowserTracing({
            routingInstrumentation: Sentry.vueRouterInstrumentation(router),
            tracingOrigins: ['localhost', 'cartobio.agencebio.org', 'cartobio-preprod.agencebio.org', /^.+--cartobio-dev.netlify.app$/],
          }),
        ],
        logErrors: true,
        tracesSampleRate: import.meta.env.PROD ? 0.3 : 1.0,
      })
    }
    catch (error) {
      console.error("Failed to initialize Sentry client %o", error)
    }
  }

  app.mount('#app')
  window.head = head
})

router.beforeEach(async (to) => {
  if (to.path === '/login/agencebio') {
    window.location = `${VUE_APP_API_ENDPOINT}/auth-provider/agencebio/login`
    return false
  }

  if (to.meta.requiredRoles && !to.meta.requiredRoles.includes(userStore.role)) {
    return router.push({ path: '/login', query: { returnto: to.path, mode: 'certification' } })
  }

  if (to.meta.requiresAuth && !userStore.isLogged) {
    return router.replace('/login')
  }

  if (to.path === '/login' && userStore.isLogged) {
    return router.replace('/')
  }

  if (to.meta.requiresGeodata) {
    // @todo fetch route related operator data
    const record = await getOperatorParcelles(userStore.user.id)

    if (!record || !record.parcelles || !record.metadata.source) {
      return router.push('/exploitation/setup')
    }
    else {
      store.setCurrentUser(record.operator, { persist: false })
      store.setRecord(record)
      store.setParcelles({
        geojson: record.parcelles,
        ...record.metadata
      })
    }
  }
})

