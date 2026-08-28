<template><p class="fr-sr-only">La carte est en mode consultation</p></template>

<script setup lang="ts">
import { onMounted, onUnmounted, ref, watch } from "vue";

import { useFeaturesStore } from "@/stores/features.js";

import { Map } from "ol";
import VectorLayer from "ol/layer/Vector";
import VectorSource from "ol/source/Vector";
import { Style, Fill, Stroke } from "ol/style";
import { Select } from "ol/interaction";
import { Feature } from "ol";

import { click, platformModifierKey } from "ol/events/condition";
import { SelectEvent } from "ol/interaction/Select";
import { MapBrowserEvent } from "ol";

/*
 * * Interface
 */

interface Props {
  map: Map;
  vectorSource: VectorSource;
  vectorLayer: VectorLayer<VectorSource>;
  isCompare?: boolean;
  noSelect?: boolean;
}

/*
 * * Stores
 */

const store = useFeaturesStore();

/*
 * * Props
 */

const props = withDefaults(defineProps<Props>(), {
  isCompare: false,
  noSelect: false,
});

/*
 * * Refs
 */

let selectInteraction: Select | null = null;
let isInternalUpdate = false;

/**
 * * Emits
 */
const emit = defineEmits<{
  (e: "selectFeature", value: number | string): void;
}>();

/**
 * * Watchers
 */
watch(
  () => store.selectedIds,
  (newSelectedIds) => {
    if (!selectInteraction || isInternalUpdate || props.isCompare) return;

    selectInteraction.getFeatures().clear();

    if (newSelectedIds && newSelectedIds.length > 0) {
      newSelectedIds.forEach((id) => {
        const feature = props.vectorSource.getFeatureById(id);
        if (feature) {
          selectInteraction.getFeatures().push(feature);
        }
      });
    }
  },
  { deep: true },
);

const isSyncingSelection = ref(false);

const syncSelection = () => {
  if (isSyncingSelection.value) return;

  isSyncingSelection.value = true;

  const selected = selectInteraction.getFeatures();

  selected.clear();

  store.selectedIds.forEach((id) => {
    const feature = props.vectorSource.getFeatureById(id);

    if (feature) {
      selected.push(feature);
    }
  });

  isSyncingSelection.value = false;
};

/*
 * * Fonctions
 */

const handleMapClick = (evt: MapBrowserEvent) => {
  const clickedFeatures: Feature[] = [];
  props.map.forEachFeatureAtPixel(
    evt.pixel,
    (feature) => {
      if (feature instanceof Feature) {
        clickedFeatures.push(feature);
      }
      return false;
    },
    {
      layerFilter: (layer) => layer === props.vectorLayer,
    },
  );

  if (clickedFeatures.length > 0) {
    const clickedFeature = clickedFeatures[0];
    const clickedId = clickedFeature.getId();
    const isAlreadySelected = selectInteraction
      ?.getFeatures()
      .getArray()
      .some((f) => f.getId() === clickedId);

    if (isAlreadySelected && selectInteraction?.getFeatures().getLength() === 1) {
      emit("selectFeature", clickedId);
    }
  }
};

/**
 * * States fonctions
 */
onMounted(() => {
  if (props.isCompare) return;
  if (props.noSelect) return;

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

  props.map.on("click", handleMapClick);

  selectInteraction.on("select", (e: SelectEvent) => {
    isInternalUpdate = true;
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

    setTimeout(() => {
      isInternalUpdate = false;
    }, 0);

    props.vectorSource.on("change", syncSelection);
  });

  if (store.selectedIds && store.selectedIds.length > 0) {
    store.selectedIds.forEach((id) => {
      const feature = props.vectorSource.getFeatureById(id);
      if (feature) {
        selectInteraction.getFeatures().push(feature);
      }
    });
  }
});

onUnmounted(() => {
  props.map.un("click", handleMapClick);

  if (selectInteraction) {
    props.map.removeInteraction(selectInteraction);
  }
  props.vectorSource.un("change", syncSelection);
});
</script>

<style>
.openlayers-culture-overlay {
  z-index: 1;
}
</style>
