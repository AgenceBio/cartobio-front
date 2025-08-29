<template>
  <div class="pop-in-top" v-if="hasDivision">
    <button class="fr-btn" :disabled="!hasDivision" @click="validateDivision">Valider la découpe</button>
    <button class="fr-btn fr-btn--secondary" :disabled="!hasDivision" @click="cancelDivision">Annuler</button>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, createApp, watch } from "vue";
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
import DivisionOverlay from "../Overlays/DivisionOverlay.vue";
import BaseEvent from "ol/events/Event";

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

// Refs division
const hasDivision = ref<boolean>(false);
const currentGeom = ref<LineString | null>(null);

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

let geomListenerKey: any = null;
let sourceListenerKey: any = null;

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
    stroke: new Stroke({ color: [0, 0, 255, 0.8], width: 3 }),
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
      fill: new Fill({ color: "white" }),
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
      const union = polyJsts.getExteriorRing().union(lineJsts);
      const polygonizer = new jsts.operation.polygonize.Polygonizer();
      polygonizer.add(union);
      const polys = polygonizer.getPolygons();

      if (polys.array.length === 2) {
        const parcelle1Style = new Style({
          stroke: new Stroke({ color: [0, 123, 255, 0.8], width: 2 }),
          fill: new Fill({ color: [0, 123, 255, 0.3] }),
          zIndex: 4,
        });

        const parcelle2Style = new Style({
          stroke: new Stroke({ color: [40, 167, 69, 0.8], width: 2 }),
          fill: new Fill({ color: [40, 167, 69, 0.3] }),
          zIndex: 4,
        });

        resSource.clear();
        polys.array.forEach((geom, index) => {
          const newFeature = new Feature({
            ...targetFeature.getProperties(),
            geometry: new Polygon(parser.write(geom).getCoordinates()),
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
    const numeroI = targetFeature.get("NUMERO_I") || "";
    const numeroP = targetFeature.get("NUMERO_P") || "";
    const nom = targetFeature.get("NOM") || "";

    let text = "";
    if (numeroI.toString() !== "") {
      text = `Ilôt ${numeroI} parcelle ${numeroP}\r`;
    } else if (nom) {
      text = nom;
    }

    const parcelle1Geometry = new GeoJSON().writeFeatureObject(newPolygons[0], {});
    const parcelle1Area = calculateArea(parcelle1Geometry as CartoBioFeature);

    const parcelle2Geometry = new GeoJSON().writeFeatureObject(newPolygons[1], {});
    const parcelle2Area = calculateArea(parcelle2Geometry as CartoBioFeature);

    createTooltipOverlay(props.map, `Division de la parcelle : ${text}`, parcelle1Area, parcelle2Area);
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

  const lineFeature = drawingLineSource?.getFeatures()[0];
  if (!lineFeature) return;

  const geom = lineFeature.getGeometry() as LineString;

  geomListenerKey = geom.on("change", (evt: BaseEvent) => {
    currentGeom.value = evt.target as LineString;
    updatePreview(currentGeom.value, previewSource);
  });

  sourceListenerKey = drawingLineSource?.on("change", () => {
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
    map.removeOverlay(currentOverlay);
  }
  map.addOverlay(overlay);
  currentOverlay = overlay;

  overlay.setPosition(positionning);
};

const calculateArea = (feature: CartoBioFeature): number => {
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
    console.log(newValue);
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
