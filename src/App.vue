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
  --brand-color: hsl(0, 0%, 90%);

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

.container {
  margin: 0 auto;
  padding: 0 1rem;
  max-width: 64rem;
}

i.vue-feather {
  margin-right: .2rem;
  vertical-align: middle;
}

form label {
  font-weight: bold;
}

:where(.button, button, input[type="text"], input[type="date"], input[type="search"]) {
  border: 1px solid #333;
  box-shadow: 2px 2px 1px rgba(0, 0, 0, .3);
  background-color: #fcfcfc;
  color: #333;
  padding: .2rem;
  text-decoration: none;
}

:where(.button, input[type="text"], input[type="date"], input[type="search"]) {
  padding: .8rem;
}

[disabled]:where(.button, button, input[type="text"], input[type="date"], input[type="search"]) {
  color: #999;
  border-color: #999;
  box-shadow: 2px 2px 1px rgba(0, 0, 0, .1);
  cursor: not-allowed;
}

:where(.button, input[type="text"], input[type="date"], input[type="search"]) + .button {
  border-left: none;
}

.field {
  margin: .5rem 0;
}

:where(form label, button, select, .button, input[type="button"], input[type="submit"]):not(:disabled) {
  cursor: pointer;
}

a.button,
button {
  background-color: var(--brand-color);
}

  a.button:hover, button:hover {
    background-color: hsl(0, 0%, 85%);
  }

button.link,
details.help summary {
  background: transparent;
  border: none;
  box-shadow: none;
  color: #00f;
  cursor: pointer;
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
