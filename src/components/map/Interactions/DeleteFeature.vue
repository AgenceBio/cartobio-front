<template>
  <div class="pop-in-top">
    <p v-if="numberSelectedFeature">Vous avez sélectionné {{ numberSelectedFeature }} parcelles à supprimer</p>

    <button class="fr-btn fr-btn--secondary fr-icon-check-line fr-btn--icon-right" @click="confirmer">
      Valider la suppression
    </button>
    <button class="fr-btn fr-icon-close-line fr-btn--tertiary-no-outline" @click="annuler"></button>
  </div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, computed } from "vue";
import { storeToRefs } from "pinia";

import { Map } from "ol";
import { Feature } from "ol";
import VectorLayer from "ol/layer/Vector";
import VectorSource from "ol/source/Vector";

import { useFeaturesStore } from "@/stores/features.js";
import { usePreferences } from "@/stores/preferences.js";
import { DeletionReasonsCode } from "@/utils/features.js";

// Utils Geom
import { deleteParcelle } from "@/cartobio-api.js";

import { Fill, Stroke, Style } from "ol/style";

/*
 * * Interface
 */

interface Props {
  map: Map;
  vectorSource: VectorSource;
  vectorLayer: VectorLayer<VectorSource>;
  recordId: string;
}

/*
 * * Props
 */

const props = defineProps<Props>();

/*
 * * Stores
 */

const preferences = usePreferences();
const store = useFeaturesStore();

const { map: mapPrefs } = storeToRefs(preferences);

let deleteLayer: VectorLayer | null = null;

/*
 * * Computed
 */

const numberSelectedFeature = computed(() => {
  return store.selectedModifIds.length;
});

/*
 * * Fonctions :  interactions
 */

const deleteSelected = (): void => {
  const deleteSource = new VectorSource();

  const redStyle = new Style({
    fill: new Fill({
      color: "rgba(255, 0, 0, 0.4)",
    }),
    stroke: new Stroke({
      color: "red",
      width: 3,
    }),
  });

  deleteLayer = new VectorLayer({
    source: deleteSource,
    style: redStyle,
    zIndex: 5,
  });

  store.selectedModifIds.forEach((id: number) => {
    const feature = props.vectorSource.getFeatureById(id);
    if (feature) {
      const clonedGeometry = feature.getGeometry()?.clone();
      const highlightFeature = new Feature({
        geometry: clonedGeometry,
        originalId: id,
        isHighlight: true,
      });
      deleteSource.addFeature(highlightFeature);
    }
  });

  props.map.addLayer(deleteLayer);
};

/*
 * * Fonctions : Data
 */

const confirmer = async (): Promise<void> => {
  if (numberSelectedFeature.value > 0 && mapPrefs.value.currentMode === "delete") {
    let result = null;
    for (const featureId of store.selectedModifIds) {
      result = await deleteParcelle(props.recordId, featureId, {
        reason: { code: DeletionReasonsCode.OTHER, details: "Test" },
      });

      const feature = props.vectorLayer.getSource()?.getFeatureById(featureId);

      if (feature) {
        props.vectorLayer.getSource()?.removeFeature(feature);
      }
    }

    if (result) {
      store.setAll(result.parcelles.features);
    }

    store.setSelectedModifiedFeature([]);
    mapPrefs.value.currentMode = "edit";

    return;
  }
};

const annuler = (): void => {
  store.setSelectedModifiedFeature([]);
  mapPrefs.value.currentMode = "edit";
};

/**
 * * States fonctions
 */

onMounted(() => {
  deleteSelected();
});

onUnmounted(() => {
  if (deleteLayer) {
    props.map.removeLayer(deleteLayer);
  }
});
</script>
