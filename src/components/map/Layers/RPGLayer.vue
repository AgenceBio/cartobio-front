<!-- eslint-disable vue/valid-template-root -->
<template></template>

<script lang="ts" setup>
import { onMounted, onUnmounted, inject, Ref } from "vue";
import VectorLayer from "ol/layer/Vector";
import VectorSource from "ol/source/Vector";
import GeoJSON from "ol/format/GeoJSON";
import { Style, Stroke, Fill } from "ol/style";
import { FeatureLike } from "ol/Feature";
import { Map as OlMap } from "ol";
import { bbox as bboxStrategy } from "ol/loadingstrategy";

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
  throw new Error("Map instance is not provided");
}

/**
 * * Refs
 */

let rpgLayer: VectorLayer<VectorSource> | null = null;

/**
 * * Constantes
 */

const MAX_RESOLUTION = 42;

/**
 * * Fonctions
 */

function styleFunction(feature: FeatureLike, resolution: number): Style | void {
  const bio = feature.get("bio") || feature.get("BIO");
  const codeCulture = feature.get("code_cultu") || feature.get("CODE_CULTU");

  let fillColor = "#ffd6a4";
  if (bio === 1 || bio === "1" || bio === true) {
    fillColor = "#9fe3d2";
  } else if (
    ["J5M", "J6S", "J6P", "JNO", "PRL", "PPH", "SPL", "SPH", "BOP", "CAE", "CEE", "ROS"].includes(codeCulture)
  ) {
    fillColor = "#fff1bd";
  }

  let strokeColor = "#ffc177";
  if (bio === 1 || bio === "1" || bio === true) {
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
    ].includes(codeCulture)
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
  rpgLayer = new VectorLayer({
    zIndex: 1,
    maxResolution: MAX_RESOLUTION,
    source: new VectorSource({
      format: new GeoJSON(),
      url: "https://data.geopf.fr/wfs/ows",
      loader: function (extent, resolution, projection) {
        const url =
          "https://data.geopf.fr/wfs/ows?" +
          new URLSearchParams({
            SERVICE: "WFS",
            VERSION: "2.0.0",
            REQUEST: "GetFeature",
            TYPENAME: "RPG.2024:parcelles_graphiques",
            OUTPUTFORMAT: "application/json",
            SRSNAME: projection.getCode(),
            BBOX: extent.join(",") + "," + projection.getCode(),
          });

        fetch(url)
          .then((response) => response.json())
          .then((data) => {
            const features = new GeoJSON().readFeatures(data);
            this.addFeatures(features);
          });
      },
      strategy: bboxStrategy,
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
