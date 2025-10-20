<template>
  <div class="button-group">
    <div class="info-box-open" aria-live="polite">
      <span><i class="ri-custom-size" aria-hidden="true" /> {{ sizeParcelles }} ha</span>
      <span>
        <i class="ri-collage-line" aria-hidden="true" />
        {{ nbParcelles }} parcelle{{ nbParcelles > 1 ? "s" : "" }}
      </span>
    </div>

    <div id="scale-line" class="scale-line"></div>

    <div class="group-button-right">
      <a
        class="fr-btn fr-btn--sm fr-btn--tertiary-no-outline"
        style="--icon-size: 0"
        href="https://docs-cartobio.agencebio.org/agriculteurs.trices/annexes/legendes-de-la-carte"
        target="_blank"
        rel="noopener noreferrer"
      >
        <span class="fr-icon--sm fr-icon-info-line"></span>
      </a>
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
import { usePreferences } from "@/stores/preferences.js";
import { storeToRefs } from "pinia";
import { inHa, legalProjectionSurface } from "@/utils/features.js";
import { useFeaturesStore } from "@/stores/features";
import { usePermissions } from "@/stores/permissions.js";

import ScaleLine from "ol/control/ScaleLine.js";

/**
 * * Refs
 */
const map = inject<Ref<OlMap | null>>("map");

/*
 * * Stores
 */

const preferences = usePreferences();
const permissions = usePermissions();

const { map: mapPrefs } = storeToRefs(preferences);
const featureStore = useFeaturesStore();

/**
 * * Props
 */
const props = defineProps<{
  isEditParcelleOpen: boolean;
  isFullScreenProps: boolean;
}>();

/**
 * * Refs
 */
const sizeParcelles = inHa(legalProjectionSurface(featureStore.collection.features));
const nbParcelles = featureStore.collection.features.length;

/**
 * * Emits
 */
const emit = defineEmits<{
  (e: "locate"): void;
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

const createScaleLine = () => {
  const control = new ScaleLine({
    className: "ol-scale-line",
    target: document.getElementById("scale-line") ?? undefined,
    units: "metric",
    maxWidth: props.isMobile ? 80 : 100,
    minWidth: props.isMobile ? 60 : 100,
  });
  if (map?.value) {
    map.value.addControl(control);
  }
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
  width: 100%;
}

.group-button-right {
  position: absolute;
  right: 10px;
  bottom: 10px;
  width: fit-content;

  display: flex;
  justify-content: space-between;
  flex-direction: column;
  gap: 2px;

  border-radius: 4px;
}

.group-button-right > button,
.group-button-right > a {
  background: white;
  width: 30px;
  height: 30px;
  justify-content: center;
  border-radius: 4px;
  box-shadow: 0px 4px 12px 0px rgba(0, 0, 18, 0.16);
  display: flex;
  align-items: center;
}

.group-button-right > a {
  text-decoration: none;
}

.group-button-right > a .button-text {
  font-size: 12px;
  margin-left: 4px;
  white-space: nowrap;
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
  bottom: 6rem;
  left: 0.5rem;
  font-weight: 500;
  box-shadow: 0px 4px 12px 0px rgba(0, 0, 18, 0.16);
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
  bottom: 10px;
  left: 1px;
}

.ol-scale-line {
  position: relative;
  background-color: rgba(255, 255, 255, 0.9);
  padding: 4px 8px;
  border-radius: 4px;
  box-shadow: 0px 2px 8px 0px rgba(0, 0, 18, 0.12);
}

@media (max-width: 768px) {
  .info-box {
    left: 10px;
    font-size: 12px;
    padding: 6px 10px;
  }

  .scale-line {
    left: 0px;
    bottom: 50px;
  }

  .group-button-right > a:not(.fr-icon-info-line) .button-text {
    display: none;
  }
}

@media (min-width: 769px) {
  .group-button-right > a {
    width: auto;
    padding: 0 12px;
  }
}

[target="_blank"]::after {
  width: 0px;
  height: 0px;
  content: none;
}
</style>
