<template>
  <div>
    <div v-if="numberSelectedFeature === 1" class="pop-in-top" role="dialog" aria-labelledby="edit">
      <div class="title fr-mr-2v">
        <i class="ri-pen-nib-line" aria-hidden="true" />
        <strong class="fr-ml-1v">Modifier</strong>
      </div>
      <button
        v-if="!isCorrecting"
        class="fr-btn fr-icon-check-line fr-btn--icon-right"
        :disabled="!hasUndo || corrections.length > 0"
        :aria-disabled="!hasUndo || corrections.length > 0"
        @click="saveModifiedFeature"
      >
        Valider la modification
      </button>
      <button
        v-else-if="isCorrecting && corrections.length > 0"
        class="fr-btn"
        :disabled="corrections.length > 1"
        :aria-disabled="corrections.length > 1"
        @click="correct"
      >
        Valider la correction
      </button>
      <button class="fr-btn fr-btn--tertiary-no-outline" :disabled="!hasUndo" @click="resetEdit">Annuler</button>
    </div>
    <div
      class="pop-in-info"
      v-if="numberSelectedFeature > 0 && corrections.length < 1"
      role="status"
      aria-live="polite"
    >
      {{ numberSelectedFeature }} parcelle{{ numberSelectedFeature > 1 ? "s" : "" }}
      {{ !isCorrecting && hasUndo ? "modifiée" : "sélectionnée" }}{{ numberSelectedFeature > 1 ? "s" : "" }}
      {{ globalHa }} ha
    </div>
    <div class="pop-in-info" role="status" v-if="isCorrecting">
      <div class="division-overlay">
        <div style="display: flex; align-items: center; gap: 8px">
          <span class="area-info blue"></span>
          {{ parcelle1Area }} ha
        </div>
        <div style="display: flex; align-items: center; gap: 8px" class="fr-ml-2v">
          <span class="area-info green"></span>
          {{ parcelle2Area }} ha
        </div>
      </div>
    </div>

    <div v-if="corrections.length > 0" class="correct-parcelle" role="alert" aria-live="assertive">
      <div class="fr-text--sm fr-mb-0">
        <i class="fr-icon fr-icon-error-warning-fill error" aria-hidden="true"></i>
        <template v-if="canCorrect()">
          <span
            ><strong>Attention ! Le tracé de votre parcelle chevauche une autre parcelle.</strong>
            {{
              !(corrections.length > 1)
                ? "Cliquez sur la parcelle à conserver"
                : "Vous pouvez déplacer les points pour	corriger ou utiliser la correction guidée."
            }}</span
          >
        </template>
        <template v-else>
          <span>Attention ! Le tracé de votre parcelle coupe une autre parcelle</span>
        </template>
      </div>
      <div>
        <button
          v-if="!isCorrecting && canCorrect()"
          class="fr-btn fr-btn--sm fr-btn--tertiary-no-outline fr-btn--icon-left"
          @click="startCorrection"
        >
          <i class="ri-shape-line fr-mr-2v" aria-hidden="true" /> Correction guidée
        </button>
        <button
          v-else-if="!isCorrecting && !canCorrect()"
          class="fr-btn fr-btn--tertiary-no-outline fr-btn--icon-left fr-icon-close-line"
          @click="resetEdit"
        >
          Annuler
        </button>
        <template v-else>
          <button
            v-if="corrections.length > 1"
            class="fr-btn fr-btn--tertiary-no-outline fr-icon-add-line fr-btn--icon-left fr-btn--sm"
            @click="correct"
          >
            Correction suivante
          </button>
          <button
            v-else
            class="fr-btn fr-btn--tertiary-no-outline fr-icon-check-line fr-btn--icon-left fr-btn--sm"
            @click="correct"
          >
            Valider la correction
          </button>
        </template>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed, createApp, watch, Ref, inject, nextTick } from "vue";
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
import FillPattern from "ol-ext/style/FillPattern";

import { useFeaturesStore } from "@/stores/features.js";
import { usePreferences } from "@/stores/preferences.js";
import { legalProjectionSurface, inHa } from "@/utils/features.js";
import { updateFeatures, addParcelleVerif } from "@/cartobio-api.js";

import { CartoBioFeature } from "@agencebio/cartobio-types";
import { click, platformModifierKey } from "ol/events/condition";
import { MultiPoint } from "ol/geom";
import EditParcelleTooltip from "../Overlays/EditParcelleTooltip.vue";
import intersect from "@turf/intersect";
import { MultiPolygon, Polygon } from "@turf/helpers";

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
    new_minus_intersection: Polygon | MultiPolygon;
    existing_minus_intersection: Polygon | MultiPolygon;
    intersection: Polygon | MultiPolygon;
  }[]
>([]);

const parcelle1Area = ref<string | null>(null);
const parcelle2Area = ref<string | null>(null);

