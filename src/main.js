import { createApp } from 'vue'
import { createRouter, createWebHistory } from "vue-router"
import routes from "~pages"
import App from './App.vue'
import VueFeather from 'vue-feather'

createApp(App)
  .use(createRouter({
    routes,
    history: createWebHistory(),
  }))
  .component(VueFeather.name, VueFeather)
  .mount('#app')
