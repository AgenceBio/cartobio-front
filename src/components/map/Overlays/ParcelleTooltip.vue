<template>
  <div class="openlayers-parcelle-tooltip fr-px-2w fr-py-3w">
    <div class="space-between fr-mb-2w">
      <b>{{ name }}</b>
      <p class="fr-mb-0 fr-hint-text fr-text--md">{{ area }} ha</p>
    </div>
    <div class="align-center gap-3">
      <span class="fr-icon-map-pin-2-line fr-icon--sm fr-hint-text" aria-hidden="true"></span>
      <p class="fr-mb-0 fr-hint-text fr-text--md">{{ codePostale }} {{ ville }}</p>
    </div>
    <div v-if="libelleCulture" class="align-center gap-1">
      <span class="fr-hint-text fr-mr-0" :class="icon" aria-hidden="true"></span>
      <p class="fr-mb-0 fr-hint-text fr-text--md">{{ libelleCulture }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  name: string;
  area: number;
  codePostale: string;
  ville: string;
  icon: string;
  libelleCulture: string | undefined;
}

defineProps<Props>();
</script>

<style scoped>
.openlayers-parcelle-tooltip {
  background-color: white;
  z-index: 150;
}
.openlayers-parcelle-tooltip div {
  display: flex;
}

.openlayers-parcelle-tooltip .space-between {
  justify-content: space-between;
  display: flex;
  gap: 30px;
}
.openlayers-parcelle-tooltip .align-center {
  align-items: center;
}
.openlayers-parcelle-tooltip .gap-3 {
  gap: 10px;
}
.openlayers-parcelle-tooltip .gap-1 {
  gap: 3px;
}
</style>