const loading: Ref<boolean> = inject("loading", ref(false));

let modify: Modify | null = null;
let selectedFeatures: Collection<Feature>;
let tooltip: Tooltip;

/**
 * Corrections
 */
const isCorrecting = ref(false);

const correctionSource = new VectorSource();
const correctionLayer = new VectorLayer({
  source: correctionSource,
});

const intersectionSource = new VectorSource();
const intersectionLayer = new VectorLayer({
  source: intersectionSource,
});

const featureToKeepForCorrection = new Collection<Feature>();

let originalModifiedFeature: Feature | null = null;
let originalOverlappedFeature: Feature | null = null;

let correctionInteraction: Select | null = null;
let correctedParcellesId: string[] = [];

/*
 * * Computed
 */

const numberSelectedFeature = computed(() => {
  return store.selectedIds.length;
});

const globalHa = computed(() => {
  if (isModifying.value && selectedFeatures.getArray().length > 0) {
    return calculateArea(new GeoJSON().writeFeatureObject(selectedFeatures.getArray()[0], {}) as CartoBioFeature);
  }
  let tempo = 0;
  for (const f of store.selectedIds) {
    const feature = store.getFeatureById(f);
    tempo += legalProjectionSurface(feature);
  }

  return inHa(tempo);
});

/*
 * * Fonctions :  interactions
 */

const resetEdit = () => {
  props.undoRedo.clear();
  isModifying.value = false;

  resetCorrection();
  nextTick(() => {
    initModifyInteraction(selectedFeatures, tooltip);
  });
};

const resetCorrection = (resetModifiedFeature = true) => {
  correctionSource.clear();
  intersectionSource.clear();
  props.map.removeLayer(correctionLayer);
  props.map.removeLayer(intersectionLayer);
  corrections.value = [];
  isCorrecting.value = false;
  featureToKeepForCorrection.clear();
  const format = new GeoJSON();
  const selectedIds = store.selectedIds as string[];
  for (const id of [...correctedParcellesId, ...selectedIds]) {
    const feature = store.getFeatureById(id);

    if (!feature) {
      continue;
    }
    const displayedFeature = props.vectorSource.getFeatureById(id);

    if (!displayedFeature) {
      continue;
    }
    if (resetModifiedFeature === true || !selectedIds.includes(id)) {
      displayedFeature.setGeometry((format.readFeature(feature) as Feature).getGeometry());
      if (selectedIds.includes(id)) {
        displayedFeature.setStyle([getPolygonStyle(), getPointStyle()]);
        continue;
      }
      displayedFeature.setStyle();
    }
  }
  correctedParcellesId = [];
  if (correctionInteraction) {
    props.map.removeInteraction(correctionInteraction);
  }
};

// Une seule action par modify pour faire fonctionner le undo redo
const initModifyInteraction = (selectedFeatures: Collection<Feature>, tooltip: Tooltip) => {
  if (modify) {
    props.map.removeInteraction(modify);
    modify = null;
  }

  tooltip.setFeature(selectedFeatures.getArray()[0]);
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

  modify.on("modifystart", () => {
    if (corrections.value.length > 0) {
      resetCorrection(false);
    }
    isModifying.value = true;
    props.map.addOverlay(tooltip);
  });

  modify.on("modifyend", () => {
    props.map.removeOverlay(tooltip);
    selectedFeatures.forEach((f) => f.setStyle([getPolygonStyle(), getPointStyle()]));
    initModifyInteraction(selectedFeatures, tooltip);
  });
};
const modifyInteraction = () => {
  selectedFeatures = new Collection<Feature>();
  tooltip = new Tooltip({
    className: "draw-tooltip",
    closeBox: false,
    positioning: "bottom-left",
    offset: [10, -10],
    getHTML: createTooltipContent,
  });
  const select = createSelectInteraction(selectedFeatures);

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

    store.setSelectedIds(selectedIds);

    if (selectedIds.length === 1) {
      initModifyInteraction(selectedFeatures, tooltip);
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

  props.undoRedo.on("undo", () => {
    resetCorrection(false);
    selectedFeatures.forEach((f) => f.setStyle([getPolygonStyle(), getPointStyle()]));
  });
  props.undoRedo.on("redo", () => {
    resetCorrection(false);
    selectedFeatures.forEach((f) => f.setStyle([getPolygonStyle(), getPointStyle()]));
  });
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
      const allCoords = (feature.getGeometry() as Polygon)?.getCoordinates();
      if (allCoords?.length) {
        const points = allCoords.flat();
        return new MultiPoint(points);
      }
    },
    zIndex: 6,
  });
};

