<template>
  <template v-if="vectorLayer && vectorSource">
    <div v-if="!isDraw">
      <ConsultFeature :map="map" :vector-layer="vectorLayer" :vector-source="vectorSource" />
    </div>
    <div v-else>
      <EditFeature
        v-if="mapPrefs.currentMode === 'edit'"
        :map="map"
        :vector-layer="vectorLayer"
        :vector-source="vectorSource"
        :record-id="recordId"
        :undo-redo="interactions.undoRedo"
        :hasUndo="hasUndo"
      />
      <DrawNewFeature
        v-else-if="mapPrefs.currentMode === 'draw'"
        :map="map"
        :vector-layer="vectorLayer"
        :vector-source="vectorSource"
        :record-id="recordId"
      />
      <CutBorder
        v-else-if="mapPrefs.currentMode === 'decouper'"
        :map="map"
        :vector-layer="vectorLayer"
        :vector-source="vectorSource"
        :record-id="recordId"
      />
      <DivideFeature
        v-else-if="mapPrefs.currentMode === 'divide'"
        :map="map"
        :vector-layer="vectorLayer"
        :vector-source="vectorSource"
        :record-id="recordId"
      />
      <MergeFeatures
        v-else-if="mapPrefs.currentMode === 'fusionner'"
        :map="map"
        :vector-layer="vectorLayer"
        :vector-source="vectorSource"
        :record-id="recordId"
      />
      <DeleteFeature
        v-else-if="mapPrefs.currentMode === 'delete'"
        :map="map"
        :vector-layer="vectorLayer"
        :vector-source="vectorSource"
        :record-id="recordId"
      />
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
    </div>
  </template>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, onUnmounted, inject, Ref, createApp } from "vue";
import { storeToRefs } from "pinia";

import { Map, Overlay } from "ol";
import { Feature } from "ol";
import VectorLayer from "ol/layer/Vector";
import VectorSource from "ol/source/Vector";
import GeoJSON from "ol/format/GeoJSON";
import { Style, Text, Fill, Stroke } from "ol/style";
import ModifyFeature from "ol-ext/interaction/ModifyFeature";
import { Select, Draw, Interaction } from "ol/interaction";
import UndoRedo from "ol-ext/interaction/UndoRedo";
import { DragPan, MouseWheelZoom, DoubleClickZoom } from "ol/interaction";

import { useFeaturesStore } from "@/stores/features.js";
import { usePreferences } from "@/stores/preferences.js";
import { legalProjectionSurface, inHa, getCultureIcon } from "@/utils/features.js";
import { getConversionLevel, LEVEL_MAYBE_AB, LEVEL_UNKNOWN } from "@/referentiels/ab";

// Utils Geom

import { CartoBioFeature, CartoBioFeatureCollection } from "@agencebio/cartobio-types";
import CultureOverlay from "../Overlays/CultureOverlay.vue";
import DrawNewFeature from "../Interactions/DrawNewFeature.vue";
import EditFeature from "../Interactions/EditFeature.vue";
import CutBorder from "../Interactions/CutBorder.vue";
import DivideFeature from "../Interactions/DivideFeature.vue";
import MergeFeatures from "../Interactions/MergeFeatures.vue";
import DeleteFeature from "../Interactions/DeleteFeature.vue";
import ConsultFeature from "../Interactions/ConsultFeature.vue";

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
const zoom = ref<number | undefined>();
const features = ref<Feature[]>([]);

const hasUndo = ref(false);
const hasRedo = ref(false);

/*
 * * Fonctions :  interactions
 */

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

/*
 * * Fonctions : Utils
 */

const calculateArea = (feature: CartoBioFeature): string => {
  return inHa(legalProjectionSurface(feature));
};

const getFeatureStyle = (feature: Feature): Style[] => {
  const size = calculateArea(new GeoJSON().writeFeatureObject(feature) as CartoBioFeature);
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

const updateHasUndoRedo = () => {
  hasUndo.value = !!interactions.value.undoRedo?.hasUndo();
  hasRedo.value = !!interactions.value.undoRedo?.hasRedo();
};

const createCultureOverlay = (feature: Feature) => {
  const element = document.createElement("div");
  const cultures: { CPF: "string" }[] = feature.get("cultures") || [];
  const conversionLevel = getConversionLevel(feature.get("conversion_niveau"));
  const cssClass =
    conversionLevel.value === LEVEL_UNKNOWN || conversionLevel.value === LEVEL_MAYBE_AB
      ? "badge-a-modifier"
      : "badge-" + conversionLevel.value;
  const icon = getCultureIcon(cultures[0]?.CPF);
  const label = conversionLevel.value === LEVEL_MAYBE_AB ? "A préciser" : conversionLevel.shortLabel;

  const app = createApp(CultureOverlay, {
    cssClass,
    icon,
    label,
  });

  app.mount(element);

  return element;
};

const generateConversionLevelOverlays = () => {
  if (!zoom.value) return;
  for (const overlay of map.value.getOverlays().getArray()) {
    if (overlay.getId() === undefined) {
      continue;
    }
    const feature = features.value.find((f) => f.getId() === overlay.getId());

    if (!feature) {
      map.value.removeOverlay(overlay);
    }
  }
  for (const feature of features.value) {
    let overlay = map.value.getOverlayById(feature.getId() ?? -1);

    //Zoom trop bas on affiche aucun overlay
    if (zoom.value < 14) {
      if (overlay) {
        map.value.removeOverlay(overlay);
      }
      continue;
    }
    //Uniquement les parcelle a préciser
    if (zoom.value < 16) {
      const conversionLevel = getConversionLevel(feature.get("conversion_niveau"));

      if (conversionLevel.value !== LEVEL_UNKNOWN && conversionLevel.value !== LEVEL_MAYBE_AB) {
        if (overlay) {
          map.value.removeOverlay(overlay);
        }

        continue;
      }
    }
    if (!overlay) {
      overlay = new Overlay({
        element: createCultureOverlay(feature as Feature),
        id: feature.getId(),
        stopEvent: false,
        insertFirst: true,
      });

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
  () => {
    interactions.value.undoRedo.clear();
    if (!props.interactive) return;
    clearInteractions();
  },
);

watch(
  () => props.isDraw,
  (isDraw) => {
    if (!isDraw) {
      mapPrefs.value.currentMode = "neutral";
      store.setSelectedModifiedFeature([]);
      for (const overlay of map.value.getOverlays().getArray()) {
        map.value.removeOverlay(overlay);
      }

      generateConversionLevelOverlays();
    }
  },
);

watch(
  () => zoom.value,
  () => generateConversionLevelOverlays(),
);

watch(
  () => store.collection,
  () => {
    features.value = new GeoJSON().readFeatures(store.collection);
    generateConversionLevelOverlays();
  },
  { deep: true },
);

/**
 * * States fonctions
 */

onMounted(() => {
  clearInteractions();
  if (!props.isDraw) {
    mapPrefs.value.currentMode = "neutral";
  }

  features.value = new GeoJSON().readFeatures(props.data ?? store.collection, {});

  vectorSource.value = new VectorSource({
    features: features.value,
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

  const extent = vectorSource.value?.getExtent();
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

  zoom.value = map.value.getView().getZoom();

  map.value.getView().on("change:resolution", () => {
    zoom.value = map.value.getView().getZoom();
  });
});

onUnmounted(() => {
  if (vectorLayer.value) map.value.removeLayer(vectorLayer.value);
  clearInteractions();
});
</script>

<style scoped>
:deep(.pop-in-top) {
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

:deep(.pop-in-top > p) {
  align-content: center;
}

:deep(.column) {
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
</style>
