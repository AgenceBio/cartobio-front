<!-- eslint-disable vue/valid-template-root -->
<template>
  <div>
    <Component
      :is="editForm"
      v-if="showDetailsModal"
      :feature="feature"
      @close="showDetailsModal = false"
      icon="fr-icon-add-line"
      data-content-name="Modale de confirmation d'ajout"
      required-name
    >
      <template #title>Créer ma parcelle</template>
    </Component>

    <div
      v-if="mergeFeature || mapPrefs.currentMode === 'delete' || mapPrefs.currentMode === 'merge'"
      class="pop-in-top"
    >
      <span v-if="mergeFeature">Surface de la parcelle fusionné {{ calculateArea(mergeFeature) }} ha</span>
      <span v-if="numberSelectedFeature && mapPrefs.currentMode === 'delete'">
        Vous avez sélectionné {{ numberSelectedFeature }} parcelles à supprimer
      </span>

      <button class="fr-btn fr-btn--secondary fr-icon-check-line fr-btn--icon-right" @click="confirmer()">
        Valider {{ mergeFeature ? "et compléter" : "la suppression" }}
      </button>
      <button class="fr-btn fr-icon-close-line fr-btn--tertiary-no-outline" @click="annuler()"></button>
    </div>

    <div v-if="invalidDrawing && mapPrefs.currentMode === 'draw'" class="pop-in-top">
      <span> Votre parcelle a été rogner pour respecter les règles</span>
      <button class="fr-btn fr-btn--secondary fr-icon-check-line fr-btn--icon-right" @click="confirmCorrection()">
        Valider
      </button>
      <button class="fr-btn fr-icon-close-line fr-btn--tertiary-no-outline" @click="cancelDraw()"></button>
    </div>
    <div v-if="errorDrawing && !invalidDrawing && mapPrefs.currentMode === 'draw'" class="pop-in-top">
      <span> Votre parcelle est invalide. Veuillez recommencer !</span>
      <button class="fr-btn fr-icon-close-line fr-btn--tertiary-no-outline" @click="cancelDraw()"></button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, onUnmounted, inject, Ref, computed } from "vue";
import { storeToRefs } from "pinia";

import { Map as OlMap } from "ol";
import { Feature } from "ol";
import VectorLayer from "ol/layer/Vector";
import VectorSource from "ol/source/Vector";
import GeoJSON from "ol/format/GeoJSON";
import { Style, Text, Fill, Stroke } from "ol/style";
import ModifyFeature from "ol-ext/interaction/ModifyFeature";
import { Select, Draw, Interaction } from "ol/interaction";
import UndoRedo from "ol-ext/interaction/UndoRedo";
import { DragPan, MouseWheelZoom, DoubleClickZoom } from "ol/interaction";

import { useFeaturesStore } from "@/stores/features.js";
import { usePreferences } from "@/stores/preferences.js";
import { legalProjectionSurface, inHa } from "@/utils/features.js";

// Interactions
import { mergeInteractions, clearMergeLayer } from "../interactions/merge";
import { drawInteraction } from "../interactions/draw";
import { divideInteraction } from "../interactions/divide";
import { modifyInteraction } from "../interactions/modify";

// Utils Geom
import { addParcelleVerif } from "@/cartobio-api.js";

import CertificationBodyEditForm from "@/components/forms/SingleItemCertificationBodyForm.vue";

/*
 * * Interface
 */

interface Props {
  name?: string;
  interactive?: boolean;
  recordId: string;
  isDraw: boolean;
}

interface Interactions {
  select: Select | null;
  modify: typeof ModifyFeature | null;
  draw: Draw | null;
  split: any | null;
  undoRedo: typeof UndoRedo | null;
}

/*
 * * Props
 */

const props = withDefaults(defineProps<Props>(), {
  name: "parcellaire-operateur",
  interactive: false,
});

/*
 * * Stores
 */

const preferences = usePreferences();
const store = useFeaturesStore();

