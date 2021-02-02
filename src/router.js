import Vue from 'vue'
import Router from 'vue-router'

import Home from './views/Home.vue'
import Stats from './views/Stats.vue'
import Changelog from './views/Changelog.vue'
import PageNotFound from './views/PageNotFound.vue'
import ApiDocumentation from './views/Api.vue'

import LandingTerritory from './views/Landing/Territory.vue'
import LandingCertificationBody from './views/Landing/CertificationBody.vue'

import ContentPagesLayout from './views/ContentPagesLayout.vue'

Vue.use(Router)

// function isLoadedAndAuthenticated (to, from, next) {
//   const isLoaded = store.getters['user/isLoaded']
//   const { oc } = store.getters.getCategories;

//   function proceed () {
//     const { getUserCategory } = store.getters;
//     getUserCategory === oc ? next() : next('/')
//   }

//   if (isLoaded) {
//     return proceed()
//   }

//   store.watch(
//     (state) => state.user.isLoaded,
//     (isLoaded) => isLoaded && proceed()
//   )
// }

export default new Router({
  routes: [
    {
      path: '/map',
      props: true,
      name: 'map',
      component: () => import(/* webpackChunkName: "map" */ './views/AppLayout.vue'),
      children: [
        {
          path: '/map/exploitation/:numeroBio',
          props: true,
          name: 'operator',
          component: () => import(/* webpackChunkName: "operator" */ './components/Map/OperatorSidebar.vue'),
          children: [
            {
              path: 'pacage',
              name: 'pacage',
              component: () => import(/* webpackChunkName: "operator" */ './components/Map/OperatorSidebarPacage.vue')
            },
            {
              path: 'parcels/new',
              name: 'new-parcel',
              component: () => import(/* webpackChunkName: "operator" */ './components/Map/OperatorSidebarParcelsSubmit.vue')
            },
            {
              path: '',
              name: 'parcels-list',
              component: () => import(/* webpackChunkName: "operator" */ './components/Map/OperatorSidebarParcelsList.vue'),
            }
          ],
          pathToRegexOptions: { strict: true }
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

        { path: '/prototypes', name: 'prototypes', component: () => import(/* webpackChunkName: "prototypes" */'./views/Prototypes.vue') },

        { path: '*', name: '404', component: PageNotFound }
      ]
    },
  ]
})
