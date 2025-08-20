<!-- eslint-disable vue/valid-template-root -->
<template></template>

<script lang="ts" setup>
import { onMounted, onUnmounted, inject, Ref } from "vue";
import VectorTileLayer from "ol/layer/VectorTile";
import VectorTileSource from "ol/source/VectorTile";
import MVT from "ol/format/MVT";
import { Style, Stroke, Fill, Text } from "ol/style";
import { Map as OlMap } from "ol";
import { FeatureLike } from "ol/Feature";

/**
 * * Injects
 */

const map = inject<Ref<OlMap>>("map");

if (!map) {
  throw new Error("Pas de map disponible");
}

/**
 * * Refs
 */

let cadastreLayer: VectorTileLayer | null = null;

/**
 * * Fonctions
 */

function parcelleStyle(feature: FeatureLike, resolution: number): Style | void {
  if (feature.get("layer") != "parcelles") {
    return;
  }
  const section = feature.get("section") || "";
  const numero = feature.get("numero") || "";
  const label = `${section}.${numero}`.trim();
  const showLabel = label.length > 1 && resolution < 50;

  const stroke = new Stroke({
    color: "black",
    width: 0.5,
    lineCap: "butt",
    lineJoin: "miter",
    miterLimit: 2,
  });

  const styleOptions: ConstructorParameters<typeof Style>[0] = {
    stroke,
    fill: new Fill({ color: "rgba(0, 0, 0, 0)" }),
  };

  if (showLabel) {
    const text = new Text({
      text: label || "test",
      font: '12px "Noto Sans", sans-serif',
      fill: new Fill({ color: "rgba(0, 0, 0, 1)" }),
      stroke: new Stroke({
        color: "#fff6f1",
        width: 1,
      }),
      placement: "point",
      rotation: 0,
      scale: 1,
    });
    styleOptions.text = text;
  }

  return new Style(styleOptions);
}

/**
 * * States fonctions
 */

onMounted(() => {
  cadastreLayer = new VectorTileLayer({
    declutter: true,
    zIndex: 2,
    source: new VectorTileSource({
      format: new MVT(),
      url: "https://openmaptiles.geo.data.gouv.fr/data/cadastre/{z}/{x}/{y}.pbf",
      maxZoom: 16,
    }),
    style: parcelleStyle,
  });

  cadastreLayer.set("name", "plan-cadastre-layer");
  map.value.addLayer(cadastreLayer);
});

onUnmounted(() => {
  if (!map) return;
  map.value.getLayers().forEach((layer) => {
    if (layer && layer.get("name") === "plan-cadastre-layer") {
      map.value.removeLayer(layer);
    }
  });
});
</script>
