import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { createRouter, createWebHistory } from "vue-router"
import { createHead } from "@vueuse/head"
import routes from "~pages"
import Matomo from 'vue-matomo'

import store from './store.js'
import { getOperatorParcelles } from './cartobio-api.js'
import App from './App.vue'

const { VUE_APP_MATOMO_SITE_ID:siteId = '245' } = import.meta.env

const pinia = createPinia()

const head = createHead({
  titleTemplate: '%s — CartoBio (beta)'
})

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

router.beforeEach(async (to) => {
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
      store.setParcelles({
        record_id: record.record_id,
        geojson: record.parcelles,
        ...record.metadata
      })
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
    domains: ['app.cartobio.org', 'v2--cartobio-dev.netlify.app'],
    enableLinkTracking: true,
    discardHashTag: true,
    enableHeartBeatTimer: 15,
    trackerUrl: 'https://cartobio.agencebio.org/s/',
    trackerScriptUrl: 'https://cartobio.agencebio.org/s/index.js',
  })

router.isReady().then(() => {
  app.mount('#app')
  window.head = head
})

