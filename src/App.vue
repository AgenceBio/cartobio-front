<template>
  <MainHeader />

  <RouterView v-slot="{ Component, route }">
    <Suspense>
      <component
        :is="Component"
        :key="route.meta.usePathKey ? route.path : undefined"
      />
      <template #fallback>Chargement... </template>
    </Suspense>
  </RouterView>

  <MainFooter />
</template>

<script setup>
import { useRoute } from 'vue-router'
import { useHead } from '@vueuse/head'
import { computed } from 'vue'

import MainHeader from './components/MainHeader.vue'
import MainFooter from './components/MainFooter.vue'

const { VUE_APP_API_ENDPOINT } = import.meta.env
const route = useRoute()

const title = computed(() => route.meta?.seo?.title)

// SEO
useHead({ title })
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

.fr-col--center,
.fr-grid-row--align-center {
  text-align: center;
}
</style>
