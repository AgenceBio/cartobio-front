import Vue from 'vue'
import Router from 'vue-router'
import Home from './views/Home.vue'
import Map from './views/Map.vue'
import AgriList from './views/AgriList.vue'
import AppLayout from './views/AppLayout.vue'
import store from './store.js'

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
          path: 'objectives'
        }, {
          path: 'about'
        }, {
          path: 'partners'
        }
      ]
    },
    {
      path: '/app',
      name: 'appHome',
      component: AppLayout,
      children: [{
          path: '/map',
          name: 'map',
          component: Map
        },
        {
          path: '/notifications',
          name: 'notifications',
          component: AgriList,
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
    }
    // {
    //   path: '/about',
    //   name: 'about',
    //   // route level code-splitting
    //   // this generates a separate chunk (about.[hash].js) for this route
    //   // which is lazy-loaded when the route is visited.
    //   component: () => import(/* webpackChunkName: "about" */ './views/About.vue')
    // }
  ]
})