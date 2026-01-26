<template>
  <aside ref="mapRef" class="openlayers-container" aria-label="Carte interactive OpenLayers">
    <p class="fr-sr-only" id="mapDescription">
      Carte interactive affichant les parcelles agricoles. Vous pouvez zoomer, déplacer la carte et sélectionner des
      zones.
    </p>
    <slot v-if="map" />
  </aside>
</template>

<script setup lang="ts">
import { ref, onMounted, provide, shallowRef, onUpdated } from "vue";

import { Map, View } from "ol";
import { useGeographic } from "ol/proj";
import { defaults as defaultInteractions } from "ol/interaction";
import Control from "ol/control/Control";

/**
 * * Refs
 */
const mapRef = ref<HTMLElement | null>(null);
const map = shallowRef<Map | null>(null);

/**
 * * Props
 */

const props = defineProps<{
  blocked?: boolean;
}>();

/**
 * * Providers
 */
provide("map", map);

defineExpose({
  map,
});

/**
 * * Functions
 */
const initMap = (): void => {
  useGeographic();
  map.value = new Map({
    view: new View({
      center: [0, 0],
      zoom: 2,
      constrainResolution: true,
    }),
    interactions: props.blocked ? [] : defaultInteractions(),
    controls: props.blocked
      ? [new InfoButtonControl("https://docs-cartobio.agencebio.org/agriculteurs.trices/annexes/legendes-de-la-carte")]
      : [],
  });
};

class InfoButtonControl extends Control {
  constructor(url: string) {
    const button = document.createElement("button");
    button.innerHTML = "i";
    button.style.width = "30px";
    button.style.height = "30px";
    button.style.backgroundColor = "white";
    button.style.cursor = "pointer";

    button.addEventListener("click", () => {
      window.open(url, "_blank");
    });

    const element = document.createElement("div");
    element.className = "info-button ol-unselectable ol-control";
    element.style.bottom = "10px";
    element.style.right = "10px";
    element.style.position = "absolute";
    element.appendChild(button);

    super({ element });
  }
}

/**
 * * States component
 */
onMounted(() => {
  initMap();
  if (mapRef.value) {
    map.value?.setTarget(mapRef.value);
  }
});

onUpdated(() => {
  if (map.value) {
    map.value.updateSize();
  }
});
</script>

<style>
@import "ol/ol.css";
</style>

<style scoped>
.openlayers-container {
  z-index: 0;
}
</style>
