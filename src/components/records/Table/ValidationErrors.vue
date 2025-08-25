<template>
  <div>
    <div
      class="fr-grid-row fr-grid-row--middle notif-title"
      :class="{ 'fr-pb-4v': open }"
      @click.stop="open = !open"
      @keydown.enter="open = !open"
    >
      <h3 class="fr-text--lg fr-mb-0">Notifications</h3>
      <div class="fr-grid-row icons">
        <p class="color-green bg-bourgeon fr-px-1v fr-text--sm fr-text--bold">
          <span class="fr-icon fr-icon-notification-3-line fr-icon--sm color-green" aria-hidden="true"></span>
          {{ countNotif }}
        </p>
        <span v-if="!open" class="fr-icon fr-icon-add-line fr-icon--sm color-green" aria-hidden="true"></span>
        <span v-else class="fr-icon fr-icon-subtract-line fr-icon--sm color-green" aria-hidden="true"></span>
      </div>
    </div>
    <div :hidden="!open">
      <div
        v-for="[ruleId, result] in featuresSet.required"
        :key="ruleId"
        class="fr-grid-row fr-grid-row--middle notification fr-p-3v fr-mb-2v"
      >
        <div class="fr-grid-row fr-grid-row--middle left-block">
          <p class="error-text fr-mb-0 fr-px-1v fr-text--sm fr-text--bold">
            <span class="fr-icon fr-icon-warning-line fr-icon--sm fr-mr-1v" aria-hidden="true"></span
            >{{ result.count }} parcelle{{ result.count > 1 ? "s" : "" }}
          </p>
          <h4 class="fr-text--md fr-mb-0">
            {{ result.label }}
          </h4>
        </div>
        <button
          class="fr-btn fr-btn--tertiary-no-outline fr-icon-search-line fr-btn--icon-right"
          :aria-label="`${result.errorMessage} pour ${result.count} parcelle${result.count > 1 ? 's' : ''}`"
          @click="selectParcelles(result.featureIds)"
        >
          Afficher
        </button>
      </div>
      <div
        v-for="[ruleId, result] in featuresSet.rotationErrors"
        :key="ruleId"
        class="fr-grid-row fr-grid-row--middle notification fr-p-3v fr-mb-2v"
      >
        <div class="fr-grid-row fr-grid-row--middle left-block">
          <p class="error-text fr-mb-0 fr-px-1v fr-text--sm fr-text--bold">
            <span class="fr-icon fr-icon-warning-line fr-icon--sm fr-mr-1v" aria-hidden="true"></span
            >{{ result.count }} parcelle{{ result.count > 1 ? "s" : "" }}
          </p>
          <h4 class="fr-text--md fr-mb-0">
            {{ result.label }}
          </h4>
        </div>
        <button
          class="fr-btn fr-btn--tertiary-no-outline fr-icon-search-line fr-btn--icon-right"
          :aria-label="`${result.errorMessage} pour ${result.count} parcelle${result.count > 1 ? 's' : ''}`"
          @click="selectParcelles(result.featureIds)"
        >
          Afficher
        </button>
      </div>

      <div
        v-if="record.record_id !== operatorStore.records?.[0]?.record_id"
        class="fr-grid-row fr-grid-row--middle notification fr-p-3v fr-mb-2v"
      >
        <div class="fr-grid-row fr-grid-row--middle left-block">
          <p class="notifications-icon fr-mb-0 fr-px-1v">
            <span class="fr-icon fr-icon-notification-3-line fr-icon--sm fr-mr-1v" aria-hidden="true"></span>1
          </p>
          <h4 class="fr-text--md fr-mb-0">Cette version du parcellaire n'est pas la plus récente.</h4>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from "vue";
import { useFeaturesSetsStore } from "@/stores/features-sets.js";
import { useOperatorStore } from "@/stores/operator";
import { useRecordStore } from "@/stores/record";
import { useFeaturesStore } from "@/stores/features";

const emit = defineEmits(["switch-tab"]);

const operatorStore = useOperatorStore();
const recordStore = useRecordStore();
const featuresSet = useFeaturesSetsStore();
const featuresStore = useFeaturesStore();

const { record } = recordStore;
const open = ref(false);
const countNotif = computed(() => {
  return (
    (featuresSet.required.size ?? 0) +
    (featuresSet.rotationErrors.size ?? 0) +
    +(record.record_id !== operatorStore.records?.[0]?.record_id)
  );
});

function selectParcelles(featureIds) {
  featuresStore.unselectAll();
  featuresStore.select(...featureIds);
  emit("switch-tab");
}
</script>

<style scoped>
.notification {
  border: 1px solid var(--blue-france-950-100);
  justify-content: space-between;
}

.left-block {
  gap: 8px;
}

.error-text {
  text-transform: uppercase;
  color: var(--text-default-error);
  background-color: var(--red-marianne-925-125);
}

.notifications-icon {
  color: var(--blue-ecume-sun-247-moon-675);
  background-color: var(--blue-ecume-925-125);
}

.color-green {
  color: var(--green-bourgeon-sun-425-moon-759);
}

.bg-bourgeon {
  background-color: var(--green-bourgeon-975-75);
}

.notif-title {
  justify-content: space-between;
}
.icons {
  gap: 5px;
}
</style>
