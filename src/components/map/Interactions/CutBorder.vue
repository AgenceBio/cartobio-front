<template>
  <div>
    <div class="pop-in-top border" role="region" aria-label="Découpe de bordure">
      <div class="title fr-mr-2v">
        <i class="ri-crop-line" aria-hidden="true" />
        <strong class="fr-ml-1v">Bordure</strong>
      </div>
      <label class="fr-label" for="largeur-bordure" aria-label="Largeur de la bordure">Largeur&nbsp;(m)</label>
      <input
        type="number"
        id="largeur-bordure"
        step="0.01"
        class="fr-input fr-mt-0 distance-input"
        v-model="distance"
        @change="setDistance"
      />
      <button
        class="fr-btn fr-btn--sm fr-btn--tertiary-no-outline"
        data-tooltip="Inverser la séléction"
        aria-label="Inverser la séléction"
        @click="invertSelection"
        :disabled="!hasBordure"
      >
        <i class="ri-arrow-left-right-line"></i>
      </button>
      <button
        class="fr-btn fr-btn--sm"
        :class="[allBorder ? 'fr-btn--secondary' : 'fr-btn--tertiary-no-outline']"
        @click="toggleAllBorder"
        data-tooltip="Faire la découpe tout autour de la parcelle"
        aria-label="Faire la découpe tout autour de la parcelle"
      >
        <i class="ri-shape-line"></i>
      </button>
      <button
        class="fr-btn fr-btn--sm fr-icon-check-line fr-btn--icon-right fr-mr-1v"
        :disabled="!hasBordure"
        aria-label="Découper"
        @click="validateDivision"
      >
        Découper
      </button>
      <div class="vr" />
      <button
        class="fr-btn fr-btn--sm fr-btn--tertiary-no-outline"
        aria-label="Annuler la découpe"
        v-if="hasBordure"
        @click="resetChoice"
      >
        Annuler
      </button>
      <button
        class="fr-btn fr-btn--sm fr-btn--tertiary-no-outline"
        aria-label="Retourner au mode editer"
        v-else
        @click="mapParams.currentMode = 'edit'"
      >
        <i class="fr-icon-close-line fr-icon--sm"></i>
      </button>
    </div>
    <div class="pop-in-info" role="status" aria-live="polite" v-if="parcelle1Area != null && parcelle2Area != null">
      <div class="division-overlay">
        <div style="display: flex; align-items: center; gap: 8px">
          <span class="area-info blue"></span>
          {{ parcelle2Area }} ha
        </div>
        <div
          style="display: flex; align-items: center; gap: 8px"
          class="fr-ml-2v"
          role="dialog"
          aria-labelledby="delete-title"
        >
          <span class="area-info green"></span>
          {{ parcelle1Area }} ha
        </div>
      </div>
    </div>
    <div class="pop-in-info error" role="alert" aria-live="assertive" v-if="errorMessage">
      <div class="error-message">
        <i class="ri-error-warning-line" aria-hidden="true"></i>
        {{ errorMessage }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, Ref, inject } from "vue";
import { storeToRefs } from "pinia";

import { Map, MapBrowserEvent, Overlay } from "ol";
import { Feature } from "ol";
import VectorLayer from "ol/layer/Vector";
import VectorSource from "ol/source/Vector";
import GeoJSON from "ol/format/GeoJSON";
import { Style, Fill, Stroke } from "ol/style";
import { Translate } from "ol/interaction";

import { useFeaturesStore } from "@/stores/features.js";
import { usePreferences } from "@/stores/preferences.js";
import { legalProjectionSurface, inHa } from "@/utils/features.js";

// Utils Geom
import { createFeaturesFromOther, getCutBorder } from "@/cartobio-api.js";

import { CartoBioFeature } from "@agencebio/cartobio-types";
import { Coordinate } from "ol/coordinate";
import CircleStyle from "ol/style/Circle";
import proj4 from "proj4";
import { LineString, Point } from "ol/geom";

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

const { params: mapParams } = storeToRefs(preferences);

/*
 * * Refs
 */

// Refs découpe bordure
const hasBordure = ref<boolean>(false);
const distance = ref<number>(5);

const loading: Ref<boolean> = inject("loading", ref(false));

const parcelle1Area: Ref<number | null> = ref(null);
const parcelle2Area: Ref<number | null> = ref(null);

const errorMessage: Ref<string | null> = ref(null);

/**
 * * Emits
 */
const emit = defineEmits<{
  (e: "endCut"): void;
}>();

/*
 * * Constantes
 */

const resSource = new VectorSource();

const SNAP_TOLERANCE = 15;

const neighborStyles: Record<string, any> = {};

