<template>
  <CertificationBodyEditForm
    v-if="showDetailsModal"
    :feature="feature"
    @close="showDetailsModal = false"
    icon="fr-icon-add-line"
    data-content-name="Modale de confirmation d'ajout"
    required-name
  >
    <template #title>Créer ma parcelle</template>
  </CertificationBodyEditForm>

  <div v-if="invalidDrawing" class="pop-in-top">
    <p>Votre parcelle a été rogner pour respecter les règles</p>
    <button class="fr-btn fr-btn--secondary fr-icon-check-line fr-btn--icon-right" @click="confirmCorrection">
      Valider
    </button>
    <button class="fr-btn fr-icon-close-line fr-btn--tertiary-no-outline" @click="cancelDraw"></button>
  </div>
  <div v-if="errorDrawing && !invalidDrawing" class="pop-in-top">
    <p>Votre parcelle est invalide. Veuillez recommencer !</p>
    <button class="fr-btn fr-icon-close-line fr-btn--tertiary-no-outline" @click="cancelDraw"></button>
  </div>
  <div v-if="errorDrawing && !invalidDrawing" class="pop-in-top">
    <p>Votre parcelle est invalide. Veuillez recommencer !</p>
    <button class="fr-btn fr-icon-close-line fr-btn--tertiary-no-outline" @click="cancelDraw"></button>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, onUnmounted, createApp } from "vue";

import { Map, MapBrowserEvent } from "ol";
import { Feature } from "ol";
import VectorLayer from "ol/layer/Vector";
import VectorSource from "ol/source/Vector";
import GeoJSON from "ol/format/GeoJSON";
import { Style, Fill, Stroke, RegularShape } from "ol/style";

import { useFeaturesStore } from "@/stores/features.js";
import { legalProjectionSurface, inHa } from "@/utils/features.js";

// Utils Geom
import { addParcelleVerif, submitNewParcelle } from "@/cartobio-api.js";

import CertificationBodyEditForm from "@/components/forms/SingleItemCertificationBodyForm.vue";
import { CartoBioFeature } from "@agencebio/cartobio-types";
import { Draw } from "ol/interaction";
import Tooltip from "ol-ext/overlay/Tooltip";
import { MultiPoint } from "ol/geom";
import { DrawEvent } from "ol/interaction/Draw";
import NewParcelleTooltip from "../Overlays/NewParcelleTooltip.vue";

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

const store = useFeaturesStore();

/*
 * * Refs
 */

const showDetailsModal = ref(false);
const feature = ref<Feature | null>(null);
const correctedGeometry = ref<Feature | null>(null);

// Refs draw interaction
const invalidDrawing = ref<boolean>(false);
const errorDrawing = ref<boolean>(false);

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

/*
 * * Fonctions :  interactions
 */

