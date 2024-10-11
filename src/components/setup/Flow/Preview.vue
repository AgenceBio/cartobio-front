<template>
  <section>
    <div class="fr-alert fr-alert--success fr-mb-3w">
      <p class="fr-alert__title">
        Nous avons identifié {{ featureCollection.features.length }} parcelles ({{ surfaceTotale }}&nbsp;ha).
      </p>
    </div>

    <div class="fr-alert fr-alert--warning fr-mb-3w" v-for="(warning, i) in warnings" :key="i">
      <p v-if="warning instanceof FeatureNotFoundError">
        La référence cadastrale <ReferenceCadastrale class="fr-text--bold" :reference="warning.id" /> est introuvable
        dans le parcellaire informatisé.
      </p>
      <p v-else>{{ warning }}</p>
    </div>

    <div class="fr-mb-3w">
      <MapContainer
        :controls="false"
        class="map map--preview"
        :options="{ interactive: false, hash: false, trackResize: false }"
        minInitialZoom="22"
        :bounds="mapBounds"
      >
        <GeojsonLayer :style="baseStyle" name="base" />
        <FeaturesLayer :data="featureCollection" />
      </MapContainer>
    </div>

    <div v-if="operatorStore.records?.length" class="fr-alert fr-alert--info fr-mb-3w">
      Récupération des informations
      <p>
        Vous pouvez récupérer les informations renseignées sur le dernier parcellaire créé&nbsp;: dates et niveaux de
        conversion, parcelles ajoutées manuellement, variété des parcelles de la culture principale, commentaires et
        noms de parcelle modifiés.
      </p>
    </div>

    <form @submit.prevent="emit('submit', importPrevious === 'oui')">
      <fieldset
        v-if="operatorStore.records?.length"
        class="fr-fieldset"
        id="radio-import"
        aria-labelledby="radio-import-legend"
      >
        <legend class="fr-fieldset__legend fr-fieldset__legend--regular" id="radio-import-legend">
          Souhaitez-vous récupérer les informations renseignées dans le dernier parcellaire créé (<i>{{
            lastCreatedRecord.version_name
          }}</i
          >) ?
        </legend>

        <div class="fr-fieldset__element">
          <div class="fr-radio-group">
            <input
              type="radio"
              id="radio-import-oui"
              name="radio-import"
              v-model="importPrevious"
              value="oui"
              required="required"
            />
            <label class="fr-label" for="radio-import-oui">Oui</label>
          </div>
        </div>
        <div class="fr-fieldset__element">
          <div class="fr-radio-group">
            <input
              type="radio"
              id="radio-import-non"
              name="radio-import"
              v-model="importPrevious"
              value="non"
              required="required"
            />
            <label class="fr-label" for="radio-import-non">Non</label>
          </div>
        </div>
      </fieldset>

      <p>
        <button class="fr-btn" type="submit">Importer ces données</button>
      </p>
    </form>
  </section>
</template>

<script setup>
import { computed, ref } from "vue";

import ReferenceCadastrale from "@/components/records/ReferenceCadastrale.vue";

import { useOperatorStore } from "@/stores/operator.js";
import { bounds, FeatureNotFoundError, inHa, legalProjectionSurface } from "@/utils/features.js";
import baseStyle from "@/map-styles/base.json";
import FeaturesLayer from "@/components/map/FeaturesLayer.vue";
import MapContainer from "@/components/map/MapContainer.vue";
import GeojsonLayer from "@/components/map/GeojsonLayer.vue";

const emit = defineEmits(["submit", "cancel"]);
const props = defineProps({
  featureCollection: {
    type: Object,
    required: true,
  },
  warnings: {
    type: Array,
    default: () => [],
  },
});

const operatorStore = useOperatorStore();
const lastCreatedRecord = computed(
  () =>
    operatorStore.records.toSorted(
      (recordA, recordB) => new Date(recordB.created_at) - new Date(recordA.created_at),
    )[0],
);
const importPrevious = ref();

const surfaceTotale = computed(() => inHa(legalProjectionSurface(props.featureCollection)));
const mapBounds = computed(() => bounds(props.featureCollection));
</script>

<style>
.map {
  background: #ccc;
  height: 276px;
  width: 100%;

  @media (width >= 78em) {
    max-width: 40vw;
  }
}
</style>
