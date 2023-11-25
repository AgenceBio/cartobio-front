<template>
  <Modal @close="showCancelModal = true" data-track-content data-content-name="Modale de modification de parcelle">
    <div class="fr-card fr-p-2w fr-mb-3w">
      <div class="fr-input-group" :class="{ 'fr-input-group--error': nameError }">
        <label class="fr-label" for="nom">Nom de la parcelle</label>
        <span class="fr-hint-text fr-mb-1v">Exemple&nbsp;: Les charrons 2</span>
        <input class="fr-input fr-error" v-model="patch.NOM" placeholder="Nom de la parcelle" required="required" :class="{ 'fr-input--error': nameError }" />
        <p v-if="nameError" class="fr-error-text">
          Ce champ est obligatoire
        </p>
      </div>
      <p class="fr-mb-0">Sa superficie est de {{ inHa(surface(feature)) }} ha.</p>

      <ul v-if="details.length">
        <li v-for="(detail, index) in details" :key="index">
          {{ detail }}
        </li>
      </ul>
    </div>

    <form @submit.prevent="validate" id="single-feature-edit-form">
      <AccordionGroup :constraint-toggle="!open">
        <AccordionSection title="Culture" :open="open">
          <figure class="fr-quote fr-py-1w fr-px-2w fr-my-2w" v-if="feature.properties.commentaires">
            <blockquote>
              <p>{{ feature.properties.commentaires }}</p>
            </blockquote>
            <figcaption>
              <p class="fr-quote__author">Notes de l'exploitant‧e</p>
            </figcaption>
          </figure>

          <div class="fr-input-group">
            <CultureSelector :cultures="patch.cultures" @change="$cultures => patch.cultures = $cultures" />
          </div>
        </AccordionSection>

        <AccordionSection title="Annotations d'audit" :open="open">
          <ConversionLevelSelector :readonly="!permissions.canChangeConversionLevel" v-model="patch.conversion_niveau" />

          <div class="fr-input-group" v-if="isAB">
            <label class="fr-label" for="engagement_date">Date d'engagement <span v-if="!isEngagementDateRequired">(facultatif)</span></label>
            <div class="fr-input-wrap fr-icon-calendar-line">
              <input type="date" class="fr-input" v-model="patch.engagement_date" name="engagement_date" id="engagement_date" :required="isEngagementDateRequired" :disabled="!isAB" min="1985-01-01" :max="maxDate" />
            </div>
          </div>

          <AnnotationsSelector v-if="permissions.canAddAnnotations" v-model="patch.annotations" :featureId="feature.properties.id" />

          <div class="fr-input-group">
            <label class="fr-label" for="auditeur_notes">Vos notes de certification (facultatif)</label>
            <textarea class="fr-input" id="auditeur_notes" name="auditeur_notes" v-model="patch.auditeur_notes" />
          </div>
        </AccordionSection>
      </AccordionGroup>
    </form>

    <template #title><slot name="title" /></template>

    <template #footer>
      <div class="fr-input-group">
        <button class="fr-btn" type="submit" form="single-feature-edit-form">Enregistrer</button>
      </div>
    </template>
  </Modal>
  <CancelModal v-if="showCancelModal" @save="validate" @close="$emit('close')"/>
</template>

<script setup>
import { reactive, computed, ref } from 'vue';

import { featureDetails, featureName, inHa, surface } from '@/components/Features/index.js'
import { isABLevel, applyValidationRules, RULE_ENGAGEMENT_DATE, RULE_NAME } from '@/referentiels/ab.js'
import { usePermissions } from '@/stores/index.js'

import AccordionGroup from '@/components/DesignSystem/AccordionGroup.vue'
import AccordionSection from '@/components/DesignSystem/Accordion.vue'
import Modal from '@/components/Modal.vue'
import AnnotationsSelector from "@/components/Features/AnnotationsSelector.vue";
import CultureSelector from "@/components/Features/CultureSelector.vue";
import ConversionLevelSelector from "@/components/Features/ConversionLevelSelector.vue";
import CancelModal from "@/components/Forms/CancelModal.vue"

const props = defineProps({
  feature: {
    type: Object,
    required: true
  },
  open: {
    type: Boolean,
    default: false
  }
})
const emit = defineEmits(['submit', 'close'])

const permissions = usePermissions()
const showCancelModal = ref(false)

const patch = reactive({
  NOM: featureName(props.feature, { placeholder: '' }),
  annotations: props.feature.properties.annotations || [],
  conversion_niveau: props.feature.properties.conversion_niveau || '',
  cultures: props.feature.properties.cultures || [],
  engagement_date: props.feature.properties.engagement_date,
  auditeur_notes: props.feature.properties.auditeur_notes || '',
})
const nameError = ref(false)

const isAB = computed(() => isABLevel(patch.conversion_niveau))
const maxDate = computed(() => new Date().toISOString().split('T').at(0))
const isEngagementDateRequired = computed(() => applyValidationRules([RULE_ENGAGEMENT_DATE], { properties: patch }).success === 0)
const details = await featureDetails(props.feature)

const validate = () => {
  const { rules } = applyValidationRules([RULE_NAME, RULE_ENGAGEMENT_DATE], { properties: patch })

  if (rules[RULE_NAME].success === 0) {
    nameError.value = true
    return false
  }

  if (rules[RULE_ENGAGEMENT_DATE].success === 0) {
    return false
  }

  emit('submit', { id: props.feature.id, properties: patch })
}
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
</style>
