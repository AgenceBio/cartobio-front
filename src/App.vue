<template>
  <MainHeader />
  <MainNotifications />

  <router-view v-bind="$attrs" />
</template>

<script setup>
import { useRouter } from 'vue-router'
import store from './store.js'

import MainHeader from './components/MainHeader.vue'
import MainNotifications from './components/MainNotifications.vue'

const router = useRouter()

router.beforeEach((to, from) => {
  if (to.meta.requiresAuth && !store.state.currentUser.id) {
    return router.replace('/operateur/login')
  }

  if (to.path === '/operateur/login' && store.state.currentUser.id) {
    return router.replace('/operateur/parcellaire')
  }

  if (to.meta.requiresGeodata && !store.state.parcellaireSource) {
    return router.replace('/operateur/setup')
  }
})
</script>

<style>
@import 'normalize.css/normalize.css';

:root {
  --brand-color: #E5E5E5;

  --type-default: hsl(0, 0%, 96%);
  --type-success: hsl(142, 52%, 96%);
  --type-warning: hsl(48, 100%, 96%);
  --type-danger: hsl(347, 90%, 96%);
  --type-default--text: hsl(0, 0%, 30%);
  --type-success--text: hsl(141, 53%, 30%);
  --type-warning--text: hsl(48, 100%, 30%);
  --type-danger--text:  hsl(348, 86%, 30%);

  --spacing: 1rem;
}

#app {
  font-family: Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

i.vue-feather {
  margin-right: .2rem;
  vertical-align: middle;
}

form label {
  font-weight: bold;
}

:where(button, input[type="button"], input[type="submit"], input[type="text"], input[type="search"]) {
  padding: 1em;
}

:where(form label, button, input[type="button"], input[type="submit"]):not(:disabled) {
  cursor: pointer;
}

button.link {
  background: transparent;
  border: none;
  padding: 0;
  text-decoration: underline;
}

.tag {
  background-color: var(--brand-color);
  border-radius: 5px;
  font-size: .8rem;
  font-weight: bold;
  padding: .3em .5em;
}
</style>
