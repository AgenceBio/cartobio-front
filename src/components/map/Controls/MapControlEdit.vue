<template>
  <div class="toolbar coachmark6">
    <div class="toolbar-top" role="group" aria-label="Outils de gestion des parcelles">
      <button
        class="fr-btn fr-btn--sm"
        :class="[mapPrefs.currentMode === 'edit' ? 'fr-btn--secondary' : 'fr-btn--tertiary-no-outline']"
        aria-label="Activer le mode édition pour modifier les parcelles existantes"
        v-tooltip="{ text: 'Activer le mode édition pour modifier les parcelles existantes', position: 'left' }"
        @click="handleAction('edit')"
        :disabled="!online"
      >
        <i class="ri-navigation-line" aria-hidden="true" />
      </button>

      <hr style="margin: 5px 0 -15px 0" />

      <button
        class="fr-btn fr-btn--sm"
        :class="[mapPrefs.currentMode === 'decouper' ? 'fr-btn--secondary' : 'fr-btn--tertiary-no-outline']"
        aria-label="Découper le contour de la parcelle sélectionnée"
        v-tooltip="{ text: 'Découper le contour de la parcelle sélectionnée', position: 'left' }"
        @click="handleAction('decouper')"
        :disabled="countSelected != 1 || !permissions.canEditParcellaire || !online"
      >
        <i class="ri-crop-line" aria-hidden="true" />
      </button>

      <button
        class="fr-btn fr-btn--sm"
        :class="[mapPrefs.currentMode === 'divide' ? 'fr-btn--secondary' : 'fr-btn--tertiary-no-outline']"
        aria-label="Tracer une ligne pour couper la parcelle sélectionnée en deux"
        v-tooltip="{ text: 'Tracer une ligne pour couper la parcelle sélectionnée en deux', position: 'left' }"
        @click="handleAction('divide')"
        :disabled="countSelected != 1 || !permissions.canEditParcellaire || !online"
      >
        <i class="ri-scissors-cut-line" aria-hidden="true" />
      </button>

      <button
        class="fr-btn fr-btn--sm"
        :class="[mapPrefs.currentMode === 'fusionner' ? 'fr-btn--secondary' : 'fr-btn--tertiary-no-outline']"
        aria-label="Fusionner plusieurs parcelles sélectionnées en un seul"
        v-tooltip="{ text: 'Fusionner plusieurs parcelles sélectionnées en un seul', position: 'left' }"
        @click="handleAction('fusionner')"
        :disabled="countSelected < 2 || !permissions.canEditParcellaire || !online"
      >
        <i class="ri-merge-cells-horizontal" aria-hidden="true" />
      </button>

      <button
        class="fr-btn fr-btn--sm"
        :class="[mapPrefs.currentMode === 'delete' ? 'fr-btn--secondary' : 'fr-btn--tertiary-no-outline']"
        aria-label="Supprimer la ou les parcelles sélectionnées"
        v-tooltip="{ text: 'Supprimer la ou les parcelles sélectionnées', position: 'left' }"
        @click="handleAction('delete')"
        :disabled="countSelected < 1 || !permissions.canEditParcellaire || !online"
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
import { usePermissions } from "@/stores/permissions.js";
import { useOnline } from "@vueuse/core";

const online = useOnline();

/**
 * * Stores
 */
const store = useFeaturesStore();
const preferences = usePreferences();
const permissions = usePermissions();

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
    return;
  }
  mapPrefs.value.currentMode = mode;
};
</script>

<style scoped>
.toolbar {
  position: absolute;
  top: 30%;
  right: 0;
  z-index: 1000;
}
@media (height <= 800px) {
  .toolbar {
    top: 5%;
  }
}

.toolbar-top {
  background: white;
  border: 4px solid #a6f2fa;
  display: flex;
  justify-content: space-between;
  flex-direction: column;
  gap: 2px;
  padding: 6px;
  border-radius: 4px;
  width: fit-content;
  box-shadow: 0px 4px 12px 0px rgba(0, 0, 18, 0.16);
}

:deep(button[class^="ri"]),
:deep(button[class*=" ri"]) {
  font-size: 1.2em;
}
</style>
