import './plugins/vuetify'
import App from './App.vue'
// import router from './router'
import Vue from 'vue'
import Vuetify from 'vuetify'

Vue.use(Vuetify)

Vue.config.productionTip = false

new Vue({
  // router,
  render: h => h(App)
}).$mount('#app')