let snapHighlightSource: VectorSource | null = null;
let snapHighlightLayer: VectorLayer<VectorSource> | null = null;
let isSnapActive = false;

/*
 * * Fonctions :  interactions
 */

let dragStart: Translate | null = null;
let dragEnd: Translate | null = null;
let currentOverlay: Overlay | null = null;
let targetFeature: Feature | null = null;
let previewClosestPointSource: VectorSource | null = null;
let previewClosestPointLayer: VectorLayer<VectorSource> | null = null;
let previewStartPointSource: VectorSource | null = null;
let previewStartPointLayer: VectorLayer<VectorSource> | null = null;
let previewEndPointSource: VectorSource | null = null;
let previewEndPointLayer: VectorLayer<VectorSource> | null = null;
let previewBorderSource: VectorSource | null = null;
let previewBorderLayer: VectorLayer<VectorSource> | null = null;
let closestPoint: Coordinate | undefined | null;
let closestSegmentIndex = -1;
let startBorderPoint: Coordinate | undefined | null;
let endBorderPoint: Coordinate | undefined | null;
const isInverted = ref(false);
const allBorder = ref(false);
let isDragging = false;

let handleMapClick: () => void;
let handlePointerMove: (e: MapBrowserEvent) => void;

/*
 * * Fonctions : Snap highlight
 */

const initSnapHighlightLayer = () => {
  snapHighlightSource = new VectorSource();
  snapHighlightLayer = new VectorLayer({
    source: snapHighlightSource,
    style: new Style({
      stroke: new Stroke({ color: "rgba(255, 215, 0, 1)", width: 3 }),
    }),
    zIndex: 11,
  });
  props.map.addLayer(snapHighlightLayer);
};

const showSnapHighlight = () => {
  if (!snapHighlightSource || !targetFeature || isSnapActive) return;
  const highlightFeature = new Feature({ geometry: targetFeature.getGeometry() });
  snapHighlightSource.addFeature(highlightFeature);
  isSnapActive = true;
};

const removeSnapHighlight = () => {
  snapHighlightSource?.clear();
  isSnapActive = false;
};

const borderInteraction = (): void => {
  if (!targetFeature) return;

  previewClosestPointSource = new VectorSource();
  previewClosestPointLayer = new VectorLayer({
    source: previewClosestPointSource,
    style: new Style({
      image: new CircleStyle({
        radius: 6,
        fill: new Fill({ color: "rgba(247, 103, 239, 1)" }),
      }),
    }),
    zIndex: 6,
  });

  previewStartPointSource = new VectorSource();
  previewStartPointLayer = new VectorLayer({
    source: previewStartPointSource,
    style: new Style({
      image: new CircleStyle({
        radius: 6,
        fill: new Fill({ color: "rgba(247, 103, 239, 1)" }),
      }),
    }),
    zIndex: 9,
  });

  previewEndPointSource = new VectorSource();
  previewEndPointLayer = new VectorLayer({
    source: previewEndPointSource,
    style: new Style({
      image: new CircleStyle({
        radius: 6,
        fill: new Fill({ color: "rgba(247, 103, 239, 1)" }),
      }),
    }),
    zIndex: 10,
  });

  previewBorderSource = new VectorSource();
  previewBorderLayer = new VectorLayer({
    source: previewBorderSource,
    style: new Style({
      stroke: new Stroke({
        color: "rgba(247, 103, 239, 1)",
        width: 4,
        lineDash: [10, 20, 10, 20],
        lineCap: "square",
        lineJoin: "bevel",
      }),
      fill: new Fill({ color: "rgba(247, 103, 239, 0.6)" }),
    }),
    zIndex: 8,
  });

  props.map.addLayer(previewClosestPointLayer);
  props.map.addLayer(previewStartPointLayer);
  props.map.addLayer(previewEndPointLayer);
  props.map.addLayer(previewBorderLayer);

  handlePointerMove = (event: MapBrowserEvent) => {
    movePoint(event);
  };

  props.map.on("pointermove", handlePointerMove);

  handleMapClick = () => {
    if (!closestPoint) return;

    if (!startBorderPoint) {
      startBorderPoint = closestPoint;
    } else if (!endBorderPoint) {
      props.map.un("pointermove", handlePointerMove);
      props.map.un("click", handleMapClick);
      endBorderPoint = closestPoint;
      closestPoint = null;
      if (previewStartPointLayer && !dragStart) {
        dragStart = dragPoint(previewStartPointLayer, (v: { point: Coordinate; segment: number }) => {
          startBorderPoint = v.point;
        });
      }
      if (previewEndPointLayer && !dragEnd) {
        dragEnd = dragPoint(previewEndPointLayer, (v: { point: Coordinate; segment: number }) => {
          endBorderPoint = v.point;
        });
      }

      drawPoints();
    }
  };

  props.map.on("click", handleMapClick);
};

