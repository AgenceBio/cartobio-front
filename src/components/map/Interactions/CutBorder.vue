<template>
  <div>
    <div class="pop-in-top border" role="region" aria-label="Découpe de bordure">
      <div class="title fr-mr-2v">
        <i class="ri-crop-line" aria-hidden="true" />
        <strong class="fr-ml-1v">Bordure</strong>
      </div>
      <label class="fr-label" for="largeur-bordure" aria-label="Largeur de la bordure">Distance (m)</label>
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
        @click="mapPrefs.currentMode = 'edit'"
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
        <div style="display: flex; align-items: center; gap: 8px" class="fr-ml-2v" role="dialog" aria-labelledby="delete-title">
          <span class="area-info green"></span>
          {{ parcelle1Area }} ha
        </div>
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
import { createFeaturesFromOther } from "@/cartobio-api.js";

import { CartoBioFeature } from "@agencebio/cartobio-types";
import { Coordinate } from "ol/coordinate";
import CircleStyle from "ol/style/Circle";
import proj4 from "proj4";
import {
  Geometry,
  GeometryCollection,
  LinearRing,
  LineString,
  MultiLineString,
  MultiPoint,
  MultiPolygon,
  Point,
  Polygon,
} from "ol/geom";
import * as jsts from "jsts/dist/jsts.min";

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

/*
 * * Refs
 */

// Refs découpe bordure
const hasBordure = ref<boolean>(false);
const distance = ref<number>(5);

const loading: Ref<boolean> = inject("loading", ref(false));

const parcelle1Area: Ref<number | null> = ref(null);
const parcelle2Area: Ref<number | null> = ref(null);

/*
 * * Computed
 */

/*
 * * Constantes
 */

const resSource = new VectorSource();

/*
 * * Fonctions :  interactions
 */

let dragStart: Translate | null = null;
let dragEnd: Translate | null = null;
let changeBorder: Translate | null = null;
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
let startSegmentIndex = -1;
let endSegmentIndex = -1;
const isInverted = ref(false);
const allBorder = ref(false);
let isDragging = false;

let handleMapClick: () => void;
let handlePointerMove: (e: MapBrowserEvent) => void;

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
      startSegmentIndex = closestSegmentIndex;
    } else if (!endBorderPoint) {
      props.map.un("pointermove", handlePointerMove);
      props.map.un("click", handleMapClick);
      endBorderPoint = closestPoint;
      endSegmentIndex = closestSegmentIndex;
      closestPoint = null;
      if (previewStartPointLayer && !dragStart) {
        dragStart = dragPoint(previewStartPointLayer, (v: { point: Coordinate; segment: number }) => {
          startBorderPoint = v.point;
          startSegmentIndex = v.segment;
        });
      }
      if (previewEndPointLayer && !dragEnd) {
        dragEnd = dragPoint(previewEndPointLayer, (v: { point: Coordinate; segment: number }) => {
          endBorderPoint = v.point;
          endSegmentIndex = v.segment;
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

function changeBorderSize() {
  if (!previewBorderLayer) return null;
  const translate = new Translate({
    layers: [previewBorderLayer],
  });

  translate.on("translating", function (event) {
    isDragging = true;

    const coordinate = proj4("EPSG:4326", "EPSG:3857", event.coordinate);
    const geometry = targetFeature?.getGeometry();
    const tmpClosestPoint = geometry?.getClosestPoint(event.coordinate);
    if (!tmpClosestPoint) return;
    const closestPoint = proj4("EPSG:4326", "EPSG:3857", tmpClosestPoint);
    const segment = new LineString([coordinate, closestPoint]);
    distance.value = +segment.getLength().toFixed(2);
    drawBorder();
  });

  // Écouter l'événement modifyend
  translate.on("translateend", function () {
    isDragging = false;
  });

  props.map.addInteraction(translate);
  return translate;
}
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
        startSegmentIndex = v.segment;
      });
      dragEnd = dragPoint(previewEndPointLayer, (v: { point: Coordinate; segment: number }) => {
        endBorderPoint = v.point;
        endSegmentIndex = v.segment;
      });
    }
    drawBorder();
  }
};

