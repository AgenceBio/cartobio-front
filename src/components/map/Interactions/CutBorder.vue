<template>
  <div class="pop-in-top border">
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
    <div class="column fr-checkbox-group">
      <label class="fr-label fr-text--bold" for="largeur-bordure" aria-label="Largeur de la bordure"
        >Distance (m)</label
      >
      <input
        type="number"
        id="largeur-bordure"
        step="0.01"
        class="fr-input fr-mt-0 distance-input"
        v-model="distance"
        @change="setDistance"
      />
    </div>
    <div class="column">
      <button class="fr-btn" :disabled="!hasBordure" @click="validateDivision">Découper</button>
      <button class="fr-btn" :disabled="!hasBordure" @click="resetChoice">Réinitialiser</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, createApp } from "vue";
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
import DivisionOverlay from "../Overlays/DivisionOverlay.vue";

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
let isInverted = false;
let allBorder = false;
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
        fill: new Fill({ color: [40, 167, 69, 1] }),
        stroke: new Stroke({ color: "white", width: 2 }),
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
        fill: new Fill({ color: [40, 167, 69, 1] }),
        stroke: new Stroke({ color: "white", width: 2 }),
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
        fill: new Fill({ color: [40, 167, 69, 1] }),
        stroke: new Stroke({ color: "white", width: 2 }),
      }),
    }),
    zIndex: 10,
  });

  previewBorderSource = new VectorSource();
  previewBorderLayer = new VectorLayer({
    source: previewBorderSource,
    style: new Style({
      stroke: new Stroke({ color: [40, 167, 69, 0.8], width: 2 }),
      fill: new Fill({ color: [40, 167, 69, 0.3] }),
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
  if (allBorder) {
    bordureJsts = allBordureJsts;
  } else {
    const parcelle = parser.write(parcelleSansBordureJsts);
    const splittingLine = getSplittingLine(distance.value * 1.1, polygonIn3857, parcelle);
    const lineJsts = parser.read(splittingLine);

    const union = allBordureJsts.getExteriorRing().union(lineJsts);
    const polygonizer = new jsts.operation.polygonize.Polygonizer();
    polygonizer.add(union);
    const polys = polygonizer.getPolygons();
    bordureJsts = polys.array
      .filter((poly) => poly.intersection(allBordureJsts).getArea() > 0)
      [+isInverted].intersection(allBordureJsts);
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

  const numeroI = targetFeature.get("NUMERO_I") || "";
  const numeroP = targetFeature.get("NUMERO_P") || "";
  const nom = targetFeature.get("NOM") || "";

  let text = "";
  if (numeroI.toString() !== "") {
    text = `Ilôt ${numeroI} parcelle ${numeroP}\r`;
  } else if (nom) {
    text = nom;
  }

  resSource?.clear();
  resSource?.addFeature(featureWithoutBordure);
  resSource?.addFeature(res);

  const parcelle1Geometry = new GeoJSON().writeFeatureObject(featureWithoutBordure, {});
  const parcelle1Area = calculateArea(parcelle1Geometry as CartoBioFeature);

  const parcelle2Geometry = new GeoJSON().writeFeatureObject(res, {});
  const parcelle2Area = calculateArea(parcelle2Geometry as CartoBioFeature);

  createTooltipOverlay(props.map, `Découpe de la parcelle : ${text}`, parcelle1Area, parcelle2Area);

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

const calculateArea = (feature: CartoBioFeature): number => {
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

const createTooltipOverlay = (map: Map, libelle: string, area1: number, area2: number): void => {
  if (!targetFeature) return;
  const extent = targetFeature.getGeometry()?.getExtent();

  if (!extent) {
    return;
  }
  const [minX, , maxX, maxY] = extent;
  const centerX = (minX + maxX) / 2;
  const positionning = [centerX, maxY];

  const element = document.createElement("div");

  const app = createApp(DivisionOverlay, {
    libelle,
    area1,
    area2,
  });

  app.mount(element);

  const overlay = new Overlay({
    element,
    offset: [0, -15],
    positioning: "bottom-center",
  });

  if (currentOverlay) {
    map.removeOverlay(overlay);
    currentOverlay = null;
  }
  map.addOverlay(overlay);
  currentOverlay = overlay;

  overlay.setPosition(positionning);
};

const invertSelection = () => {
  isInverted = !isInverted;
  if (startBorderPoint && endBorderPoint) {
    drawBorder();
  }
};

const toggleAllBorder = () => {
  allBorder = !allBorder;
  hasBordure.value = allBorder;
  previewClosestPointSource?.clear();
  previewStartPointSource?.clear();
  previewEndPointSource?.clear();
  if (allBorder) {
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
  if ((!isNaN(distance.value) && startBorderPoint && endBorderPoint) || allBorder) {
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
.column {
  display: flex;
  flex-direction: column;
  justify-content: space-evenly;
  gap: 10px;
}

.distance-input {
  width: 10ch;
}

.pop-in-top.border {
  gap: 10px;
  padding: 8px 10px;
}
</style>
