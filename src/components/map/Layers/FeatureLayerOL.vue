<!-- eslint-disable vue/valid-template-root -->
<template>
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
  <template v-if="isDraw">
    <div
      v-if="mergeFeature || mapPrefs.currentMode === 'delete' || mapPrefs.currentMode === 'fusionner'"
      class="pop-in-top"
    >
      <p v-if="mergeFeature">Surface de la parcelle fusionné {{ calculateArea(mergeFeature) }} ha</p>
      <p v-if="numberSelectedFeature && mapPrefs.currentMode === 'delete'">
        Vous avez sélectionné {{ numberSelectedFeature }} parcelles à supprimer
      </p>

      <button class="fr-btn fr-btn--secondary fr-icon-check-line fr-btn--icon-right" @click="confirmer">
        Valider {{ mergeFeature ? "et compléter" : "la suppression" }}
      </button>
      <button class="fr-btn fr-icon-close-line fr-btn--tertiary-no-outline" @click="annuler"></button>
    </div>

    <div v-else-if="invalidDrawing && mapPrefs.currentMode === 'draw'" class="pop-in-top">
      <p>Votre parcelle a été rogner pour respecter les règles</p>
      <button class="fr-btn fr-btn--secondary fr-icon-check-line fr-btn--icon-right" @click="confirmCorrection">
        Valider
      </button>
      <button class="fr-btn fr-icon-close-line fr-btn--tertiary-no-outline" @click="cancelDraw"></button>
    </div>
    <div v-if="errorDrawing && !invalidDrawing && mapPrefs.currentMode === 'draw'" class="pop-in-top">
      <p>Votre parcelle est invalide. Veuillez recommencer !</p>
      <button class="fr-btn fr-icon-close-line fr-btn--tertiary-no-outline" @click="cancelDraw"></button>
    </div>
    <div v-if="errorDrawing && !invalidDrawing && mapPrefs.currentMode === 'draw'" class="pop-in-top">
      <p>Votre parcelle est invalide. Veuillez recommencer !</p>
      <button class="fr-btn fr-icon-close-line fr-btn--tertiary-no-outline" @click="cancelDraw"></button>
    </div>
    <div v-else-if="mapPrefs.currentMode === 'edit' && store.selectedModifIds.length === 1" class="pop-in-top">
      <button class="fr-btn" :disabled="!hasUndo" @click="saveModifiedFeature">Valider la modification</button>
      <button class="fr-btn fr-btn--secondary" :disabled="!hasUndo" @click="resetEdit">Annuler</button>
    </div>
    <div v-else-if="mapPrefs.currentMode === 'divide'" class="pop-in-top">
      <button class="fr-btn" :disabled="!hasDivision" @click="validateDivision">Valider la découpe</button>
      <button class="fr-btn fr-btn--secondary" :disabled="!hasDivision" @click="validateDivision">Annuler</button>
    </div>
    <div v-else-if="mapPrefs.currentMode === 'decouper'" class="pop-in-top">
      <div class="column">
        <div class="fr-checkbox-group">
          <input type="checkbox" id="bordure-complete" @click="toggleAllBorder" />
          <label class="fr-label" for="bordure-complete" aria-label="Appliquer la bordure sur toute la parcelle"
            >Bordure complète</label
          >
        </div>
        <div class="fr-checkbox-group">
          <input type="checkbox" id="inverser-selection" @click="invertSelection" />
          <label class="fr-label" for="inverser-selection" aria-label="Inverser le sens de la bordure"
            >Inverser la séléction</label
          >
        </div>
      </div>
      <div class="column">
        <div class="fr-checkbox-group">
          <label class="fr-label fr-text--bold" for="largeur-bordure" aria-label="Largeur de la bordure"
            >Distance (m)</label
          >
          <input
            type="number"
            id="largeur-bordure"
            step="0.01"
            class="fr-input fr-mt-0"
            v-model="distance"
            @change="setDistance"
          />
        </div>
      </div>
      <div class="column">
        <button class="fr-btn" :disabled="!hasBordure" @click="validateDivision">Découper</button>
      </div>
    </div>
    <Teleport to=".toolbar">
      <div class="toolbar-bottom">
        <button class="fr-btn fr-btn--tertiary-no-outline" data-tooltip="Annuler" @click="undo" :disabled="!hasUndo">
          <i class="ri-arrow-go-back-line"></i>
        </button>
        <button class="fr-btn fr-btn--tertiary-no-outline" data-tooltip="Refaire" @click="redo" :disabled="!hasRedo">
          <i class="ri-arrow-go-forward-line"></i>
        </button>
      </div>
    </Teleport>
  </template>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, onUnmounted, inject, Ref, computed } from "vue";
