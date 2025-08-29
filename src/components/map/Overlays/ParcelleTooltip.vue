<template>
  <div class="openlayers-parcelle-tooltip fr-px-2w fr-py-3w">
    <div class="not-flex">
      <div class="space-between">
        <b class="fr-text--sm fr-mb-0">{{ name }}</b>
        <p class="fr-hint-text fr-text--xs fr-mb-0">{{ area }} ha</p>
      </div>
      <div class="align-center gap-3 fr-mt-1v">
        <span class="fr-icon-map-pin-2-line fr-icon--sm fr-hint-text" aria-hidden="true"></span>
        <p class="fr-hint-text fr-mb-1v fr-text--xs">{{ codePostale }} {{ ville }}</p>
      </div>
      <div v-if="conversionDate" class="align-center gap-3">
        <span class="fr-icon-calendar-line fr-icon--sm fr-hint-text" aria-hidden="true"></span>
        <p class="fr-hint-text fr-mb-1v fr-text--xs">Début de conversion {{ dateFormat(conversionDate) }}</p>
      </div>
    </div>

    <div v-if="conversionLevel" class="align-center fr-mt-3w">
      <ConversionLevel :level="getConversionLevel(conversionLevel)" :noIcon="true" :labelSelector="true" />
    </div>
    <div v-else-if="libelleCulture" class="red radius fr-mt-1v">
      <span class="fr-icon-pencil-line fr-icon--sm fr-hint-text"> </span>
      <p class="fr-mb-0 fr-text--xs">Certification</p>
    </div>
    <div v-if="libelleCulture" class="align-center gap-1 fr-mt-1v">
      <span class="fr-hint-text fr-mr-0" :class="icon" aria-hidden="true"></span>
      <p class="fr-mb-0 fr-hint-text fr-text--xs">{{ libelleCulture }}</p>
    </div>
    <div v-else-if="conversionLevel" class="red radius fr-mt-1v">
      <span class="fr-icon-pencil-line fr-icon--sm fr-hint-text"> </span>
      <p class="fr-mb-0 fr-text--xs">Culture</p>
    </div>

    <div v-if="!conversionLevel && !libelleCulture" class="align-center gap-3">
      <div class="align-center gap-3 red radius">
        <span class="fr-icon-pencil-line fr-icon--sm fr-hint-text fr-mr-0"> </span>
        <p class="fr-mb-0 fr-text--xs">Culture</p>
      </div>
      <div class="align-center gap-3 red radius">
        <span class="fr-icon-pencil-line fr-icon--sm fr-hint-text fr-mr-0"> </span>
        <p class="fr-mb-0 fr-text--xs">Certification</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { getConversionLevel } from "@/referentiels/ab.js";
import ConversionLevel from "@/components/records/Table/ConversionLevel.vue";
import { dateFormat } from "@/utils/dates.js";

interface Props {
  name: string;
  area: string;
  codePostale: string;
  ville: string;
  icon: string;
  libelleCulture: string | undefined;
  conversionLevel: string | undefined;
  conversionDate: string | undefined;
}

defineProps<Props>();
</script>

<style scoped>
.openlayers-parcelle-tooltip {
  background-color: white;
}
.openlayers-parcelle-tooltip div {
  display: flex;
}

.not-flex {
  display: inline !important;
}

.openlayers-parcelle-tooltip .space-between {
  justify-content: space-between;
  display: flex;
  gap: 60px;
  margin: 0px;
  padding: 0px;
}
.openlayers-parcelle-tooltip .align-center {
  align-items: center;
}
.openlayers-parcelle-tooltip .gap-3 {
  gap: 3px;
}
.openlayers-parcelle-tooltip .gap-1 {
  gap: 1px;
}

.red {
  color: var(--text-default-error);
  background-color: var(--red-marianne-925-125);
  box-shadow: none;
  width: fit-content;
  padding: 2px 8px;
}

.radius {
  border-radius: 16px;
}
</style>
