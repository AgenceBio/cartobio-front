import Vue from 'vue'
import Router from 'vue-router'
import Home from './views/Home.vue'
import Stats from './views/Stats.vue'
import AppLayout from './views/AppLayout.vue'
import store from './store.js'
import goTo from 'vuetify/lib/components/Vuetify/goTo'

Vue.use(Router)

export default new Router({
  routes: [{
      path: '/',
      name: 'home',
      component: Home,
      children: [{
          path: 'title'
        },
        {
          path: 'objectifs'
        }, {
          path: 'a-propos'
        }, {
          path: 'nous-suivre'
        }, {
          path: 'partenaires'
        }
      ]
    },
    {
      path: '/app',
      component: AppLayout,
      children: [
        {
          path: '/map/pacage/:pacageId:latLonZoom(@[0-9.-]+,[0-9.-]+,[0-9]+)?',
          props: true,
          name: 'mapWithPacage',
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
          beforeEnter: (to, from, next) => {
            let userCategory = store.getters.getUserCategory;
            if (userCategory !== store.getters.getCategories.oc) {
              next('/map');
            } else {
              next();
            }
          }
        }
      ]
    },
    {
      path: '/stats',
      name: 'stats',
      component: Stats
    }
    // {
    //   path: '/about',
    //   name: 'about',
    //   // route level code-splitting
    //   // this generates a separate chunk (about.[hash].js) for this route
    //   // which is lazy-loaded when the route is visited.
    //   component: () => import(/* webpackChunkName: "about" */ './views/About.vue')
    // }
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
