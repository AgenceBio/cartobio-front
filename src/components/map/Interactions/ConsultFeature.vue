<template><p class="fr-sr-only">La carte est en mode consultation</p></template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed, createApp, watch } from "vue";

import { Map, MapBrowserEvent } from "ol";
import { Feature } from "ol";
import VectorLayer from "ol/layer/Vector";
import VectorSource from "ol/source/Vector";
import GeoJSON from "ol/format/GeoJSON";
import { Style, Fill, Stroke } from "ol/style";
import { Select } from "ol/interaction";
import Tooltip from "ol-ext/overlay/Tooltip";

import { useFeaturesStore } from "@/stores/features.js";
import { legalProjectionSurface, inHa, getCultureIcon, featureName } from "@/utils/features.js";
import { fromCodeCpf } from "@agencebio/rosetta-cultures";

// Utils Geom

import { CartoBioFeature } from "@agencebio/cartobio-types";
import { click } from "ol/events/condition";
import ParcelleTooltip from "../Overlays/ParcelleTooltip.vue";
import { SelectEvent } from "ol/interaction/Select";

/*
 * * Interface
 */

interface Props {
  map: Map;
  vectorSource: VectorSource;
  vectorLayer: VectorLayer<VectorSource>;
}

/*
 * * Props
 */

const props = defineProps<Props>();
/*
 * * Stores
 */

const store = useFeaturesStore();

/*
 * * Refs
 */

const currentTooltipParcelleId = ref<string | null>(null);
const currentTooltipParcelle = ref<string | null>(null);

let selectInteraction: Select | null = null;
let tooltip: Tooltip | null = null;
let currentFeature: Feature | null = null;

/**
 * * Emits
 */
const emit = defineEmits<{
  (e: "selectFeature", value: number | string): void;
}>();

/*
 * * Computed
 */

const numberSelectedFeature = computed(() => {
  return store.selectedModifIds.length;
});

/*
 * * Fonctions :  interactions
 */

/*
 * * Fonctions : Utils
 */
const calculateArea = (feature: CartoBioFeature): string => {
  return inHa(legalProjectionSurface(feature));
};

/**
 * * States fonctions
 */
onMounted(() => {
  selectInteraction = new Select({
    condition: click,
    multi: false,
    layers: [props.vectorLayer],
    style: new Style({
      zIndex: 6,
      fill: new Fill({ color: "rgba(0, 0, 145, 0.3)" }),
      stroke: new Stroke({ width: 3, color: "#6a6af4" }),
    }),
  });
  props.map.addInteraction(selectInteraction);

  selectInteraction.on("select", (e: SelectEvent) => {
    const features = e.target.getFeatures().getArray();

    if (features.length === 1) {
      props.map.getView().fit(features[0].getGeometry(), {
        duration: 1000,
        padding: [50, 50, 50, 50],
      });
      emit("selectFeature", features[0].getId());
    }
  });
});
onUnmounted(() => {
  if (selectInteraction) {
    props.map.removeInteraction(selectInteraction);
  }
});
</script>

<style>
/** Pour afficher la tooltip par dessus les overlays */
.openlayers-culture-overlay {
  z-index: 1;
}
</style>