const dragPoint = (
  layer: VectorLayer<VectorSource>,
  setValue: (value: { point: Coordinate; segment: number }) => void,
) => {
  const translate = new Translate({
    layers: [layer],
    hitTolerance: 10,
  });

  translate.on("translating", function (event) {
    isDragging = true;
    const coordinate = movePoint(event as unknown as MapBrowserEvent);
    if (coordinate) {
      setValue(coordinate);
    }
  });

  // Écouter l'événement modifyend
  translate.on("translateend", function () {
    isDragging = false;
  });

  props.map.addInteraction(translate);
  return translate;
};

const drawPoints = () => {
  if (!previewClosestPointSource || !previewStartPointSource || !previewEndPointSource) return;
  previewClosestPointSource.clear();
  if (closestPoint && !isDragging) {
    const feature = new Feature({
      geometry: new Point(closestPoint),
    });

    previewClosestPointSource.addFeature(feature);
  }

  if (startBorderPoint) {
    const feature = new Feature({
      geometry: new Point(startBorderPoint),
    });

    previewStartPointSource?.clear();
    previewStartPointSource.addFeature(feature);
  }

  if (endBorderPoint) {
    const feature = new Feature({
      geometry: new Point(endBorderPoint),
    });

    previewEndPointSource.clear();
    previewEndPointSource.addFeature(feature);
  }

  if (startBorderPoint && endBorderPoint) {
    if (!isDragging && previewStartPointLayer && previewEndPointLayer) {
      dragStart = dragPoint(previewStartPointLayer, (v: { point: Coordinate; segment: number }) => {
        startBorderPoint = v.point;
      });
      dragEnd = dragPoint(previewEndPointLayer, (v: { point: Coordinate; segment: number }) => {
        endBorderPoint = v.point;
      });
    }
    drawBorder();
  }
};

const drawBorder = async () => {
  try {
    errorMessage.value = null;

    if (!targetFeature) return;
    if (distance.value < 0.1) {
      errorMessage.value = "Impossible de mettre une distance de 0";
      return;
    }

    const geometry = new GeoJSON().writeGeometryObject(targetFeature.getGeometry());

    const startBorderPointTab = startBorderPoint ? [startBorderPoint[0], startBorderPoint[1]] : undefined;
    const endBorderPointTab = endBorderPoint ? [endBorderPoint[0], endBorderPoint[1]] : undefined;

    const response = await getCutBorder(
      geometry,
      distance.value,
      allBorder.value,
      isInverted.value,
      startBorderPointTab,
      endBorderPointTab,
    );

    if (response.status !== 200) {
      const error = await response.json();
      throw new Error(error.error);
    }

    const result = response.data;

    const targetProperties = targetFeature.getProperties();
    delete targetProperties.geometry;

    previewBorderSource?.clear();

    const featureWithoutBordure = new GeoJSON().readFeature(result.parcelleSansBordure);
    const bordureFeature = new GeoJSON().readFeature(result.bordure);

    featureWithoutBordure.setProperties({ ...targetProperties });
    bordureFeature.setProperties({ ...targetProperties });

    resSource?.clear();
    resSource?.addFeature(featureWithoutBordure);
    resSource?.addFeature(bordureFeature);

    previewBorderSource?.addFeature(bordureFeature);

    parcelle1Area.value = calculateArea(new GeoJSON().writeFeatureObject(featureWithoutBordure, {}) as CartoBioFeature);
    parcelle2Area.value = calculateArea(new GeoJSON().writeFeatureObject(bordureFeature, {}) as CartoBioFeature);

    hasBordure.value = true;
  } catch (e) {
    errorMessage.value = e.message || "La découpe est impossible dû à la forme de la géométrie de la parcelle";
    hasBordure.value = false;
    previewBorderSource?.clear();
  }
};

/*
 * * Utils
 */

const calculateArea = (feature: CartoBioFeature): string => {
  return inHa(legalProjectionSurface(feature));
};

const squaredDistance = (point1: Coordinate, point2: Coordinate) => {
  const p1 = proj4("EPSG:4326", "EPSG:3857", point1);
  const p2 = proj4("EPSG:4326", "EPSG:3857", point2);
  const dx = p1[0] - p2[0];
  const dy = p1[1] - p2[1];
  return dx * dx + dy * dy;
};

const invertSelection = () => {
  isInverted.value = !isInverted.value;
  if (startBorderPoint && endBorderPoint) {
    drawBorder();
  }
};

