<!-- eslint-disable vue/valid-template-root -->
<template></template>

<script lang="ts" setup>
import { onMounted, onUnmounted, inject, Ref } from "vue";
import VectorTileLayer from "ol/layer/VectorTile";
import VectorTileSource from "ol/source/VectorTile";
import MVT from "ol/format/MVT";
import { Style, Stroke, Fill } from "ol/style";
import { Map as OlMap } from "ol";
import { FeatureLike } from "ol/Feature";
import FillPattern from "ol-ext/style/FillPattern";
const { VUE_APP_CARTOBIO_PARCELLES_YEAR } = import.meta.env;

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

let cartobioParcellesLayer: VectorTileLayer | null = null;

/**
 * * Constantes
 */

const MAX_RESOLUTION = 42;

/**
 * * Fonctions
 */

function parcelleStyle(feature: FeatureLike, resolution: number): Style | void {
  let lineWidth = 0;
  if (resolution < 200) {
    lineWidth = 1;
  } else if (resolution < 500) {
    lineWidth = 0.5;
  }

  return new Style({
    fill: new FillPattern({
      pattern: "hatch",
      ratio: 1,
      color: "rgba(40, 166, 54, 1)",
      offset: feature.getProperties().id % 100,
      scale: 2,
      fill: new Fill({ color: "rgba(0, 0, 0, 0)" }),
      size: lineWidth,
      spacing: 6,
      angle: 45,
    }),
    stroke: new Stroke({ color: "rgba(40, 166, 54, 1)", width: lineWidth }),
  });
}

/**
 * * States fonctions
 */

onMounted(() => {
  cartobioParcellesLayer = new VectorTileLayer({
    declutter: true,
    maxResolution: MAX_RESOLUTION,
    zIndex: 2,
    source: new VectorTileSource({
      format: new MVT(),
      url:
        "https://cartobio.agencebio.org/cartobio-parcelles/" +
        VUE_APP_CARTOBIO_PARCELLES_YEAR +
        "/" +
        "{z}/{x}/{y}.pbf",
      minZoom: 10,
      maxZoom: 14,
    }),
    style: parcelleStyle,
  });

  cartobioParcellesLayer.set("name", "cartobio-parcelles-layer");
  map.value.addLayer(cartobioParcellesLayer);
});

onUnmounted(() => {
  if (!map) return;
  map.value.getLayers().forEach((layer) => {
    if (layer && layer.get("name") === "cartobio-parcelles-layer") {
      map.value.removeLayer(layer);
    }
  });
});
</script>
