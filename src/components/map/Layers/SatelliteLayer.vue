<!-- eslint-disable vue/valid-template-root -->
<template></template>

<script lang="ts" setup>
import { onMounted, onUnmounted, inject, Ref } from "vue";
import TileLayer from "ol/layer/Tile";
import WMTS from "ol/source/WMTS";
import WMTSTileGrid from "ol/tilegrid/WMTS";
import { Map as OlMap } from "ol";

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

let satelliteLayer: TileLayer<WMTS> | null = null;

/**
 * * States fonctions
 */

onMounted(() => {
  const ignTileGrid = new WMTSTileGrid({
    origin: [-20037508, 20037508],
    resolutions: [
      156543.03392804103, 78271.5169640205, 39135.75848201024, 19567.879241005125, 9783.939620502562, 4891.969810251281,
      2445.9849051256406, 1222.9924525628203, 611.4962262814101, 305.74811314070485, 152.87405657035254,
      76.43702828517625, 38.218514142588134, 19.109257071294063, 9.554628535647034, 4.777314267823517,
      2.3886571339117584, 1.1943285669558792, 0.5971642834779396, 0.29858214173896974, 0.14929107086948493,
      0.07464553543474241,
    ],
    matrixIds: Array.from({ length: 20 }, (_, i) => i.toString()),
  });

  const ignAttributions =
    '<a href="https://www.ign.fr/geoplateforme" target="_blank">' +
    '<img src="https://data.geopf.fr/annexes/ressources/logos/ign.gif" ' +
    'title="Institut national de l\'information géographique et forestière" alt="IGN"></a>';

  satelliteLayer = new TileLayer({
    source: new WMTS({
      url: "https://data.geopf.fr/wmts",
      layer: "ORTHOIMAGERY.ORTHOPHOTOS",
      matrixSet: "PM",
      format: "image/jpeg",
      crossOrigin: "Anonymous",
      projection: "EPSG:3857",
      tileGrid: ignTileGrid,
      style: "normal",
      attributions: ignAttributions,
    }),
    visible: true,
    zIndex: 0,
    properties: {
      code: "OrthophotosIGN",
      groupe: "IGN_BASE_LAYER",
      ordre: 1,
    },
    background: "white",
  });

  satelliteLayer.set("name", "plan-satellite-layer");
  map.value.addLayer(satelliteLayer);
});

onUnmounted(() => {
  if (!map) return;
  map.value.getLayers().forEach((layer) => {
    if (layer && layer.get("name") === "plan-satellite-layer") {
      map.value.removeLayer(layer);
    }
  });
});
</script>