const createSelectInteraction = (selectedFeatures: Collection<Feature>): Select => {
  const source = props.vectorLayer.getSource();
  const alreadySelectedIds = store.selectedIds ?? [];

  alreadySelectedIds.forEach((id: number) => {
    const feature = source?.getFeatureById(id);
    if (feature && !selectedFeatures.getArray().includes(feature)) {
      selectedFeatures.push(feature);
    }
  });

  const selectInteraction = new Select({
    layers: [props.vectorLayer],
    condition: (e) => !isModifying.value && click(e),
    toggleCondition: platformModifierKey,
    multi: true,
    features: selectedFeatures,
    style: () => {
      if (store.selectedIds.length >= 2) {
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
  const selectdId = store.selectedIds[0];
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
    loading.value = true;

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
      store.setAll(result.parcelles.features);
      nextTick(() => {
        props.undoRedo.clear();
        store.setSelectedIds([]);
        selectedFeatures.clear();
        initModifyInteraction(selectedFeatures, tooltip);
      });
    }
    loading.value = false;
    correctedParcellesId = [];
    isModifying.value = false;
    mapPrefs.value.currentMode = "edit";
    props.undoRedo.clear();

    return;
  }

  if (data.corrections) {
    corrections.value = data.corrections;
    props.map.addLayer(intersectionLayer);

    for (const correction of corrections.value) {
      const feature = new GeoJSON().readFeature(correction.intersection) as Feature;
      feature.setStyle(
        new Style({
          fill: new FillPattern({
            pattern: "hatch",
            ratio: 1,
            color: "red",
            offset: 0,
            scale: 2,
            fill: new Fill({ color: "rgba(0, 0, 0, 0)" }),
            size: 2,
            spacing: 6,
            angle: 0,
          }),
          stroke: new Stroke({ color: "red", width: 1 }),
        }),
      );
      intersectionSource.addFeature(feature);
    }
  }
};

const selectToCorrect = (
  correction: {
    id: string;
    new_minus_intersection: Polygon | MultiPolygon;
    existing_minus_intersection: Polygon | MultiPolygon;
  },
  modifiedFeature: Feature,
  overlappedFeature: Feature,
  originalModifiedFeature: Feature | null,
  originalOverlappedFeature: Feature | null,
) => {
  if (!originalModifiedFeature || !originalOverlappedFeature) {
    return;
  }
  const format = new GeoJSON();

  if (featureToKeepForCorrection.getLength() === 0) {
    featureToKeepForCorrection.push(modifiedFeature);
  }

  const selectId = featureToKeepForCorrection.getArray()[0]?.get("id");

  if (selectId === modifiedFeature.get("id")) {
    originalModifiedFeature.setGeometry(modifiedFeature.getGeometry());
    const feature = format.readFeature(correction.existing_minus_intersection) as Feature;

    originalOverlappedFeature.setGeometry(feature.getGeometry());

    if (!correctedParcellesId.includes(correction.id)) {
      correctedParcellesId.push(correction.id);
    }

    const updatedParcelle1Geometry = format.writeFeatureObject(originalModifiedFeature, {});
    parcelle1Area.value = calculateArea(updatedParcelle1Geometry as CartoBioFeature);

    const updatedParcelle2Geometry = format.writeFeatureObject(originalOverlappedFeature, {});
    parcelle2Area.value = calculateArea(updatedParcelle2Geometry as CartoBioFeature);

    return;
  }

  originalOverlappedFeature.setGeometry(overlappedFeature.getGeometry());
  const newGeometry = intersect(
    correction.new_minus_intersection,
    format.writeFeatureObject(originalModifiedFeature) as CartoBioFeature,
  );

  if (!newGeometry) {
    return;
  }

  const feature = format.readFeature(newGeometry) as Feature;
  originalModifiedFeature.setGeometry(feature.getGeometry());

  correctedParcellesId = correctedParcellesId.filter((id) => id !== correction.id);

  const updatedParcelle1Geometry = format.writeFeatureObject(originalModifiedFeature, {});
  parcelle1Area.value = calculateArea(updatedParcelle1Geometry as CartoBioFeature);

  const updatedParcelle2Geometry = format.writeFeatureObject(originalOverlappedFeature, {});
  parcelle2Area.value = calculateArea(updatedParcelle2Geometry as CartoBioFeature);
};

const startCorrection = () => {
  isModifying.value = true;
  if (corrections.value.length === 0) {
    return;
  }
  const correction = corrections.value[0];
  featureToKeepForCorrection.clear();
  correctionSource.clear();
  originalModifiedFeature = props.vectorSource.getFeatureById(store.selectedIds[0]);
  originalOverlappedFeature = props.vectorSource.getFeatureById(correction.id);

  if (!originalModifiedFeature || !originalOverlappedFeature) {
    return;
  }

  const modifiedFeature = originalModifiedFeature.clone();
  const overlappedFeature = originalOverlappedFeature.clone();

  const transparent = new Style({
    stroke: new Stroke({ color: [0, 0, 0, 0] }),
    fill: new Fill({ color: [0, 0, 0, 0] }),
  });

  const parcelle1Style = new Style({
    stroke: new Stroke({
      color: "rgba(247, 103, 239, 1)",
      width: 4,
      lineDash: [8, 6],
    }),
    fill: new Fill({ color: "rgba(247, 103, 239, 0.3)" }),
    zIndex: 4,
  });

  const parcelle2Style = new Style({
    stroke: new Stroke({
      color: "rgba(96, 224, 235, 1)",
      width: 4,
      lineDash: [8, 6],
    }),
    fill: new Fill({ color: "rgba(166, 242, 250, 0.2)" }),
    zIndex: 4,
  });

  modifiedFeature.setStyle(transparent);
  overlappedFeature.setStyle(transparent);
  originalModifiedFeature.setStyle([parcelle1Style, getPointStyle()]);
  const parcelle1Geometry = new GeoJSON().writeFeatureObject(originalModifiedFeature, {});

  parcelle1Area.value = calculateArea(parcelle1Geometry as CartoBioFeature);

  originalOverlappedFeature.setStyle(parcelle2Style);
  const parcelle2Geometry = new GeoJSON().writeFeatureObject(originalOverlappedFeature, {});

  parcelle2Area.value = calculateArea(parcelle2Geometry as CartoBioFeature);

  featureToKeepForCorrection.push(modifiedFeature);
  correctionSource.addFeatures([modifiedFeature, overlappedFeature]);
  props.map.addLayer(correctionLayer);

  correctionInteraction = new Select({
    layers: [correctionLayer],
    condition: click,
    multi: false,
    features: featureToKeepForCorrection,
    style: transparent,
  });

  props.map.addInteraction(correctionInteraction);
  isCorrecting.value = true;

  selectToCorrect(correction, modifiedFeature, overlappedFeature, originalModifiedFeature, originalOverlappedFeature);

  correctionInteraction.on("select", () => {
    selectToCorrect(correction, modifiedFeature, overlappedFeature, originalModifiedFeature, originalOverlappedFeature);
  });
};

const correct = () => {
  if (corrections.value.length === 0 || !originalModifiedFeature || !originalOverlappedFeature) {
    return;
  }

  corrections.value.shift();

  if (correctionInteraction) {
    props.map.removeInteraction(correctionInteraction);
  }

  props.map.removeLayer(correctionLayer);
  originalModifiedFeature.setStyle([getPolygonStyle(), getPointStyle()]);
  originalOverlappedFeature.setStyle();

  if (corrections.value.length === 0) {
    isCorrecting.value = false;
    intersectionSource.clear();
    props.map.removeLayer(intersectionLayer);
    saveModifiedFeature();
  } else {
    startCorrection();
  }
};

const canCorrect = () => {
  if (corrections.value.length === 0) {
    return false;
  }

  for (const correction of corrections.value) {
    if (
      correction.existing_minus_intersection.type !== "Polygon" ||
      correction.new_minus_intersection.type !== "Polygon"
    ) {
      return false;
    }
  }

  return true;
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

watch(
  () => props.hasUndo,
  (newValue) => {
    if (!newValue) isModifying.value = false;
  },
);

/**
 * * States fonctions
 */
onMounted(() => {
  modifyInteraction();
});
onUnmounted(() => {
  props.undoRedo.clear();
});
</script>

<style scoped>
.correct-parcelle {
  position: absolute;
  bottom: 10%;
  left: 55%;
  background: white;
  z-index: 1000;
  padding: 8px 12px;
  display: flex;
  gap: 5px;
  max-width: 50ch;
  border-radius: 6px;
  flex-direction: column;
}

.error {
  color: var(--text-default-error);
  margin-right: 10px;
}

.title {
  align-content: center;
}

.pop-in-info {
  position: absolute;
  top: 75px;
  left: 50%;
  transform: translateX(-50%);
  background: white;
  z-index: 1000;
  padding: 5px;
  display: flex;
  gap: 5px;
  border-radius: 4px;
}

.division-overlay {
  background: white;
  padding: 8px 12px;
  font-size: 14px;
  white-space: nowrap;
  border-radius: 4px;
  display: flex;
}

.area-info {
  width: 12px;
  height: 12px;
  border-radius: 2px;
}

.area-info.blue {
  width: 15px;
  height: 15px;

  background: rgba(247, 103, 239, 0.3);
  border: 2px dashed #f767ef;

  flex: none;
  order: 0;
  flex-grow: 0;
}

.area-info.green {
  width: 15px;
  height: 15px;

  background: rgba(88, 197, 207, 0.5);
  border: 2px dashed #60e0eb;

  flex: none;
  order: 0;
  flex-grow: 0;
}
</style>
