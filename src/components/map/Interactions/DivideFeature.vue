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
import { Draw, Modify, Select } from "ol/interaction";
import { Fill, RegularShape, Stroke, Style } from "ol/style";
import { click } from "ol/events/condition";
import { DrawEvent } from "ol/interaction/Draw";
import { LinearRing, LineString, MultiLineString, MultiPoint, MultiPolygon, Point, Polygon } from "ol/geom";
import * as jsts from "jsts/dist/jsts.min";
import BaseEvent from "ol/events/Event";
import { EventsKey } from "ol/events";

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
let currentOverlay: Overlay | null = null;
let previewLayer: VectorLayer<VectorSource> | null = null;
let drawingLineSource: VectorSource | null = null;
let drawingLineLayer: VectorLayer<VectorSource> | null = null;
let clickCount = 0;
const previewSource = new VectorSource();

let geomListenerKey: EventsKey | null = null;
let sourceListenerKey: EventsKey | null = null;

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
  resSource.clear();
  previewSource.clear();

  if (previewLayer) {
    props.map.removeLayer(previewLayer);
  }

  if (drawingLineLayer) {
    props.map.removeLayer(drawingLineLayer);
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

  divideInteraction();
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

  const draw = new Draw({
    type: "LineString",
    source: drawingLineSource,
    freehand: false,
    style: [lineStyle],
  });

  clickCount = 0;

  props.map.addLayer(previewLayer);
  props.map.addLayer(drawingLineLayer);
  props.map.addInteraction(draw);

  modifyInteraction = new Modify({
    source: drawingLineSource,
    style: modifyStyle,
  });

  selectInteraction = new Select({
    condition: click,
    layers: [drawingLineLayer],
    style: modifyStyle,
  });

  const handleMapClick = (evt: MapBrowserEvent) => {
    if (!targetFeature) return;

    const coordinate = evt.coordinate;

    const isInsidePolygon = targetFeature.getGeometry()?.intersectsCoordinate(coordinate);

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

    e.feature.getGeometry()?.on("change", (evt: BaseEvent) => {
      updatePreview(evt.target, previewSource);
    });
  });

  draw.on("drawend", () => {
    props.map.un("click", handleMapClick);

    props.map.removeInteraction(draw);

    if (selectInteraction) {
      props.map.addInteraction(selectInteraction);
    }
    if (modifyInteraction) {
      props.map.addInteraction(modifyInteraction);

      modifyInteraction.on("modifyend", () => {
        const lineFeature = drawingLineSource?.getFeatures()[0];
        if (lineFeature && lineFeature.getGeometry()) {
          currentGeom.value = lineFeature.getGeometry() as LineString;

          updatePreview(lineFeature.getGeometry() as LineString, previewSource);
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
      }
    } catch (error) {
      console.warn("Erreur lors du découpage:", error);
    }
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
    currentGeom.value = evt.target as LineString;
    updatePreview(currentGeom.value, previewSource);
  });

  sourceListenerKey = drawingLineSource.on("change", () => {
    const f = drawingLineSource?.getFeatures()[0];
    if (f && f.getGeometry()) {
      currentGeom.value = f.getGeometry() as LineString;
      updatePreview(currentGeom.value, previewSource);
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

  if (drawingLineLayer) {
    props.map.removeLayer(drawingLineLayer);
  }

  if (currentOverlay) {
    props.map.removeOverlay(currentOverlay);
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
