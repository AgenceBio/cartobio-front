<template>
  <div class="flex">
    <div ref="mapRef" class="openlayers-container">
      <slot name="map1" v-if="map" />
    </div>
    <div ref="mapRef2" class="openlayers-container">
      <slot name="map2" v-if="map2" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, provide, shallowRef, onUpdated } from "vue";
import LayerDiff from "./Interactions/LayerDiff.vue";
import { Map, View } from "ol";
import { useGeographic } from "ol/proj";
import { Select } from "ol/interaction";
import { click } from "ol/events/condition";

/**
 * * Refs
 */
const mapRef = ref<HTMLElement | null>(null);
const map = shallowRef<Map | null>(null);
const mapRef2 = ref<HTMLElement | null>(null);
const map2 = shallowRef<Map | null>(null);

/**
 * * Providers
 */

provide("map", map);
provide("map2", map2);

defineExpose({
  map,
});

/**
 * * Functions
 */
const initMap = (): void => {
  useGeographic();
  const view = new View({
    center: [0, 0],
    zoom: 2,
    constrainResolution: true,
  });
  map.value = new Map({
    controls: [],
    view: view,
  });
  map2.value = new Map({
    controls: [],
    view: view,
  });

  const select1 = new Select({ condition: click });
  map.value.addInteraction(select1);
  const select2 = new Select({ condition: click });
  map2.value.addInteraction(select2);
};

/**
 * * States component
 */
onMounted(() => {
  initMap();
  if (mapRef.value && mapRef2.value) {
    map.value?.setTarget(mapRef.value);
    map2.value?.setTarget(mapRef2.value);
  }
});

onUpdated(() => {
  if (map.value) {
    map.value.updateSize();
  }
  if (map2.value) {
    map2.value.updateSize();
  }
});
</script>

<style>
@import "ol/ol.css";
</style>

<style scoped>
.openlayers-container {
  z-index: 0;
  height: min(80vh, 1000px);
  max-width: 50%;
  min-width: 50%;
}
.flex {
  display: flex;
}
</style>
