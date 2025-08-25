<template>
  <div v-if="numberSelectedFeature === 1 && !isCorrecting" class="pop-in-top">
    <button class="fr-btn" :disabled="!hasUndo" @click="saveModifiedFeature">Valider la modification</button>
    <button class="fr-btn fr-btn--secondary" :disabled="!hasUndo" @click="resetEdit">Annuler</button>
  </div>
  <div v-else-if="isCorrecting && corrections.length > 0" class="pop-in-top">
    <button class="fr-btn" @click="correct">Valider la correction</button>
  </div>
  <div v-if="corrections.length > 0" class="correct-parcelle">
    <div>
      <i class="fr-icon fr-icon-warning-line error" aria-hidden="true"></i>
      <strong>Attention ! Le tracé de votre parcelle chevauche une autre parcelle</strong>
    </div>
    <div>
      <button class="fr-btn fr-btn--tertiary-no-outline" @click="startCorrection">
        <i class="ri-shape-line" aria-hidden="true" /> Corriger automatiquement
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed, createApp } from "vue";
import { storeToRefs } from "pinia";

import { Collection, Map } from "ol";
import { Feature } from "ol";
import VectorLayer from "ol/layer/Vector";
import VectorSource from "ol/source/Vector";
import GeoJSON from "ol/format/GeoJSON";
import { Style, Fill, Stroke, RegularShape } from "ol/style";
import { Select, Modify } from "ol/interaction";
import UndoRedo from "ol-ext/interaction/UndoRedo";
import Tooltip from "ol-ext/overlay/Tooltip";

import { useFeaturesStore } from "@/stores/features.js";
import { usePreferences } from "@/stores/preferences.js";
import { legalProjectionSurface, inHa } from "@/utils/features.js";

// Interactions

// Utils Geom
import { updateFeatures, addParcelleVerif } from "@/cartobio-api.js";

import { CartoBioFeature } from "@agencebio/cartobio-types";
import { click } from "ol/events/condition";
import { MultiPoint } from "ol/geom";
import EditParcelleTooltip from "../Overlays/EditParcelleTooltip.vue";

/*
 * * Interface
 */