const { map: mapPrefs } = storeToRefs(preferences);

/*
 * * Injects
 */

const map = inject<Ref<OlMap>>("map");

/*
 * * Refs
 */

const vectorSource = ref<VectorSource>(null);
const vectorLayer = ref<VectorLayer<VectorSource>>(null);
const interactions = ref<Interactions>({
  select: null,
  modify: null,
  draw: null,
  split: null,
  undoRedo: null,
});

const showDetailsModal = ref(false);
const feature = ref<Feature | null>(null);
const mergeFeature = ref<Feature | null>(null);
const correctedGeometry = ref<any>(null);

// Refs draw interaction
const invalidDrawing = ref<boolean>(false);
const errorDrawing = ref<boolean>(false);

/*
 * * Computed
 */

const numberSelectedFeature = computed(() => {
  return store.selectedModifIds.length;
});

/*
 * * Constantes
 */

const previewStyle = new Style({
  stroke: new Stroke({
    color: "rgba(139, 248, 231, 1)",
    width: 3,
    lineDash: [10, 5],
  }),
  fill: new Fill({
    color: "rgba(8, 41, 67, 0.7)",
  }),
});

const errorStyle = new Style({
  stroke: new Stroke({
    color: "rgba(255, 0, 0, 1)",
    width: 3,
    lineDash: [10, 5],
  }),
  fill: new Fill({
    color: "rgba(255, 0, 0, 0.3)",
  }),
});

const previewSource = new VectorSource();
const previewLayer = new VectorLayer({
  source: previewSource,
  style: previewStyle,
});

/*
 * * Components
 */

const editForm = CertificationBodyEditForm;

/*
 * * Fonctions :  interactions
 */

const initDraw = async (): Promise<void> => {
  drawInteraction(
    map.value,
    vectorLayer.value,
    vectorSource.value,
    updateFeatureStoreCollection,
    showDetailsModal,
    feature,
  );
};

const initModify = (): void => {
  const store = useFeaturesStore();
  modifyInteraction(map.value, vectorLayer.value, store);
};

const deleteSelected = (): void => {
  const highlightSource = new VectorSource();

  const redStyle = new Style({
    fill: new Fill({
      color: "rgba(255, 0, 0, 0.4)",
    }),
    stroke: new Stroke({
      color: "red",
      width: 3,
    }),
  });

  const highlightLayer = new VectorLayer({
    source: highlightSource,
    style: redStyle,
    zIndex: 5,
    name: "layer-delete",
  });

  store.selectedModifIds.forEach((id) => {
    const feature = vectorSource.value.getFeatureById(id);
    if (feature) {
      const clonedGeometry = feature.getGeometry().clone();
      const highlightFeature = new Feature({
        geometry: clonedGeometry,
        originalId: id,
        isHighlight: true,
      });
      highlightSource.addFeature(highlightFeature);
    }
  });

  map.value.addLayer(highlightLayer);
};

const initDivide = (): void => {
  divideInteraction(map.value, vectorLayer.value, store);
};

const initCut = (): void => {
  // TODO : Reprendre fonctionnement existant de cut Border et réadpater pour la bonne utilisation de celle-ci avec OpenLayers
};

const mergeFeatures = (): void => {
  const store = useFeaturesStore();
  const geojsonFormat = new GeoJSON();

  const resultMerge = mergeInteractions(vectorSource.value, map.value, store.selectedModifIds);
  if (resultMerge) {
    mergeFeature.value = geojsonFormat.writeFeatureObject(resultMerge, {});
  } else {
    console.warn("Afficher message d'erreur");
    clearMergeLayer(map.value);
    mapPrefs.value.currentMode = "edit";
  }
};

const undo = (): void => {
  if (interactions.value.undoRedo) {
    interactions.value.undoRedo.undo();
  }
};

const redo = (): void => {
  if (interactions.value.undoRedo) {
    interactions.value.undoRedo.redo();
  }
};

/*
 * * Fonctions : Data
 */

