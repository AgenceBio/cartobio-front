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
import * as XLSX from "xlsx";
import cheminFichierXlsx from "@/data/culture_rpg.xlsx?url";
import FillPattern from "ol-ext/style/FillPattern";

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

const COLONNE_CODE = 0;
const COLONNE_RESULTAT = 3;
const NB_LIGNES_ENTETE = 1;

const COLOR_BY_GROUP: Record<string, { fill: string; stroke: string }> = {
  "Grandes Cultures": { fill: "#ffe08280", stroke: "#ffb300" },
  "Prairies et surfaces fourragères": { fill: "#a5d6a780", stroke: "#43a047" },
  Légumes: { fill: "#ff8a6580", stroke: "#e53935" },
  Fruits: { fill: "#ffb74d80", stroke: "#f57c00" },
  Vignes: { fill: "#f48fb180", stroke: "#e91e63" },
  "Plantes à parfums, aromatiques et médicinales et plantes à boissons": { fill: "#4994A980", stroke: "#00acc1" },
  Autres: { fill: "#4374CB80", stroke: "#2C4E9B" },
};

const COLOR_DEFAULT = { fill: "#000000", stroke: "#ffc177" };

let lignesXlsx = null;
let chargementXlsx = null;

async function chargerLignesXlsx() {
  if (lignesXlsx) return lignesXlsx;
  if (!chargementXlsx) {
    chargementXlsx = fetch(cheminFichierXlsx)
      .then((reponse) => reponse.arrayBuffer())
      .then((arrayBuffer) => {
        const classeur = XLSX.read(arrayBuffer, { type: "array" });
        const premiereFeuille = classeur.Sheets[classeur.SheetNames[0]];
        lignesXlsx = XLSX.utils.sheet_to_json(premiereFeuille, { header: 1 }).slice(NB_LIGNES_ENTETE);
        return lignesXlsx;
      });
  }
  return chargementXlsx;
}

/**
 * * Fonctions
 */

function styleFunction(feature: FeatureLike): Style | void {
  const bio = feature.get("bio");
  const codeCulture = feature.get("code_cultu");
  const group = getFromCsvGroup(codeCulture);

  let colors = COLOR_DEFAULT;

  if (group) {
    colors = COLOR_BY_GROUP[group];
  }

  const fill = new Fill({ color: colors.fill });

  return new Style({
    fill: bio
      ? new FillPattern({
          pattern: "dot",
          color: "rgba(40, 166, 54, 1)",
          offset: feature.getProperties().id % 100,
          scale: 4,
          fill,
          size: 1,
          spacing: 2,
        })
      : fill,
    stroke: new Stroke({
      color: colors.stroke,
      width: 1,
    }),
  });
}

function getFromCsvGroup(codeCulture: string) {
  if (!lignesXlsx) return null;
  const ligneTrouvee = lignesXlsx.find((ligne) => String(ligne[COLONNE_CODE]) === String(codeCulture));

  return ligneTrouvee ? ligneTrouvee[COLONNE_RESULTAT] : null;
}

/**
 * * States fonctions
 */

onMounted(async () => {
  await chargerLignesXlsx();

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
            TYPENAME: "LANDUSE.AGRICULTURE2025:parcelles_graphiques",
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
