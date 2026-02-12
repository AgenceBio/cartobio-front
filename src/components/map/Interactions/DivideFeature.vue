<template>
  <div>
    <div class="pop-in-top" role="dialog" aria-labelledby="Découper">
      <div class="title fr-mr-2v">
        <i class="ri-scissors-cut-line" aria-hidden="true" />
        <strong class="fr-ml-1v">Découper</strong>
      </div>
      <button
        class="fr-btn fr-btn--sm fr-icon-check-line fr-btn--icon-right"
        :disabled="!hasDivision"
        @click="validateDivision"
      >
        Découper
      </button>
      <div class="vr" />
      <button
        class="fr-btn fr-btn--sm fr-btn--tertiary-no-outline"
        :disabled="!hasDivision"
        :aria-disabled="!hasDivision"
        @click="cancelDivision"
        v-if="hasDivision"
      >
        Annuler
      </button>
      <button
        class="fr-btn fr-btn--sm fr-btn--tertiary-no-outline fr-icon-close-line fr-icon--sm"
        v-else
        @click="mapParams.currentMode = 'edit'"
        aria-label="Fermer la découpe"
      >
        Fermer
      </button>
    </div>
    <div class="pop-in-info" role="status" v-if="parcelle1Area != null && parcelle2Area != null">
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
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch, Ref, inject } from "vue";
import { storeToRefs } from "pinia";

import { Map, MapBrowserEvent, Overlay } from "ol";
import { Feature } from "ol";
import VectorLayer from "ol/layer/Vector";
import VectorSource from "ol/source/Vector";
import GeoJSON from "ol/format/GeoJSON";

import { useFeaturesStore } from "@/stores/features.js";
import { usePreferences } from "@/stores/preferences.js";
import { legalProjectionSurface, inHa } from "@/utils/features.js";

// Utils Geom
import { createFeaturesFromOther } from "@/cartobio-api.js";
import { unByKey } from "ol/Observable";

import { CartoBioFeature } from "@agencebio/cartobio-types";
import { Draw, Modify, Select, Snap } from "ol/interaction";
import { Fill, RegularShape, Stroke, Style } from "ol/style";
import { click } from "ol/events/condition";
import { DrawEvent } from "ol/interaction/Draw";
import { LinearRing, LineString, MultiLineString, MultiPoint, MultiPolygon, Point, Polygon } from "ol/geom";
import * as jsts from "jsts/dist/jsts.min";
import BaseEvent from "ol/events/Event";
import { EventsKey } from "ol/events";
import { Coordinate } from "ol/coordinate";

import proj4 from "proj4";

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

// Refs division
const hasDivision = ref<boolean>(false);
const currentGeom = ref<LineString | null>(null);

const loading: Ref<boolean> = inject("loading", ref(false));

/*
 * * Constantes
 */

const resSource = new VectorSource();
let targetFeature: Feature | null = null;

let modifyInteraction: Modify | null = null;
let selectInteraction: Select | null = null;
let snapInteraction: Snap | null = null;
let currentOverlay: Overlay | null = null;
let previewLayer: VectorLayer<VectorSource> | null = null;
let drawingLineSource: VectorSource | null = null;
let drawingLineLayer: VectorLayer<VectorSource> | null = null;
let snapIndicatorLayer: VectorLayer<VectorSource> | null = null;
let snapIndicatorSource: VectorSource | null = null;
let clickCount = 0;
const previewSource = new VectorSource();

let geomListenerKey: EventsKey | null = null;
let sourceListenerKey: EventsKey | null = null;
let pointerMoveKey: EventsKey | null = null;

const SNAP_TOLERANCE = 15; // pixels

/*
 * * Refs
 */

const parcelle1Area: Ref<string | null> = ref(null);
const parcelle2Area: Ref<string | null> = ref(null);

/*
 * * Emits
 */

const emit = defineEmits<{
  (e: "endDivide"): void;
}>();

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
    const featureObj = geoJson.writeFeatureObject(featureClone) as CartoBioFeature;

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
  emit("endDivide");
  mapParams.value.currentMode = "edit";
};

const cancelDivision = () => {
  clickCount = 0;
  hasDivision.value = false;
  parcelle1Area.value = null;
  parcelle2Area.value = null;
  resSource.clear();
  previewSource.clear();

  if (previewLayer) {
    props.map.removeLayer(previewLayer);
  }

  if (drawingLineLayer) {
    props.map.removeLayer(drawingLineLayer);
  }

  if (snapIndicatorLayer) {
    props.map.removeLayer(snapIndicatorLayer);
  }

  if (currentOverlay) {
    props.map.removeOverlay(currentOverlay);
  }

  if (modifyInteraction) {
    props.map.removeInteraction(modifyInteraction);
  }

  if (selectInteraction) {
    props.map.removeInteraction(selectInteraction);
  }

  if (snapInteraction) {
    props.map.removeInteraction(snapInteraction);
  }

  if (pointerMoveKey) {
    unByKey(pointerMoveKey);
    pointerMoveKey = null;
  }

  divideInteraction();
};

