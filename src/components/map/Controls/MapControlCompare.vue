<template>
  <div class="button-group">
    <div :class="[props.isCompare ? 'info-box-left' : 'info-box-right']">
      <div class="geometric-diff-viewer fr-mb-2w" v-if="diffOnMap" aria-live="polite">
        <div class="legend">
          <div class="legend-item">
            <span class="legend-color added"></span> Ajoutées <span class="nb-class">{{ addNb }}</span>
          </div>
          <div class="legend-item">
            <span class="legend-color modified"></span> Modifiées <span class="nb-class">{{ modifiedNb }}</span>
          </div>
          <div class="legend-item">
            <span class="legend-color removed"></span> Supprimées <span class="nb-class">{{ deleteNb }}</span>
          </div>
        </div>
      </div>
      <hr v-if="diffOnMap" />
      <span><i class="ri-custom-size" aria-hidden="true" /> {{ sizeParcelles }} ha</span>
      <span>
        <i class="ri-collage-line" aria-hidden="true" />
        {{ nbParcelles }} parcelle{{ nbParcelles > 1 ? "s" : "" }}
      </span>
    </div>
    <div class="attribution fr-text--xs" v-if="isCompare">
      <a href="https://docs-cartobio.agencebio.org/agriculteurs.trices/annexes/legendes-de-la-carte" target="_blank"
        >Sources des données et licences<span class="fr-sr-only"> (ouvre un nouvel onglet)</span></a
      >
    </div>

    <div id="scale-line" class="scale-line" v-if="isCompare"></div>
    <div class="group-button-right" v-if="isCompare">
      <div class="group-zoom">
        <button class="fr-btn fr-btn--sm fr-btn--tertiary-no-outline" @click="onZoomIn" aria-label="Zoomer">
          <span class="fr-icon-add-line fr-icon--sm"></span>
        </button>
        <button class="fr-btn fr-btn--sm fr-btn--tertiary-no-outline" @click="onZoomOut" aria-label="Dézoomer">
          <span class="fr-icon-subtract-line fr-icon--sm"></span>
        </button>
      </div>
      <button class="fr-btn fr-btn--sm fr-btn--tertiary-no-outline" @click="onLocate" aria-label="Localiser">
        <span class="ri-focus-3-line"></span>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { inject, onMounted, onUnmounted, ref, Ref } from "vue";
import type { Map as OlMap } from "ol";

import ScaleLine from "ol/control/ScaleLine.js";

/**
 * * Props
 */

const props = defineProps<{
  isCompare?: boolean;
  nbParcelles: number;
  sizeParcelles: number;
}>();

/**
 * * Injects
 */
const map = inject<Ref<OlMap>>(!props.isCompare ? "map" : "map2");
if (!map) {
  throw new Error("Pas de map disponible");
}

/**
 * * Emits
 */
const emit = defineEmits<{
  (e: "locate"): void;
}>();

/**
 * * Refs
 */

const modifiedNb = ref(0);
const addNb = ref(0);
const deleteNb = ref(0);

const diffOnMap = ref<boolean>(false);

const addListener = ref(null);
const removeListener = ref(null);

/**
 * * Fonction
 */
const onZoomIn = () => {
  if (!map?.value) return;
  const view = map.value.getView();
  const zoom = view.getZoom() || 0;
  view.setZoom(zoom + 1);
};

const onZoomOut = () => {
  if (!map?.value) return;
  const view = map.value.getView();
  const zoom = view.getZoom() || 1;
  view.setZoom(zoom - 1);
};

const onLocate = () => {
  emit("locate");
};

const createScaleLine = () => {
  if (!map?.value) return;

  const scaleLineElement = document.getElementById("scale-line");
  if (!scaleLineElement) return;

  const control = new ScaleLine({
    className: "ol-scale-line",
    target: scaleLineElement,
    units: "metric",
    maxWidth: 100,
    minWidth: 100,
  });
  map.value.addControl(control);
};

const updateFeatureCounts = (layer) => {
  if (!layer) return;

  const source = layer.getSource();
  if (!source) return;

  const features = source.getFeatures();
  if (!features) return;

  modifiedNb.value = features.filter((f) => f.get("status") === "modified").length;
  addNb.value = features.filter((f) => f.get("status") === "added").length;
  deleteNb.value = features.filter((f) => f.get("status") === "deleted").length;
};

/**
 * * States fonctions
 */

onMounted(() => {
  if (!map?.value) return;

  createScaleLine();

  const layers = map.value.getLayers();

  addListener.value = layers.on("add", (e) => {
    if (e.element.get("name") === "diffLayer") {
      diffOnMap.value = true;
      updateFeatureCounts(e.element);
    }
  });

  removeListener.value = layers.on("remove", (e) => {
    if (e.element.get("name") === "diffLayer") {
      diffOnMap.value = false;
      modifiedNb.value = 0;
      addNb.value = 0;
      deleteNb.value = 0;
    }
  });
});

