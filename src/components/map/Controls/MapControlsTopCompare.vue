<template>
  <div class="button-group">
    <div class="mode-choice" v-if="!isCompare">
      <b class="fr-ml-1w">{{ record?.version_name }}</b>
      <p class="fr-text--xs cec">{{ permissions.isOc ? "Contrôle en cours" : "Consultation en cours" }}</p>
      <p
        class="fr-text--xs version-recente fr-pr-0w fr-mr-0w"
        v-if="diffOnMap === 'map1'"
        role="status"
        aria-live="polite"
      >
        Version + récente
      </p>
    </div>

    <div class="mode-choice" v-else>
      <div class="fr-select-group fr-mb-0w fr-p-0w">
        <select
          class="fr-select fr-text--sm"
          name="select-version"
          id="select-version"
          v-model="currentRecordId"
          @change="onSelectionChange"
          aria-label="Sélectionner la version à comparer"
        >
          <optgroup label="Navigation rapide" v-if="hasNavigationOptions">
            <option
              v-if="previousRecordFromCurrent"
              :value="previousRecordFromCurrent.record_id"
              class="navigation-option"
              :key="'prev-' + previousRecordFromCurrent.record_id"
            >
              Version précédente ({{
                previousRecordFromCurrent.version_name.length > 25
                  ? previousRecordFromCurrent.version_name.slice(0, 25) + "..."
                  : previousRecordFromCurrent.version_name
              }})
            </option>
            <option
              v-if="nextRecordFromCurrent"
              :value="nextRecordFromCurrent.record_id"
              class="navigation-option"
              :key="'next-' + nextRecordFromCurrent.record_id"
            >
              Version suivante ({{
                nextRecordFromCurrent.version_name.length > 25
                  ? nextRecordFromCurrent.version_name.slice(0, 25) + "..."
                  : nextRecordFromCurrent.version_name
              }})
            </option>
          </optgroup>

          <optgroup label="Toutes les versions">
            <option v-for="recordItem in sortedRecords" :key="recordItem.record_id" :value="recordItem.record_id">
              {{ recordItem.version_name }}
            </option>
          </optgroup>
        </select>
      </div>
      <p
        class="fr-text--xs version-recente fr-pr-0w fr-mr-0w"
        v-if="diffOnMap === 'map2'"
        role="status"
        aria-live="polite"
      >
        Version + récente
      </p>
      <div class="vr" />

      <button
        class="fr-btn fr-btn--tertiary-no-outline fr-btn--sm fr-icon-close-line"
        aria-label="Fermer la comparaison"
        @click="closeComparison"
      ></button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, inject, onMounted, Ref, ref, watch } from "vue";
import { storeToRefs } from "pinia";
import { useRecordStore } from "@/stores/record.js";
import { useOperatorStore } from "@/stores/operator.js";
import { apiClient } from "@/cartobio-api.js";
import { Map } from "ol";
import { usePermissions } from "@/stores/permissions.js";

const recordStore = useRecordStore();
const operatorStore = useOperatorStore();
const permissions = usePermissions();

const { record } = storeToRefs(recordStore);

const props = defineProps<{
  fullScreenMap: boolean;
  isCompare?: boolean;
  selectedRecord?: any;
}>();

const emit = defineEmits<{
  (e: "addParcelle"): void;
  (e: "changeCompare", payload: { data: any; record_id: string }): void;
  (e: "closeComparaison"): void;
}>();
const map1 = inject<Ref<Map | null>>("map");
const map2 = inject<Ref<Map | null>>("map2");
const diffOnMap = ref<"map1" | "map2" | null>(null);

onMounted(() => {
  if (map1.value) {
    map1.value.getLayers().on("add", (e) => {
      if (e.element.get("name") === "diffLayer") {
        diffOnMap.value = "map1";
      }
    });
    map1.value.getLayers().on("remove", (e) => {
      if (e.element.get("name") === "diffLayer") {
        diffOnMap.value = null;
      }
    });
  }

  if (map2.value) {
    map2.value.getLayers().on("add", (e) => {
      if (e.element.get("name") === "diffLayer") {
        diffOnMap.value = "map2";
      }
    });
    map2.value.getLayers().on("remove", (e) => {
      if (e.element.get("name") === "diffLayer") {
        diffOnMap.value = null;
      }
    });
  }
});

const sortedRecords = computed(() => {
  const list = operatorStore.recordsByYearAll ? operatorStore.recordsByYearAll.flatMap((item) => item.records) : [];
  const excludeId = record.value?.record_id ?? null;
  const filtered = list.filter((r) => r.record_id !== excludeId);
  return filtered;
});

const sortedRecordsWithCurrent = computed(() => {
  const list = operatorStore.recordsByYearAll ? operatorStore.recordsByYearAll.flatMap((item) => item.records) : [];

  return list;
});