const findClosestPointOnBoundary = (coordinate: Coordinate): Coordinate | null => {
  if (!targetFeature) return null;

  const polygon = targetFeature.getGeometry() as Polygon;
  if (!polygon) return null;

  const coordinates = polygon.getCoordinates()[0];
  let minDistance = Infinity;
  let closestPoint: Coordinate | null = null;

  for (let i = 0; i < coordinates.length - 1; i++) {
    const start = coordinates[i];
    const end = coordinates[i + 1];

    const pointOnSegment = getClosestPointOnSegment(coordinate, start, end);
    const distance = getDistance(coordinate, pointOnSegment);

    if (distance < minDistance) {
      minDistance = distance;
      closestPoint = pointOnSegment;
    }
  }

  return closestPoint;
};

const getClosestPointOnSegment = (point: Coordinate, start: Coordinate, end: Coordinate): Coordinate => {
  const dx = end[0] - start[0];
  const dy = end[1] - start[1];

  if (dx === 0 && dy === 0) return start;

  const t = Math.max(0, Math.min(1, ((point[0] - start[0]) * dx + (point[1] - start[1]) * dy) / (dx * dx + dy * dy)));

  return [start[0] + t * dx, start[1] + t * dy];
};

const getDistance = (p1: Coordinate, p2: Coordinate): number => {
  const dx = p2[0] - p1[0];
  const dy = p2[1] - p1[1];
  return Math.sqrt(dx * dx + dy * dy);
};

const extendLineToIntersectPolygon = (lineGeom: LineString): LineString => {
  const coords = lineGeom.getCoordinates();
  if (coords.length < 2 || !targetFeature) return lineGeom;

  const polygon = targetFeature.getGeometry() as Polygon;
  if (!polygon) return lineGeom;

  const prev = coords[coords.length - 2];
  const last = coords[coords.length - 1];

  const prevMeters = proj4("EPSG:4326", "EPSG:3857", prev);
  const lastMeters = proj4("EPSG:4326", "EPSG:3857", last);

  const dx = lastMeters[0] - prevMeters[0];
  const dy = lastMeters[1] - prevMeters[1];
  const length = Math.sqrt(dx * dx + dy * dy);
  if (length === 0) return lineGeom;

  const dirX = dx / length;
  const dirY = dy / length;

  const polygonCoords = polygon.getCoordinates()[0];
  let closestIntersection: Coordinate | null = null;
  let minDistance = Infinity;

  for (let i = 0; i < polygonCoords.length - 1; i++) {
    const segStart = polygonCoords[i];
    const segEnd = polygonCoords[i + 1];

    const segStartMeters = proj4("EPSG:4326", "EPSG:3857", segStart);
    const segEndMeters = proj4("EPSG:4326", "EPSG:3857", segEnd);

    const farPointMeters: [number, number] = [
      lastMeters[0] + dirX * 100000,
      lastMeters[1] + dirY * 100000,
    ];

    const intersection = getLineIntersection(lastMeters, farPointMeters, segStartMeters, segEndMeters);

    if (intersection) {
      const dist = Math.sqrt(
        Math.pow(intersection[0] - lastMeters[0], 2) + Math.pow(intersection[1] - lastMeters[1], 2),
      );

      if (dist < minDistance && dist > 0.1) {
        minDistance = dist;
        closestIntersection = intersection;
      }
    }
  }

  if (closestIntersection) {
    const extensionAfterIntersection = 0.01;
    const finalPointMeters: [number, number] = [
      closestIntersection[0] + dirX * extensionAfterIntersection,
      closestIntersection[1] + dirY * extensionAfterIntersection,
    ];
    const finalPoint4326 = proj4("EPSG:3857", "EPSG:4326", finalPointMeters);
    return new LineString([...coords, finalPoint4326]);
  }

  const extensionAfterIntersection = 0.01;
  const extendedEndMeters: [number, number] = [
    lastMeters[0] + dirX * extensionAfterIntersection,
    lastMeters[1] + dirY * extensionAfterIntersection,
  ];
  const extendedEnd4326 = proj4("EPSG:3857", "EPSG:4326", extendedEndMeters);
  return new LineString([...coords, extendedEnd4326]);
};