onUnmounted(() => {
  if (addListener.value) {
    addListener.value = null;
  }
  if (removeListener.value) {
    removeListener.value = null;
  }
});
</script>

<style scoped>
.button-group {
  position: absolute;
  bottom: 0;
  z-index: 1;
  display: inline-flex;
  max-width: 50vw;
  border-radius: 4px;
}

.group-button-right {
  position: absolute;
  bottom: 0;
  right: 0;

  display: flex;
  justify-content: space-between;
  flex-direction: column;
  gap: 2px;

  border-radius: 4px;
}

.group-button-right > button {
  background: white;
  width: 30px;
  height: 30px;
  justify-content: center;
  margin-right: 1rem;
}

.group-zoom > button {
  background: white;
  width: 30px;
  height: 30px;
  justify-content: center;
}

.group-zoom {
  display: flex;
  flex-direction: column;
  box-shadow: 0px 4px 12px 0px rgba(0, 0, 18, 0.16);
}

.mode-choice {
  background: #ffffff;
  padding: 6px;
  justify-content: space-between;
  gap: 10px;
  height: fit-content;
  position: absolute;
  bottom: 10px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 10px;
  border-radius: 4px;
}

.active {
  border-radius: 4px;
}

.info-box-left {
  font-size: 14px;
  position: absolute;
  bottom: 1rem;
  left: 1rem;
  font-weight: 500;
  padding: 24px;
  border-radius: 6px;
  display: flex;
  flex-direction: column;
  background: #ffffff;
  box-shadow: 0px 4px 12px 0px rgba(0, 0, 18, 0.16);
}

.info-box-right {
  font-size: 14px;
  position: absolute;
  bottom: 1rem;
  right: 1.5rem;
  font-weight: 500;
  padding: 24px;
  border-radius: 6px;
  display: flex;
  box-shadow: 0px 4px 12px 0px rgba(0, 0, 18, 0.16);

  flex-direction: column;
  background: #ffffff;
}

.parcelles {
  background-color: white;

  padding: 16px;
  gap: 12px;

  background: rgba(255, 255, 255, 0.9);

  border-radius: 20px;
}

.surface {
  background-color: white;

  padding: 16px;
  gap: 12px;

  background: rgba(255, 255, 255, 0.9);

  border-radius: 20px;
}

.info-box-open {
  background: #ffffff;
  padding: 8px 12px;
  border-radius: 6px;
  display: flex;
  flex-direction: column;
  font-size: 14px;
  position: absolute;
  bottom: 8rem;
  left: 1rem;
  font-weight: 500;
}

.group-button-right {
  bottom: 10px;
  right: 10px;
  display: flex;
  gap: 10px;
}

.button-group {
  width: 100%;
}

i[class^="ri"],
i[class*=" ri"] {
  font-size: 1.2em;
}

.button-group > div {
  border-radius: 6px;
}

.scale-line {
  position: absolute;
  bottom: 0.15rem;
  right: 10rem;
}
.ol-scale-line {
  position: relative;
  bottom: 0px;
  left: 0px;
}

.attribution > a {
  position: absolute;
  display: flex;
  right: 160px;
  bottom: 15px;
  background-color: white;
  border-radius: 0px !important;
}

.attribution > .fr-btn {
  position: absolute;
  display: flex;
  right: 160px;
  bottom: 10px;
  background-color: white;
}

.geometric-diff-viewer {
  font-size: 0.85rem;
  z-index: 10000;
}
.legend {
  gap: 1rem;
}
.legend-item {
  display: flex;
  align-items: center;
  gap: 0.4rem;
}
.legend-color {
  width: 14px;
  height: 14px;
  border: 1px solid #000;
}
.legend-color.added {
  background: rgba(251, 184, 246, 1);
  border-color: rgba(247, 103, 239, 1);
}
.legend-color.removed {
  background-color: rgba(246, 246, 246, 0.3);
  background-image: repeating-linear-gradient(
    -45deg,
    rgba(207, 207, 207, 1) 0,
    rgba(207, 207, 207, 1) 1px,
    transparent 1px,
    transparent 4px
  );
  border: 2px dashed rgba(246, 246, 246, 0.3);
  border-radius: 4px;
}

.legend-color.modified {
  background: rgba(255, 165, 0, 0.3);
  border-color: orange;
  border-style: dashed;
}

.nb-class {
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  padding: 2px 8px;
  gap: 2px;

  width: 24px;
  height: 24px;

  background: #eeeeee;
  border-radius: 12px;
}
</style>
