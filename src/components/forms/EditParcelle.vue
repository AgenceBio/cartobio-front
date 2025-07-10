<template>
  <div class="fr-px-6v fr-py-6v">
    <div class="fr-grid-row">
      <button
        class="end-right fr-btn fr-btn--tertiary-no-outline fr-icon-close-line fr-btn--icon-right"
        @click="handleClose"
      >
        Fermer
      </button>
    </div>
    <div class="fr-mb-4v">
      <p class="fr-h4 fr-mb-2v">{{ featureName(feature) }}</p>
      <div class="fr-grid-row">
        <span class="fr-icon-map-pin-2-line fr-icon--sm fr-mr-1v" aria-hidden="true"></span>
        <p class="fr-mb-0">{{ feature.properties.COMMUNE_LABEL }} ({{ feature.properties.COMMUNE.slice(0, -3) }})</p>
      </div>
      <div class="fr-grid-row">
        <span class="ri-custom-size fr-mr-1v" aria-hidden="true"></span>
        <p class="fr-mb-0">
          {{
            !isNaN(parseFloat(inHa(legalProjectionSurface(feature))))
              ? inHa(legalProjectionSurface(feature)) + " ha"
              : ""
          }}
        </p>
      </div>
    </div>
    <form @submit.prevent="validate" id="single-feature-edit-form">
      <div class="fr-mb-3w">
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
          />
          <div v-for="[id, result] in nameErrors" :key="id" class="fr-hint-text fr-error-text">
            {{ result.errorMessage }}.
          </div>
        </div>
        <p class="fr-mb-0">Sa superficie est de {{ inHa(legalProjectionSurface(feature)) }} ha.</p>

        <ul v-if="details.length">
          <li v-for="(detail, index) in details" :key="index">
            {{ detail }}
          </li>
        </ul>
      </div>
      <figure class="fr-quote fr-py-1w fr-px-2w fr-my-2w" v-if="feature.properties.commentaires && permissions.isOc">
        <blockquote>
          <p>{{ feature.properties.commentaires }}</p>
        </blockquote>
        <figcaption>
          <p class="fr-quote__author">Notes de l'exploitant‧e</p>
        </figcaption>
      </figure>
      <div class="fr-card fr-p-2w fr-mb-3w" v-if="feature.properties.CODE_CULTURE">
        <div class="fr-mb-3w import-pac">
          <span class="fr-label">Culture de l'import PAC</span>
          <span class="fr-hint-text">réalisé le {{ jjmmyyyy(feature.properties.createdAt) }}</span>
        </div>
        <div class="code-culture">
          {{ feature.properties.CODE_CULTURE }}
          <template v-if="feature.properties.CODE_PRECISION"> - {{ feature.properties.CODE_PRECISION }}</template>
          <template v-if="getCulturePAC(feature.properties.CODE_CULTURE, feature.properties.CODE_PRECISION ?? '')">
            :
            {{
              getCulturePAC(feature.properties.CODE_CULTURE, feature.properties.CODE_PRECISION ?? "").libelle
            }}</template
          >
        </div>
        <div class="fr-hint-text">
          Code culture
          <template v-if="feature.properties.CODE_PRECISION"> - code précision</template>
          <template v-if="getCulturePAC(feature.properties.CODE_CULTURE, feature.properties.CODE_PRECISION ?? '')">
            : culture</template
          >
        </div>
      </div>
      <CultureSelector
        v-if="permissions.canChangeCulture"
        :feature-id="feature.properties.id"
        :cultures="patch.cultures"
        @change="($cultures) => (patch.cultures = $cultures)"
      />

      <template v-else>
        <AccordionGroup>
          <AccordionSection title="Culture">
            <CultureSelector
              :disabled-input="true"
              :feature-id="feature.properties.id"
              :cultures="patch.cultures"
              @change="($cultures) => (patch.cultures = $cultures)"
            />
          </AccordionSection>
        </AccordionGroup>

        <AccordionGroup :constraint-toggle="!open">
          <AccordionSection
            title="Annotations d'audit"
            :open="open"
            :requires-action="requiresAction(['conversion_niveau', 'engagement_date', 'annotations'])"
          >
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
          </AccordionSection>
        </AccordionGroup>
      </template>

      <div v-if="!permissions.isOc" class="fr-input-group fr-px-6v">
        <label class="fr-label" for="feature-commentaires">
          Vos notes
          <span class="fr-hint-text">Elles seront visibles par votre organisme de certification.</span>
        </label>
        <textarea class="fr-input" id="feature-commentaires" name="commentaires" v-model="patch.commentaires" />
      </div>
      <div class="fr-input-group">
        <button class="fr-btn" type="submit" form="single-feature-edit-form" aria-label="Enregister le parcellaire">
          Enregistrer
        </button>
      </div>
    </form>
    <CancelModal v-if="showCancelModal" @cancel="showCancelModal = false" @close="$emit('close')" />
  </div>