const getLineIntersection = (
  p1: [number, number],
  p2: [number, number],
  p3: [number, number],
  p4: [number, number],
): [number, number] | null => {
  const x1 = p1[0],
    y1 = p1[1];
  const x2 = p2[0],
    y2 = p2[1];
  const x3 = p3[0],
    y3 = p3[1];
  const x4 = p4[0],
    y4 = p4[1];

  const denom = (x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4);

  if (Math.abs(denom) < 1e-10) return null;

  const t = ((x1 - x3) * (y3 - y4) - (y1 - y3) * (x3 - x4)) / denom;
  const u = -((x1 - x2) * (y1 - y3) - (y1 - y2) * (x1 - x3)) / denom;

  if (u >= 0 && u <= 1 && t > 0) {
    return [x1 + t * (x2 - x1), y1 + t * (y2 - y1)];
  }

  return null;
};

const isNearBoundary = (coordinate: Coordinate): boolean => {
  if (!targetFeature) return false;

  const pixel = props.map.getPixelFromCoordinate(coordinate);
  const closestPoint = findClosestPointOnBoundary(coordinate);

  if (closestPoint) {
    const closestPixel = props.map.getPixelFromCoordinate(closestPoint);
    const pixelDistance = Math.sqrt(Math.pow(pixel[0] - closestPixel[0], 2) + Math.pow(pixel[1] - closestPixel[1], 2));

    return pixelDistance <= SNAP_TOLERANCE;
  }

  return false;
};

const divideInteraction = (): void => {
  const lineStyle = new Style({
    stroke: new Stroke({ color: "rgba(247, 103, 239, 1)", width: 3 }),
    image: new RegularShape({
      fill: new Fill({ color: "white" }),
      points: 4,
      radius: 7,
    }),
    zIndex: 6,
  });

  const modifyStyle = new Style({
    stroke: new Stroke({ color: [0, 0, 255, 0.8], width: 3 }),
    image: new RegularShape({
      fill: new Fill({ color: "rgba(247, 103, 239, 1)" }),
      points: 4,
      radius: 7,
    }),
    zIndex: 7,
  });

  previewLayer = new VectorLayer({
    source: previewSource,
    zIndex: 5,
  });

  drawingLineSource = new VectorSource();
  drawingLineLayer = new VectorLayer({
    source: drawingLineSource,
    style: lineStyle,
    zIndex: 6,
  });

  snapIndicatorSource = new VectorSource();
  snapIndicatorLayer = new VectorLayer({
    source: snapIndicatorSource,
    zIndex: 10,
  });

  const draw = new Draw({
    type: "LineString",
    source: drawingLineSource,
    freehand: false,
    style: [lineStyle],
  });

  clickCount = 0;

  props.map.addLayer(previewLayer);
  props.map.addLayer(drawingLineLayer);
  props.map.addLayer(snapIndicatorLayer);
  props.map.addInteraction(draw);

  if (targetFeature) {
    const snapSource = new VectorSource();
    snapSource.addFeature(targetFeature);

    snapInteraction = new Snap({
      source: snapSource,
      pixelTolerance: SNAP_TOLERANCE,
      edge: true,
      vertex: true,
    });

    props.map.addInteraction(snapInteraction);
  }

  pointerMoveKey = props.map.on("pointermove", (evt: MapBrowserEvent<any>) => {
    if (!snapIndicatorSource) return;

    snapIndicatorSource.clear();

    const coordinate = evt.coordinate;
    const pixel = props.map.getPixelFromCoordinate(coordinate);

    const closestPoint = findClosestPointOnBoundary(coordinate);

    if (closestPoint) {
      const closestPixel = props.map.getPixelFromCoordinate(closestPoint);
      const pixelDistance = Math.sqrt(
        Math.pow(pixel[0] - closestPixel[0], 2) + Math.pow(pixel[1] - closestPixel[1], 2),
      );

      if (pixelDistance <= SNAP_TOLERANCE) {
        const snapFeature = new Feature({
          geometry: new Point(closestPoint),
        });
        snapIndicatorSource.addFeature(snapFeature);
      }
    }
  });

  modifyInteraction = new Modify({
    source: drawingLineSource,
    style: modifyStyle,
  });

  selectInteraction = new Select({
    condition: click,
    layers: [drawingLineLayer],
    style: modifyStyle,
  });

  const handleMapClick = (evt: MapBrowserEvent<any>) => {
    if (!targetFeature) return;

    const coordinate = evt.coordinate;
    const isInsidePolygon = targetFeature.getGeometry()?.intersectsCoordinate(coordinate);

    if (isNearBoundary(coordinate)) {
      clickCount++;
      if (clickCount >= 2) {
        draw.finishDrawing();
      }
      return;
    }

    if (!isInsidePolygon) {
      clickCount++;
      if (clickCount >= 2) {
        draw.finishDrawing();
      }
    }
  };

  props.map.on("click", handleMapClick);

  draw.on("drawstart", (e: DrawEvent) => {
    cleanupPreview(previewSource);
    clickCount = 0;

    e.feature.getGeometry()?.on("change", (evt: BaseEvent) => {
      const lineGeom = evt.target as LineString;
      const extendedLine = extendLineToIntersectPolygon(lineGeom);
      updatePreview(extendedLine, previewSource);
    });
  });

  draw.on("drawend", () => {
    props.map.un("click", handleMapClick);
    props.map.removeInteraction(draw);

    const lineFeature = drawingLineSource?.getFeatures()[0];
    if (lineFeature) {
      const lineGeom = lineFeature.getGeometry() as LineString;
      const extendedLine = extendLineToIntersectPolygon(lineGeom);
      lineFeature.setGeometry(extendedLine);
      currentGeom.value = extendedLine;
      updatePreview(extendedLine, previewSource);
    }

    if (selectInteraction) {
      props.map.addInteraction(selectInteraction);
    }
    if (modifyInteraction) {
      props.map.addInteraction(modifyInteraction);

      modifyInteraction.on("modifyend", () => {
        const lineFeature = drawingLineSource?.getFeatures()[0];
        if (lineFeature && lineFeature.getGeometry()) {
          const lineGeom = lineFeature.getGeometry() as LineString;
          const extendedLine = extendLineToIntersectPolygon(lineGeom);
          lineFeature.setGeometry(extendedLine);
          currentGeom.value = extendedLine;
          updatePreview(extendedLine, previewSource);
        }
      });
    }
    if (modifyInteraction) {
      attachPreviewListeners();
      modifyInteraction.on("modifystart", () => {
        attachPreviewListeners();
      });
    }
  });
};

