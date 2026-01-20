<template>
  <template v-if="vectorLayer && vectorSource">
    <div v-if="mapPrefs.currentMode === 'consult'">
      <ConsultFeature
        :map="map"
        :vector-layer="vectorLayer"
        :vector-source="vectorSource"
        @selectFeature="(e) => emit('selectFeature', e)"
        v-if="interactive"
      />
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
      <AddNewFeature
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
        @endDivide="() => emit('selectFeature', null)"
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
        <div class="toolbar-bottom" v-if="hasUndo || hasRedo">
          <button
            class="fr-btn fr-btn--sm fr-btn--tertiary-no-outline"
            v-tooltip="{ text: 'Annuler la dernière modification', position: 'left' }"
            @click="undo"
            :disabled="!hasUndo"
          >
            <i class="ri-arrow-go-back-line" aria-hidden="true" />
          </button>
          <button
            class="fr-btn fr-btn--sm fr-btn--tertiary-no-outline"
            v-tooltip="{ text: 'Refaire la dernière modification', position: 'left' }"
            @click="redo"
            :disabled="!hasRedo"
          >
            <i class="ri-arrow-go-forward-line" aria-hidden="true" />
          </button>
        </div>
      </Teleport>
    </div>
  </template>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, onUnmounted, inject, Ref, createApp, computed } from "vue";
import { storeToRefs } from "pinia";

import { Map, Overlay, MapBrowserEvent } from "ol";
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
import { useRecordStore } from "@/stores/record.js";
import { usePreferences } from "@/stores/preferences.js";
import { legalProjectionSurface, inHa, getCultureIcon, featureName } from "@/utils/features.js";
import { getConversionLevel, LEVEL_MAYBE_AB, LEVEL_UNKNOWN } from "@/referentiels/ab";
import { fromCodeCpf } from "@agencebio/rosetta-cultures";

// Utils Geom

import { CartoBioFeature, CartoBioFeatureCollection } from "@agencebio/cartobio-types";
import CultureOverlay from "../Overlays/CultureOverlay.vue";
import AddNewFeature from "../Interactions/AddNewFeature.vue";
import EditFeature from "../Interactions/EditFeature.vue";
import CutBorder from "../Interactions/CutBorder.vue";
import DivideFeature from "../Interactions/DivideFeature.vue";
import MergeFeatures from "../Interactions/MergeFeatures.vue";
import DeleteFeature from "../Interactions/DeleteFeature.vue";
import ConsultFeature from "../Interactions/ConsultFeature.vue";
import { FeatureLike } from "ol/Feature";
import ParcelleTooltip from "../Overlays/ParcelleTooltip.vue";

// Imports SVG
import drawCursor from "@/assets/logos-edit/pen-nib-line.svg";
import cropCursor from "@/assets/logos-edit/crop-line.svg";
import scissorsCursor from "@/assets/logos-edit/scissors-cut-line.svg";
import editCursor from "@/assets/logos-edit/edit.svg";

/*
 * * Interface
 */

interface Props {
  name?: string;
  interactive?: boolean;
  recordId: string;
  data?: CartoBioFeatureCollection;
  isCompare?: boolean;
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
const recordStore = useRecordStore();

const { hoveredId } = storeToRefs(store);
const { map: mapPrefs } = storeToRefs(preferences);

/*
 * * Injects
 */

const map = inject<Ref<Map>>(!props.isCompare ? "map" : "map2");
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

let hoverOverlay: Overlay | null = null;
let currentHoveredFeature: Feature | null = null;

const currentCursor: Ref<string> = ref("default");

/**
 * * Computed
 */
const windowWidth = ref(window.innerWidth);

const isMobile = computed(() => windowWidth.value < 992);

/**
 * * Emits
 */
const emit = defineEmits<{
  (e: "clickOnOverlay", value: number | string): void;
  (e: "selectFeature", value: number | string | null): void;
  (e: "zoom:featureId", value: number | string | undefined): void;
}>();

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

const getFeatureStyle = (feature: FeatureLike): Style => {
  const size = calculateArea(new GeoJSON().writeFeatureObject(feature as Feature) as CartoBioFeature);
  const numeroI = feature.get("NUMERO_I") || "";
  const numeroP = feature.get("NUMERO_P") || "";
  const nom = feature.get("NOM") || "";
  const selected = feature.get("selected");
  const hover = feature.get("hover");
  const type = feature.get("TYPE");

  let fillColor = "rgba(166, 242, 250, 0.2)";
  let borderColor = "rgba(96, 224, 235, 1)";
  if (selected) {
    fillColor = "rgba(88, 197, 207, 0.6)";
    borderColor = "rgba(65, 156, 164, 1)";
  } else if (hover) {
    fillColor = "rgba(166, 242, 250, 0.5)";
    borderColor = "rgba(76, 180, 189, 1)";
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
    zIndex: selected || hover ? 4 : 3,
    fill: new Fill({ color: fillColor, fillRule: "evenodd" }),
    stroke: new Stroke({ width: selected || hover ? 3 : 1, color: borderColor }),
    text: new Text({
      text: [text, "14px 'Marianne'", "\n", "", size, "bold 14px 'Marianne'", " ha", " 14px 'Marianne'"],
      fill: new Fill({ color: mapPrefs.value.background === "plan" ? "#000000" : "#ffffff" }),
      stroke: new Stroke({ width: 1, color: mapPrefs.value.background === "plan" ? "#ffffff" : "#000000" }),
    }),
  });

