import './plugins/vuetify'
import Vue from 'vue'
import Storage from 'vue-ls';

import Vuetify from 'vuetify'
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

router.afterEach((to, from) => {
  if (to.path && to.path !== from.path) {
    window._paq.push(['trackPageView', to.name])
  }
})


Vue.config.productionTip = false

new Vue({
  store,
  router,
  render: function (createElement) {
    return createElement(App)
  }
}).$mount('#app')