<template>
  <MainHeader />

  <RouterView v-slot="{ Component, route }">
    <Suspense>
      <template #default>
        <component
          :is="Component"
          :key="route.meta.usePathKey ? route.path : undefined"
        />
      </template>
      <template #fallback>Chargement... </template>
    </Suspense>
  </RouterView>

  <MainFooter />

</template>

<script setup>
import { useRouter } from 'vue-router'
import store from './store.js'
import { getOperatorParcelles } from './cartobio-api.js'

import MainHeader from './components/MainHeader.vue'
import MainFooter from './components/MainFooter.vue'

const { VUE_APP_API_ENDPOINT } = import.meta.env
const router = useRouter()

router.beforeEach(async (to, from) => {
  if (to.meta.requiresAuth && !store.state.currentUser.id) {
    return router.replace('/operateur/login')
  }

  if (to.path === '/operateur/login' && store.state.currentUser.id) {
    return router.replace('/operateur/certification-ab')
  }

  if (to.meta.requiresGeodata) {
    try {
      await getOperatorParcelles()
    }
    catch (error) {
      if (error.name === 'ParcellesNotSetup') {
        return router.push('/operateur/setup')
      }
    }
  }
})
</script>

<style>
@charset "utf-8";

@import '@gouvfr/dsfr/dsfr.css';
@import '@gouvfr/dsfr/utility/icons/icons.css';
@import 'styles/variables.css';

a[aria-disabled] {
  --text-action-high-blue-france: gray;
  --border-action-high-blue-france: gray;
  cursor: not-allowed;
  pointer-events: none;
}
</style>