interface Props {
  map: Map;
  vectorSource: VectorSource;
  vectorLayer: VectorLayer<VectorSource>;
  recordId: string;
  undoRedo: UndoRedo;
  hasUndo: boolean;
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

/*
 * * Refs
 */

const isModifying = ref(false);
const corrections = ref<
  {
    id: string;
    new_minus_intersection: CartoBioFeature;
    existing_minus_intersection: CartoBioFeature;
  }[]
>([]);

/**
 * Corrections
 */
const isCorrecting = ref(false);

const correctionSource = new VectorSource();
const correctionLayer = new VectorLayer({
  source: correctionSource,
});
const featureToKeepForCorrection = new Collection<Feature>();

let correctionInteraction: Select | null = null;
let correctedParcellesId: string[] = [];

/*
 * * Computed
 */

const numberSelectedFeature = computed(() => {
  return store.selectedModifIds.length;
});

/*
 * * Fonctions :  interactions
 */

const undoAll = (): void => {
  if (props.undoRedo) {
    let hasUndo = props.undoRedo.hasUndo();
    while (hasUndo > 0) {
      props.undoRedo.undo();
      hasUndo = props.undoRedo.hasUndo();
    }
  }
};

const resetEdit = () => {
  undoAll();
  isModifying.value = false;
  correctionSource.clear();
  corrections.value = [];
  isCorrecting.value = false;
  featureToKeepForCorrection.clear();
  correctedParcellesId = [];
  if (correctionInteraction) {
    props.map.removeInteraction(correctionInteraction);
  }
};

const modifyInteraction = () => {
  const selectedFeatures = new Collection<Feature>();
  const select = createSelectInteraction(selectedFeatures);

  let modify: Modify | null = null;

  select.on("select", (e) => {
    if (isModifying.value) return;
    e.deselected.forEach((feature) => {
      feature.setStyle();
    });

    const selectedIds = e.target
      .getFeatures()
      .getArray()
      .map((feature: Feature) => feature.getId())
      .filter((id: string | number | undefined): id is string | number => id !== undefined);

    store.setSelectedModifiedFeature(selectedIds);

    if (selectedIds.length === 1) {
      modify = new Modify({
        features: selectedFeatures,
        style: [
          getPolygonStyle(),
          new Style({
            image: new RegularShape({
              fill: new Fill({ color: "white" }),
              points: 4,
              radius: 7,
            }),
          }),
        ],
      });
      props.map.addInteraction(modify);
      const tooltip = new Tooltip({
        className: "draw-tooltip",
        closeBox: false,
        positioning: "bottom-left",
        offset: [10, -10],
        getHTML: createTooltipContent,
      });
      tooltip.setFeature(selectedFeatures.getArray()[0]);

      modify.on("modifystart", () => {
        isModifying.value = true;
        props.map.addOverlay(tooltip);
      });

      modify.on("modifyend", () => {
        props.map.removeOverlay(tooltip);
      });
    } else {
      if (modify) {
        props.map.removeInteraction(modify);
        modify = null;
      }
    }

    e.deselected.forEach((feature) => {
      feature.setStyle();
    });
  });

  props.map.addInteraction(select);
};

const getPolygonStyle = (): Style => {
  return new Style({
    fill: new Fill({ color: "rgba(74, 140, 190, 0.3)" }),
    stroke: new Stroke({ width: 3, color: "rgba(139, 248, 231, 1)" }),
  });
};

const getPolygonMultipleStyle = (): Style => {
  return new Style({
    fill: new Fill({ color: "rgba(74, 140, 190, 0.7)" }),
    stroke: new Stroke({ width: 3, color: "rgba(139, 248, 231, 1)" }),
  });
};

const getPointStyle = (): Style => {
  return new Style({
    image: new RegularShape({
      fill: new Fill({ color: "white" }),
      points: 4,
      radius: 7,
    }),
    geometry: (feature: Feature) => {
      const coords = (feature.getGeometry() as Polygon)?.getCoordinates()[0];
      if (coords?.length) {
        return new MultiPoint(coords);
      }
    },
  });
};

const createSelectInteraction = (selectedFeatures: Collection<Feature>): Select => {
  const source = props.vectorLayer.getSource();
  const alreadySelectedIds = store.selectedModifIds ?? [];

  alreadySelectedIds.forEach((id: number) => {
    const feature = source?.getFeatureById(id);
    if (feature && !selectedFeatures.getArray().includes(feature)) {
      selectedFeatures.push(feature);
    }
  });

  const selectInteraction = new Select({
    layers: [props.vectorLayer],
    condition: (e) => !isModifying.value && click(e),
    multi: true,
    features: selectedFeatures,
    style: () => {
      if (store.selectedModifIds.length >= 2) {
        return getPolygonMultipleStyle();
      }
      return [getPolygonStyle(), getPointStyle()];
    },
  });

  return selectInteraction;
};

const createTooltipContent = (feature: Feature) => {
  const area = calculateArea(new GeoJSON().writeFeatureObject(feature, {}) as CartoBioFeature);

  const element = document.createElement("div");

  const app = createApp(EditParcelleTooltip, {
    area,
  });

  app.mount(element);
  return element.innerHTML;
};

/*
 * * Fonctions : Data
 */

const saveModifiedFeature = async () => {
  let modifiedFeature: CartoBioFeature | null = null;
  const selectdId = store.selectedModifIds[0];
  const geoJson = new GeoJSON();
  const feature = props.vectorSource.getFeatureById(selectdId);

  if (!feature) return;

  modifiedFeature = geoJson.writeFeatureObject(feature.clone()) as CartoBioFeature;
  modifiedFeature.id = selectdId;

  if (!modifiedFeature) return;
  const data = (await addParcelleVerif(modifiedFeature, props.recordId)).data;

  if (
    data.valid === true ||
    data.corrections.filter((c: { id: string }) => !correctedParcellesId.includes(c.id)).length === 0
  ) {
    const correctedParcelles = [];

    for (const id of correctedParcellesId) {
      const correctedFeature = props.vectorSource.getFeatureById(id);

      if (correctedFeature) {
        const parcelle = geoJson.writeFeatureObject(correctedFeature.clone()) as CartoBioFeature;

        parcelle.id = id;
        correctedParcelles.push(parcelle);
      }
    }
    const result = await updateFeatures(props.recordId, [modifiedFeature, ...correctedParcelles]);

    if (result) {
      store.setSelectedModifiedFeature([]);
      store.setAll(result.parcelles.features);
    }
    isModifying.value = false;
    mapPrefs.value.currentMode = "edit";
    props.undoRedo.clear();

    return;
  }

  if (data.corrections) {
    corrections.value = data.corrections;
  }
};

const selectToCorrect = (
  correction: {
    id: string;
    new_minus_intersection: CartoBioFeature;
    existing_minus_intersection: CartoBioFeature;
  },
  modifiedFeature: Feature,
  overlappedFeature: Feature,
  originalModifiedFeature: Feature,
  originalOverlappedFeature: Feature,
) => {
  const format = new GeoJSON();

  if (featureToKeepForCorrection.getLength() === 0) {
    featureToKeepForCorrection.push(modifiedFeature);
  }

  const selectId = featureToKeepForCorrection.getArray()[0]?.get("id");

  if (selectId === modifiedFeature.get("id")) {
    originalModifiedFeature.setGeometry(modifiedFeature.getGeometry());
    const feature = format.readFeature(correction.existing_minus_intersection) as Feature;

    originalOverlappedFeature.setGeometry(feature.getGeometry());
    return;
  }

  originalOverlappedFeature.setGeometry(overlappedFeature.getGeometry());
  const feature = format.readFeature(correction.new_minus_intersection) as Feature;

  originalModifiedFeature.setGeometry(feature.getGeometry());
};

const startCorrection = () => {
  isModifying.value = true;
  if (corrections.value.length === 0) {
    return;
  }
  const correction = corrections.value[0];
  featureToKeepForCorrection.clear();
  correctionSource.clear();
  const originalModifiedFeature = props.vectorSource.getFeatureById(store.selectedModifIds[0]);
  const originalOverlappedFeature = props.vectorSource.getFeatureById(correction.id);

  if (!originalModifiedFeature || !originalOverlappedFeature) {
    return;
  }

  const modifiedFeature = originalModifiedFeature.clone();
  const overlappedFeature = originalOverlappedFeature.clone();
  const transparent = new Style({
    stroke: new Stroke({ color: [0, 0, 0, 0] }),
    fill: new Fill({ color: [0, 0, 0, 0] }),
  });

  modifiedFeature.setStyle(transparent);
  overlappedFeature.setStyle(transparent);
  featureToKeepForCorrection.push(modifiedFeature);
  correctionSource.addFeatures([modifiedFeature, overlappedFeature]);
  props.map.addLayer(correctionLayer);

  correctionInteraction = new Select({
    layers: [correctionLayer],
    condition: click,
    multi: false,
    features: featureToKeepForCorrection,
    style: new Style({
      fill: new Fill({ color: "rgba(74, 140, 190, 0.5)" }),
    }),
  });

  props.map.addInteraction(correctionInteraction);
  isCorrecting.value = true;

  selectToCorrect(correction, modifiedFeature, overlappedFeature, originalModifiedFeature, originalOverlappedFeature);

  correctionInteraction.on("select", () => {
    selectToCorrect(correction, modifiedFeature, overlappedFeature, originalModifiedFeature, originalOverlappedFeature);
  });
};

const correct = () => {
  if (corrections.value.length === 0) {
    return;
  }
  const correction = corrections.value[0];
  const selectedFeatureId = featureToKeepForCorrection.getArray()[0]?.get("id");

  // On conserve la modification au détriment de l'autre parcelle
  if (selectedFeatureId === store.selectedModifIds[0]) {
    correctedParcellesId.push(correction.id);
  }

  corrections.value.shift();
  if (correctionInteraction) {
    props.map.removeInteraction(correctionInteraction);
  }

  props.map.removeLayer(correctionLayer);

  if (corrections.value.length === 0) {
    isCorrecting.value = false;
  } else {
    startCorrection();
  }
};

/*
 * * Fonctions : Utils
 */

const calculateArea = (feature: CartoBioFeature): string => {
  return inHa(legalProjectionSurface(feature));
};

/*
 * * Watchers
 */

/**
 * * States fonctions
 */
onMounted(() => {
  modifyInteraction();
});
onUnmounted(() => {
  undoAll();
});
</script>

<style scoped>
.correct-parcelle {
  position: absolute;
  bottom: 10%;
  left: 50%;
  background: white;
  z-index: 1000;
  padding: 5px;
  display: flex;
  gap: 5px;
  border-radius: 10px;
  flex-direction: column;
}

.error {
  color: var(--text-default-error);
}
</style>
