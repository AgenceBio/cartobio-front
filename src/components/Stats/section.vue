<template>
  <div class="fr-container--fluid fr-py-5w">
    <div class="fr-container container--stats">
      <div class="fr-grid-row">
        <div class="fr-col-12">
          <h2 class="fr-h4">Les chiffres</h2>
        </div>
      </div>

      <ul class="fr-grid-row fr-raw-list">
        <li class="fr-col-md-3">
          <span class="fr-display--xl fr-text-title--blue-france">{{ stats.cartobioExploitationsCount }}</span>
          Parcellaires renseignés
        </li>
        <li class="fr-col-md-3">
          <span class="fr-display--xl fr-text-title--blue-france">{{ stats.surfaceCartographiéConnuee }}%</span>
          De la surface cultivée en bio cartographiée
        </li>
        <li class="fr-col-md-3">
          <span class="fr-display--xl fr-text-title--blue-france">{{ stats.opendataDownloadCount }}</span>
          Téléchargements des données
        </li>
      </ul>

      <div class="fr-grid-row" v-if="$slots['footer-link']">
        <p class="fr-col-12 fr-mt-3w">
          <slot name="footer-link" />
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { toRef, onMounted } from 'vue'

import store from '@/store.js'

const stats = toRef(store.state, 'stats')

onMounted(() => store.fetchStats())
</script>

<style scoped>
.container--stats span {
  display: block;
  margin: 0;
}
</style>