import { storeToRefs } from "pinia";

import { Map, MapBrowserEvent, Overlay } from "ol";
import { Feature } from "ol";
import VectorLayer from "ol/layer/Vector";
import VectorSource from "ol/source/Vector";
import GeoJSON from "ol/format/GeoJSON";
import { Style, Text, Fill, Stroke } from "ol/style";
import ModifyFeature from "ol-ext/interaction/ModifyFeature";
import { Select, Draw, Interaction } from "ol/interaction";
import UndoRedo from "ol-ext/interaction/UndoRedo";
import { DragPan, MouseWheelZoom, DoubleClickZoom } from "ol/interaction";
import Tooltip from "ol-ext/overlay/Tooltip";

import { useFeaturesStore } from "@/stores/features.js";
import { usePreferences } from "@/stores/preferences.js";
import { DeletionReasonsCode, legalProjectionSurface, inHa, getCultureIcon, featureName } from "@/utils/features.js";
import { getConversionLevel, LEVEL_MAYBE_AB, LEVEL_UNKNOWN } from "@/referentiels/ab";
import { fromCodeCpf } from "@agencebio/rosetta-cultures";

// Interactions
import { mergeInteractions, clearMergeLayer } from "../interactions/merge";
import { drawInteraction } from "../interactions/draw";
import { divideInteraction, cleanup as cleanupDivision } from "../interactions/divide";
import { modifyInteraction, setIsModifying } from "../interactions/modify";

// Utils Geom
import {
  addParcelleVerif,
  deleteParcelle,
  createFeaturesFromOther,
  updateFeature,
  submitNewParcelle,
} from "@/cartobio-api.js";

import CertificationBodyEditForm from "@/components/forms/SingleItemCertificationBodyForm.vue";
import {
  borderInteraction,
  cleanup as cleanupBordure,
  invertSelection,
  setDistance,
  toggleAllBorder,
} from "../interactions/border";
import { CartoBioFeature, CartoBioFeatureCollection } from "@agencebio/cartobio-types";
import ZIndexContext from "ol/render/canvas/ZIndexContext";

/*
 * * Interface
 */

interface Props {
  name?: string;
  interactive?: boolean;
  recordId: string;
  isDraw: boolean;
  data?: CartoBioFeatureCollection;
}

interface Interactions {
  select: Select | null;
  modify: typeof ModifyFeature | null;
  draw: Draw | null;
  split: unknown | null;
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

const map = inject<Ref<Map>>("map");
if (!map) {
  throw new Error("Pas de map disponible");
}
/*
 * * Refs
 */

const vectorSource = ref<VectorSource>();
const vectorLayer = ref<VectorLayer<VectorSource>>();
const interactions = ref<Interactions>({
  select: null,
  modify: null,
  draw: null,
  split: null,
  undoRedo: null,
});

const showDetailsModal = ref(false);
const feature = ref<Feature | null>(null);
const mergeFeature = ref<CartoBioFeature | null>(null);
const correctedGeometry = ref<Feature | null>(null);
const hasUndo = ref(false);
const hasRedo = ref(false);

// Refs draw interaction
const invalidDrawing = ref<boolean>(false);
const errorDrawing = ref<boolean>(false);

// Refs division
const hasDivision = ref<boolean>(false);

// Refs découpe bordure
const hasBordure = ref<boolean>(false);
const distance = ref<number>(5);
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
const resSource = new VectorSource();

/*
 * * Components
 */

const editForm = CertificationBodyEditForm;

/*
 * * Fonctions :  interactions
 */

const initDraw = async (): Promise<void> => {
  if (map && vectorLayer.value && vectorSource.value) {
    drawInteraction(map.value, vectorLayer.value, vectorSource.value, showDetailsModal, feature);
  }
};

const initModify = (): void => {
  if (map && vectorLayer.value) {
    modifyInteraction(map.value, vectorLayer.value, store);
  }
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
    const feature = vectorSource.value?.getFeatureById(id);
    if (feature) {
      const clonedGeometry = feature.getGeometry()?.clone();
      const highlightFeature = new Feature({
        geometry: clonedGeometry,
        originalId: id,
        isHighlight: true,
      });
      highlightSource.addFeature(highlightFeature);
    }
  });

  map?.value.addLayer(highlightLayer);
};