const updatePreview = (lineGeom: LineString, previewSource: VectorSource): void => {
  previewSource.clear();
  if (currentOverlay) {
    props.map.removeOverlay(currentOverlay);
    currentOverlay = null;
  }

  const parser = new jsts.io.OL3Parser();
  parser.inject(Point, LineString, LinearRing, Polygon, MultiPoint, MultiLineString, MultiPolygon);

  const lineJsts = parser.read(lineGeom);

  if (!targetFeature || !(targetFeature.getGeometry() instanceof Polygon)) {
    return;
  }

  const newPolygons: Feature<Polygon>[] = [];
  const polyJsts = parser.read(targetFeature.getGeometry());

  if (lineJsts.intersects(polyJsts)) {
    try {
      const parts: any[] = [];

      if (typeof (polyJsts as any).split === "function") {
        const splitGeom = (polyJsts as any).split(lineJsts);
        const num = splitGeom.getNumGeometries ? splitGeom.getNumGeometries() : 0;
        for (let i = 0; i < num; i++) {
          const g = splitGeom.getGeometryN(i);
          if (g.getArea && g.getArea() > 0 && polyJsts.contains(g.getInteriorPoint())) {
            parts.push(g);
          }
        }
      }

      if (parts.length === 0) {
        const union = polyJsts.getBoundary().union(lineJsts);
        const polygonizer = new jsts.operation.polygonize.Polygonizer();
        polygonizer.add(union);
        const polys = polygonizer.getPolygons();

        if (polys && (polys.getGeometryN || polys.array)) {
          if (typeof polys.getNumGeometries === "function") {
            const n = polys.getNumGeometries();
            for (let i = 0; i < n; i++) {
              const g = polys.getGeometryN(i);
              if (g.getArea && g.getArea() > 0 && polyJsts.contains(g.getInteriorPoint())) {
                parts.push(g);
              }
            }
          } else if (Array.isArray(polys.array)) {
            polys.array.forEach((g: any) => {
              if (g.getArea && g.getArea() > 0 && polyJsts.contains(g.getInteriorPoint())) {
                parts.push(g);
              }
            });
          }
        }
      }

      if (parts.length === 2) {
        const parcelle1Style = new Style({
          stroke: new Stroke({
            color: "rgba(247, 103, 239, 1)",
            width: 4,
            lineDash: [10, 20, 10, 20],
            lineCap: "square",
            lineJoin: "bevel",
          }),
          fill: new Fill({ color: "rgba(247, 103, 239, 0.3)" }),
          zIndex: 4,
        });

        const parcelle2Style = new Style({
          stroke: new Stroke({
            color: "rgba(96, 224, 235, 1)",
            width: 4,
            lineDash: [10, 20, 10, 20],
            lineCap: "square",
            lineJoin: "bevel",
          }),
          fill: new Fill({ color: "rgba(166, 242, 250, 0.2)" }),
          zIndex: 4,
        });

        resSource.clear();
        parts.forEach((geom: any, index: number) => {
          const olGeom = parser.write(geom);
          const newFeature = new Feature({
            ...targetFeature?.getProperties(),
            geometry: new Polygon(olGeom.getCoordinates()),
          });
          resSource.addFeature(newFeature);
          newFeature.setStyle(index === 0 ? parcelle1Style : parcelle2Style);
          newPolygons.push(newFeature);
        });
        hasDivision.value = true;
      } else {
        hasDivision.value = false;
        parcelle1Area.value = null;
        parcelle2Area.value = null;
      }
    } catch (error) {
      console.warn("Erreur lors du découpage:", error);
      hasDivision.value = false;
      parcelle1Area.value = null;
      parcelle2Area.value = null;
    }
  } else {
    hasDivision.value = false;
    parcelle1Area.value = null;
    parcelle2Area.value = null;
  }

  if (newPolygons.length === 2) {
    const parcelle1Geometry = new GeoJSON().writeFeatureObject(newPolygons[0], {});
    parcelle1Area.value = calculateArea(parcelle1Geometry as CartoBioFeature);

    const parcelle2Geometry = new GeoJSON().writeFeatureObject(newPolygons[1], {});
    parcelle2Area.value = calculateArea(parcelle2Geometry as CartoBioFeature);
  }

  newPolygons.forEach((poly) => {
    previewSource.addFeature(poly);
  });
};

