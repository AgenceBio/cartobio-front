<template>
  <div class="toolbar">
    <div class="toolbar-top">
      <button
        class="fr-btn"
        :class="[mapPrefs.currentMode === 'edit' ? 'fr-btn--secondary' : 'fr-btn--tertiary-no-outline']"
        data-tooltip="Éditer"
        @click="handleAction('edit')"
      >
        <i class="ri-navigation-line"></i>
      </button>

      <button
        class="fr-btn"
        :class="[mapPrefs.currentMode === 'draw' ? 'fr-btn--secondary' : 'fr-btn--tertiary-no-outline']"
        data-tooltip="Dessiner"
        @click="handleAction('draw')"
      >
        <i class="ri-pen-nib-line"></i>
      </button>

      <hr />

      <button
        class="fr-btn"
        :class="[mapPrefs.currentMode === 'decouper' ? 'fr-btn--secondary' : 'fr-btn--tertiary-no-outline']"
        data-tooltip="decouper"
        @click="handleAction('decouper')"
        :disabled="countSelected != 1"
      >
        <i class="ri-crop-line"></i>
      </button>

      <button
        class="fr-btn"
        :class="[mapPrefs.currentMode === 'divide' ? 'fr-btn--secondary' : 'fr-btn--tertiary-no-outline']"
        data-tooltip="Couper"
        @click="handleAction('divide')"
        :disabled="countSelected != 1"
      >
        <i class="ri-scissors-cut-line"></i>
      </button>

      <button
        class="fr-btn"
        :class="[mapPrefs.currentMode === 'fusionner' ? 'fr-btn--secondary' : 'fr-btn--tertiary-no-outline']"
        data-tooltip="Fusionner"
        @click="handleAction('fusionner')"
        :disabled="countSelected < 2"
      >
        <i class="ri-merge-cells-horizontal"></i>
      </button>

      <button
        class="fr-btn"
        :class="[mapPrefs.currentMode === 'delete' ? 'fr-btn--secondary' : 'fr-btn--tertiary-no-outline']"
        data-tooltip="Supprimer"
        @click="handleAction('delete')"
        :disabled="countSelected < 1"
      >
        <i class="ri-delete-bin-line"></i>
      </button>
    </div>
    <div class="toolbar-bottom">
      <button
        class="fr-btn"
        :class="[mapPrefs.currentMode === 'undo' ? 'fr-btn--secondary' : 'fr-btn--tertiary-no-outline']"
        data-tooltip="Annuler"
        @click="handleAction('undo')"
        :disabled="true"
      >
        <i class="ri-arrow-go-back-line"></i>
      </button>

      <button
        class="fr-btn"
        :class="[mapPrefs.currentMode === 'redo' ? 'fr-btn--secondary' : 'fr-btn--tertiary-no-outline']"
        data-tooltip="Refaire"
        @click="handleAction('redo')"
        :disabled="true"
      >
        <i class="ri-arrow-go-forward-line"></i>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from "vue";
import { storeToRefs } from "pinia";

import { useFeaturesStore } from "@/stores/features";
import { usePreferences } from "@/stores/preferences.js";

/**
 * * Stores
 */
const store = useFeaturesStore();
const preferences = usePreferences();
const { map: mapPrefs } = storeToRefs(preferences);

/**
 * * Refs
 */
const countSelected = ref<number>(store.selectedModifIds.length | 0);

/**
 * * Watchers
 */

watch(
  () => store.selectedModifIds,
  (newValue) => {
    countSelected.value = newValue.length;
  },
);

/**
 * * Fonction
 */
const handleAction = (mode: string) => {
  if (mapPrefs.value.currentMode === mode) {
    mapPrefs.value.currentMode = "edit";
    return;
  }
  mapPrefs.value.currentMode = mode;
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

hr {
  padding: 1px;
}
</style>
