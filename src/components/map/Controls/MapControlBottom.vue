<template>
  <div class="button-group">
    <div class="info-box">
      <span><i class="ri-custom-size" aria-hidden="true" /> {{ sizeParcelles }} ha</span>
      <span>
        <i class="ri-collage-line" aria-hidden="true" />
        {{ nbParcelles }} parcelle{{ nbParcelles > 1 ? "s" : "" }}
      </span>
    </div>
    <div class="mode-choice">
      <button
        type="button"
        class="fr-btn fr-icon-eye-line fr-btn--icon-left"
        :class="[mapPrefs.currentMode === 'consult' ? 'fr-btn--secondary' : 'fr-btn--tertiary-no-outline']"
        @click="mapPrefs.currentMode = 'consult'"
      >
        Consulter
      </button>
      <button
        type="button"
        class="fr-btn"
        :class="[mapPrefs.currentMode != 'consult' ? 'fr-btn--secondary' : 'fr-btn--tertiary-no-outline']"
        @click="mapPrefs.currentMode = 'edit'"
      >
        <i class="ri-shape-line" aria-hidden="true" />
        Modifier
      </button>
    </div>
    <div class="group-button-right">
      <button
        class="fr-btn fr-btn--tertiary-no-outline"
        :class="[isFullScreen ? 'ri-collapse-diagonal-line' : 'ri-expand-diagonal-line']"
        @click="onFullScreen"
      />
      <div class="group-zoom">
        <button class="fr-btn fr-btn--tertiary-no-outline fr-icon-add-line" @click="onZoomIn" />
        <button class="fr-btn fr-btn--tertiary-no-outline fr-icon-subtract-line" @click="onZoomOut" />
      </div>
      <button class="fr-btn fr-btn--tertiary-no-outline ri-focus-3-line" @click="onLocate" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { inject, ref, Ref } from "vue";
import type { Map as OlMap } from "ol";
import { usePreferences } from "@/stores/preferences.js";
import { storeToRefs } from "pinia";
import { inHa, legalProjectionSurface } from "@/utils/features.js";
import { useFeaturesStore } from "@/stores/features";

/**
 * * Refs
 */
const map = inject<Ref<OlMap | null>>("map");

/*
 * * Stores
 */

const preferences = usePreferences();

const { map: mapPrefs } = storeToRefs(preferences);
const featureStore = useFeaturesStore();

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
  bottom: 0;
  width: fit-content;

  display: flex;
  justify-content: space-between;
  flex-direction: column;
  gap: 2px;

  border-radius: 4px;
}

.group-button-right > button {
  background: white;
  width: 42px;
  height: 42px;
  justify-content: center;
}

.group-zoom {
  display: flex;
  flex-direction: column;
}

.group-zoom > button {
  background: white;
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

.info-box {
  background: #ffffff;
  padding: 8px 12px;
  border-radius: 6px;
  display: flex;
  flex-direction: column;
  font-size: 14px;
  position: absolute;
  bottom: 1rem;
  left: 8rem;
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
</style>
