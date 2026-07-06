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
import cheminFichierXlsx from "@/data/culture_rpg.xlsx";


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
  "Grandes Cultures": { fill: "#ffe082", stroke: "#ffb300" },
  "Prairies et surfaces fourragères": { fill: "#a5d6a7", stroke: "#43a047" },
  Légumes: { fill: "#ff8a65", stroke: "#e53935" },
  Fruits: { fill: "#ffb74d", stroke: "#f57c00" },
  Vignes: { fill: "#f48fb1", stroke: "#e91e63" },
  "Plantes à parfums, aromatiques et médicinales et plantes à boissons": { fill: "#80deea", stroke: "#00acc1" },
  Autres: { fill: "#b39ddb", stroke: "#5e35b1" },
};

const COLOR_DEFAULT = { fill: "#000000", stroke: "#ffc177" };
const COLOR_BIO = { fill: "#9fe3d2", stroke: "#54cdaf" };

let lignesXlsx: any[] | null = null;
let chargementXlsx: Promise<any[]> | null = null;

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

function styleFunction(feature: FeatureLike, resolution: number): Style | void {
  const bio = feature.get("bio") || feature.get("BIO");

  const codeCulture = feature.get("code_cultu") || feature.get("CODE_CULTU");

  let colors = COLOR_DEFAULT;

  if (bio === 1 || bio === "1" || bio === true) {
    colors = COLOR_BIO;
  } else {
    const group = getFromCsvGroup(codeCulture);
    if (group) {
      colors = COLOR_BY_GROUP[group];
    }
  }

  let lineWidth = 0;
  if (resolution < 200) {
    lineWidth = 1;
  } else if (resolution < 500) {
    lineWidth = 0.5;
  }

  return new Style({
    fill: new Fill({ color: colors.fill }),
    stroke: new Stroke({
      color: colors.stroke,
      width: lineWidth,
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