const currentRecordId = ref<string | null>(props.selectedRecord?.record_id ?? null);

const fixedRecordIndexInSortedList = computed(() => {
  if (!record.value.record_id) return -1;
  return sortedRecordsWithCurrent.value.findIndex((r) => r.record_id === record.value.record_id);
});

const previousRecordFromCurrent = computed(() => {
  const currentIndex = fixedRecordIndexInSortedList.value;

  if (currentIndex >= 0 && currentIndex < sortedRecordsWithCurrent.value.length - 1) {
    const prev = sortedRecordsWithCurrent.value[currentIndex + 1];
    return prev;
  }
  return null;
});

const nextRecordFromCurrent = computed(() => {
  const currentIndex = fixedRecordIndexInSortedList.value;
  if (currentIndex > 0) {
    const next = sortedRecordsWithCurrent.value[currentIndex - 1];
    return next;
  }
  return null;
});

const hasNavigationOptions = computed(() => !!(previousRecordFromCurrent.value || nextRecordFromCurrent.value));

watch(
  sortedRecords,
  (list) => {
    if (!currentRecordId.value && list.length > 0) {
      currentRecordId.value = list[0].record_id;
    }
  },
  { immediate: true },
);

watch(
  () => props.selectedRecord,
  (newSel) => {
    if (newSel?.record_id) currentRecordId.value = newSel.record_id;
  },
);

watch(
  currentRecordId,
  async (newId) => {
    if (!newId) return;
    try {
      const { data } = await apiClient.get(`/v2/audits/${newId}/parcelles`);
      emit("changeCompare", { data, record_id: newId });
    } catch (error) {
      console.error("Erreur lors du chargement des parcelles:", error);
    }
  },
  { immediate: true },
);

const onSelectionChange = (event: Event) => {
  const target = event.target as HTMLSelectElement;
  currentRecordId.value = target.value || null;
};

const closeComparison = () => {
  emit("closeComparaison");
};
</script>

<style scoped>
.mode-choice {
  background: #ffffff;
  padding: 12px;
  border-radius: 4px;
  position: absolute;
  top: 10px;
  left: 30%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
  min-width: 300px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  height: 56px;
  font-size: 12px;
}

.fr-select-group {
  position: relative;
  flex: 1;
}

.fr-select {
  width: 100%;
  background-color: var(--background-default-grey);
  border: 2px solid #000091;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
  color: #000091;
  appearance: none;
  margin-bottom: 0rem;
  -webkit-appearance: none;
  -moz-appearance: none;
  outline: none;
}

.fr-select:not(:focus) {
  outline: none !important;
  box-shadow: none !important;
}

.fr-select:focus {
  border-color: #000091;
  outline: 2px solid rgba(0, 0, 145, 0.2);
  outline-offset: 2px;
  box-shadow: 0 0 0 3px rgba(0, 0, 145, 0.1);
}

.fr-select optgroup {
  font-weight: bold;
  color: var(--text-title-grey);
  background-color: var(--background-alt-grey);
  padding: 0.5rem;
}

.fr-select option {
  padding: 0.75rem;
  color: var(--text-default-grey);
  background-color: var(--background-default-grey);
  font-weight: normal;
}

.fr-select option.navigation-option {
  font-style: italic;
  color: #000091;
  font-weight: 500;
}

.fr-select option:hover {
  background-color: var(--background-alt-blue-france);
}

.fr-btn {
  height: fit-content;
  align-self: center;
  white-space: nowrap;
  flex-shrink: 0;
}

.cec {
  align-items: center;
  padding: 2px 8px;
  background: #eeeeee;
  border-radius: 12px;
  font-size: 0.75rem;
  margin: auto;
}

.button-group {
  width: 50%;
  z-index: 1;
  top: 0;
  position: absolute;
}

.fr-select-group:not(:last-child),
.fr-input-group:not(:last-child) {
  margin-bottom: 0rem;
}

.version-recente {
  padding: 2px 8px;
  align-items: center;
  font-size: 0.75rem;
  margin: auto;

  background: #8bf8e7;
  border-radius: 12px;
}

@media (max-width: 768px) {
  .mode-choice {
    left: 10px;
    right: 10px;
    width: auto;
    min-width: auto;
    flex-direction: column;
    align-items: stretch;
    gap: 0.75rem;
    justify-content: flex-start;
  }

  .fr-select {
    min-width: auto;
    width: 100%;
  }

  .fr-btn {
    align-self: stretch;
    justify-content: center;
  }
}

.vr {
  display: inline-block;
  align-self: stretch;
  width: 1px;
  min-height: 0.5em;
  background-color: grey;
  opacity: 0.25;
}
</style>
