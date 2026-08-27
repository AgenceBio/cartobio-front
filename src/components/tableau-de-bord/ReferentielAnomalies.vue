<script setup lang="ts">
import { ref } from "vue";
import { getErrorMessage, ErrorGroups, getErrorColor } from "@/utils/error-api.utils.ts";
import Modal from "@/components/widgets/Modal.vue";

defineProps<{
  modelValue: boolean;
}>();

const emit = defineEmits<{
  (e: "update:modelValue", value: boolean): void;
}>();

const closeModal = () => {
  emit("update:modelValue", false);
};

const activeTab = ref("operateur");

const tabs = [
  {
    id: "operateur",
    label: "Opérateur",
    errors: ErrorGroups.import,
  },
  {
    id: "dates",
    label: "Dates du parcellaire",
    errors: ErrorGroups.dateValidation,
  },
  {
    id: "parcelles",
    label: "Parcelles",
    errors: [...ErrorGroups.parcelErrors, ...ErrorGroups.parcelWarnings],
  },
];
</script>

<template>
  <Modal v-if="modelValue" data-track-content data-content-name="Modale référentiel des anomalies" @close="closeModal">
    <h2 class="fr-h5 fr-mb-3w">Référentiel des anomalies</h2>

    <div class="fr-tabs">
      <ul class="fr-tabs__list" role="tablist">
        <li v-for="tab in tabs" :key="tab.id" role="presentation">
          <button
            :id="`tab-${tab.id}`"
            class="fr-tabs__tab"
            :class="{ 'fr-tabs__tab--active': activeTab === tab.id }"
            type="button"
            role="tab"
            :aria-selected="activeTab === tab.id"
            :aria-controls="`panel-${tab.id}`"
            @click="activeTab = tab.id"
          >
            {{ tab.label }}
          </button>
        </li>
      </ul>

      <template v-for="tab in tabs" :key="tab.id">
        <section
          v-if="activeTab === tab.id"
          :id="`panel-${tab.id}`"
          class="fr-tabs__panel fr-tabs__panel--selected"
          role="tabpanel"
          :aria-labelledby="`tab-${tab.id}`"
          tabindex="0"
        >
          <div v-for="anomalie in tab.errors" :key="anomalie" class="anomalie-row">
            <span class="anomalie-label">
              <span
                class="anomalie-color"
                :style="{
                  backgroundColor: getErrorColor(anomalie as ErrorCode),
                }"
                aria-hidden="true"
              ></span>

              <span>
                {{ getErrorMessage(anomalie) }}
              </span>
            </span>

            <span class="anomalie-code">
              {{ anomalie }}
            </span>
          </div>
        </section>
      </template>
    </div>
  </Modal>
</template>

<style scoped>
.anomalie-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 0;
  border-bottom: 1px solid #ddd;
}

.anomalie-code {
  color: #666;
  font-size: 0.9rem;
  font-family: monospace;
}

.anomalie-label {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.anomalie-color {
  width: 12px;
  height: 12px;
  flex: 0 0 12px;
  border-radius: 0;
  display: inline-block;
}
</style>
