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
          De la surface cultivée en bio cartographiée<br/>
          (correspondant au <a href="https://www.data.gouv.fr/fr/dataset/616d6531c2951bbe8bd97771/" target="_blank">RPG Bio</a>)
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
import { onMounted, reactive } from 'vue'

import axios from "axios"

const DEFAULT_STATS = {
  surfaceCartobioCouverte: 0,
  surfaceBioCouverte: 2776553,
  surfaceRpgBioCouverte: 2360070,
  get surfaceCartographiéConnuee () {
    return (this.surfaceRpgBioCouverte / this.surfaceBioCouverte * 100).toLocaleString('fr-FR')
  },
  cartobioExploitationsCount: 0,
  cartobioParcellesCount: 0,
  opendataDownloadCount: 518, // datapass.api.gouv.fr + demandes manuelles
}

const stats = reactive(structuredClone(DEFAULT_STATS))

onMounted(async () => {
  const { data } = await axios.get(`${import.meta.env.VUE_APP_API_ENDPOINT}/v2/stats`)
  const { dataGouv, stats: cartobio } = data

  stats.opendataDownloadCount = dataGouv.resources.reduce((sum, resource) => sum + (resource.metrics.views ?? 0), DEFAULT_STATS.opendataDownloadCount)
  stats.cartobioExploitationsCount = cartobio.count
  stats.cartobioParcellesCount = cartobio.parcelles_count
})



</script>

<style scoped>
.container--stats span {
  display: block;
  margin: 0;
}
</style>