  return styleText;
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
  hasUndo.value = (interactions.value.undoRedo?.getStack("undo").length || 0) > 0;
  hasRedo.value = (interactions.value.undoRedo?.getStack("redo").length || 0) > 0;
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
  const label =
    conversionLevel.value === LEVEL_MAYBE_AB
      ? "A préciser"
      : (conversionLevel.labelSelector ?? conversionLevel.shortLabel);

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
  if (!props.interactive) return;
  for (const overlay of map.value.getOverlays().getArray()) {
    if (overlay.getId() === undefined || overlay.getId() === "hover-tooltip") {
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
    if (zoom.value < 12) {
      if (overlay) {
        map.value.removeOverlay(overlay);
      }
      continue;
    }
    //Uniquement les parcelle a préciser
    if (zoom.value < 10) {
      const conversionLevel = getConversionLevel(feature.get("conversion_niveau"));

      if (conversionLevel.value !== LEVEL_UNKNOWN && conversionLevel.value !== LEVEL_MAYBE_AB) {
        if (overlay) {
          map.value.removeOverlay(overlay);
        }

        continue;
      }
    }
    if (!overlay) {
      const element = createCultureOverlay(feature as Feature);
      overlay = new Overlay({
        element: element,
        id: feature.getId(),
        stopEvent: false,
        insertFirst: true,
      });

      element.addEventListener("click", (event) => {
        event.stopPropagation();
        return emit("zoom:featureId", feature.getId());
      });

      watch(
        [() => mapPrefs.value.currentMode, () => store.selectedIds],
        ([mode, selectedIds]) => {
          if (mode !== "consult" && mode !== "edit") {
            element.style.visibility = "hidden";
            return;
          }

          if (mode === "edit" && selectedIds.length > 0) {
            element.style.visibility = "hidden";
            return;
          }

          element.style.visibility = "visible";
        },
        { immediate: true },
      );

      map.value.addOverlay(overlay);
      overlay.setPosition(feature.getGeometry()?.getInteriorPoint().getCoordinates());
    }
  }
};

const createParcelleHoverOverlay = (feature: Feature) => {
  const cartobioFeature = new GeoJSON().writeFeatureObject(feature) as CartoBioFeature;
  const name = featureName(cartobioFeature);
  const area = calculateArea(cartobioFeature);
  const codePostale = feature.get("COMMUNE");
  const ville = feature.get("COMMUNE_LABEL");
  const cultures: { CPF: "string" }[] = feature.get("cultures") || [];
  const icon = getCultureIcon(cultures[0]?.CPF);
  const libelleCulture = fromCodeCpf(cultures[0]?.CPF);
  const conversionLevel = feature.get("conversion_niveau");
  const conversionDate = feature.get("engagement_date");

  const element = document.createElement("div");
  const app = createApp(ParcelleTooltip, {
    name,
    area,
    codePostale,
    ville,
    icon,
    libelleCulture: libelleCulture?.libelle_code_cpf,
    conversionLevel,
    conversionDate,
  });

  app.mount(element);

  return element;
};

const showHoverOverlay = (feature: Feature) => {
  if (currentHoveredFeature === feature) return;

  hideHoverOverlay();
  getCursor(mapPrefs.value.currentMode);
  const element = createParcelleHoverOverlay(feature);
  const geometry = feature.getGeometry();

  if (geometry) {
    const extent = geometry.getExtent();
    const centerX = (extent[0] + extent[2]) / 2;
    const topY = extent[3];

    hoverOverlay = new Overlay({
      element: element,
      id: "hover-tooltip",
      position: [centerX, topY],
      positioning: "bottom-center",
      offset: [0, -10],
      stopEvent: false,
      insertFirst: false,
    });

    map.value.addOverlay(hoverOverlay);
    currentHoveredFeature = feature;
  }
};

const hideHoverOverlay = () => {
  getCursor(mapPrefs.value.currentMode);
  if (hoverOverlay) {
    map.value.removeOverlay(hoverOverlay);
    hoverOverlay = null;
    currentHoveredFeature = null;
  }
};

/*
 * * Fonctions : Data
 */

const handlePointerMove = (e: MapBrowserEvent) => {
  if (currentCursor.value) map.value.getViewport().style.cursor = currentCursor.value;

  if (
    props.interactive &&
    (mapPrefs.value.currentMode === "consult" ||
      (mapPrefs.value.currentMode === "edit" && store.selectedIds.length === 0))
  ) {
    const feature = map.value.forEachFeatureAtPixel(
      e.pixel,
      (feature) => {
        return feature;
      },
      { layerFilter: (l) => l.get("name") === vectorLayer.value?.get("name") },
    ) as Feature;

    if (feature && feature !== currentHoveredFeature) {
      hoveredId.value = feature.getId() as string;
      showHoverOverlay(feature);
    } else if (!feature && currentHoveredFeature) {
      hoveredId.value = null;
      hideHoverOverlay();
    }
  }
};

const handlePointerLeave = () => {
  hideHoverOverlay();
};

/*
 * * Watchers
 */

watch(
  () => mapPrefs.value.currentMode,
  () => {
    if (
      store.selectedIds.length === 0 &&
      mapPrefs.value.currentMode != "consult" &&
      mapPrefs.value.currentMode != "edit" &&
      mapPrefs.value.currentMode != "draw"
    ) {
      mapPrefs.value.currentMode = "edit";

      return;
    }
    interactions.value.undoRedo.clear();
    if (!props.interactive) return;
    clearInteractions();
    if (mapPrefs.value.currentMode === "consult") {
      store.unselect([]);
      const list = map.value.getOverlays().getArray();
      for (const overlay of list) {
        if (overlay.getId() !== "hover-tooltip") {
          map.value.removeOverlay(overlay);
        }
      }

      generateConversionLevelOverlays();
    } else {
      hideHoverOverlay();
    }
  },
);

// watch(
//   () => mapPrefs.value.currentMode,
//   (newValue, oldValue) => {
//     if (oldValue === "consult" && newValue !== "consult") {
//       emit("selectFeature", null);
//     }
//   },
// );

const getCursor = (mode: string) => {
  if (!props.interactive) currentCursor.value = "default";
  else {
    switch (mode) {
      case "consult":
        if (hoveredId.value) {
          currentCursor.value = `pointer`;
        } else {
          currentCursor.value = `url("${editCursor}"), pointer`;
        }
        break;
      case "draw":
        currentCursor.value = `url("${drawCursor}"), pointer`;
        break;
      case "decouper":
        currentCursor.value = `url("${cropCursor}"), pointer`;
        break;
      case "divide":
        currentCursor.value = `url("${scissorsCursor}"), pointer`;
        break;
      case "edit":
        if (hoveredId.value) {
          currentCursor.value = `pointer`;
        } else {
          currentCursor.value = `url("${editCursor}"), pointer`;
        }
        break;
      default:
        currentCursor.value = "default";
        break;
    }
  }
};

watch(
  () => mapPrefs.value.currentMode,
  (mode) => {
    getCursor(mode);
  },
  { immediate: true },
);

watch(
  () => zoom.value,
  () => generateConversionLevelOverlays(),
);

watch(
  () => hasUndo.value,
  () => (mapPrefs.value.hasUndo = hasUndo.value),
);

watch(
  () => store.selectedIds,
  (newValue) => {
    if (newValue.length > 0) {
      hideHoverOverlay();
    }
  },
);

watch(
  () => store.collection.features,
  () => {
    features.value = new GeoJSON().readFeatures(store.collection);
    if (vectorSource.value) {
      vectorSource.value.clear();
      vectorSource.value.addFeatures(features.value as Feature[]);
    }
    map.value
      .getOverlays()
      .getArray()
      .slice(0)
      .forEach((e) => {
        if (e.getId() !== "hover-tooltip") {
          map.value.removeOverlay(e);
        }
      });

    generateConversionLevelOverlays();
  },
);
watch(
  () => recordStore.record.record_id,
  () => {
    const extent = recordStore.bounds;

    if (extent && !isNaN(extent[0]) && extent[0] != Infinity) {
      map.value
        .getView()
        .fit(extent, { padding: isMobile.value ? [15, 15, 15, 15] : [50, 50, 50, 50], duration: 5000, maxZoom: 18 });
    }
  },
);

watch(
  () => props.data,
  (newData) => {
    if (!vectorSource.value) return;
    features.value = new GeoJSON().readFeatures(newData ?? store.collection);

    vectorSource.value.clear();
    vectorSource.value.addFeatures(features.value);

    map.value
      .getOverlays()
      .getArray()
      .slice(0)
      .forEach((e) => {
        if (e.getId() !== "hover-tooltip") {
          map.value.removeOverlay(e);
        }
      });

    generateConversionLevelOverlays();

    const extent = vectorSource.value?.getExtent();
    if (extent && !isNaN(extent[0]) && extent[0] !== Infinity) {
      map.value.getView().fit(extent, { padding: isMobile.value ? [15, 15, 15, 15] : [250, 0, 0, 0] });
    }
  },
  { deep: true },
);

/**
 * * States fonctions
 */

onMounted(() => {
  clearInteractions();
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

  let extent = vectorSource.value?.getExtent();

  if (!extent || isNaN(extent[0]) || extent[0] === Infinity) {
    extent = recordStore.bounds;
  }

  if (extent && !isNaN(extent[0]) && extent[0] != Infinity) {
    map.value.getView().fit(extent, { padding: isMobile.value ? [15, 15, 15, 15] : [50, 50, 50, 50] });
  }

  if (props.interactive) {
    store.bindFeatureState(map, "plan-features-layer");
    store.bindFeatureInteraction(map, "plan-features-layer");
  }

  const undoRedo = new UndoRedo({ layers: [vectorLayer.value], maxLength: 50 });
  map.value.addInteraction(undoRedo);
  interactions.value.undoRedo = undoRedo;

  interactions.value.undoRedo.on("stack:add", updateHasUndoRedo);
  interactions.value.undoRedo.on("stack:remove", updateHasUndoRedo);
  interactions.value.undoRedo.on("stack:clear", updateHasUndoRedo);

  zoom.value = map.value.getView().getZoom();

  map.value.getView().on("change:resolution", () => {
    zoom.value = map.value.getView().getZoom();
  });

  map.value.on("pointermove", handlePointerMove);
  map.value.getTargetElement().addEventListener("pointerleave", handlePointerLeave);

  mapPrefs.value.currentMode = "consult";
});

onUnmounted(() => {
  if (vectorLayer.value) map.value.removeLayer(vectorLayer.value);
  clearInteractions();
  hideHoverOverlay();
  map.value.un("pointermove", handlePointerMove);
  map.value.getTargetElement().removeEventListener("pointerleave", handlePointerLeave);
});
</script>

<style scoped>
:deep(.pop-in-top) {
  position: absolute;
  top: 10px;
  left: 50%;
  transform: translateX(-50%);
  background: white;
  z-index: 1000;
  padding: 6px;
  display: flex;
  gap: 5px;
  border-radius: 4px;
  box-shadow: 0px 0px 30px 0px rgba(64, 102, 68, 0.2);
}

.toolbar-bottom {
  background: white;
  border: 4px solid #a6f2fa;
  border-top: none;
  display: flex;
  justify-content: space-between;
  flex-direction: column;
  gap: 2px;
  padding: 6px;
  border-radius: 4px;
  box-shadow: 0px 4px 12px 0px rgba(0, 0, 18, 0.16);
}

button[data-tooltip] {
  position: relative;
}

button[data-tooltip]::after {
  content: attr(data-tooltip);
  position: absolute;
  left: 0px;
  top: 50%;
  transform: translate(-100%, -50%);
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
</style>
