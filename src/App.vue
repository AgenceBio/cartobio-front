<template>
  <MainHeader />

  <router-view v-bind="$attrs" />
</template>

<script setup>
import { useRouter } from 'vue-router'
import store from './store.js'

import MainHeader from './components/MainHeader.vue'

const router = useRouter()

router.beforeEach((to, from) => {
  if (to.meta.requiresAuth && !store.state.currentUser.id) {
    router.replace('/operateur/login')
  }
})
</script>

<style>
@import 'normalize.css/normalize.css';

:root {
  --spacing: 1rem;
}

#app {
  font-family: Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}
</style>
