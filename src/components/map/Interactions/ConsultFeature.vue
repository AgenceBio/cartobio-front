<template><p class="fr-sr-only">La carte est en mode consultation</p></template>

<script setup lang="ts">
import { onMounted, onUnmounted } from "vue";

import { Map } from "ol";
import VectorLayer from "ol/layer/Vector";
import VectorSource from "ol/source/Vector";
import { Style, Fill, Stroke } from "ol/style";
import { Select } from "ol/interaction";

// Utils Geom

import { click } from "ol/events/condition";
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
 * * Refs
 */

let selectInteraction: Select | null = null;

/**
 * * Emits
 */
const emit = defineEmits<{
  (e: "selectFeature", value: number | string): void;
}>();

/**
 * * States fonctions
 */
onMounted(() => {
  selectInteraction = new Select({
    condition: click,
    multi: false,
    layers: [props.vectorLayer],
    style: new Style({
      fill: new Fill({ color: "rgba(88, 197, 207, 0.6)" }),
      stroke: new Stroke({ width: 3, color: "rgba(65, 156, 164, 1)" }),
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
