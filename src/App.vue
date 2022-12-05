<template>
  <MainHeader />

  <RouterView v-slot="{ Component, route }">
    <Suspense>
      <component
        :is="Component"
        :key="route.meta.usePathKey ? route.path : undefined"
      />
      <template #fallback>
        <div class="fr-container fr-py-6w">
          <div class="fr-grid-row">
            <div class="fr-col-12">
              <Spinner class="fr-h5">Chargement des données…</Spinner>
            </div>
          </div>
        </div>
      </template>
    </Suspense>
  </RouterView>

  <MainFooter />
</template>

<script setup>
import { useRoute } from 'vue-router'
import { useHead } from '@unhead/vue'
import { computed } from 'vue'

import MainHeader from '@/components/MainHeader.vue'
import MainFooter from '@/components/MainFooter.vue'
import Spinner from '@/components/Spinner.vue'

const route = useRoute()
const title = computed(() => route.meta?.seo?.title)

// SEO
useHead({ title, titleTemplate: '%s — CartoBio (beta)' })
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

.fr-background-alt--blue-france {
  background-color: var(--background-alt-blue-france);
}
.fr-background-alt--grey {
  background-color: var(--background-alt-grey);
}
</style>