const toggleAllBorder = () => {
  allBorder.value = !allBorder.value;
  hasBordure.value = allBorder.value;
  previewClosestPointSource?.clear();
  previewStartPointSource?.clear();
  previewEndPointSource?.clear();
  if (allBorder.value) {
    props.map.un("pointermove", handlePointerMove);
    props.map.un("click", handleMapClick);
    drawBorder();
  } else {
    previewBorderSource?.clear();
    if (currentOverlay) {
      props.map.removeOverlay(currentOverlay);
      currentOverlay = null;
    }
    if (!endBorderPoint) {
      props.map.on("pointermove", handlePointerMove);
      props.map.on("click", handleMapClick);
    }
    drawPoints();
  }
};

const setDistance = () => {
  if ((!isNaN(distance.value) && startBorderPoint && endBorderPoint) || allBorder.value) {
    drawBorder();
  }
};

const movePoint = (event: MapBrowserEvent) => {
  if (!previewStartPointSource || !previewEndPointSource) return null;

  const coordinate = event.coordinate;
  const geometry = targetFeature?.getGeometry();
  closestPoint = geometry?.getClosestPoint(coordinate);
  if (!closestPoint) {
    return null;
  }
  previewStartPointSource.clear();
  previewEndPointSource.clear();

  const pixel = props.map.getPixelFromCoordinate(coordinate);
  const closestPixel = props.map.getPixelFromCoordinate(closestPoint);
  const pixelDistance = Math.sqrt(
    Math.pow(pixel[0] - closestPixel[0], 2) + Math.pow(pixel[1] - closestPixel[1], 2),
  );

  if (pixelDistance <= SNAP_TOLERANCE) {
    showSnapHighlight();
  } else {
    removeSnapHighlight();
  }

  drawPoints();

  const coordinates = geometry?.getCoordinates()[0];
  let minSquaredDistance = Infinity;
  for (let i = 0; i < coordinates.length - 1; i++) {
    const start = coordinates[i];
    const end = coordinates[(i + 1) % (coordinates.length - 1)];
    const line = new LineString([start, end]);
    const segmentClosestPoint = line.getClosestPoint(coordinate);
    const sqDist = squaredDistance(segmentClosestPoint, coordinate);
    if (sqDist < minSquaredDistance) {
      minSquaredDistance = sqDist;
      closestSegmentIndex = i;
    }
  }

  return { point: closestPoint, segment: closestSegmentIndex };
};
/*
 * * Fonctions : Data
 */

const validateDivision = async () => {
  const modifiedFeatures: CartoBioFeature[] = [];
  const selectdId = store.selectedIds[0];
  const geoJson = new GeoJSON();

  const originalFeature = store.all.find((f: CartoBioFeature) => f.id === selectdId);
  const baseNom = originalFeature?.properties?.NOM || null;
  const baseNumero = originalFeature?.properties?.NUMERO_P || null;

  const features = resSource.getFeatures();

  features.forEach((feature, index) => {
    const featureClone = feature.clone();
    const featureObj = geoJson.writeFeatureObject(featureClone, {}) as CartoBioFeature;

    console.log(featureObj);
    if (baseNom) {
      featureObj.properties.NOM = `${baseNom}.${index + 1}`;
    } else if (baseNumero) {
      featureObj.properties.NOM = `Parcelle ${baseNumero}.${index + 1}`;
    } else {
      featureObj.properties.NOM = `Parcelle ${index + 1}`;
    }

    modifiedFeatures.push(featureObj);
  });

  loading.value = true;
  const result = await createFeaturesFromOther(props.recordId, modifiedFeatures, [selectdId]);

  if (result) {
    emit("endCut");
    store.unselectAll();
    const newFeatures = result.parcelles.features.filter(
      (f: CartoBioFeature) => !store.all.map((f: CartoBioFeature) => f.id).some((pa: string) => pa === f.id),
    );
    store.setAll(result.parcelles.features);

    const feature = props.vectorLayer.getSource()?.getFeatureById(selectdId);

    if (feature) {
      props.vectorLayer.getSource()?.removeFeature(feature);
    }

    for (const newFeature of newFeatures) {
      props.vectorLayer.getSource()?.addFeature(geoJson.readFeature(newFeature) as Feature);
    }
  }
  loading.value = false;
  mapParams.value.currentMode = "edit";
};

