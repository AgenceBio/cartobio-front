<template>
  <Modal @close="emit('close')" v-bind="$attrs">
    <template #title> <slot name="title" /> </template>
    <form @submit.prevent="validate" id="feature-edit-niveau-conversion-form">
      <ConversionLevelSelector
        :feature-id="feature.properties.id || feature.id"
        :readonly="!permissions.canChangeConversionLevel"
        v-model="patch.conversion_niveau"
        modal
      />

      <div class="fr-input-group" v-if="isAB">
        <label class="fr-label" for="engagement_date"
          >Date de début de conversion <span v-if="!isEngagementDateRequired">(facultatif)</span></label
        >
        <input
          type="date"
          class="fr-input"
          v-model="patch.engagement_date"
          name="engagement_date"
          id="engagement_date"
          :required="isEngagementDateRequired"
          :disabled="!isAB || !permissions.canChangeConversionLevel"
          min="1985-01-01"
          :max="maxDate"
        />
      </div>

      <AnnotationsSelector
        v-if="permissions.canAddAnnotations"
        v-model="patch.annotations"
        :feature-id="feature.properties.id"
        :readonly="!permissions.canEditParcellaire"
      />

      <div class="fr-input-group">
        <label class="fr-label" for="auditeur_notes">Vos notes de certification (facultatif)</label>
        <textarea
          :disabled="!permissions.canEditParcellaire"
          class="fr-input"
          id="auditeur_notes"
          name="auditeur_notes"
          v-model="patch.auditeur_notes"
        />
      </div>
    </form>
    <template #footer>
      <ul class="fr-btns-group fr-btns-group--inline fr-btns-group--icon-left">
        <li>
          <button
            class="fr-btn"
            type="submit"
            form="feature-edit-niveau-conversion-form"
            aria-label="Enregister le niveau de conversion"
          >
            Ok
          </button>
        </li>
        <li>
          <button
            class="fr-btn fr-btn--tertiary"
            @click="emit('close')"
            aria-label="Annuler la modification du niveau de conversion"
          >
            Annuler
          </button>
        </li>
      </ul>
      <div class="fr-input-group"></div>
    </template>
  </Modal>
</template>

<script setup>
import { computed, reactive, onBeforeUnmount, watch } from "vue";
import Modal from "@/components/widgets/Modal.vue";
import { usePermissions } from "@/stores/permissions";
import ConversionLevelSelector from "./fields/ConversionLevelSelector.vue";
import { useFeaturesSetsStore } from "@/stores/features-sets";
import { isABLevel, LEVEL_C1, LEVEL_C2, LEVEL_C3 } from "@/referentiels/ab";
import { toDateInputString } from "@/utils/dates";

const props = defineProps({
  feature: {
    type: Object,
    required: true,
  },
});

const emit = defineEmits(["submit", "close"]);
const isAB = computed(() => isABLevel(patch.conversion_niveau));
const maxDate = computed(() => toDateInputString(new Date()));
const isEngagementDateRequired = computed(() => [LEVEL_C1, LEVEL_C2, LEVEL_C3].includes(patch.conversion_niveau));

const patch = reactive({
  conversion_niveau: props.feature.properties.conversion_niveau || "",
  engagement_date: props.feature.properties.engagement_date,
  auditeur_notes: props.feature.properties.auditeur_notes || "",
  annotations: props.feature.properties.annotations || [],
});
const permissions = usePermissions();
const featuresSet = useFeaturesSetsStore();

onBeforeUnmount(() => featuresSet.setCandidate([]));

watch(
  patch,
  (properties) => {
    featuresSet.setCandidate([
      {
        id: props.feature.id,
        geometry: props.feature.geometry,
        properties: {
          ...props.feature.properties,
          ...properties,
        },
      },
    ]);
  },
  { immediate: props.feature.properties.isCertified ?? false },
);

const validate = () => {
  const set = featuresSet.byFeature(props.feature.id, true);

  if (set.size) {
    return false;
  }

  emit("submit", { id: props.feature.id, properties: patch });
};
</script>

<style scoped></style>