const drawBorder = () => {
  if (!changeBorder) {
    changeBorder = changeBorderSize();
  }
  if (currentOverlay) {
    props.map.removeOverlay(currentOverlay);
    currentOverlay = null;
  }
  previewBorderSource?.clear();
  if (!targetFeature) return;
  const polygonIn3857 = targetFeature.getGeometry()?.clone();

  if (!polygonIn3857) return;

  polygonIn3857.setCoordinates(
    polygonIn3857.getCoordinates().map((coord: number[][]) => {
      return coord.map((point: number[]) => proj4("EPSG:4326", "EPSG:3857", point));
    }),
  );

  const parser = new jsts.io.OL3Parser();
  parser.inject(Point, LineString, LinearRing, Polygon, MultiPoint, MultiLineString, MultiPolygon, GeometryCollection);

  const parcelleJsts = parser.read(polygonIn3857);
  const parcelleAggrandieJsts = parcelleJsts.buffer(0.01);

  const parcelleSansBordureJsts = parcelleAggrandieJsts.buffer(-(distance.value + 0.01));
  const allBordureJsts = parcelleAggrandieJsts.difference(parcelleSansBordureJsts);

  let bordureJsts;
  if (allBorder.value) {
    bordureJsts = allBordureJsts;
  } else {
    const parcelle = parser.write(parcelleSansBordureJsts);
    let splittingLine;
    try {
      splittingLine = getSplittingLine(distance.value * 1.1, polygonIn3857, parcelle);
    } catch (e) {
      return;
    }

    const lineJsts = parser.read(splittingLine);

    const union = allBordureJsts.getExteriorRing().union(lineJsts);
    const polygonizer = new jsts.operation.polygonize.Polygonizer();
    polygonizer.add(union);
    const polys = polygonizer.getPolygons();
    bordureJsts = polys.array
      .filter((poly) => poly.intersection(allBordureJsts).getArea() > 0)
      [+isInverted.value].intersection(allBordureJsts);
  }

  const bordure = parser.write(bordureJsts);
  bordure.setCoordinates(
    bordure.getCoordinates().map((coord: number[][]) => {
      return coord.map((point: number[]) => proj4("EPSG:3857", "EPSG:4326", point));
    }),
  );

  const withoutBordure = parser.write(parcelleJsts.difference(bordureJsts));
  withoutBordure.setCoordinates(
    withoutBordure.getCoordinates().map((coord: number[][]) => {
      return coord.map((point: number[]) => proj4("EPSG:3857", "EPSG:4326", point));
    }),
  );

  const res = new Feature({
    ...targetFeature.getProperties(),
    geometry: bordure,
  });

  const featureWithoutBordure = new Feature({
    ...targetFeature.getProperties(),
    geometry: withoutBordure,
  });

  resSource?.clear();
  resSource?.addFeature(featureWithoutBordure);
  resSource?.addFeature(res);

  const parcelle1Geometry = new GeoJSON().writeFeatureObject(featureWithoutBordure, {});
  parcelle1Area.value = calculateArea(parcelle1Geometry as CartoBioFeature);

  const parcelle2Geometry = new GeoJSON().writeFeatureObject(res, {});
  parcelle2Area.value = calculateArea(parcelle2Geometry as CartoBioFeature);

  previewBorderSource?.addFeature(res);
  hasBordure.value = true;
};

