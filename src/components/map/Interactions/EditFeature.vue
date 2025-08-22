<template>
  <div v-if="numberSelectedFeature === 1" class="pop-in-top">
    <button class="fr-btn" :disabled="!hasUndo" @click="saveModifiedFeature">Valider la modification</button>
    <button class="fr-btn fr-btn--secondary" :disabled="!hasUndo" @click="resetEdit">Annuler</button>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed, createApp } from "vue";
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

import { useFeaturesStore } from "@/stores/features.js";
import { usePreferences } from "@/stores/preferences.js";
import { legalProjectionSurface, inHa } from "@/utils/features.js";

// Interactions

// Utils Geom
import { updateFeature } from "@/cartobio-api.js";

import { CartoBioFeature } from "@agencebio/cartobio-types";
import { click } from "ol/events/condition";
import { MultiPoint } from "ol/geom";
import EditParcelleTooltip from "../Overlays/EditParcelleTooltip.vue";

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

/*
 * * Computed
 */

const numberSelectedFeature = computed(() => {
  return store.selectedModifIds.length;
});

/*
 * * Fonctions :  interactions
 */

const undoAll = (): void => {
  if (props.undoRedo) {
    let hasUndo = props.undoRedo.hasUndo();
    while (hasUndo > 0) {
      props.undoRedo.undo();
      hasUndo = props.undoRedo.hasUndo();
    }
  }
};

const resetEdit = () => {
  undoAll();
  isModifying.value = false;
};

const modifyInteraction = () => {
  const selectedFeatures = new Collection<Feature>();
  const select = createSelectInteraction(selectedFeatures);

  let modify: Modify | null = null;

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

    store.setSelectedModifiedFeature(selectedIds);

    if (selectedIds.length === 1) {
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
      const tooltip = new Tooltip({
        className: "draw-tooltip",
        closeBox: false,
        positioning: "bottom-left",
        offset: [10, -10],
        getHTML: createTooltipContent,
      });
      tooltip.setFeature(selectedFeatures.getArray()[0]);

      modify.on("modifystart", () => {
        isModifying.value = true;
        props.map.addOverlay(tooltip);
      });

      modify.on("modifyend", () => {
        props.map.removeOverlay(tooltip);
      });
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
      const coords = (feature.getGeometry() as Polygon)?.getCoordinates()[0];
      if (coords?.length) {
        return new MultiPoint(coords);
      }
    },
  });
};

const createSelectInteraction = (selectedFeatures: Collection<Feature>): Select => {
  const source = props.vectorLayer.getSource();
  const alreadySelectedIds = store.selectedModifIds ?? [];

  alreadySelectedIds.forEach((id: number) => {
    const feature = source?.getFeatureById(id);
    if (feature && !selectedFeatures.getArray().includes(feature)) {
      selectedFeatures.push(feature);
    }
  });

  const selectInteraction = new Select({
    layers: [props.vectorLayer],
    condition: (e) => !isModifying.value && click(e),
    multi: true,
    features: selectedFeatures,
    style: () => {
      if (store.selectedModifIds.length >= 2) {
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
  const selectdId = store.selectedModifIds[0];
  const geoJson = new GeoJSON();
  const feature = props.vectorSource.getFeatureById(selectdId);

  if (!feature) return;

  modifiedFeature = geoJson.writeFeatureObject(feature.clone()) as CartoBioFeature;

  if (!modifiedFeature) return;

  const result = await updateFeature(props.recordId, modifiedFeature, selectdId);

  if (result) {
    store.setSelectedModifiedFeature([]);
    store.setAll(result.parcelles.features);
  }
  isModifying.value = false;
  mapPrefs.value.currentMode = "edit";
  props.undoRedo.clear();
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

/**
 * * States fonctions
 */
onMounted(() => {
  modifyInteraction();
});
onUnmounted(() => {
  undoAll();
});
</script>
