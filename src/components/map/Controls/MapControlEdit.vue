<template>
  <div class="toolbar coachmark6">
    <div class="toolbar-top" role="group" aria-label="Outils de gestion des parcelles">
      <button
        class="fr-btn fr-btn--sm"
        :class="[mapParams.currentMode === 'edit' ? 'fr-btn--secondary' : 'fr-btn--tertiary-no-outline']"
        aria-label="Activer le mode édition pour modifier les parcelles existantes"
        :aria-pressed="mapParams.currentMode === 'edit'"
        v-tooltip="{ text: 'Activer le mode édition pour modifier les parcelles existantes', position: 'left' }"
        @click="handleAction('edit')"
        @keydown.enter.prevent="handleAction('edit')"
        @keydown.space.prevent="handleAction('edit')"
        :disabled="!online"
      >
        <i class="ri-navigation-line" aria-hidden="true" />
      </button>

      <hr style="margin: 5px 0 -15px 0" />

      <button
        class="fr-btn fr-btn--sm"
        :class="[mapParams.currentMode === 'decouper' ? 'fr-btn--secondary' : 'fr-btn--tertiary-no-outline']"
        aria-label="Découper le contour de la parcelle sélectionnée"
        :aria-pressed="mapParams.currentMode === 'decouper'"
        v-tooltip="{ text: 'Découper le contour de la parcelle sélectionnée', position: 'left' }"
        @click="handleAction('decouper')"
        @keydown.enter.prevent="handleAction('decouper')"
        @keydown.space.prevent="handleAction('decouper')"
        :disabled="countSelected != 1 || !permissions.canEditParcellaire || !online"
      >
        <i class="ri-crop-line" aria-hidden="true" />
      </button>

      <button
        class="fr-btn fr-btn--sm"
        :class="[mapParams.currentMode === 'divide' ? 'fr-btn--secondary' : 'fr-btn--tertiary-no-outline']"
        aria-label="Tracer une ligne pour couper la parcelle sélectionnée en deux"
        :aria-pressed="mapParams.currentMode === 'divide'"
        v-tooltip="{ text: 'Tracer une ligne pour couper la parcelle sélectionnée en deux', position: 'left' }"
        @click="handleAction('divide')"
        @keydown.enter.prevent="handleAction('divide')"
        @keydown.space.prevent="handleAction('divide')"
        :disabled="countSelected != 1 || !permissions.canEditParcellaire || !online"
      >
        <i class="ri-scissors-cut-line" aria-hidden="true" />
      </button>

      <button
        class="fr-btn fr-btn--sm"
        :class="[mapParams.currentMode === 'fusionner' ? 'fr-btn--secondary' : 'fr-btn--tertiary-no-outline']"
        aria-label="Fusionner plusieurs parcelles sélectionnées en un seul"
        :aria-pressed="mapParams.currentMode === 'fusionner'"
        v-tooltip="{ text: 'Fusionner plusieurs parcelles sélectionnées en un seul', position: 'left' }"
        @click="handleAction('fusionner')"
        @keydown.enter.prevent="handleAction('fusionner')"
        @keydown.space.prevent="handleAction('fusionner')"
        :disabled="countSelected < 2 || !permissions.canEditParcellaire || !online"
      >
        <i class="ri-merge-cells-horizontal" aria-hidden="true" />
      </button>

      <button
        class="fr-btn fr-btn--sm"
        :class="[mapParams.currentMode === 'delete' ? 'fr-btn--secondary' : 'fr-btn--tertiary-no-outline']"
        aria-label="Supprimer la ou les parcelles sélectionnées"
        :aria-pressed="mapParams.currentMode === 'delete'"
        v-tooltip="{ text: 'Supprimer la ou les parcelles sélectionnées', position: 'left' }"
        @click="handleAction('delete')"
        @keydown.enter.prevent="handleAction('delete')"
        @keydown.space.prevent="handleAction('delete')"
        :disabled="countSelected < 1 || !permissions.canEditParcellaire || !online"
      >
        <i class="ri-delete-bin-line" aria-hidden="true" />
      </button>
    </div>
  </div>

  <ChangeCartoModeModal v-if="targetMode" :target-mode="targetMode" @close="targetMode = null" />
</template>
<script setup lang="ts">
import { ref, watch } from "vue";
import { storeToRefs } from "pinia";

import { useFeaturesStore } from "@/stores/features";
import { usePreferences } from "@/stores/preferences.js";
import { usePermissions } from "@/stores/permissions.js";
import { useOnline } from "@vueuse/core";
import ChangeCartoModeModal from "@/components/forms/ChangeCartoModeModal.vue";

const online = useOnline();

/**
 * * Stores
 */
const store = useFeaturesStore();
const preferences = usePreferences();
const permissions = usePermissions();

const { params: mapParams } = storeToRefs(preferences);

/**
 * * Refs
 */
const countSelected = ref<number>(store.selectedIds.length | 0);
const targetMode = ref<string | null>(null);

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
  if (mapParams.value.currentMode === mode) {
    return;
  }
  if (mapParams.value.hasUndo) {
    targetMode.value = mode;
  } else {
    mapParams.value.currentMode = mode;
  }
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
    top: 15%;
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
