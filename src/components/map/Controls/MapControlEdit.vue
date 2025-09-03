<template>
  <div class="toolbar">
    <div class="toolbar-top">
      <button
        class="fr-btn fr-btn--sm"
        :class="[mapPrefs.currentMode === 'edit' ? 'fr-btn--secondary' : 'fr-btn--tertiary-no-outline']"
        data-tooltip="Activer le mode édition pour modifier les parcelles existants"
        @click="handleAction('edit')"
      >
        <i class="ri-navigation-line" aria-hidden="true" />
      </button>

      <button
        class="fr-btn fr-btn--sm"
        :class="[mapPrefs.currentMode === 'draw' ? 'fr-btn--secondary' : 'fr-btn--tertiary-no-outline']"
        data-tooltip="Dessiner une nouvelle parcelle sur la carte"
        @click="handleAction('draw')"
      >
        <i class="ri-pen-nib-line" aria-hidden="true" />
      </button>

      <hr />

      <button
        class="fr-btn fr-btn--sm"
        :class="[mapPrefs.currentMode === 'decouper' ? 'fr-btn--secondary' : 'fr-btn--tertiary-no-outline']"
        data-tooltip="Découper le contour de la parcelle sélectionnée "
        @click="handleAction('decouper')"
        :disabled="countSelected != 1"
      >
        <i class="ri-crop-line" aria-hidden="true" />
      </button>

      <button
        class="fr-btn fr-btn--sm"
        :class="[mapPrefs.currentMode === 'divide' ? 'fr-btn--secondary' : 'fr-btn--tertiary-no-outline']"
        data-tooltip="Tracer une ligne pour couper la parcelle sélectionnée en deux"
        @click="handleAction('divide')"
        :disabled="countSelected != 1"
      >
        <i class="ri-scissors-cut-line" aria-hidden="true" />
      </button>

      <button
        class="fr-btn fr-btn--sm"
        :class="[mapPrefs.currentMode === 'fusionner' ? 'fr-btn--secondary' : 'fr-btn--tertiary-no-outline']"
        data-tooltip="Fusionner plusieurs parcelles sélectionnées en un seul"
        @click="handleAction('fusionner')"
        :disabled="countSelected < 2"
      >
        <i class="ri-merge-cells-horizontal" aria-hidden="true" />
      </button>

      <button
        class="fr-btn fr-btn--sm"
        :class="[mapPrefs.currentMode === 'delete' ? 'fr-btn--secondary' : 'fr-btn--tertiary-no-outline']"
        data-tooltip="Supprimer la ou les parcelles sélectionnées"
        @click="handleAction('delete')"
        :disabled="countSelected < 1"
      >
        <i class="ri-delete-bin-line" aria-hidden="true" />
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
const countSelected = ref<number>(store.selectedIds.length | 0);

/**
 * * Watchers
 */

watch(
  () => store.selectedIds,
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

<style scoped>
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
  width: fit-content;
}

:deep(button[class^="ri"]),
:deep(button[class*=" ri"]) {
  font-size: 1.2em;
}

hr {
  padding: 1px;
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
  white-space: normal; /* permet retour à la ligne */
  width: max-content;
  max-width: 220px; /* limite pour éviter des tooltips trop larges */
  pointer-events: none;
  transition: opacity 0.2s ease-in-out;
  z-index: 2000;
}

button[data-tooltip]:hover::after {
  opacity: 1;
}
</style>
