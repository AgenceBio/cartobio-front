import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { createRouter, createWebHistory } from "vue-router"
import { createHead } from "@unhead/vue"
import routes from "~pages"
import Matomo from 'vue-matomo'

import store from './store.js'
import { useUserStore } from '@/stores/index.js'
import { getOperatorParcelles } from './cartobio-api.js'
import App from './App.vue'

const { VUE_APP_MATOMO_SITE_ID:siteId = '245', VUE_APP_API_ENDPOINT } = import.meta.env

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
    domains: ['cartobio.agencebio.org', 'v2--cartobio-dev.netlify.app'],
    enableLinkTracking: true,
    discardHashTag: true,
    enableHeartBeatTimer: 15,
    trackerUrl: 'https://cartobio.agencebio.org/s/',
    trackerScriptUrl: 'https://cartobio.agencebio.org/s/index.js',
  })

const userStore = useUserStore()

router.isReady().then(() => {
  app.mount('#app')
  window.head = head
})

router.beforeEach(async (to) => {
  if (to.path === '/login/agencebio') {
    window.location = `${VUE_APP_API_ENDPOINT}/auth-provider/agencebio/login`
    return false
  }

  if (to.meta.requiredRoles && !to.meta.requiredRoles.includes(userStore.role)) {
    return router.push({ path: '/login', query: { returnto: to.path }})
  }

  if (to.meta.requiresAuth && !store.state.currentUser.id) {
    return router.replace('/exploitation/login')
  }

  if (to.path === '/exploitation/login' && store.state.currentUser.id) {
    return router.replace('/exploitation/parcellaire')
  }

  if (to.meta.requiresGeodata) {
    const record = await getOperatorParcelles(store.state.currentUser.id)

    if (!record || !record.parcelles || !record.metadata.source) {
      return router.push('/exploitation/setup')
    }
    else {
      store.setCurrentUser(record.operator)
      store.setRecord(record)
      store.setParcelles({
        geojson: record.parcelles,
        ...record.metadata
      })
    }
  }
})

