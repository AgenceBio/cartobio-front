<template>
  <div class="button-group">
    <div class="left-button" v-if="!fullScreenMap">
      <button
        class="fr-btn fr-btn--tertiary-no-outline"
        @click="emit('openFullScreen')"
        aria-label="Ouvrir le mode plein écran"
        :disabled="!online"
      >
        <span class="ri-sidebar-fold-line" aria-hidden="true" />
      </button>
    </div>

    <div class="mode-choice" v-if="mapPrefs.currentMode === 'consult'">
      <button
        class="fr-btn fr-btn--sm fr-btn--tertiary-no-outline"
        @click="emit('compare')"
        aria-label="Comparer les parcelles"
        :disabled="!online"
      >
        <i class="ri-arrow-left-right-line fr-mr-1w" aria-hidden="true" />Comparer
      </button>
      <button
        class="fr-btn fr-btn--sm fr-btn--tertiary-no-outline fr-icon-add-line fr-btn--icon-left"
        aria-label="Ajouter une nouvelle parcelle"
        :disabled="!permissions.canEditParcellaire || !online"
        @click="emit('addParcelle')"
      >
        Ajouter une parcelle
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { usePreferences } from "@/stores/preferences.js";
import { usePermissions } from "@/stores/permissions.js";
import { useOnline } from "@vueuse/core";

import { storeToRefs } from "pinia";

const online = useOnline();

/*
 * * Stores
 */

const preferences = usePreferences();
const permissions = usePermissions();

const { map: mapPrefs } = storeToRefs(preferences);

/**
 * *Props
 */

defineProps<{ fullScreenMap: boolean }>();

/**
 * * Emits
 */
const emit = defineEmits<{
  (e: "addParcelle"): void;
  (e: "compare"): void;
  (e: "openFullScreen"): void;
}>();
</script>

<style scoped>
.mode-choice {
  background: #ffffff;
  padding: 6px;
  justify-content: space-between;
  border-radius: 4px;
  gap: 10px;
  height: fit-content;
  position: absolute;
  top: 10px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 10px;
  box-shadow: 0px 4px 12px 0px rgba(0, 0, 18, 0.16);
}

.left-button {
  background: #ffffff;
  height: fit-content;
  border-radius: 4px;

  position: absolute;
  top: 10px;
  left: 10px;
  box-shadow: 0px 4px 12px 0px rgba(0, 0, 18, 0.16);
}

.left-button > button {
  border-radius: 4px;
  width: 44px;
  height: 44px;
  justify-content: center;
}

.button-group {
  width: 100%;
  z-index: 1;
  position: absolute;
}
</style>