const confirmer = (): void => {
  console.log("TODO");
};

const annuler = (): void => {
  if (mergeFeature.value) {
    mergeFeature.value = null;
    clearMergeLayer(map.value);
  }
  store.selectedModifIds = [];
  mapPrefs.value.currentMode = "edit";
  clearDeleteLayer();
};

const cancelDraw = (): void => {
  clearPreviewSource();
  invalidDrawing.value = false;
  errorDrawing.value = false;
  correctedGeometry.value = null;
};

const confirmCorrection = (): void => {
  feature.value = correctedGeometry.value;
};

/*
 * * Fonctions : Utils
 */

const calculateArea = (feature: any): string => {
  return inHa(legalProjectionSurface(feature));
};

const getFeatureStyle = (feature: Feature): Style[] => {
  const size = calculateArea(new GeoJSON().writeFeatureObject(feature, {}));
  const numeroI = feature.get("NUMERO_I") || "";
  const numeroP = feature.get("NUMERO_P") || "";
  const nom = feature.get("NOM") || "";
  const selected = feature.get("selected");
  const hover = feature.get("hover");
  const type = feature.get("TYPE");

  let fillColor = "rgba(74, 140, 190, 0.3)";
  let borderColor = "#ffffff";
  if (selected || hover) {
    fillColor = "rgba(0, 0, 145, 0.3)";
    borderColor = "#6a6af4";
  } else if (type === "BOR") {
    fillColor = "#d2d2f4";
  }
  let text = "";
  if (numeroI.toString() !== "") {
    text = `${numeroI}.${numeroP}\r`;
  } else if (nom) {
    text = nom;
  }

  const styleText = new Style({
    zIndex: selected || hover ? 6 : 3,
    fill: new Fill({ color: fillColor }),
    stroke: new Stroke({ width: selected || hover ? 3 : 1, color: borderColor }),
    text: new Text({
      text: [text, "14px 'Marianne'", "\n", "", size, "bold 14px 'Marianne'", " ha", " 14px 'Marianne'"],
      fill: new Fill({ color: "#000000" }),
      stroke: new Stroke({ width: 2, color: "#ffffff" }),
    }),
  });

  return [styleText];
};

const clearDeleteLayer = (): void => {
  const layerDelete = map.value
    .getLayers()
    .getArray()
    .find((layer) => layer.get("name") == "layer-delete");
  if (layerDelete) {
    map.value.removeLayer(layerDelete);
  }
};

const updateFeatureStoreCollection = (): void => {
  // TODO : Après un envoi quelquconque au serveur réactualiser la vue en temps réél
  console.log("TODO");
};

const clearInteractions = (): void => {
  const interactions = map.value.getInteractions();

  const toRemove: Interaction[] = [];

  interactions.forEach((interaction) => {
    if (
      !(interaction instanceof UndoRedo) &&
      !(interaction instanceof DragPan) &&
      !(interaction instanceof MouseWheelZoom) &&
      !(interaction instanceof DoubleClickZoom)
    ) {
      toRemove.push(interaction);
    }
  });

  toRemove.forEach((interaction) => {
    map.value.removeInteraction(interaction);
  });
};

const clearPreviewSource = (): void => {
  const features = previewLayer.getSource().getFeatures();
  features.forEach((feat) => {
    previewLayer.getSource().removeFeature(feat);
  });
};

/*
 * * Watchers
 */

watch(
  () => mapPrefs.value.currentMode,
  (newMode, oldValue) => {
    if (!props.interactive) return;
    switch (oldValue) {
      case "divide":
        break;
      case "fusionner":
        clearMergeLayer(map.value);
        break;
      case "delete":
        clearDeleteLayer();
        break;
    }
    switch (newMode) {
      case "draw":
        clearInteractions();
        clearPreviewSource();
        store.setSelectedModifiedFeature([]);
        initDraw();
        break;
      case "edit":
        clearInteractions();
        initModify();
        break;
      case "delete":
        clearInteractions();
        deleteSelected();
        break;
      case "divide":
        clearInteractions();
        initDivide();
        break;
      case "decouper":
        clearInteractions();
        initCut();
        break;
      case "fusionner":
        clearInteractions();
        mergeFeatures();
        break;
      case "undo":
        undo();
        break;
      case "redo":
        redo();
        break;
      case "neutral":
        clearInteractions();
        break;
    }
  },
);

