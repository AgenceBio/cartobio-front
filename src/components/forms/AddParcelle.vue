<template>
  <Modal @close="handleClose" v-bind="$attrs" data-track-content data-content-name="Modale de modification de parcelle">
    <form @submit.prevent="validate" id="single-feature-edit-form">
      <div class="fr-p-2w fr-mb-3w">
        <div class="fr-input-group" :class="{ 'fr-input-group--error': nameErrors.size }">
          <label class="fr-label" for="feature-nom">Nom de la parcelle</label>
          <span class="fr-hint-text fr-mb-1v">Exemple&nbsp;: Les charrons 2</span>
          <input
            class="fr-input"
            id="feature-nom"
            v-model="patch.NOM"
            :required="requiredName"
            :class="{ 'fr-input--error': nameErrors.size }"
            ref="autofocusedElement"
            :disabled="readonly"
          />
          <div v-for="[id, result] in nameErrors" :key="id" class="fr-hint-text fr-error-text">
            {{ result.errorMessage }}.
          </div>
        </div>
      </div>

      <CultureSelector
        :feature-id="feature.properties.id || feature.id"
        :cultures="patch.cultures"
        @change="($cultures) => (patch.cultures = $cultures)"
        :disabled-input="readonly || !permissions.canChangeCulture"
      />

      <ConversionLevelSelector
        :feature-id="feature.properties.id || feature.id"
        :readonly="!permissions.canChangeConversionLevel || readonly"
        v-model="patch.conversion_niveau"
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
          :disabled="!isAB || readonly || !permissions.canChangeConversionLevel"
          min="1985-01-01"
          :max="maxDate"
        />
      </div>

      <AnnotationsSelector
        v-if="permissions.canAddAnnotations"
        v-model="patch.annotations"
        :feature-id="feature.properties.id"
        :readonly="readonly || !permissions.canEditParcellaire"
      />

      <div class="fr-input-group">
        <label class="fr-label" for="auditeur_notes">Vos notes de certification (facultatif)</label>
        <textarea
          :disabled="readonly || !permissions.canEditParcellaire"
          class="fr-input"
          id="auditeur_notes"
          name="auditeur_notes"
          v-model="patch.auditeur_notes"
        />
      </div>
    </form>

    <template #title><slot name="title" /></template>

    <template #footer>
      <div class="fr-input-group">
        <button
          class="fr-btn"
          type="submit"
          form="single-feature-edit-form"
          :aria-label="readonly ? 'Ne plus afficher les details du parcellaire' : 'Enregistrer le parcellaire'"
        >
          {{ readonly ? "Fermer" : "Enregistrer" }}
        </button>
      </div>
    </template>
  </Modal>
  <CancelModal v-if="showCancelModal" @cancel="showCancelModal = false" @close="$emit('close')" />
</template>

<script setup>
import { computed, onBeforeUnmount, reactive, ref, watch } from "vue";
import { useFocus } from "@vueuse/core";

import { isABLevel, LEVEL_C1, LEVEL_C2, LEVEL_C3 } from "@/referentiels/ab.js";
import { useFeaturesSetsStore } from "@/stores/features-sets.js";
import { usePermissions } from "@/stores/permissions.js";
import { toDateInputString } from "@/utils/dates.js";

import Modal from "@/components/widgets/Modal.vue";
import AnnotationsSelector from "@/components/forms/fields/AnnotationsSelector.vue";
import CultureSelector from "@/components/forms/fields/CultureSelector.vue";
import ConversionLevelSelector from "@/components/forms/fields/ConversionLevelSelector.vue";
import CancelModal from "@/components/forms/CancelModal.vue";

const props = defineProps({
  feature: {
    type: Object,
    required: true,
  },
  open: {
    type: Boolean,
    default: false,
  },
  requiredName: {
    type: Boolean,
    default: false,
  },
  readonly: {
    type: Boolean,
    default: false,
  },
});
const emit = defineEmits(["submit", "close"]);

const permissions = usePermissions();
const featuresSet = useFeaturesSetsStore();
const showCancelModal = ref(false);
const autofocusedElement = ref();
useFocus(autofocusedElement, { initialValue: true });

const patch = reactive({
  NOM: props.feature.properties.NOM || "",
  annotations: props.feature.properties.annotations || [],
  conversion_niveau: props.feature.properties.conversion_niveau || "",
  cultures: props.feature.properties.cultures || [],
  engagement_date: props.feature.properties.engagement_date,
  auditeur_notes: props.feature.properties.auditeur_notes || "",
});

const isAB = computed(() => isABLevel(patch.conversion_niveau));
const maxDate = computed(() => toDateInputString(new Date()));
const isEngagementDateRequired = computed(() => [LEVEL_C1, LEVEL_C2, LEVEL_C3].includes(patch.conversion_niveau));
const nameErrors = computed(() => featuresSet.byFeatureProperty(props.feature.id, "name"));

const validate = () => {
  if (props.readonly) {
    emit("close");
    return;
  }
  const set = featuresSet.byFeature(props.feature.id, true);

  if (set.size) {
    return false;
  }

  emit("submit", { id: props.feature.id, properties: patch });
};

function handleClose() {
  if (featuresSet.isDirty && !props.readonly) {
    showCancelModal.value = true;
  } else {
    emit("close");
  }
}

onBeforeUnmount(() => featuresSet.setCandidate([]));

watch(
  patch,
  (properties) => {
    if (props.readonly) {
      return;
    }

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
</script>

<style scoped>
.fr-quote {
  background-color: var(--background-contrast-info);
  border-left: none;
  border-radius: 5px;
}
.fr-quote blockquote p {
  font-weight: normal;
}
.import-pac {
  display: flex;
  align-items: flex-end;
  gap: 0.5rem;
}
.code-culture {
  line-height: 1.2rem;
}
</style>
