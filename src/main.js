import { createApp } from 'vue'
import { createRouter, createWebHistory } from "vue-router"
import routes from "~pages"
import App from './App.vue'
import VueFeather from 'vue-feather'
import Matomo from 'vue-matomo'

const { MATOMO_SITE_ID = 116 } = import.meta.env

const router = createRouter({
  routes,
  history: createWebHistory(),
})

createApp(App)
  .use(router)
  .use(Matomo, {
    router,
    siteId: MATOMO_SITE_ID,
    domains: ['app.cartobio.org', 'v2--cartobio-dev.netlify.app'],
    enableLinkTracking: true,
    discardHashTag: true,
    enableHeartBeatTimer: 15,
    trackerUrl: 'https://cartobio.org/s/',
    trackerScriptUrl: 'https://cartobio.org/s/index.js',
  })
  .component(VueFeather.name, VueFeather)
  .mount('#app')
