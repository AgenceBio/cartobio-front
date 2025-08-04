<template>
  <aside ref="mapRef" class="openlayers-container">
    <slot v-if="map" />
  </aside>
</template>

<script setup lang="ts">
import { ref, onMounted, provide, shallowRef, onUpdated } from "vue";
import { Map, View } from "ol";
import { useGeographic } from "ol/proj";

/**
 * * Refs
 */
const mapRef = ref<HTMLElement | null>(null);
const map = shallowRef<Map | null>(null);

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
    controls: [],
    view: new View({
      center: [0, 0],
      zoom: 2,
      constrainResolution: true,
    }),
  });
};

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

<style lang="postcss" scoped>
.openlayers-container {
  z-index: 0;
}
</style>
