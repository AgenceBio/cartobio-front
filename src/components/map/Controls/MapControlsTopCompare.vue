<template>
  <div class="button-group">
    <div class="mode-choice current" v-if="!isCompare">
      <p class="fr-text--xs center">Controle en cours</p>
      <b class="fr-ml-1w">{{ record.version_name }}</b>
    </div>
    <div class="mode-choice" v-else>
      <div class="seamless-select fr-grid-row">
        <b class="version-name">{{ currentRecord?.version_name ?? "" }}</b>
        <select class="version-name" name="select-version" id="select-version" v-model="currentRecord">
          <option
            :value="recordList.record_id"
            :key="recordList.record_id"
            v-for="recordList in sortedRecords"
            @click="changeCompare(recordList)"
          >
            {{ recordList.version_name }}
          </option>
        </select>
      </div>
      <button
        class="fr-btn fr-btn--tertiary-no-outline fr-btn--sm fr-icon-close-line fr-btn--icon-right"
        @click="emit('closeComparaison')"
      >
        Fermer
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRecordStore } from "@/stores/record.js";
import { useOperatorStore } from "@/stores/operator.js";

import { computed, onMounted, ref } from "vue";
import { apiClient } from "@/cartobio-api.js";

/*
 * * Stores
 */
const recordStore = useRecordStore();
const operatorStore = useOperatorStore();

const { record } = recordStore;

const sortedRecords = computed(() => operatorStore.records.filter((r) => r.record_id !== record.record_id));

/**
 * * Props
 */

const props = defineProps<{ fullScreenMap: boolean; isCompare?: boolean; selectedRecord?: any }>();

const currentRecord = ref(props.selectedRecord || sortedRecords.value[0]);

/**
 * * Emits
 */

const emit = defineEmits<{
  (e: "addParcelle"): void;
  (e: "changeCompare", { data: any, record_id: string }): void;
}>();

/**
 * * Functions
 */

const changeCompare = async (record) => {
  currentRecord.value = record;
  const { data } = await apiClient.get(`/v2/audits/${record.record_id}/parcelles`);
  emit("changeCompare", { data: data, record_id: record.record_id });
};

onMounted(async () => {
  currentRecord.value = sortedRecords.value[0];
  const { data } = await apiClient.get(`/v2/audits/${currentRecord.value.record_id}/parcelles`);
  emit("changeCompare", { data: data, record_id: currentRecord.value.record_id });
});
</script>

<style scoped>
.mode-choice {
  background: #ffffff;
  padding: 6px;
  border-radius: 4px;
  position: absolute;
  top: 10px;
  left: 35%;
  display: inline-flex;
}

.mode-choice.current {
  background: var(--green-menthe-925-125);
  color: var(--green-menthe-sun-373-moon-652);
}
.mode-choice.current > p {
  padding: 0;
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
  width: 50%;
  z-index: 1;
  top: 0;
  position: absolute;
}

.seamless-select {
  gap: 5px;
  position: relative;
  padding-right: 1rem;
  font-weight: normal;
  background-image: url("data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTIiIGhlaWdodD0iNiIgdmlld0JveD0iMCAwIDEyIDYiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxwYXRoIGZpbGwtcnVsZT0iZXZlbm9kZCIgY2xpcC1ydWxlPSJldmVub2RkIiBkPSJNNiA2TDAgMEgxMkw2IDZaIiBmaWxsPSIjMDAwMDkxIi8+Cjwvc3ZnPgo=");
  background-position: right center;
  background-repeat: no-repeat;
  justify-content: flex-end;
  color: black;

  & label {
    display: inline;
  }

  /* super hacky way to hide a select behind
   our custom div and still be able to interact with it
   (there is no way to open select fields programmatically) */
  & select {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    opacity: 0;
  }
}
.font-blue {
  color: black;
}

.mode-choice > * {
  margin-top: auto;
  margin-bottom: auto;
}

.version-name {
  margin-top: auto;
  margin-bottom: auto;
}
</style>
