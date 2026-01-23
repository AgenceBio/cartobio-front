<template><p class="fr-sr-only">La carte est en mode consultation</p></template>

<script setup lang="ts">
import { onMounted, onUnmounted } from "vue";

import { useFeaturesStore } from "@/stores/features.js";

import { Map } from "ol";
import VectorLayer from "ol/layer/Vector";
import VectorSource from "ol/source/Vector";
import { Style, Fill, Stroke } from "ol/style";
import { Select } from "ol/interaction";

// Utils Geom

import { click, platformModifierKey } from "ol/events/condition";
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
 * * Stores
 */

const store = useFeaturesStore();

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
    toggleCondition: platformModifierKey, // Ctrl / Cmd
    multi: true,
    layers: [props.vectorLayer],
    style: new Style({
      fill: new Fill({ color: "rgba(88, 197, 207, 0.6)" }),
      stroke: new Stroke({ width: 3, color: "rgba(65, 156, 164, 1)" }),
    }),
  });
  props.map.addInteraction(selectInteraction);

  selectInteraction.on("select", (e: SelectEvent) => {
    const selected = e.target.getFeatures().getArray();

    if (selected.length === 1) {
      store.unselectAll();
      store.select(selected[0].getId());
      emit("selectFeature", selected[0].getId());
    } else if (selected.length > 1) {
      store.unselectAll();
      store.setSelectedIds(selected.map((f) => f.getId()));
      emit("selectFeature", null);
    } else {
      store.unselectAll();
      emit("selectFeature", null);
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
