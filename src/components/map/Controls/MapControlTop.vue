<template>
  <div class="button-group">
    <div class="left-button" v-if="modelOnglet != 'fullTab'">
      <fieldset
        class="fr-segmented fr-segmented--sm coachmark7"
        :class="{ 'vertical-layout': !isMobile && !isWide && isEditing }"
      >
        <div class="fr-segmented__elements">
          <div
            class="fr-segmented__element"
            aria-label="Vue partagée tableau / carte"
            v-tooltip="{ text: 'Vue partagée tableau / carte', position: 'right' }"
          >
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
          <div class="fr-segmented__element" aria-label="Vue tableau" v-tooltip="{ text: 'Vue tableau' }">
            <input value="fullTab" type="radio" id="segmented-1-2" name="segmented-1" v-model="modelOnglet" />
            <label class="fr-label" for="segmented-1-2">
              <span class="fr-icon-list-unordered fr-icon--sm fr-mx-1w" aria-hidden="true"></span>
            </label>
          </div>
          <div class="fr-segmented__element" aria-label="Vue carte" v-tooltip="{ text: 'Vue carte' }">
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
        aria-label="Comparer les versions"
        v-tooltip="{ text: 'Comparer les versions' }"
        v-if="mapParams.currentMode === 'consult'"
        :disabled="!online"
      >
        <i
          class="ri-arrow-left-right-line"
          :class="{
            'fr-mr-1w': !isEditing || modelOnglet === 'fullMap',
          }"
          aria-hidden="true"
        />
        <template v-if="!isEditing || modelOnglet === 'fullMap'">Comparer</template>
      </button>
      <button
        class="fr-btn fr-btn--sm fr-btn--tertiary-no-outline fr-icon-add-line coachmark4"
        :class="{
          'fr-btn--icon-left': !isEditing || mapParams.currentMode != 'consult' || modelOnglet === 'fullMap',
        }"
        aria-label="Ajouter une nouvelle parcelle"
        v-tooltip="{ text: 'Ajouter une nouvelle parcelle' }"
        :disabled="
          !permissions.canEditParcellaire ||
          !online ||
          (mapParams.currentMode != 'edit' && mapParams.currentMode != 'consult')
        "
        @click="emit('addParcelle')"
      >
        <template v-if="!isEditing || mapParams.currentMode != 'consult' || modelOnglet === 'fullMap'"
          >Ajouter une parcelle</template
        >
      </button>
    </div>

    <div class="right-button">
      <button
        v-if="mapParams.currentMode === 'consult'"
        class="fr-btn fr-btn--tertiary-no-outline fr-btn--sm coachmark5"
        @click="mapParams.currentMode = 'edit'"
        aria-label="Passer en mode dessin"
        v-tooltip="{ text: 'Passer en mode dessin' }"
        :disabled="!permissions.canEditParcellaire || !online"
      >
        <i
          class="ri-shape-line"
          :class="{
            'fr-mr-1w':
              (isWide && !isEditing) || !isEditing || mapParams.currentMode != 'consult' || modelOnglet === 'fullMap',
          }"
          aria-hidden="true"
        />
        <template
          v-if="(isWide && !isEditing) || !isEditing || mapParams.currentMode != 'consult' || modelOnglet === 'fullMap'"
          >Mode dessin</template
        >
        <template v-else>Dessin</template>
      </button>
      <button
        v-else-if="mapParams.currentMode != 'consult'"
        class="fr-btn fr-btn--tertiary-no-outline fr-btn--sm"
        @click="mapParams.currentMode = 'consult'"
        aria-label="Fermer le mode dessin"
        v-tooltip="{ text: 'Fermer le mode dessin' }"
        :disabled="
          !permissions.canEditParcellaire ||
          !online ||
          (mapParams.currentMode != 'edit' && mapParams.currentMode != 'consult')
        "
      >
        <i
          class="fr-icon-close-line fr-icon--sm"
          :class="{
            'fr-mr-1w': isWide || !isEditing || mapParams.currentMode != 'consult' || modelOnglet === 'fullMap',
          }"
          aria-hidden="true"
        />
        <template v-if="isWide || !isEditing || mapParams.currentMode != 'consult' || modelOnglet === 'fullMap'"
          >Fermer le mode dessin</template
        >
        <template v-else>Dessin</template>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { usePreferences } from "@/stores/preferences.js";
import { usePermissions } from "@/stores/permissions.js";
import { useOnline } from "@vueuse/core";
import { useFeaturesStore } from "@/stores/features";
import { ref, watch, computed, onMounted, onUnmounted } from "vue";
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

const props = defineProps<{ stateFS: "fullTab" | "split" | "fullMap"; isEditing: boolean }>();

/**
 * * Refs
 */

const windowWidth = ref(window.innerWidth);

const countSelected = ref<number>(store.selectedIds.length | 0);
const modelOnglet = ref<"fullTab" | "split" | "fullMap">(props.stateFS);

const isMobile = computed(() => windowWidth.value < 992);
const isWide = computed(() => windowWidth.value >= 1600);

/**
 * * Gestion du resposive
 */
const handleResize = () => {
  windowWidth.value = window.innerWidth;
};

onMounted(() => {
  window.addEventListener("resize", handleResize);
});

onUnmounted(() => {
  window.removeEventListener("resize", handleResize);
});

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
  height: fit-content;
  position: absolute;
  top: 10px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  box-shadow: 0px 4px 12px 0px rgba(0, 0, 18, 0.16);
  button + button {
    border-left: 1px solid var(--background-default-grey-active);
  }
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

.left-button .vertical-layout .fr-segmented__elements {
  flex-direction: column;
}

.left-button .vertical-layout .fr-segmented__element {
  width: 100%;
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
