<template>
  <div class="button-group">
    <div :class="[props.isCompare ? 'info-box-left' : 'info-box-right']">
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
        <button class="fr-btn fr-btn--sm fr-btn--tertiary-no-outline" @click="onZoomIn">
          <span class="fr-icon-add-line fr-icon--sm"></span>
        </button>
        <button class="fr-btn fr-btn--sm fr-btn--tertiary-no-outline" @click="onZoomOut">
          <span class="fr-icon-subtract-line fr-icon--sm"></span>
        </button>
      </div>
      <button class="fr-btn fr-btn--sm fr-btn--tertiary-no-outline" @click="onLocate">
        <span class="ri-focus-3-line"></span>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { inject, onMounted, ref, Ref, watch } from "vue";
import type { Map as OlMap } from "ol";
import { usePreferences } from "@/stores/preferences.js";
import { storeToRefs } from "pinia";
import { inHa, legalProjectionSurface } from "@/utils/features.js";
import { useFeaturesStore } from "@/stores/features";
import { usePermissions } from "@/stores/permissions.js";

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
 * * Refs
 */
const isFullScreen = ref<boolean>(false);

/**
 * * Emits
 */
const emit = defineEmits<{
  (e: "locate"): void;
  (e: "fullscreen"): void;
}>();

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

const onFullScreen = () => {
  emit("fullscreen");
  isFullScreen.value = !isFullScreen.value;
};

const createScaleLine = () => {
  const control = new ScaleLine({
    className: "ol-scale-line",
    target: document.getElementById("scale-line"),
    units: "metric",
    maxWidth: 100,
    minWidth: 100,
  });
  map.value.addControl(control);
};

/**
 * * States fonctions
 */

onMounted(() => {
  createScaleLine();
});
</script>

<style scoped>
.button-group {
  position: absolute;
  bottom: 0;
  z-index: 1;
  display: inline-flex;
  max-width: 50vw;
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
  padding: 8px 12px;
  border-radius: 6px;
  display: flex;
  flex-direction: column;
  background: #ffffff;
}

.info-box-right {
  font-size: 14px;
  position: absolute;
  bottom: 1rem;
  left: 8rem;
  font-weight: 500;
  padding: 8px 12px;
  border-radius: 6px;
  display: flex;
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
</style>
