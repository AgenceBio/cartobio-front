import { createApp } from 'vue'
import { createRouter, createWebHistory } from "vue-router"
import { createHead } from "@vueuse/head"
import routes from "~pages"
import App from './App.vue'
import Matomo from 'vue-matomo'

const { VUE_APP_MATOMO_SITE_ID:siteId = '245' } = import.meta.env

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

const app = createApp(App)
  .use(router)
  .use(head)
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

