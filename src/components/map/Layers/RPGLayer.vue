<!-- eslint-disable vue/valid-template-root -->
<template></template>

<script lang="ts" setup>
import { onMounted, onUnmounted, inject, Ref } from "vue";
import VectorTileLayer from "ol/layer/VectorTile";
import VectorTileSource from "ol/source/VectorTile";
import MVT from "ol/format/MVT";
import { Style, Stroke, Fill } from "ol/style";
import { FeatureLike } from "ol/Feature";
import { Map as OlMap } from "ol";

/**
 * * Injects
 */

const map = inject<Ref<OlMap>>("map");
if (!map) {
  throw new Error("Map instance is not provided");
}

/**
 * * Refs
 */

let rpgLayer: VectorTileLayer | null = null;

/**
 * * Fonctions
 */

function styleFunction(feature: FeatureLike, resolution: number): Style | null {
  const layerName = feature.get("layer");
  if (layerName !== "rpg2023") return null;

  const BIO = feature.get("BIO");
  const CODE_CULTU = feature.get("CODE_CULTU");

  let fillColor = "#ffd6a4";
  if (BIO === 1) {
    fillColor = "#9fe3d2";
  } else if (
    ["J5M", "J6S", "J6P", "JNO", "PRL", "PPH", "SPL", "SPH", "BOP", "CAE", "CEE", "ROS"].includes(CODE_CULTU)
  ) {
    fillColor = "#fff1bd";
  }

  let strokeColor = "#ffc177";
  if (BIO === 1) {
    strokeColor = "#54cdaf";
  } else if (
    [
      "GFP",
      "PTR",
      "BOP",
      "BRH",
      "BRO",
      "CAE",
      "CEE",
      "CRA",
      "DTY",
      "FET",
      "FLO",
      "J5M",
      "J6P",
      "J6S",
      "JNO",
      "MLG",
      "PAT",
      "PCL",
      "PRL",
      "PPH",
      "RGA",
      "ROS",
      "SPH",
      "SPL",
      "XFE",
    ].includes(CODE_CULTU)
  ) {
    strokeColor = "#ffe586";
  }

  let lineWidth = 0;
  if (resolution < 200) {
    lineWidth = 1;
  } else if (resolution < 500) {
    lineWidth = 0.5;
  }

  return new Style({
    fill: new Fill({ color: fillColor }),
    stroke: new Stroke({
      color: strokeColor,
      width: lineWidth,
    }),
  });
}

/**
 * * States fonctions
 */

onMounted(() => {
  rpgLayer = new VectorTileLayer({
    declutter: true,
    zIndex: 1,
    source: new VectorTileSource({
      format: new MVT(),
      url: "https://cartobio.agencebio.org/tiles/rpg-2023/{z}/{x}/{y}.pbf",
      crossOrigin: "Anonymous",
      maxZoom: 16,
    }),
    style: styleFunction,
  });

  rpgLayer.set("name", "plan-rpg-layer");
  map.value.addLayer(rpgLayer);
});

onUnmounted(() => {
  if (!map) return;
  map.value.getLayers().forEach((layer) => {
    if (layer && layer.get("name") === "plan-rpg-layer") {
      map.value.removeLayer(layer);
    }
  });
});
</script>