const clearPreviewSource = (): void => {
  const features = previewLayer.getSource()?.getFeatures();
  if (!features) {
    return;
  }

  features.forEach((feat) => {
    previewLayer.getSource()?.removeFeature(feat);
  });
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

const createStyles = () => {
  const fillColor = "rgba(74, 140, 190, 0.3)";
  const borderColor = "rgba(139, 248, 231, 1)";

  const styleDrawing = new Style({
    fill: new Fill({ color: fillColor }),
    stroke: new Stroke({ width: 3, color: borderColor }),
  });

  const stylePointDrawing = new Style({
    image: new RegularShape({
      fill: new Fill({ color: "white" }),
      points: 4,
      radius: 7,
    }),
    geometry: (e: Feature<any>) => {
      const coords = e.getGeometry()?.getCoordinates()?.[0];
      if (coords?.length) return new MultiPoint(coords);
    },
  });

  const snapStyle = new Style({
    stroke: new Stroke({ color: "#ff3333", width: 2, lineDash: [5, 5] }),
    fill: new Fill({ color: "rgba(255, 51, 51, 0.1)" }),
  });

  return { styleDrawing, stylePointDrawing, snapStyle };
};

const createTooltipContent = (feature: Feature) => {
  const area = calculateArea(new GeoJSON().writeFeatureObject(feature, {}) as CartoBioFeature);
  const element = document.createElement("div");

  const app = createApp(NewParcelleTooltip, {
    area,
  });

  app.mount(element);
  return element.innerHTML;
};

const handleTracing = (
  e: any,
  currentDrawing: Feature | null,
  snapStyle: Style,
  snapFeatureRef: { current: Feature | null },
) => {
  if (!currentDrawing) return;

  const coordinate = e.coordinate;
  const pixel = props.map.getPixelFromCoordinate(coordinate);

  const features = props.map.getFeaturesAtPixel(pixel, {
    layerFilter: (layer) => layer === props.vectorLayer,
    hitTolerance: 10,
  });

  if (snapFeatureRef.current) {
    props.vectorSource.removeFeature(snapFeatureRef.current);
    snapFeatureRef.current = null;
  }

  if (features.length > 0 && features[0] !== currentDrawing) {
    const targetFeature = features[0];
    const targetGeom = targetFeature.getGeometry();

    if (targetGeom) {
      snapFeatureRef.current = new Feature({ geometry: targetGeom.clone() });
      snapFeatureRef.current.setStyle(snapStyle);
      props.vectorSource.addFeature(snapFeatureRef.current);
    }
  }
};

const drawInteraction = (): void => {
  const { styleDrawing, stylePointDrawing, snapStyle } = createStyles();

  let currentDrawing: Feature | null = null;
  const snapFeatureRef = { current: null as Feature | null };

  const drawPoly = new Draw({
    type: "Polygon",
    style: [styleDrawing, stylePointDrawing],

    condition: (e: MapBrowserEvent) => {
      const coordPoint = e.coordinate;
      let canDraw = true;

      props.vectorSource.getFeatures().forEach((feature: Feature) => {
        if (feature.getGeometry().intersectsCoordinate(coordPoint)) {
          canDraw = false;
        }
      });

      return canDraw;
    },
    trace: true,
    traceSource: props.vectorLayer.getSource(),
    freehandCondition: () => false,
  });

  props.map.addInteraction(drawPoly);

  const tooltip = new Tooltip({
    className: "draw-tooltip",
    closeBox: false,
    positioning: "bottom-left",
    offset: [10, -10],
    getHTML: createTooltipContent,
  });

  drawPoly.on("drawstart", (e: DrawEvent) => {
    tooltip.setFeature(e.feature);
    props.map.addOverlay(tooltip);
    currentDrawing = e.feature;
  });

  drawPoly.on("drawend", (e: DrawEvent) => {
    const newFeature = e.feature;

    if (snapFeatureRef.current) {
      props.vectorSource.removeFeature(snapFeatureRef.current);
      snapFeatureRef.current = null;
    }

    currentDrawing = null;

    props.map.removeOverlay(tooltip);
    const geojsonFormat = new GeoJSON();
    const geojsonFeature = geojsonFormat.writeFeatureObject(newFeature);
    geojsonFeature.properties = {};
    feature.value = geojsonFeature;
  });

  props.map.on("pointermove", (e: MapBrowserEvent) => {
    handleTracing(e, currentDrawing, snapStyle, snapFeatureRef);
  });
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
  () => feature.value,
  async (newFeature) => {
    if (!newFeature) return;
    const format = new GeoJSON();
    invalidDrawing.value = false;
    errorDrawing.value = false;
    const data = (await addParcelleVerif(newFeature, props.recordId)).data;

    if (data.valid === true) {
      errorDrawing.value = false;
      const previewFeature = format.readFeature(newFeature) as Feature;
      previewFeature.setStyle(previewStyle);
      previewSource.addFeature(previewFeature);

      const result = await submitNewParcelle(props.recordId, newFeature);

      if (result) {
        const newFeatures = result.parcelles.features.filter(
          (f: CartoBioFeature) => !store.all.map((f: CartoBioFeature) => f.id).some((pa: string) => pa === f.id),
        );
        store.setAll(result.parcelles.features);

        for (const newFeature of newFeatures) {
          props.vectorLayer.getSource()?.addFeature(format.readFeature(newFeature) as Feature);
        }
      }

      return;
    }

    errorDrawing.value = true;
    if (data.correction) {
      correctedGeometry.value = data.correction.corrected_input || data.correction.input_minus_existing;

      console.log(correctedGeometry.value?.type);
      if (correctedGeometry.value && correctedGeometry.value.type != "MultiPolygon") {
        invalidDrawing.value = true;
        const correctedFeature = format.readFeature(correctedGeometry.value) as Feature;

        previewSource.addFeature(correctedFeature);

        const extent = correctedFeature.getGeometry()?.getExtent();
        if (extent && !isNaN(extent[0])) {
          props.map.getView().fit(extent, { padding: [50, 50, 50, 50] });
        }
        return;
      }
      const previewFeature = format.readFeature(correctedGeometry) as Feature;
      previewFeature.setStyle(errorStyle);
      previewSource.addFeature(previewFeature);
      return;
    }

    const previewFeature = format.readFeature(newFeature) as Feature;
    previewFeature.setStyle(errorStyle);
    previewSource.addFeature(previewFeature);
  },
);

/**
 * * States fonctions
 */

onMounted(() => {
  drawInteraction();
  props.map.addLayer(previewLayer);
});
onUnmounted(() => {
  store.setSelectedModifiedFeature([]);
  props.map.removeLayer(previewLayer);
});
</script>
