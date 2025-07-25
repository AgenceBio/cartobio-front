<template>
  <div class="button-group">
    <div class="info-box">
      <span><i class="ri-custom-size"></i> {{ props.parcellesSize }} ha</span>
      <span>
        <i class="ri-collage-line"></i>
        {{ props.parcellesNb }} parcelle{{ props.parcellesNb > 1 ? "s" : "" }}
      </span>
    </div>
    <div class="mode-choice">
      <button
        type="button"
        class="fr-btn fr-icon-eye-line fr-btn--icon-left"
        @click="changeMode()"
        :class="[!drawMode ? 'fr-btn--secondary' : 'fr-btn--tertiary-no-outline']"
      >
        Consulter
      </button>
      <button
        type="button"
        class="fr-btn"
        :class="[drawMode ? 'fr-btn--secondary' : 'fr-btn--tertiary-no-outline']"
        @click="changeMode()"
      >
        <span class="ri-shape-line" />
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
import { inject, ref, defineEmits, watch, Ref } from "vue";
import type { Map as OlMap } from "ol";

/**
 * * Refs
 */
const map = inject<Ref<OlMap | null>>("map");

/**
 * * Props
 */
const props = defineProps<{
  parcellesNb: number;
  parcellesSize: string;
  drawModeProps: boolean;
}>();

/**
 * * Refs
 */
const isFullScreen = ref<boolean>(false);
const drawMode = ref<boolean>(false);

/**
 * * Emits
 */
const emit = defineEmits<{
  (e: "locate"): void;
  (e: "fullscreen"): void;
  (e: "drawMode", value: boolean): void;
}>();

/**
 * * Watchers
 */
watch(
  () => props.drawModeProps,
  (newValue) => {
    drawMode.value = newValue;
  },
);

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

const changeMode = () => {
  drawMode.value = !drawMode.value;
  if (!drawMode.value) clearInteractions();
  emit("drawMode", drawMode.value);
};

const clearInteractions = () => {
  map?.value?.getInteractions().pop();
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
  padding: 10px;
  justify-content: space-between;
  gap: 10px;
  height: fit-content;
  position: absolute;
  bottom: 10px;
  left: 35%;
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
  gap: 5px;
  font-size: 14px;
  position: absolute;
  bottom: 1rem;
  left: 8rem;
  display: flex;
  gap: 10px;
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
</style>
