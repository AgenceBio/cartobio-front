import './plugins/vuetify'
import Vue from 'vue'
import Storage from 'vue-ls';
import VueMeta from 'vue-meta'
import Vuetify from 'vuetify/lib'
import store from './store.js'
import router from './router'
import App from './App.vue'

let storageOptions = {
  namespace: 'cartobio_',
  name: 'ls',
  storage: 'local'
}

Vue.use(Vuetify)
Vue.use(Storage, storageOptions)
Vue.use(VueMeta, {
  refreshOnceOnNavigation: true
})

Vue.config.productionTip = false

new Vue({
  store,
  router,
  render: (createElement) => createElement(App),
  created () {
    this.$store.dispatch('user/setProfile', this.$ls.get('cartobioToken'))
  },
  beforeCreate () {
    // skip if not in production, or user is part of the demo users
    if (window.location.hostname === 'cartobio.org' && this.$store.getters['user/isDemoAccount'] === false) {
      router.afterEach((to, from) => {
        if (to.path && (to.path === '/' || to.path !== from.path)) {
          const {userProfile: userData} = this.$store.state

          if (userData.userId) {
            window._paq.push(['setUserId', userData.userId])
            window._paq.push(['setCustomVariable', 1, "oc", userData.organismeCertificateur?.nom ?? "", "visit"])
            window._paq.push(['setCustomVariable', 2, "group", userData.mainGroup?.nom ?? "", "visit"])
          }

          window._paq.push(['setDocumentTitle', to.name])
          window._paq.push(['setCustomUrl', to.path])
          window._paq.push(['setReferrerUrl', from.path])
          window._paq.push(['enableLinkTracking'])
          window._paq.push(['trackPageView'])
        }
      })
    }

  }
}).$mount('#app')
