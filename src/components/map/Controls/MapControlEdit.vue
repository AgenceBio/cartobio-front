<template>
  <div class="toolbar">
    <div class="toolbar-top">
      <button
        class="fr-btn"
        :class="[currentMode === 'edit' ? 'fr-btn--secondary' : 'fr-btn--tertiary-no-outline']"
        data-tooltip="Éditer"
        @click="handleAction('edit')"
      >
        <i class="ri-navigation-line"></i>
      </button>

      <button
        class="fr-btn"
        :class="[currentMode === 'draw' ? 'fr-btn--secondary' : 'fr-btn--tertiary-no-outline']"
        data-tooltip="Dessiner"
        @click="handleAction('draw')"
      >
        <i class="ri-pen-nib-line"></i>
      </button>

      <button
        class="fr-btn"
        :class="[currentMode === 'divide' ? 'fr-btn--secondary' : 'fr-btn--tertiary-no-outline']"
        data-tooltip="Couper"
        @click="handleAction('divide')"
      >
        <i class="ri-scissors-cut-line"></i>
      </button>

      <button
        class="fr-btn"
        :class="[currentMode === 'decouper' ? 'fr-btn--secondary' : 'fr-btn--tertiary-no-outline']"
        data-tooltip="decouper"
        @click="handleAction('decouper')"
      >
        <i class="ri-crop-line"></i>
      </button>

      <button
        class="fr-btn"
        :class="[currentMode === 'fusionner' ? 'fr-btn--secondary' : 'fr-btn--tertiary-no-outline']"
        data-tooltip="Fusionner"
        @click="handleAction('fusionner')"
      >
        <i class="ri-merge-cells-horizontal"></i>
      </button>

      <div class="toolbar-separator"></div>

      <button
        class="fr-btn"
        :class="[currentMode === 'delete' ? 'fr-btn--secondary' : 'fr-btn--tertiary-no-outline']"
        data-tooltip="Supprimer"
        @click="handleAction('delete')"
      >
        <i class="ri-delete-bin-line"></i>
      </button>
    </div>

    <div class="toolbar-bottom">
      <button
        class="fr-btn"
        :class="[currentMode === 'undo' ? 'fr-btn--secondary' : 'fr-btn--tertiary-no-outline']"
        data-tooltip="Annuler"
        @click="handleAction('undo')"
      >
        <i class="ri-arrow-go-back-line"></i>
      </button>

      <button
        class="fr-btn"
        :class="[currentMode === 'redo' ? 'fr-btn--secondary' : 'fr-btn--tertiary-no-outline']"
        data-tooltip="Refaire"
        @click="handleAction('redo')"
      >
        <i class="ri-arrow-go-forward-line"></i>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { defineEmits, ref, watch, defineProps } from "vue";

/**
 * * Props
 */
const props = defineProps<{
  mode: string;
}>();

/**
 * * Refs
 */
const currentMode = ref<string>(props.mode);

/**
 * * Emits
 */
const emit = defineEmits<{
  (e: "action", mode: string): void;
}>();

/**
 * * Watchers
 */
watch(
  () => props.mode,
  (newValue) => {
    currentMode.value = newValue;
  },
);

/**
 * * Fonction
 */
const handleAction = (mode: string) => {
  if (currentMode.value === mode) {
    currentMode.value = "neutral";
    emit("action", currentMode.value);
    return;
  }

  currentMode.value = mode;
  emit("action", mode);
};
</script>

<style>

.toolbar {
  position: absolute;
  top: 25%;
  right: 1rem;
  z-index: 1000;
}
.toolbar-top {
  background: white;
  display: flex;
  justify-content: space-between;
  flex-direction: column;
  gap: 2px;
  padding: 10px;
  border-radius: 4px;
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

button[class^="ri"],
button[class*=" ri"] {
  font-size: 1.2em;
}
</style>
