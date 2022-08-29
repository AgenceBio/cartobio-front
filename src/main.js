import { createApp } from 'vue'
import { createRouter, createWebHistory } from "vue-router"
import routes from "~pages"
import App from './App.vue'
import Matomo from 'vue-matomo'

const { VUE_APP_MATOMO_SITE_ID:siteId = '245' } = import.meta.env

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

createApp(App)
  .use(router)
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
  .mount('#app')
