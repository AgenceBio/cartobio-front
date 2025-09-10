<!-- eslint-disable vue/valid-template-root -->
<template></template>

<script lang="ts" setup>
import { onMounted, onUnmounted, inject, Ref } from "vue";
import { Map as OlMap } from "ol";
import VectorTileLayer from "ol/layer/VectorTile.js";
import { applyStyle } from "ol-mapbox-style";
import baseStyle from "@/map-styles/base.json";

/**
 * * Props
 */

const props = defineProps<{
  isCompare?: boolean;
}>();

/**
 * * Injects
 */

const map = inject<Ref<OlMap>>(!props.isCompare ? "map" : "map2");
if (!map) {
  throw new Error("Pas de map disponible");
}

/**
 * * Refs
 */
let layer: VectorTileLayer | null = null;

/**
 * * States fonctions
 */

onMounted(() => {
  layer = new VectorTileLayer({
    declutter: true,
    zIndex: 0,
    background: "white",
    preload: 0,
    visible: true,
  });
  layer.set("name", "plan-base-layer");

  applyStyle(layer, baseStyle);

  map.value.addLayer(layer);
});

onUnmounted(() => {
  if (!map) return;
  map.value.getLayers().forEach((l) => {
    if (l && l.get("name") === "plan-base-layer") {
      map.value.removeLayer(l);
    }
  });
});
</script>
