<template>
  <div class="pop-in-top delete">
    <div class="title fr-mr-2v">
      <i class="ri-delete-bin-line" aria-hidden="true" />
      <strong class="fr-ml-1v">Supprimer</strong>
    </div>
    <p class="fr-mb-0 fr-text--xs" v-if="numberSelectedFeature">
      Vous avez sélectionné {{ numberSelectedFeature }} parcelle{{ numberSelectedFeature > 1 ? "s" : "" }} à supprimer
    </p>

    <button class="fr-btn fr-icon-check-line fr-btn--icon-right fr-btn--sm" @click="confirmer">Confirmer</button>
    <button class="fr-btn fr-icon-close-line fr-btn--tertiary-no-outline fr-btn--sm" @click="annuler"></button>
  </div>

  <Teleport to="body">
    <DeleteModal v-if="deleteModalMultiple" @submit="handleMultipleDelete" @close="deleteModalMultiple = false" />
  </Teleport>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, computed, ref, inject, Ref } from "vue";
import { storeToRefs } from "pinia";

import { Map } from "ol";
import { Feature } from "ol";
import VectorLayer from "ol/layer/Vector";
import VectorSource from "ol/source/Vector";

import { useFeaturesStore } from "@/stores/features.js";
import { usePreferences } from "@/stores/preferences.js";

import DeleteModal from "@/components/forms/DeleteForm.vue";
import toast from "@/utils/toast.js";

// Utils Geom

import { Fill, Stroke, Style } from "ol/style";
import { useOnline } from "@vueuse/core";

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
  return store.selectedIds.length;
});

/*
 * * Refs
 */

const deleteModalMultiple = ref(false);
const loading: Ref<boolean> = inject("loading", ref(false));
const isOnline = useOnline();

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

  store.selectedIds.forEach((id: number) => {
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

const handleMultipleDelete = async (reason: { code: string; details: string }): Promise<void> => {
  if (numberSelectedFeature.value > 0 && mapPrefs.value.currentMode === "delete") {
    for (const featureId of store.selectedIds) {
      await store.deleteSingleFeature({ id: featureId, reason });

      if (isOnline && loading) {
        loading.value = true;
      } else toast.success(`Parcelles supprimée.`);

      const feature = props.vectorLayer.getSource()?.getFeatureById(featureId);

      if (feature) {
        props.vectorLayer.getSource()?.removeFeature(feature);
      }
    }

    store.unselectAll([]);
    mapPrefs.value.currentMode = "edit";

    return;
  }
};

const annuler = (): void => {
  mapPrefs.value.currentMode = "edit";
};

async function confirmer() {
  deleteModalMultiple.value = !deleteModalMultiple.value;
}

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

<style scoped>
.pop-in-top.delete {
  gap: 10px;
  padding: 5px 10px;
  align-items: center;
}
</style>