const initDivide = (): void => {
  const targetFeature = getTargetFeature();

  if (map && vectorLayer.value && targetFeature) {
    divideInteraction(map.value, targetFeature, resSource, hasDivision);
  }
};

const initBorder = (): void => {
  const targetFeature = getTargetFeature();

  if (map && vectorLayer.value && targetFeature) {
    borderInteraction(map.value, targetFeature, hasBordure, distance, resSource);
  }
};

const mergeFeatures = (): void => {
  const geojsonFormat = new GeoJSON();

  if (!map || !vectorSource.value) {
    return;
  }

  const resultMerge = mergeInteractions(vectorSource.value, map.value, store.selectedModifIds);
  if (resultMerge) {
    mergeFeature.value = geojsonFormat.writeFeatureObject(resultMerge) as CartoBioFeature;
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

const undoAll = (): void => {
  if (interactions.value.undoRedo) {
    let hasUndo = interactions.value.undoRedo.hasUndo();
    while (hasUndo > 0) {
      interactions.value.undoRedo.undo();
      hasUndo = interactions.value.undoRedo.hasUndo();
    }
  }
};

const resetEdit = () => {
  undoAll();
  setIsModifying(false);
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

      const feature = vectorLayer.value?.getSource()?.getFeatureById(featureId);

      if (feature) {
        vectorLayer.value?.getSource()?.removeFeature(feature);
      }
    }

    if (result) {
      store.setAll(result.parcelles.features);
    }

    store.setSelectedModifiedFeature([]);
    mapPrefs.value.currentMode = "edit";

    return;
  }

  if (mergeFeature.value && mapPrefs.value.currentMode === "fusionner") {
    const result = await createFeaturesFromOther(props.recordId, [mergeFeature.value], store.selectedModifIds);

    if (result) {
      const selectdIds = store.selectedModifIds;
      const geoJson = new GeoJSON();

      store.setSelectedModifiedFeature([]);
      const newFeatures = result.parcelles.features.filter(
        (f: CartoBioFeature) => !store.all.map((f: CartoBioFeature) => f.id).some((pa: string) => pa === f.id),
      );
      store.setAll(result.parcelles.features);

      for (const selectdId of selectdIds) {
        const feature = vectorLayer.value?.getSource()?.getFeatureById(selectdId);

        if (feature) {
          vectorLayer.value?.getSource()?.removeFeature(feature);
        }
      }

      for (const newFeature of newFeatures) {
        vectorLayer.value?.getSource()?.addFeature(geoJson.readFeature(newFeature) as Feature);
      }
    }
    mapPrefs.value.currentMode = "edit";
  }
};

