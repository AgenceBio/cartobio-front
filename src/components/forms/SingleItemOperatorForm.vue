<template>
  <Modal @close="handleClose" v-bind="$attrs" data-track-content data-content-name="Modale de modification de parcelle">
    <form @submit.prevent="validate" id="single-feature-edit-form">
      <div class="fr-card fr-p-2w fr-mb-3w">
        <div class="fr-input-group" :class="{ 'fr-input-group--error': nameErrors.size }">
          <label class="fr-label" for="feature-nom">Nom de la parcelle</label>
          <span class="fr-hint-text fr-mb-1v">Exemple&nbsp;: Les charrons 2</span>
          <input class="fr-input" id="feature-nom" v-model="patch.NOM" :required="requiredName"
            :class="{ 'fr-input--error': nameErrors.size }" ref="autofocusedElement" />
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

      <CultureSelector v-if="permissions.canEditParcellaire" :feature-id="feature.properties.id" :cultures="patch.cultures"
        @change="$cultures => patch.cultures = $cultures" />


      <AccordionGroup v-if="!permissions.canEditParcellaire">
        <AccordionSection title="Culture">

          <CultureSelector :disabled-input="!permissions.canEditParcellaire" :feature-id="feature.properties.id"
            :cultures="patch.cultures" @change="$cultures => patch.cultures = $cultures" />
        </AccordionSection>
        <AccordionSection title="Annotations d'audit">

          <div v-if="!permissions.canEditParcellaire">
            <ConversionLevelSelector :feature-id="feature.properties.id" :readonly="!permissions.canEditParcellaire"
              v-model="patch.conversion_niveau" />

            <div class="fr-input-group">
              <label class="fr-label" for="engagement_date">Date de début de conversion <span
                  v-if="!isEngagementDateRequired">(facultatif)</span></label>
              <input type="date" class="fr-input" v-model="patch.engagement_date" name="engagement_date"
                id="engagement_date" :disabled="!permissions.canEditParcellaire" />
            </div>
          </div>
        </AccordionSection>
        <br />
      </AccordionGroup>

      <div class="fr-input-group">
        <label class="fr-label" for="feature-commentaires">
          Vos notes
          <span class="fr-hint-text">Elles seront visibles par votre organisme de certification.</span>
        </label>
        <textarea class="fr-input" id="feature-commentaires" name="commentaires" v-model="patch.commentaires" />
      </div>

    </form>

    <template #title>
      <slot name="title" />
    </template>

    <template #footer>
      <div class="fr-input-group">
        <button class="fr-btn" type="submit" form="single-feature-edit-form">Enregistrer</button>
      </div>
    </template>
  </Modal>
  <CancelModal v-if="showCancelModal" @cancel="showCancelModal = false" @close="$emit('close')" />
</template>


<script setup>
import { computed, onBeforeUnmount, reactive, ref, watch } from 'vue';
import { useFocus } from '@vueuse/core'

import AccordionGroup from '@/components/widgets/AccordionGroup.vue'
import AccordionSection from '@/components/widgets/Accordion.vue'
import Modal from '@/components/widgets/Modal.vue'
import { LEVEL_C1, LEVEL_C2, LEVEL_C3 } from '@/referentiels/ab.js'
import CultureSelector from '@/components/forms/fields/CultureSelector.vue'
import ConversionLevelSelector from "@/components/forms/fields/ConversionLevelSelector.vue";
import { usePermissions } from "@/stores/permissions.js"
import { useFeaturesSetsStore } from "@/stores/features-sets.js"
import CancelModal from "@/components/forms/CancelModal.vue"
import { featureDetails, inHa, legalProjectionSurface } from "@/utils/features.js"

const props = defineProps({
  feature: {
    type: Object,
    required: true
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
const autofocusedElement = ref()
useFocus(autofocusedElement, { initialValue: true })

const patch = reactive({
  NOM: props.feature.properties.NOM || '',
  cultures: props.feature.properties.cultures,
  commentaires: props.feature.properties.commentaires || '',
  conversion_niveau: props.feature.properties.conversion_niveau || '',
  engagement_date : props.feature.properties.engagement_date || ''
})

const details = featureDetails(props.feature)
const nameErrors = computed(() => featuresSet.byFeatureProperty(props.feature.id, 'name'))
const isEngagementDateRequired = computed(() => [LEVEL_C1, LEVEL_C2, LEVEL_C3].includes(patch.conversion_niveau))


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
