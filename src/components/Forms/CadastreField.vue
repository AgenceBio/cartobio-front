<template>
  <div class="horizontal-stack">
    <div class="fr-input-group">
      <label :for="`parcel-prefix-${fieldId}`" class="fr-label">
        Préfixe (facultatif)
        <span class="fr-hint-text">Exemple : 000, 011</span>
      </label>

      <div class="fr-input-wrap">
        <input type="search" class="fr-input" :id="`parcel-prefix-${fieldId}`" placeholder="000" pattern="\d{2,3}" :disabled="isCommuneEmpty" v-model="prefix" />
      </div>
    </div>

    <div class="fr-input-group">
      <label :for="`parcel-section-${fieldId}`" class="fr-label">
        Section
        <span class="fr-hint-text">Exemple : A, AD</span>
      </label>

      <div class="fr-input-wrap">
        <input type="search" class="fr-input" :id="`parcel-section-${fieldId}`" :disabled="isCommuneEmpty" pattern="[a-zA-Z\d]{1,2}" v-model="section" required />
      </div>
    </div>

    <div class="fr-input-group">
      <label :for="`parcel-number-${fieldId}`" class="fr-label" aria-label="Numéro de parcelle">
        N° de parcelle
        <span class="fr-hint-text">Exemple : 250, 1</span>
      </label>

      <div class="fr-input-wrap">
        <input type="search" class="fr-input" :id="`parcel-number-${fieldId}`" pattern="\d{1,4}" :disabled="isCommuneEmpty" v-model="number" required />
      </div>
    </div>

    <div class="fr-input-group fr-input-group--actions">
      <span :class="{'fr-icon': true, 'fr-icon-check-line': hasFeature && !$props.helpText.error, 'fr-icon-alert-fill': doesNotExist, 'fr-icon-more-fill': isFetchingGeometry }" :disabled="!hasFeature" />
    </div>
  </div>
  <span :class="{ 'fr-hint-text': !$props.helpText.error, 'fr-error-text': $props.helpText.error }"
        v-if="$props.helpText.message"
  >{{ $props.helpText.message }}</span>
</template>

<script setup>
import axios from 'axios'

import { computed, ref, watch } from 'vue'
import { isValidReference, parseReference, toString, trimLeadingZero } from '../cadastre.js';

const props = defineProps({
  commune: {
    type: String,
    required: true
  },
  reference: {
    type: String,
    default: ''
  },
  helpText: {
    type: Object,
    default: function () {
      return {
        message: '',
            error: false
      }
    }
  }
})

const emit = defineEmits(['change', 'feature'])

const fieldId = ref(crypto.randomUUID())
const referenceField = ref(props.reference)
const parsedReference = computed(() => parseReference(referenceField.value) ?? { prefix: '', section: '', number: '' })
const feature = ref(null)

const hasFeature = computed(() => feature?.value)
const isCommuneEmpty = computed(() => props.commune === '')
const doesNotExist = ref(false)
const isFetchingGeometry = ref(false)

const prefix = ref(trimLeadingZero(parsedReference.value?.prefix))
const section = ref(trimLeadingZero(parsedReference.value?.section))
const number = ref(trimLeadingZero(parsedReference.value?.number))
const tentativeReference = computed(() => toString({
  commune: props.commune,
  prefix: prefix.value,
  section: section.value,
  number: number.value
}))

watch(tentativeReference, (tentative) => {
  if (section.value && number && isValidReference(tentative)) {
    referenceField.value = tentative
    emit('change', parseReference(tentative))
  }
})

let cadastreRequestController;
watch(referenceField, async (newReference, oldReference) => {
  if (newReference && newReference !== oldReference && isValidReference(newReference)) {
    const { commune: code_insee, section, prefix: com_abs, number: numero } = parseReference(newReference)
    const _limit = 1
    const source_ign = 'PCI'
    isFetchingGeometry.value = true


    try {
      if (cadastreRequestController) {
        cadastreRequestController.abort()
      }
      cadastreRequestController = new AbortController()
      const { data: featureCollection } = await axios.get('https://apicarto.ign.fr/api/cadastre/parcelle', {
        params: { code_insee, section, numero, com_abs, _limit, source_ign },
        signal: cadastreRequestController.signal
      })

      if (featureCollection.features.length) {
        doesNotExist.value = false
        feature.value = featureCollection.features.at(0)
      }
      else {
        feature.value = null
        doesNotExist.value = true
      }
      emit('feature', { reference: newReference, feature: feature.value })
    }
    catch (error) {
      if (error.name === 'CanceledError') {
        return
      }
      console.error('Failed to fetch geometry for ref', newReference, error)
    }
    finally {
      isFetchingGeometry.value = false
    }
  }
})
</script>

<style scoped>
.horizontal-stack {
  display: flex;
  gap: 1em;
  margin-bottom: 1rem;
}

.horizontal-stack .fr-input-group--actions {
  display: flex;
  align-items: center;
}

.fr-input-group {
  margin-bottom: 0;
}

.fr-hint-text {
  margin-top: 1rem;
}
</style>