const resetChoice = () => {
  if (previewClosestPointLayer) {
    props.map.removeLayer(previewClosestPointLayer);
  }

  if (previewStartPointLayer) {
    props.map.removeLayer(previewStartPointLayer);
  }

  if (previewEndPointLayer) {
    props.map.removeLayer(previewEndPointLayer);
  }

  if (previewBorderLayer) {
    props.map.removeLayer(previewBorderLayer);
  }

  if (currentOverlay) {
    props.map.removeOverlay(currentOverlay);
    currentOverlay = null;
  }

  closestSegmentIndex = -1;
  startBorderPoint = null;
  endBorderPoint = null;
  hasBordure.value = false;
  parcelle1Area.value = 0;
  parcelle2Area.value = 0;
  errorMessage.value = null;

  removeSnapHighlight();
  borderInteraction();
};

/*
 * * Fonctions : Utils
 */

const getTargetFeature = (): Feature | null => {
  const features = new GeoJSON().readFeatures(store.collection, {});

  if (store.selectedIds && store.selectedIds[0]) {
    const selectedFeature = features.find(
      (feature) => feature.getId() === store.selectedIds[0] || feature.get("id") === store.selectedIds[0],
    );

    if (selectedFeature) {
      return selectedFeature;
    }
  }

  return null;
};

const applyBorderStyle = () => {
  const grayStyle = new Style({
    stroke: new Stroke({ color: "rgba(150, 150, 150, 0.35)", width: 1 }),
    fill: new Fill({ color: "rgba(200, 200, 200, 0.1)" }),
  });

  props.vectorSource.getFeatures().forEach((feature) => {
    const fid = String(feature.getId() ?? feature.get("id") ?? "");
    if (fid && fid !== String(store.selectedIds[0])) {
      neighborStyles[fid] = feature.getStyle();
      feature.setStyle(grayStyle);
    }
  });
};

const restoreFeatureStyles = () => {
  props.vectorSource.getFeatures().forEach((feature) => {
    const fid = String(feature.getId() ?? feature.get("id") ?? "");
    if (fid && Object.prototype.hasOwnProperty.call(neighborStyles, fid)) {
      feature.setStyle(neighborStyles[fid]);
      delete neighborStyles[fid];
    }
  });

  removeSnapHighlight();

  if (snapHighlightLayer) {
    props.map.removeLayer(snapHighlightLayer);
    snapHighlightLayer = null;
    snapHighlightSource = null;
  }
};

/**
 * * States fonctions
 */
onMounted(() => {
  targetFeature = getTargetFeature();
  applyBorderStyle();
  initSnapHighlightLayer();
  borderInteraction();
});
onUnmounted(() => {
  restoreFeatureStyles();

  if (previewClosestPointLayer) {
    props.map.removeLayer(previewClosestPointLayer);
  }

  if (previewStartPointLayer) {
    props.map.removeLayer(previewStartPointLayer);
  }

  if (previewEndPointLayer) {
    props.map.removeLayer(previewEndPointLayer);
  }

  if (previewBorderLayer) {
    props.map.removeLayer(previewBorderLayer);
  }

  if (currentOverlay) {
    props.map.removeOverlay(currentOverlay);
    currentOverlay = null;
  }
});
</script>

<style scoped>
.distance-input {
  width: 12ch;
}

.pop-in-top.border {
  gap: 10px;
  padding: 8px 10px;
  width: fit-content;
}

:deep(button[class^="ri"]),
:deep(button[class*=" ri"]) {
  font-size: 1.2em;
}

.fr-btn {
  height: fit-content;
  margin: auto 0px;
}

.pop-in-info {
  position: absolute;
  top: 128px;
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

.title {
  align-content: center;
}

.fr-label {
  align-content: center;
}

button[data-tooltip] {
  position: relative;
}

button[data-tooltip]::after {
  content: attr(data-tooltip);
  position: absolute;
  left: -5px;
  top: 50%;
  transform: translate(-50%, -100%);
  background: rgba(0, 0, 0, 0.85);
  color: #fff;
  padding: 6px 10px;
  border-radius: 6px;
  font-size: 0.8rem;
  line-height: 1.2;
  opacity: 0;
  white-space: normal;
  /* permet retour à la ligne */
  width: max-content;
  max-width: 220px;
  /* limite pour éviter des tooltips trop larges */
  pointer-events: none;
  transition: opacity 0.2s ease-in-out;
  z-index: 2000;
}

button[data-tooltip]:hover::after {
  opacity: 1;
}

.vr {
  display: inline-block;
  align-self: stretch;
  width: 1px;
  min-height: 0.5em;
  background-color: grey;
  opacity: 0.25;
}

.pop-in-info.error {
  background: #fee;
  border: 1px solid #c00;
}
.error-message {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #c00;
  font-weight: 500;
}

.error-message i {
  font-size: 1.2em;
}
</style>