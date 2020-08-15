import Vue from 'vue'
import Router from 'vue-router'

import Home from './views/Home.vue'
import Stats from './views/Stats.vue'
import Changelog from './views/Changelog.vue'
import ApiDocumentation from './views/Api.vue'
import LandingTerritory from './views/Landing/Territory.vue'
import LandingCertificationBody from './views/Landing/CertificationBody.vue'

import AppLayout from './views/AppLayout.vue'
import ContentPagesLayout from './views/ContentPagesLayout.vue'

import store from './store.js'
import goTo from 'vuetify/lib/components/Vuetify/goTo'

Vue.use(Router)

function isLoadedAndAuthenticated (to, from, next) {
  const isLoaded = store.getters['user/isLoaded']
  const { oc } = store.getters.getCategories;

  function proceed () {
    const { getUserCategory } = store.getters;
    getUserCategory === oc ? next() : next('/map')
  }

  if (isLoaded) {
    return proceed()
  }

  store.watch(
    (state) => state.user.isLoaded,
    (isLoaded) => isLoaded && proceed()
  )
}

export default new Router({
  routes: [
    {
      path: '/app',
      component: AppLayout,
      children: [
        {
          path: '/map/exploitation/:numeroBio:latLonZoom(@[0-9.-]+,[0-9.-]+,[0-9]+)?',
          props: true,
          name: 'mapWithOperator',
          component: () => import(/* webpackChunkName: "app-map" */ './views/Map.vue'),
        },
        {
          path: '/map:latLonZoom(@[0-9.-]+,[0-9.-]+,[0-9]+)?',
          props: true,
          name: 'map',
          component: () => import(/* webpackChunkName: "app-map" */ './views/Map.vue'),
        },
        {
          path: '/notifications',
          name: 'notifications',
          component: () => import(/* webpackChunkName: "app-notifications" */ './views/AgriList.vue'),
          beforeEnter: isLoadedAndAuthenticated
        }
      ]
    },
    {
      path: '/',
      component: ContentPagesLayout,
      children: [
        {
          path: '/',
          name: 'home',
          component: Home,
          children: [
            { path: 'title' },
            { path: 'certification' },
            { path: 'territoire' },
            { path: 'demarche' },
            { path: 'contact' },
          ]
        },
        { path: '/stats', name: 'stats', component: Stats },
        { path: '/changelog', name: 'changelog', component: Changelog },
        { path: '/api', name: 'api', component: ApiDocumentation },
        { path: '/features/organismes-certification-bio', name: 'landing-oc', component: LandingCertificationBody },
        { path: '/features/territoires', name: 'landing-territoires', component: LandingTerritory },
      ]
    },
  ],
  scrollBehavior: (to, from, savedPosition) => {
    let scrollTo = 0

    if (to.hash) {
      scrollTo = to.hash
    } else if (savedPosition) {
      scrollTo = savedPosition.y
    }

    return goTo(scrollTo)
  },
})
