<template>
  <div class="button-group">
    <div class="left-button" v-if="modelOnglet != 'fullTab'">
      <fieldset class="fr-segmented fr-segmented--sm coachmark7">
        <div class="fr-segmented__elements">
          <div class="fr-segmented__element">
            <input type="radio" id="segmented-1-1" name="segmented-1" value="split" v-model="modelOnglet" />
            <label class="fr-label" for="segmented-1-1">
              <span
                :class="{
                  'ri-layout-column-fill fr-mx-1w': modelOnglet === 'split',
                  'ri-layout-column-line fr-mx-1w': modelOnglet !== 'split',
                }"
                aria-hidden="true"
              ></span>
            </label>
          </div>
          <div class="fr-segmented__element">
            <input value="fullTab" type="radio" id="segmented-1-2" name="segmented-1" v-model="modelOnglet" />
            <label class="fr-label" for="segmented-1-2">
              <span class="fr-icon-list-unordered fr-icon--sm fr-mx-1w" aria-hidden="true"></span>
            </label>
          </div>
          <div class="fr-segmented__element">
            <input type="radio" id="segmented-1-3" name="segmented-1" value="fullMap" v-model="modelOnglet" />
            <label class="fr-label" for="segmented-1-3">
              <span
                :class="{
                  'fr-icon-road-map-fill fr-icon--sm fr-mx-1w': modelOnglet === 'fullMap',
                  'fr-icon-road-map-line fr-icon--sm fr-mx-1w': modelOnglet !== 'fullMap',
                }"
                aria-hidden="true"
              ></span>
            </label>
          </div>
        </div>
      </fieldset>
    </div>

    <div class="mode-choice">
      <button
        class="fr-btn fr-btn--sm fr-btn--tertiary-no-outline coachmark3"
        @click="emit('compare')"
        aria-label="Comparer les parcelles"
        v-if="mapParams.currentMode === 'consult'"
        :disabled="!online"
      >
        <i class="ri-arrow-left-right-line fr-mr-1w" aria-hidden="true" />Comparer
      </button>
      <button
        class="fr-btn fr-btn--sm fr-btn--tertiary-no-outline fr-icon-add-line fr-btn--icon-left coachmark4"
        aria-label="Ajouter une nouvelle parcelle"
        :disabled="!permissions.canEditParcellaire || !online"
        @click="emit('addParcelle')"
      >
        Ajouter une parcelle
      </button>
    </div>

    <div class="right-button">
      <button
        v-if="mapParams.currentMode === 'consult'"
        class="fr-btn fr-btn--tertiary-no-outline fr-btn--sm coachmark5"
        @click="mapParams.currentMode = 'edit'"
        aria-label="Passer en mode dessin"
        :disabled="!permissions.canEditParcellaire || !online"
      >
        <i class="ri-shape-line fr-mr-1w" aria-hidden="true" /> Mode dessin
      </button>
      <button
        v-else-if="mapParams.currentMode != 'consult'"
        class="fr-btn fr-btn--tertiary-no-outline fr-btn--sm"
        @click="mapParams.currentMode = 'consult'"
        aria-label="Passer en mode dessin"
        :disabled="!permissions.canEditParcellaire || !online"
      >
        <i class="fr-icon-close-line fr-icon--sm fr-mr-1w" aria-hidden="true" /> Fermer le mode dessin
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { usePreferences } from "@/stores/preferences.js";
import { usePermissions } from "@/stores/permissions.js";
import { useOnline } from "@vueuse/core";
import { useFeaturesStore } from "@/stores/features";
import { ref, watch } from "vue";
import { storeToRefs } from "pinia";

const online = useOnline();

/*
 * * Stores
 */

const store = useFeaturesStore();
const preferences = usePreferences();
const permissions = usePermissions();

const { params: mapParams } = storeToRefs(preferences);

/**
 * *Props
 */

const props = defineProps<{ stateFS: "fullTab" | "split" | "fullMap" }>();

/**
 * * Refs
 */
const countSelected = ref<number>(store.selectedIds.length | 0);
const modelOnglet = ref<"fullTab" | "split" | "fullMap">(props.stateFS);

/**
 * * Emits
 */
const emit = defineEmits<{
  (e: "addParcelle"): void;
  (e: "compare"): void;
  (e: "openFullScreen"): void;
  (e: "modeDisplay", a: string): void;
}>();

/**
 * * Watchers
 */

watch(
  () => store.selectedIds,
  (newValue) => {
    countSelected.value = newValue.length;
  },
);

watch(
  () => props.stateFS,
  (newValue) => {
    modelOnglet.value = newValue;
  },
);

watch(
  () => modelOnglet.value,
  (newValue) => {
    emit("modeDisplay", newValue);
  },
);
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
  padding: 4px;

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

.right-button {
  background: #ffffff;
  height: fit-content;
  border-radius: 4px;

  position: absolute;
  top: 10px;
  right: 10px;

  box-shadow: 0px 4px 12px 0px rgba(0, 0, 18, 0.16);
}

.right-button > button {
  border-radius: 4px;
  height: 44px;
  justify-content: center;
}

.blue-background {
  background-color: #a6f2fa;
}
</style>