watch(
  () => props.isDraw,
  (newValue) => {
    if (!newValue) {
      mapPrefs.value.currentMode = "neutral";
      store.setSelectedModifiedFeature([]);
    }
  },
);

watch(
  () => feature.value,
  async (newFeature) => {
    if (!newFeature) return;
    const format = new GeoJSON();
    invalidDrawing.value = false;
    errorDrawing.value = false;
    clearPreviewSource();
    const data = (await addParcelleVerif(newFeature, props.recordId)).data;
    const existingLayer = map.value
      .getLayers()
      .getArray()
      .find((layer) => layer === previewLayer);

    if (existingLayer) {
      previewLayer.getSource().clear();
    } else {
      map.value.addLayer(previewLayer);
    }

    if (data.valid === true) {
      errorDrawing.value = false;
      const previewFeature = format.readFeature(newFeature);
      previewFeature.setStyle(previewStyle);
      previewSource.addFeature(previewFeature);
    } else {
      errorDrawing.value = true;
      if (data.correction) {
        correctedGeometry.value = data.correction.corrected_input || data.correction.input_minus_existing;

        if (correctedGeometry.value && correctedGeometry.value.type != "MultiPolygon") {
          invalidDrawing.value = true;
          const correctedFeature = format.readFeature(correctedGeometry.value);

          previewSource.addFeature(correctedFeature);

          const extent = correctedFeature.getGeometry().getExtent();
          if (extent && !isNaN(extent[0])) {
            map.value.getView().fit(extent, { padding: [50, 50, 50, 50] });
          }
          return;
        }
        const previewFeature = format.readFeature(correctedGeometry);
        previewFeature.setStyle(errorStyle);
        previewSource.addFeature(previewFeature);
        return;
      }
      const previewFeature = format.readFeature(newFeature);
      previewFeature.setStyle(errorStyle);
      previewSource.addFeature(previewFeature);
    }
  },
);

/**
 * * States fonctions
 */

onMounted(() => {
  clearInteractions();
  if (!props.isDraw) {
    clearInteractions();
    mapPrefs.value.currentMode = "neutral";
  }

  const featureStore = useFeaturesStore();
  const features = new GeoJSON().readFeatures(featureStore.collection, {});

  vectorSource.value = new VectorSource({
    features,
  });

  vectorLayer.value = new VectorLayer({
    source: vectorSource.value,
    zIndex: 3,
    updateWhileInteracting: true,
    updateWhileAnimating: true,
    style: getFeatureStyle,
  });

  vectorLayer.value.set("name", "plan-features-layer");
  map.value.addLayer(vectorLayer.value);

  const extent = vectorSource.value.getExtent();
  if (extent && !isNaN(extent[0])) {
    map.value.getView().fit(extent, { padding: [50, 50, 50, 50] });
  }

  if (props.interactive) {
    featureStore.bindFeatureState(map, "plan-features-layer");
    featureStore.bindFeatureInteraction(map, "plan-features-layer");
  }

  const undoRedo = new UndoRedo({ source: vectorSource.value });
  map.value.addInteraction(undoRedo);
  interactions.value.undoRedo = undoRedo;
});

onUnmounted(() => {
  if (vectorLayer.value) map.value.removeLayer(vectorLayer.value);
  clearInteractions();
});
</script>

<style scoped>
.pop-in-top {
  position: absolute;
  top: 7%;
  left: 30%;
  background: white;
  z-index: 1000;
  padding: 5px;
  display: flex;
  gap: 5px;
  border-radius: 10px;
}

.pop-in-top > span {
  align-content: center;
}
</style>