</template>

<script setup>
import { computed, onBeforeUnmount, ref, watch } from "vue";
import { useFocus } from "@vueuse/core";

import AccordionGroup from "@/components/widgets/AccordionGroup.vue";
import AccordionSection from "@/components/widgets/Accordion.vue";
import { LEVEL_C1, LEVEL_C2, LEVEL_C3 } from "@/referentiels/ab.js";
import CultureSelector from "@/components/forms/fields/CultureSelector.vue";
import ConversionLevelSelector from "@/components/forms/fields/ConversionLevelSelector.vue";
import { usePermissions } from "@/stores/permissions.js";
import { useFeaturesSetsStore } from "@/stores/features-sets.js";
import CancelModal from "@/components/forms/CancelModal.vue";
import { featureDetails, featureName, inHa, legalProjectionSurface } from "@/utils/features.js";
import { getCulturePAC } from "@agencebio/rosetta-cultures";
import { jjmmyyyy } from "@/utils/dates";

const props = defineProps({
  feature: {
    type: Object,
    required: true,
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
const isAB = computed(() => isABLevel(patch.value.conversion_niveau));
const maxDate = computed(() => toDateInputString(new Date()));

useFocus(autofocusedElement, { initialValue: true });
function requiresAction(properties) {
  return properties.some((property) => featuresSet.byFeatureProperty(props.feature.id, property, true).size > 0);
}
const patch = ref({
  NOM: props.feature.properties.NOM || "",
  cultures: props.feature.properties.cultures,
  commentaires: props.feature.properties.commentaires || "",
  ...(!permissions.canChangeCulture
    ? {
        conversion_niveau: props.feature.properties.conversion_niveau || "",
        engagement_date: props.feature.properties.engagement_date,
      }
    : {}),
});

const featureId = computed(() => props.feature.id);
watch(featureId, () => {
  patch.value = {
    NOM: props.feature.properties.NOM || "",
    cultures: props.feature.properties.cultures,
    commentaires: props.feature.properties.commentaires || "",
    ...(!permissions.canChangeCulture
      ? {
          conversion_niveau: props.feature.properties.conversion_niveau || "",
          engagement_date: props.feature.properties.engagement_date,
        }
      : {}),
  };
});

const details = featureDetails(props.feature);
const nameErrors = computed(() => featuresSet.byFeatureProperty(props.feature.id, "name"));
const isEngagementDateRequired = computed(() => [LEVEL_C1, LEVEL_C2, LEVEL_C3].includes(patch.value.conversion_niveau));

const validate = () => {
  const set = featuresSet.byFeature(props.feature.id, true);

  if (set.size) {
    return false;
  }

  emit("submit", { id: props.feature.id, properties: patch });
};

function handleClose() {
  if (featuresSet.isDirty) {
    showCancelModal.value = true;
  } else {
    emit("close");
  }
}

onBeforeUnmount(() => featuresSet.setCandidate([]));

watch(
  patch,
  (properties) => {
    featuresSet.setCandidate([
      {
        id: props.feature.id,
        properties: {
          ...props.feature.properties,
          ...properties,
        },
      },
    ]);
  },
  { deep: true },
);
</script>

<style scoped>
.import-pac {
  display: flex;
  align-items: flex-end;
  gap: 0.5rem;
}
.code-culture {
  line-height: 1.2rem;
}

.end-right {
  margin-left: auto;
}
</style>
