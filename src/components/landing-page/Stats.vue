<template>
  <div class="fr-container--fluid fr-py-9v">
    <div class="fr-container container--stats">
      <div class="fr-grid-row">
        <div class="fr-col-12">
          <h2 class="fr-h4">Les chiffres</h2>
        </div>
      </div>

      <ul class="fr-grid-row fr-raw-list">
        <li class="fr-col-md-3">
          <span class="fr-display--xl fr-text-title--blue-france">{{ stats.cartobioExploitationsCount }}</span>
          Parcellaires certifiés
        </li>
        <li class="fr-col-md-3">
          <span class="fr-display--xl fr-text-title--blue-france">{{ stats.cartobioParcellesCount }}</span>
          Parcelles renseignées
        </li>
        <li class="fr-col-md-3">
          <span class="fr-display--xl fr-text-title--blue-france">{{ stats.surfaceCartographiéConnuee }}</span>
          De la surface connue en bio cartographiée
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
import { onMounted, reactive } from "vue";

import axios from "axios";

const roundedPercent = Intl.NumberFormat("fr-FR", {
  style: "percent",
  maximumFractionDigits: 1,
});

const largeNumbers = Intl.NumberFormat("fr-FR", {
  style: "decimal",
  notation: "compact",
  compactDisplay: "short",
});

const stats = reactive({
  surfaceBioCouverte: 2776553,
  surfaceRpgBioCouverte: 2360070,
  get surfaceCartographiéConnuee() {
    return roundedPercent.format(this.cartobioSurfaceCouverte / this.surfaceBioCouverte);
  },
  cartobioExploitationsCount: 0,
  cartobioParcellesCount: 0,
  cartobioSurfaceCouverte: 0,
  opendataDownloadCount: 518, // datapass.api.gouv.fr + demandes manuelles
});

onMounted(async () => {
  const { data } = await axios.get(`${import.meta.env.VUE_APP_API_ENDPOINT}/v2/stats`);
  const { dataGouv, stats: cartobio } = data;

  const dataGouvAccumulatedDownloads = dataGouv.resources.reduce(
    (sum, resource) => sum + (resource.metrics.views ?? 0),
    stats.opendataDownloadCount,
  );

  stats.opendataDownloadCount = largeNumbers.format(dataGouvAccumulatedDownloads);
  stats.cartobioExploitationsCount = largeNumbers.format(cartobio.parcellaires);
  stats.cartobioParcellesCount = largeNumbers.format(cartobio.parcelles);
  stats.cartobioSurfaceCouverte = cartobio.surface;
});
</script>

<style scoped>
.container--stats span {
  display: block;
  margin: 0;
}
</style>
