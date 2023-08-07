<route lang="yaml">
  meta:
    seo:
      title: Connexion sécurisée à votre compte
</route>

<template>
  <div class="fr-container fr-my-5w">
    <div class="fr-grid-row">
      <div class="fr-col-12">
        <h2 class="fr-h6">
          Connexion à CartoBio
        </h2>

        <div
          class="fr-tabs"
          style="--tabs-height: 99.5%;"
        >
          <ul
            class="fr-tabs__list"
            role="tablist"
          >
            <li role="presentation">
              <router-link
                to="/login?mode=exploitation"
                class="fr-tabs__tab"
                role="button"
                :aria-selected="mode === MODES_EXPLOITATION"
                @click="mode = MODES_EXPLOITATION"
                :aria-controls="MODES_EXPLOITATION"
              >
                Je suis agriculteur·ice
              </router-link>
            </li>
            <li role="presentation">
              <router-link
                to="/login?mode=certification"
                class="fr-tabs__tab"
                role="button"
                :aria-selected="mode === MODES_CERTIFICATION"
                @click="mode = MODES_CERTIFICATION"
                :aria-controls="MODES_CERTIFICATION"
              >
                Je travaille pour un organisme de certification
              </router-link>
            </li>
          </ul>

          <Component
            :is="LoginComponent"
            :id="mode"
            class="fr-tabs__panel fr-tabs__panel--selected"
            role="tabpanel"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import { useRoute } from 'vue-router'

import CertificationLogin from '@/components/Certification/Login.vue'
import OperatorLogin from '@/components/Operator/Login.vue'

const MODES_EXPLOITATION = 'exploitation'
const MODES_CERTIFICATION = 'certification'

const MODES = {
  [MODES_EXPLOITATION]: {
    component: OperatorLogin,
  },
  [MODES_CERTIFICATION]: {
    component: CertificationLogin
  },
}

const route = useRoute()
const mode = ref(route.query.mode in MODES ? route.query.mode : MODES_EXPLOITATION)
const LoginComponent = computed(() => MODES[mode.value].component)
</script>
