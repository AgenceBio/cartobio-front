<template><p class="fr-sr-only">La carte est en mode consultation</p></template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed, createApp } from "vue";

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

// Interactions

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

/*
 * * Computed
 */

const numberSelectedFeature = computed(() => {
  return store.selectedModifIds.length;
});

/*
 * * Fonctions :  interactions
 */

const createParcelleTooltip = (feature: Feature) => {
  if (currentTooltipParcelleId.value === feature.get("id")) {
    return currentTooltipParcelle.value;
  }

  const cartobioFeature = new GeoJSON().writeFeatureObject(feature) as CartoBioFeature;
  const name = featureName(cartobioFeature);
  const area = calculateArea(cartobioFeature);
  const codePostale = feature.get("COMMUNE");
  const ville = feature.get("COMMUNE_LABEL");
  const cultures: { CPF: "string" }[] = feature.get("cultures") || [];
  const icon = getCultureIcon(cultures[0]?.CPF);
  const libelleCulture = fromCodeCpf(cultures[0]?.CPF);

  const element = document.createElement("div");
  const app = createApp(ParcelleTooltip, {
    name,
    area,
    codePostale,
    ville,
    icon,
    libelleCulture: libelleCulture?.libelle_code_cpf,
  });

  app.mount(element);

  currentTooltipParcelle.value = element.innerHTML;
  currentTooltipParcelleId.value = feature.get("id");

  return element.innerHTML;
};
/*
 * * Fonctions : Data
 */

const handlePointerMove = (e: MapBrowserEvent) => {
  if (numberSelectedFeature.value > 0) {
    props.map.removeOverlay(tooltip);
    return;
  }
  const feature = props.map.forEachFeatureAtPixel(
    e.pixel,
    (feature) => {
      return feature.clone();
    },
    { layerFilter: (l) => l.get("name") === props.vectorLayer.get("name") },
  ) as Feature;
  if (feature) {
    if (feature !== currentFeature) {
      if (currentFeature == null) {
        props.map.addOverlay(tooltip);
      }
      tooltip.setFeature(feature);
    }
  } else if (currentFeature) {
    props.map.removeOverlay(tooltip);
  }
  currentFeature = feature;
};

const handlePointLeave = () => {
  if (currentFeature) {
    props.map.removeOverlay(tooltip);
    currentFeature = null;
  }
};

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
    }
  });
  tooltip = new Tooltip({
    className: "openlayers-culture-overlay",
    closeBox: false,
    positioning: "bottom-center",
    offset: [0, -25],
    getHTML: createParcelleTooltip,
    map: props.map,
  });

  props.map.on("pointermove", handlePointerMove);

  props.map.getTargetElement().addEventListener("pointerleave", handlePointLeave);
});
onUnmounted(() => {
  props.map.un("pointermove", handlePointerMove);
  props.map.getTargetElement().removeEventListener("pointerleave", handlePointLeave);

  if (selectInteraction) {
    props.map.removeInteraction(selectInteraction);
  }

  if (tooltip) {
    props.map.removeOverlay(tooltip);
  }
});
</script>

<style>
/** Pour afficher la tooltip par dessus les overlays */
.openlayers-culture-overlay {
  z-index: 1;
}
</style>
