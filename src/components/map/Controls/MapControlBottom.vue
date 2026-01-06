<template>
  <div class="button-group">
    <div :class="[isEditParcelleOpen ? 'info-box-open' : 'info-box']" aria-live="polite">
      <span><i class="ri-custom-size" aria-hidden="true" /> {{ sizeParcelles }} ha</span>
      <span>
        <i class="ri-collage-line" aria-hidden="true" />
        {{ nbParcelles }} parcelle{{ nbParcelles > 1 ? "s" : "" }}
      </span>
    </div>

    <div class="attribution fr-text--xs">
      <a
        v-if="!isEditParcelleOpen"
        href="https://docs-cartobio.agencebio.org/agriculteurs.trices/annexes/legendes-de-la-carte"
        target="_blank"
        >Sources des données et licences<span class="fr-sr-only"> (ouvre un nouvel onglet)</span></a
      >
      <a
        v-else
        class="fr-btn fr-btn--sm fr-btn--tertiary-no-outline fr-icon-info-line"
        href="https://docs-cartobio.agencebio.org/agriculteurs.trices/annexes/legendes-de-la-carte"
        target="_blank"
      ></a>
    </div>

    <div id="scale-line" class="scale-line"></div>
    <div class="group-button-right">
      <button
        class="fr-btn fr-btn--sm fr-btn--tertiary-no-outline"
        @click="onFullScreen"
        :aria-label="isFullScreen ? 'Quitter plein écran' : 'Passer en plein écran'"
      >
        <span :class="[isFullScreen ? 'ri-collapse-diagonal-line' : 'ri-expand-diagonal-line']"></span>
      </button>
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
import { inject, onMounted, ref, Ref, watch } from "vue";
import type { Map as OlMap } from "ol";
import { inHa, legalProjectionSurface } from "@/utils/features.js";
import { useFeaturesStore } from "@/stores/features";

import ScaleLine from "ol/control/ScaleLine.js";

/**
 * * Refs
 */
const map = inject<Ref<OlMap | null>>("map");

/*
 * * Stores
 */

const featureStore = useFeaturesStore();

/**
 * * Props
 */
const props = withDefaults(
  defineProps<{
    isEditParcelleOpen: boolean;
    isFullScreenProps: boolean;
    isMobile?: boolean;
  }>(),
  { isMobile: false },
);

/**
 * * Refs
 */
const isFullScreen = ref<boolean>(false);
const sizeParcelles = inHa(legalProjectionSurface(featureStore.collection.features));
const nbParcelles = featureStore.collection.features.length;

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
    target: document.getElementById("scale-line") ?? undefined,
    units: "metric",
    maxWidth: 100,
    minWidth: 100,
  });
  if (map?.value) {
    map.value.addControl(control);
  }
};

/**
 * * Watchers
 */

watch(
  () => props.isFullScreenProps,
  (newValue) => {
    isFullScreen.value = newValue;
  },
);

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
}

.group-button-right {
  position: relative;
  right: 0;
  bottom: 10px;
  width: fit-content;

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
  border-radius: 4px;
  box-shadow: 0px 4px 12px 0px rgba(0, 0, 18, 0.16);
}

.group-zoom > button {
  width: 30px;
  height: 30px;
  justify-content: center;
}

.group-zoom {
  background: white;
  display: flex;
  flex-direction: column;
  border-radius: 4px;
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
  box-shadow: 0px 4px 12px 0px rgba(0, 0, 18, 0.16);
}

.active {
  border-radius: 4px;
}

.info-box {
  background: #ffffff;
  padding: 8px 12px;
  border-radius: 6px;
  display: flex;
  flex-direction: column;
  font-size: 14px;
  position: absolute;
  bottom: 10px;
  left: 8rem;
  font-weight: 500;
  box-shadow: 0px 4px 12px 0px rgba(0, 0, 18, 0.16);
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
  position: absolute;
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
  bottom: 0px;
  right: 10rem;
}

.ol-scale-line {
  position: relative;
  bottom: 10px;
  left: 0px;
}

.attribution > a {
  position: absolute;
  display: flex;
  right: 160px;
  bottom: 10px;
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
