import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { createRouter, createWebHistory } from 'vue-router'
import { createHead } from '@unhead/vue'
import * as Sentry from '@sentry/vue'
import routes from '~pages'
import Matomo from 'vue-matomo'
import Vue3Toastify, { toast as toastify } from 'vue3-toastify'
import 'vue3-toastify/dist/index.css';

import App from './App.vue'
import { version } from "../package.json"
import toast from '@/utils/toast.js'
import { AxiosError } from "axios"
import { useUserStore } from "@/stores/user.js"

const { VUE_APP_MATOMO_SITE_ID:siteId = '58', VUE_APP_API_ENDPOINT } = import.meta.env
const { VUE_APP_SENTRY_DSN } = import.meta.env

const pinia = createPinia()
const head = createHead()
const app = createApp(App)
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
        Sentry.browserTracingIntegration({
          router
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

app
  .use(router)
  .use(head)
  .use(pinia)
  .use(
    Vue3Toastify,
    {
      autoClose: false,
      position: toastify.POSITION.BOTTOM_LEFT,
      width: 'auto',
      limit: 3,
    }
  )
  .use(Matomo, {
    router,
    siteId,
    domains: ['cartobio.agencebio.org', 'cartobio-preprod.agencebio.org'],
    enableLinkTracking: true,
    discardHashTag: true,
    enableHeartBeatTimer: 15,
    trackerUrl: 'https://cartobio.agencebio.org/s/',
    trackerScriptUrl: 'https://cartobio.agencebio.org/s/index.js',
    trackSiteSearch: (to) => to.path === '/certification/exploitations' && to.query.search || null,
  })

// this is sync because we need to know the user role before rendering the app
const userStore = useUserStore()
userStore.enablePersistance()

function handlerAPIErrors(error) {
  if (
      error.name === "AxiosError" &&
      [
        AxiosError.ETIMEDOUT,
        AxiosError.ECONNABORTED,
        AxiosError.ERR_NETWORK
      ].includes(error.code)
  ) {
    toast.error('Une erreur de réseau est survenue. Vérifiez votre connexion internet.')
    return true
  }

  // Token has expired, as stated by the API error code
  // We disconnect and force render the current page to trigger the login mechanism
  if (error?.response?.data?.code === 'EXPIRED_CREDENTIALS') {
    const { path, params } = router.currentRoute.value

    userStore.logout()
    router.push({ path, params, force: true })
    return true
  }
}

app.config.errorHandler = (error) => {
  if (handlerAPIErrors(error)) return false

  toast.error('Une erreur est survenue. Nous avons été informés et résoudrons ceci au plus vite.')
  console.error(error)
  throw error;
}

router.onError((error, to) => {
  if (handlerAPIErrors(error)) return false

  // refresh the page if the app is redeployed while being in use
  // this should be handled with a basic ServiceWorker/offline-first approach
  // it could also be done as a Toast, with a reload action to offer a less surprising experience
  const errors = ['Failed to fetch dynamically imported module', 'Unable to preload CSS']
  if (errors.some((e) => error.message.includes(e))) {
    window.location = to.fullPath
    return
  }

  // try to prefetch errors from response
  const { message = 'Une erreur est survenue. La page n\'a pas pu être chargée.' } = error?.response?.data ?? {}
  toast.error(message)
  console.error(error)
  throw error
})

router.isReady().then(() => {
  app.mount('#app')
  window.head = head
})

router.beforeEach(async (to) => {
  const { useRecordStore } = await import('@/stores/record.js')
  const recordStore = useRecordStore()
  // Preload stores for checking permissions
  if (to.params.recordId) {
    await recordStore.ready(to.params.recordId) // will load also the operator
  } else if (to.params.numeroBio) {
    recordStore.$reset()
    const { useOperatorStore } = await import('@/stores/operator.js')
    const operatorStore = useOperatorStore()
    await operatorStore.ready(to.params.numeroBio)
  }

  if (to.path === '/logout') {
    const path = (userStore.isOc || userStore.isAgri) ? '/pro' : '/'
    await userStore.logout()
    return { path }
  }

  if (to.path === '/login' && userStore.isLogged) {
    return { path: userStore.startPage, replace: true }
  }


  if (to.meta.requiresAuth && !userStore.isLogged) {
    return { path: '/login', replace: true }
  }

  if (to.path === '/login/agencebio') {
    // forwards the user selected tab to the callback URI
    // this way, we come back to the same tab
    window.location = `${VUE_APP_API_ENDPOINT}/auth-provider/agencebio/login`
    return false
  }

  if (to.meta.requiredRoles
      && !to.meta.requiredRoles.some(role => userStore.roles.includes(role))) {
    return { path: '/login' }
  }

  if (to.meta.requiredPermissions) {
    const { usePermissions } = await import('@/stores/permissions.js')
    const permissions = usePermissions()
    const hasPermission = to.meta.requiredPermissions
        .every(permission => permissions[permission])

    if (!hasPermission) {
      return { path: '/login' }
    }
  }
})

router.afterEach(async() => {
  const { useCartoBioStorage } = await import('@/stores/storage.js')
  const storage = useCartoBioStorage()
  await storage.sync()
})
