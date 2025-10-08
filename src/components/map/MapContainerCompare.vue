<template>
  <div class="flex" role="group" aria-label="Comparaison de deux cartes interactives">
    <div ref="mapRef" aria-label="Carte gauche, première version" class="openlayers-container fr-ml-2w">
      <slot name="map1" v-if="map" />
    </div>

    <div class="separator"></div>

    <div ref="mapRef2" class="openlayers-container" aria-label="Carte droite, seconde version">
      <slot name="map2" v-if="map2" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, provide, shallowRef, onUpdated } from "vue";
import { Map, View } from "ol";
import { useGeographic } from "ol/proj";
import { Select } from "ol/interaction";
import { click } from "ol/events/condition";

const mapRef = ref<HTMLElement | null>(null);
const map = shallowRef<Map | null>(null);
const mapRef2 = ref<HTMLElement | null>(null);
const map2 = shallowRef<Map | null>(null);

provide("map", map);
provide("map2", map2);

defineExpose({ map, map2 });

const initMap = (): void => {
  useGeographic();
  const view = new View({
    center: [0, 0],
    zoom: 2,
    constrainResolution: true,
  });
  map.value = new Map({ controls: [], view });
  map2.value = new Map({ controls: [], view });

  const select1 = new Select({ condition: click });
  map.value.addInteraction(select1);
  const select2 = new Select({ condition: click });
  map2.value.addInteraction(select2);
};

onMounted(() => {
  initMap();
  if (mapRef.value && mapRef2.value) {
    map.value?.setTarget(mapRef.value);
    map2.value?.setTarget(mapRef2.value);
  }
});

onUpdated(() => {
  map.value?.updateSize();
  map2.value?.updateSize();
});

const diffOnMap = ref<"map1" | "map2" | null>(null);

onMounted(() => {
  if (map.value) {
    map.value.getLayers().on("add", (e) => {
      if (e.element.get("name") === "diffLayer") {
        diffOnMap.value = "map1";
      }
    });
    map.value.getLayers().on("remove", (e) => {
      if (e.element.get("name") === "diffLayer") {
        diffOnMap.value = null;
      }
    });
  }

  if (map2.value) {
    map2.value.getLayers().on("add", (e) => {
      if (e.element.get("name") === "diffLayer") {
        diffOnMap.value = "map2";
      }
    });
    map2.value.getLayers().on("remove", (e) => {
      if (e.element.get("name") === "diffLayer") {
        diffOnMap.value = null;
      }
    });
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
  flex: 1;
}

.flex {
  display: flex;
}

.separator {
  position: relative;
  width: 3px;
  background: white;
  z-index: 0;
}
</style>
