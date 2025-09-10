<template>
  <div class="button-group">
    <div class="left-button" v-if="!fullScreenMap">
      <button class="fr-btn fr-btn--tertiary-no-outline" @click="emit('openFullScreen')">
        <i class="ri-sidebar-fold-line" aria-hidden="true" />
      </button>
    </div>

    <div class="mode-choice" v-if="mapPrefs.currentMode === 'consult'">
      <button class="fr-btn fr-btn--tertiary-no-outline" @click="emit('compare')">
        <i class="ri-arrow-left-right-line fr-mr-1w" aria-hidden="true" />Comparer
      </button>
      <button
        class="fr-btn fr-btn--tertiary-no-outline fr-icon-add-line fr-btn--icon-left"
        :disabled="!permissions.canEditParcellaire"
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

import { storeToRefs } from "pinia";

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
}

.left-button {
  background: #ffffff;
  justify-content: space-between;
  gap: 10px;
  height: fit-content;
  position: absolute;
  top: 10px;
  left: 10px;
  display: flex;
  gap: 10px;
}

.left-button > button {
  border-radius: 4px;
  width: 44px;
  height: 44px;
  text-align: center;
}

.button-group {
  width: 100%;
  z-index: 1;
  position: absolute;
}
</style>
