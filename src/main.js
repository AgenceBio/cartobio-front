import './plugins/vuetify'
import Vue from 'vue'
import Vuetify from 'vuetify'

import router from './router'
import App from './App.vue'

Vue.use(Vuetify)

Vue.config.productionTip = false

new Vue({
  router,
  render: function (createElement) {
    return createElement(App)
  }
}).$mount('#app')