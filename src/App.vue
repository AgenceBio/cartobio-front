<template>
  <MainHeader />
  <MainNotifications />

  <RouterView v-bind="$attrs" />
</template>

<script setup>
import { useRouter } from 'vue-router'
import { get } from 'axios'
import store from './store.js'

import MainHeader from './components/MainHeader.vue'
import MainNotifications from './components/MainNotifications.vue'

const { VUE_APP_API_ENDPOINT } = import.meta.env
const router = useRouter()

router.beforeEach(async (to, from) => {
  if (store.state.currentUser.id && Object.keys(store.state.parcellaire).length === 0) {
    const { data } = await get(`${VUE_APP_API_ENDPOINT}/v2/operator/${store.state.currentUser.id}`)

    if (data) {
      store.setParcelles({
        geojson: data.parcelles,
        source: data.metadata.source,
        sourceLastUpdate: data.metadata.sourceLastUpdate,
      })
    }
  }

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