const attachPreviewListeners = () => {
  if (geomListenerKey) {
    unByKey(geomListenerKey);
    geomListenerKey = null;
  }
  if (sourceListenerKey) {
    unByKey(sourceListenerKey);
    sourceListenerKey = null;
  }

  if (!drawingLineSource) {
    return;
  }
  const lineFeature = drawingLineSource.getFeatures()[0];
  if (!lineFeature) return;

  const geom = lineFeature.getGeometry() as LineString;

  geomListenerKey = geom.on("change", (evt: BaseEvent) => {
    const lineGeom = evt.target as LineString;
    const extendedLine = extendLineToIntersectPolygon(lineGeom);
    currentGeom.value = extendedLine;
    updatePreview(extendedLine, previewSource);
  });

  sourceListenerKey = drawingLineSource.on("change", () => {
    const f = drawingLineSource?.getFeatures()[0];
    if (f && f.getGeometry()) {
      const lineGeom = f.getGeometry() as LineString;
      const extendedLine = extendLineToIntersectPolygon(lineGeom);
      currentGeom.value = extendedLine;
      updatePreview(extendedLine, previewSource);
    }
  });
};

/*
 * * Fonctions : Utils
 */

const cleanupPreview = (previewSource: VectorSource): void => {
  if (currentOverlay) {
    props.map.removeOverlay(currentOverlay);
    currentOverlay = null;
  }

  previewSource.clear();
};

const calculateArea = (feature: CartoBioFeature): string => {
  return inHa(legalProjectionSurface(feature));
};

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

/*
 * * Watchers
 */
watch(
  () => currentGeom.value,
  (newValue) => {
    if (newValue) {
      updatePreview(newValue, previewSource);
    }
  },
  { immediate: true },
);

/**
 * * States fonctions
 */
onMounted(() => {
  targetFeature = getTargetFeature();
  divideInteraction();
});

onUnmounted(() => {
  if (previewLayer) {
    props.map.removeLayer(previewLayer);
  }

  if (drawingLineLayer) {
    props.map.removeLayer(drawingLineLayer);
  }

  if (snapIndicatorLayer) {
    props.map.removeLayer(snapIndicatorLayer);
  }

  if (currentOverlay) {
    props.map.removeOverlay(currentOverlay);
  }

  if (snapInteraction) {
    props.map.removeInteraction(snapInteraction);
  }

  if (pointerMoveKey) {
    unByKey(pointerMoveKey);
    pointerMoveKey = null;
  }
});
</script>

<style scoped>
:deep(button[class^="ri"]),
:deep(button[class*=" ri"]) {
  font-size: 1.2em;
}

.pop-in-info {
  position: absolute;
  top: 115px;
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

.vr {
  display: inline-block;
  align-self: stretch;
  width: 1px;
  min-height: 0.5em;
  background-color: grey;
  opacity: 0.25;
}
</style>