const annuler = (): void => {
  if (!map) {
    return;
  }
  if (mergeFeature.value) {
    mergeFeature.value = null;
    clearMergeLayer(map.value);
  }

  store.setSelectedModifiedFeature([]);
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

const validateDivision = async () => {
  const modifiedFeatures: CartoBioFeature[] = [];
  const selectdId = store.selectedModifIds[0];
  const geoJson = new GeoJSON();

  for (const modifiedFeature of resSource.getFeatures()) {
    modifiedFeatures.push(geoJson.writeFeatureObject(modifiedFeature.clone()) as CartoBioFeature);
  }
  const result = await createFeaturesFromOther(props.recordId, modifiedFeatures, [selectdId]);

  if (result) {
    store.setSelectedModifiedFeature([]);
    const newFeatures = result.parcelles.features.filter(
      (f: CartoBioFeature) => !store.all.map((f: CartoBioFeature) => f.id).some((pa: string) => pa === f.id),
    );
    store.setAll(result.parcelles.features);

    const feature = vectorLayer.value?.getSource()?.getFeatureById(selectdId);

    if (feature) {
      vectorLayer.value?.getSource()?.removeFeature(feature);
    }

    for (const newFeature of newFeatures) {
      vectorLayer.value?.getSource()?.addFeature(geoJson.readFeature(newFeature) as Feature);
    }
  }
  mapPrefs.value.currentMode = "edit";
  if (hasBordure.value) {
    cleanupBordure();
  } else if (hasDivision.value) {
    cleanupDivision();
  }
};

const saveModifiedFeature = async () => {
  let modifiedFeature: CartoBioFeature | null = null;
  const selectdId = store.selectedModifIds[0];
  const geoJson = new GeoJSON();
  const feature = vectorSource.value?.getFeatureById(selectdId);

  if (!feature) return;

  modifiedFeature = geoJson.writeFeatureObject(feature.clone()) as CartoBioFeature;

  if (!modifiedFeature) return;

  const result = await updateFeature(props.recordId, modifiedFeature, selectdId);

  if (result) {
    store.setSelectedModifiedFeature([]);
    store.setAll(result.parcelles.features);
  }
  setIsModifying(false);
  mapPrefs.value.currentMode = "edit";
  interactions.value.undoRedo.clear();
};

/*
 * * Fonctions : Utils
 */

const calculateArea = (feature: CartoBioFeature): string => {
  return inHa(legalProjectionSurface(feature));
};

const getFeatureStyle = (feature: Feature): Style[] => {
  const size = calculateArea(new GeoJSON().writeFeatureObject(feature));
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
  if (!map) {
    return;
  }

  const layerDelete = map.value
    .getLayers()
    .getArray()
    .find((layer) => layer.get("name") == "layer-delete");
  if (layerDelete) {
    map.value.removeLayer(layerDelete);
  }
};

const clearInteractions = (): void => {
  if (!map) {
    return;
  }
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
  const features = previewLayer.getSource()?.getFeatures();
  if (!features) {
    return;
  }

  features.forEach((feat) => {
    previewLayer.getSource()?.removeFeature(feat);
  });
};

const getTargetFeature = (): Feature | null => {
  const features = new GeoJSON().readFeatures(store.collection, {});

  if (store.selectedModifIds && store.selectedModifIds[0]) {
    const selectedFeature = features.find(
      (feature) => feature.getId() === store.selectedModifIds[0] || feature.get("id") === store.selectedModifIds[0],
    );

    if (selectedFeature) {
      return selectedFeature;
    }
  }

  return null;
};

const updateHasUndoRedo = () => {
  hasUndo.value = !!interactions.value.undoRedo?.hasUndo();
  hasRedo.value = !!interactions.value.undoRedo?.hasRedo();
};

const createCultureOverlay = (feature: Feature) => {
  const cultures: { CPF: "string" }[] = feature.get("cultures") || [];
  const conversionLevel = getConversionLevel(feature.get("conversion_niveau"));
  const conversionClassCss =
    conversionLevel.value === LEVEL_UNKNOWN || conversionLevel.value === LEVEL_MAYBE_AB
      ? "badge-a-modifier"
      : "badge-" + conversionLevel.value;
  const icon = getCultureIcon(cultures[0]?.CPF);

  return `
<div class="openlayers-culture-overlay">
  <div class="badge-container">
      <div class="badge ${conversionClassCss}">
      <i class="fr-icon ${icon}"></i>${conversionLevel.value === LEVEL_MAYBE_AB ? "A préciser" : conversionLevel.shortLabel}</div>
    </div>
  </div>
</div>
`;
};

const createParcelleTooltip = (feature: Feature) => {
  const cartobioFeature = new GeoJSON().writeFeatureObject(feature) as CartoBioFeature;
  const name = featureName(cartobioFeature);
  const area = calculateArea(cartobioFeature);
  const codePostale = feature.get("COMMUNE");
  const ville = feature.get("COMMUNE_LABEL");
  const cultures: { CPF: "string" }[] = feature.get("cultures") || [];
  const icon = getCultureIcon(cultures[0]?.CPF);
  const libelleCulture = fromCodeCpf(cultures[0]?.CPF);

  console.log(feature.get("cultures"));
  return `
<div class="openlayers-parcelle-tooltip fr-px-2w fr-py-3w">
  <div class="space-between fr-mb-2w">
    <b>${name}</b>
    <p class="fr-mb-0 fr-hint-text fr-text--md">${area} ha</p>
  </div>
  <div class="align-center gap-3">
    <span class="fr-icon-map-pin-2-line fr-icon--sm fr-hint-text" aria-hidden="true"></span>
    <p class="fr-mb-0 fr-hint-text fr-text--md">${codePostale} ${ville}</p>
  </div>
  ${
    cultures.length > 0
      ? `
  <div class="align-center gap-1">
    <span class="${icon} fr-hint-text fr-mr-0" aria-hidden="true"></span>
    <p class="fr-mb-0 fr-hint-text fr-text--md">${libelleCulture.libelle_code_cpf}</p>
  </div>
  `
      : ""
  }
</div>
`;
};

const getOverlays = (features: Feature[], zoom: number | undefined) => {
  if (!zoom) return;
  for (const feature of features) {
    let overlay = map.value.getOverlayById(feature.getId() ?? -1);

    //Zoom trop bas on affiche aucun overlay
    if (zoom < 14) {
      if (overlay) {
        map.value.removeOverlay(overlay);
      }
      continue;
    }
    //Uniquement les parcelle a préciser
    if (zoom < 16) {
      const conversionLevel = getConversionLevel(feature.get("conversion_niveau"));

      if (conversionLevel.value !== LEVEL_UNKNOWN && conversionLevel.value !== LEVEL_MAYBE_AB) {
        if (overlay) {
          map.value.removeOverlay(overlay);
        }

        continue;
      }
    }
    if (!overlay) {
      const element = document.createElement("div");
      element.innerHTML = createCultureOverlay(feature);

      overlay = new Overlay({ element, id: feature.getId() });

      map.value.addOverlay(overlay);
      overlay.setPosition(feature.getGeometry()?.getInteriorPoint().getCoordinates());
    }
  }
};

/*
 * * Watchers
 */

watch(
  () => mapPrefs.value.currentMode,
  (newMode, oldValue) => {
    interactions.value.undoRedo.clear();
    if (!props.interactive) return;
    switch (oldValue) {
      case "divide":
        break;
      case "fusionner":
        if (map) {
          clearMergeLayer(map.value);
        }
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
        initBorder();
        break;
      case "fusionner":
        clearInteractions();
        mergeFeatures();
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

      const result = await submitNewParcelle(props.recordId, newFeature);

      if (result) {
        store.setAll(result.parcelles.features);
      }

      return;
    }

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
  },
);

/**
 * * States fonctions
 */

onMounted(() => {
  clearInteractions();
  if (!props.isDraw) {
    mapPrefs.value.currentMode = "neutral";
  }

  const features = new GeoJSON().readFeatures(props.data ?? store.collection, {});

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
    store.bindFeatureState(map, "plan-features-layer");
    store.bindFeatureInteraction(map, "plan-features-layer");
  }

  const undoRedo = new UndoRedo({ layers: [vectorLayer.value] });
  map.value.addInteraction(undoRedo);
  interactions.value.undoRedo = undoRedo;

  interactions.value.undoRedo.on("stack:add", updateHasUndoRedo);
  interactions.value.undoRedo.on("stack:remove", updateHasUndoRedo);
  interactions.value.undoRedo.on("stack:clear", updateHasUndoRedo);
  getOverlays(features, map.value.getView().getZoom());

  map.value.getView().on("change:resolution", () => {
    const zoom = map.value.getView().getZoom();

    getOverlays(features, zoom);
  });

  const tooltip = new Tooltip({
    className: "openlayers-culture-overlay",
    closeBox: false,
    positioning: "bottom-center",
    offset: [0, -15],
    getHTML: createParcelleTooltip,
  });
  let currentFeature: Feature | null = null;
  map.value.on("pointermove", function (evt: MapBrowserEvent) {
    const feature = map.value.forEachFeatureAtPixel(evt.pixel, function (feature) {
      return feature;
    }) as Feature;
    if (feature) {
      if (feature !== currentFeature) {
        tooltip.setFeature(feature);
        map.value.addOverlay(tooltip);
      }
    } else if (currentFeature) {
      map.value.removeOverlay(tooltip);
    }
    currentFeature = feature;
  });

  map.value.getTargetElement().addEventListener("pointerleave", function () {
    if (currentFeature) {
      map.value.removeOverlay(tooltip);
      currentFeature = null;
    }
  });
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
  left: 50%;
  transform: translateX(-50%);
  background: white;
  z-index: 1000;
  padding: 5px;
  display: flex;
  gap: 5px;
  border-radius: 10px;
}

.pop-in-top > p {
  align-content: center;
}

.column {
  display: flex;
  flex-direction: column;
  justify-content: space-evenly;
}

.toolbar-bottom {
  margin-top: 10px;
  background: white;
  display: flex;
  justify-content: space-between;
  flex-direction: column;
  gap: 2px;
  padding: 10px;
  border-radius: 4px;
}

:deep(.ol-overlaycontainer) {
  z-index: 1;
}
</style>

<style>
.openlayers-culture-overlay .badge-container {
  background-color: white;
  padding: 4px;
  border-radius: 21px;
  transform: translate(-52%, -177%);
}
.openlayers-culture-overlay .badge-container::after {
  content: "";
  position: absolute;
  top: 99%;
  right: 50%;
  transform: translateX(50%);
  border-width: 10px;
  border-style: solid;
  border-color: white transparent transparent transparent;
  border-bottom: 4px solid transparent;
}
.openlayers-culture-overlay .badge {
  padding: 4px 12px;
  display: flex;
  gap: 5px;
  border-radius: 16px;
  border: 1px solid;
  align-items: center;
}

.openlayers-culture-overlay .badge-a-modifier {
  color: var(--text-default-error);
  background-color: var(--red-marianne-925-125);
  border: 1px solid var(--red-marianne-925-125);
}
.openlayers-culture-overlay .badge-CONV {
  color: var(--green-tilleul-verveine-sun-418-moon-817);
  background-color: var(--green-tilleul-verveine-925-125);
  border: 1px solid var(--green-tilleul-verveine-850-200);
}
.openlayers-culture-overlay .badge-C1 {
  color: var(--green-bourgeon-sun-425-moon-759);
  background-color: var(--green-bourgeon-975-75);
  border: 1px solid var(--green-bourgeon-850-200);
}
.openlayers-culture-overlay .badge-C2 {
  color: var(--green-bourgeon-sun-425-moon-759);
  background-color: var(--green-bourgeon-950-100);
  border: 1px solid var(--green-bourgeon-850-200);
}
.openlayers-culture-overlay .badge-C3 {
  color: var(--green-bourgeon-sun-425-moon-759);
  background-color: var(--green-bourgeon-925-125);
  border: 1px solid var(--green-bourgeon-850-200);
}
.openlayers-culture-overlay .badge-AB {
  color: white;
  background-color: var(--green-bourgeon-sun-425-moon-759);
  border: 1px solid var(--green-bourgeon-sun-425-moon-759);
}

.openlayers-parcelle-tooltip {
  background-color: white;
  z-index: 150;
}
.openlayers-parcelle-tooltip div {
  display: flex;
}

.openlayers-parcelle-tooltip .space-between {
  justify-content: space-between;
  display: flex;
  gap: 30px;
}
.openlayers-parcelle-tooltip .align-center {
  align-items: center;
}
.openlayers-parcelle-tooltip .gap-3 {
  gap: 10px;
}
.openlayers-parcelle-tooltip .gap-1 {
  gap: 3px;
}
/** Pour afficher la tooltip par dessus les overlays */
.ol-overlaycontainer {
  z-index: 1 !important;
}
</style>
