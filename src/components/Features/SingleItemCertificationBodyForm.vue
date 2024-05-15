<template>
  <Modal @close="handleClose" v-bind="$attrs" data-track-content data-content-name="Modale de modification de parcelle">
    <form @submit.prevent="validate" id="single-feature-edit-form">
      <div class="fr-card fr-p-2w fr-mb-3w">
        <div class="fr-input-group" :class="{ 'fr-input-group--error': nameErrors.size }">
          <label class="fr-label" for="feature-nom">Nom de la parcelle</label>
          <span class="fr-hint-text fr-mb-1v">Exemple&nbsp;: Les charrons 2</span>
          <input class="fr-input" id="feature-nom" v-model="patch.NOM" :required="requiredName" :class="{ 'fr-input--error': nameErrors.size }" ref="autofocusedInput" />
          <div v-for="([id, result]) in nameErrors" :key="id" class="fr-hint-text fr-error-text">
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

      <AccordionGroup :constraint-toggle="!open">
        <AccordionSection title="Culture" :open="open" :requires-action="requiresAction(['commentaires', 'cultures'])">
          <figure class="fr-quote fr-py-1w fr-px-2w fr-my-2w" v-if="feature.properties.commentaires">
            <blockquote>
              <p>{{ feature.properties.commentaires }}</p>
            </blockquote>
            <figcaption>
              <p class="fr-quote__author">Notes de l'exploitant‧e</p>
            </figcaption>
          </figure>

          <CultureSelector :feature-id="feature.properties.id" :cultures="patch.cultures" @change="$cultures => patch.cultures = $cultures" />
        </AccordionSection>

        <AccordionSection title="Annotations d'audit" :open="open" :requires-action="requiresAction(['conversion_niveau', 'engagement_date', 'annotations'])">
          <ConversionLevelSelector :feature-id="feature.properties.id" :readonly="!permissions.canChangeConversionLevel" v-model="patch.conversion_niveau" />

          <div class="fr-input-group" v-if="isAB">
            <label class="fr-label" for="engagement_date">Date de début de conversion <span v-if="!isEngagementDateRequired">(facultatif)</span></label>
            <input type="date" class="fr-input" v-model="patch.engagement_date" name="engagement_date" id="engagement_date" :required="isEngagementDateRequired" :disabled="!isAB" min="1985-01-01" :max="maxDate" />
          </div>

          <AnnotationsSelector v-if="permissions.canAddAnnotations" v-model="patch.annotations" :feature-id="feature.properties.id" />

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
  <CancelModal v-if="showCancelModal" @cancel="showCancelModal = false" @close="$emit('close')"/>
</template>

<script setup>
import { computed, onBeforeUnmount, reactive, ref, watch } from 'vue'
import { useFocus } from '@vueuse/core'

import { featureDetails, inHa, legalProjectionSurface } from '@/components/Features/index.js'
import { isABLevel, LEVEL_C1, LEVEL_C2, LEVEL_C3 } from '@/referentiels/ab.js'
import { useFeaturesSetsStore } from "@/stores/features-sets.js"
import { usePermissions } from "@/stores/permissions.js"
import { toDateInputString } from '@/components/dates.js'

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
  },
  requiredName: {
    type: Boolean,
    default: false
  }
})
const emit = defineEmits(['submit', 'close'])

const permissions = usePermissions()
const featuresSet = useFeaturesSetsStore()
const showCancelModal = ref(false)
const autofocusedInput = ref()
const { focused } = useFocus(autofocusedInput, { initialValue: true })

const patch = reactive({
  NOM: props.feature.properties.NOM || '',
  annotations: props.feature.properties.annotations || [],
  conversion_niveau: props.feature.properties.conversion_niveau || '',
  cultures: props.feature.properties.cultures || [],
  engagement_date: props.feature.properties.engagement_date,
  auditeur_notes: props.feature.properties.auditeur_notes || '',
})

const isAB = computed(() => isABLevel(patch.conversion_niveau))
const maxDate = computed(() => toDateInputString(new Date()))
const isEngagementDateRequired = computed(() => [LEVEL_C1, LEVEL_C2, LEVEL_C3].includes(patch.conversion_niveau))
const details = featureDetails(props.feature)
const nameErrors = computed(() => featuresSet.byFeatureProperty(props.feature.id, 'name'))

function requiresAction (properties) {
  return properties.some(property => featuresSet.byFeatureProperty(props.feature.id, property, true).size > 0)
}

const validate = () => {
  const set = featuresSet.byFeature(props.feature.id, true)

  if (set.size) {
    return false
  }

  emit('submit', { id: props.feature.id, properties: patch })
}

function handleClose () {
  if (featuresSet.isDirty) {
    showCancelModal.value = true
  }
  else {
    emit('close')
  }
}

onBeforeUnmount(() => featuresSet.setCandidate([]))

watch(patch, (properties) => {
  featuresSet.setCandidate([{
    id: props.feature.id,
    properties: {
      ...props.feature.properties,
      ...properties
    }
  }])
})
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