const getSplittingLine = (projectionDistance: number, geometry: Geometry, buffer: Geometry) => {
  const polygon = geometry.getCoordinates()[0];
  if (startSegmentIndex == -1 || endSegmentIndex == -1 || !startBorderPoint || !endBorderPoint || !targetFeature)
    return null;

  const startPoint = proj4("EPSG:4326", "EPSG:3857", [startBorderPoint[0], startBorderPoint[1]]);
  const endPoint = proj4("EPSG:4326", "EPSG:3857", [endBorderPoint[0], endBorderPoint[1]]);
  const startSlope = calculateSlope(
    polygon[startSegmentIndex],
    polygon[(startSegmentIndex + 1) % (polygon.length - 1)],
  );
  const endSlope = calculateSlope(polygon[endSegmentIndex], polygon[(endSegmentIndex + 1) % (polygon.length - 1)]);

  // Calculer les points A et B
  let pointA = calculateDestinationPoint(startPoint, projectionDistance, startSlope);
  let extendedStartPoint = calculateDestinationPoint(startPoint, -1, startSlope);
  if (!isPointInPolygon(pointA, geometry)) {
    pointA = calculateDestinationPoint(startPoint, -projectionDistance, startSlope);
    extendedStartPoint = calculateDestinationPoint(startPoint, 1, startSlope);
  }

  if (!isPointInPolygon(pointA, geometry)) {
    throw new Error("Bordure plus grande que la parcelle");
  }

  let pointB = calculateDestinationPoint(endPoint, projectionDistance, endSlope);
  let extendedEndPoint = calculateDestinationPoint(endPoint, -1, endSlope);
  if (!isPointInPolygon(pointB, geometry)) {
    pointB = calculateDestinationPoint(endPoint, -projectionDistance, endSlope);
    extendedEndPoint = calculateDestinationPoint(endPoint, 1, endSlope);
  }

  if (!isPointInPolygon(pointB, geometry)) {
    throw new Error("Bordure plus grande que la parcelle");
  }

  const points = [];
  for (let i = startSegmentIndex; i % (polygon.length - 1) != endSegmentIndex % (polygon.length - 1); i++) {
    let startPoint = polygon[i % (polygon.length - 1)];
    const nextPoint =
      i + 1 === endSegmentIndex ? calculateMidpoint(startPoint, endPoint) : polygon[(i + 1) % (polygon.length - 1)];

    if (i === startSegmentIndex) {
      startPoint = calculateMidpoint(nextPoint, startPoint);
    }

    const slope = calculateSlope(startPoint, nextPoint);
    let tmpPoint = calculateDestinationPoint(startPoint, projectionDistance * 5, slope);
    if (!isPointInPolygon(tmpPoint, buffer)) {
      tmpPoint = calculateDestinationPoint(startPoint, -projectionDistance * 5, slope);
    }

    if (isPointInPolygon(tmpPoint, buffer)) {
      points.push(tmpPoint);
    }
    tmpPoint = calculateDestinationPoint(nextPoint, projectionDistance * 5, slope);
    if (!isPointInPolygon(tmpPoint, buffer)) {
      tmpPoint = calculateDestinationPoint(nextPoint, -projectionDistance * 5, slope);
    }

    if (isPointInPolygon(tmpPoint, buffer)) {
      points.push(tmpPoint);
    }
  }

  const lineCoordinates = [extendedStartPoint, startPoint, pointA, ...points, pointB, endPoint, extendedEndPoint];

  return new LineString(lineCoordinates);
};

/*
 * * Utils
 */

const calculateArea = (feature: CartoBioFeature): string => {
  return inHa(legalProjectionSurface(feature));
};

const calculateSlope = (startPoint: Coordinate, endPoint: Coordinate) => {
  const slope = (endPoint[1] - startPoint[1]) / (endPoint[0] - startPoint[0]);

  return -1 / slope;
};

const calculateDestinationPoint = (startPoint: Coordinate, distance: number, slope: number) => {
  const x = startPoint[0] + distance / Math.sqrt(1 + slope * slope);
  const y = startPoint[1] + slope * (x - startPoint[0]);
  return [x, y];
};

const calculateMidpoint = (pointA: number[], pointB: number[]) => {
  return [(pointA[0] + pointB[0]) / 2, (pointA[1] + pointB[1]) / 2];
};

const isPointInPolygon = (point: Coordinate, geom: Geometry) => {
  return geom.intersectsCoordinate(point);
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

  for (const modifiedFeature of resSource.getFeatures()) {
    modifiedFeatures.push(geoJson.writeFeatureObject(modifiedFeature.clone()) as CartoBioFeature);
  }
  loading.value = true;
  const result = await createFeaturesFromOther(props.recordId, modifiedFeatures, [selectdId]);

  if (result) {
    store.unselectAll([]);
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
  mapPrefs.value.currentMode = "edit";
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
  startSegmentIndex = -1;
  endSegmentIndex = -1;
  hasBordure.value = false;
  parcelle1Area.value = 0;
  parcelle2Area.value = 0;

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

/**
 * * States fonctions
 */
onMounted(() => {
  targetFeature = getTargetFeature();
  borderInteraction();
});
onUnmounted(() => {
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

.pop-in-info {
  position: absolute;
  top: 12%;
  left: 50%;
  transform: translateX(-50%);
  background: white;
  z-index: 1000;
  padding: 5px;
  display: flex;
  gap: 5px;
  border-radius: 10px;
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
  white-space: normal; /* permet retour à la ligne */
  width: max-content;
  max-width: 220px; /* limite pour éviter des tooltips trop larges */
  pointer-events: none;
  transition: opacity 0.2s ease-in-out;
  z-index: 2000;
}

button[data-tooltip]:hover::after {
  opacity: 1;
}
</style>
