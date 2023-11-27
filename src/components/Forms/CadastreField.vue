<template>
  <fieldset class="fr-fieldset" :class="{'fr-fieldset--error': isError, 'fr-fieldset--valid': !!feature && !isError}">
    <div class="fr-fieldset__element">
      <div class="fr-input-group">
        <label :for="`parcel-prefix-${fieldId}`" class="fr-label">
          Préfixe (facultatif)
          <span class="fr-hint-text">Exemple : 000, 011</span>
        </label>
        <input type="search" class="fr-input" :id="`parcel-prefix-${fieldId}`" placeholder="000" pattern="\d{2,3}" :disabled="commune === ''" v-model="prefix" @keydown.enter="searchReference" />
      </div>
    </div>

    <div class="fr-fieldset__element">
      <div class="fr-input-group">
        <label :for="`parcel-section-${fieldId}`" class="fr-label">
          Section
          <span class="fr-hint-text">Exemple : A, AD</span>
        </label>
        <input type="search" class="fr-input" :id="`parcel-section-${fieldId}`" :disabled="commune === ''" pattern="[a-zA-Z\d]{1,2}" v-model="section" required @keydown.enter="searchReference" />
      </div>
    </div>

    <div class="fr-fieldset__element">
      <div class="fr-input-group">
        <label :for="`parcel-number-${fieldId}`" class="fr-label" aria-label="Numéro de parcelle">
          N° de parcelle
          <span class="fr-hint-text">Exemple : 250, 1</span>
        </label>
        <input type="search" class="fr-input" :id="`parcel-number-${fieldId}`" pattern="\d{1,4}" :disabled="commune === ''" v-model="number" required @keydown.enter="searchReference" />
      </div>
    </div>

    <div class="fr-fieldset__element">
      <button v-if="feature && canDelete" class="fr-btn fr-btn--secondary fr-icon-delete-line" @click="emit('delete')">Supprimer</button>
      <button v-else-if="isFetchingGeometry" class="fr-btn fr-btn--secondary fr-icon-time-fill" disabled>Recherche en cours</button>
      <button v-else class="fr-btn fr-icon-search-line" @click="searchReference" :disabled="commune === ''">Rechercher</button>
    </div>
  </fieldset>
  <span v-if="searchError" class="fr-hint-text fr-message--error">{{ searchError }}</span>
  <span v-if="formError" class="fr-hint-text fr-message--error">{{ formError }}</span>
</template>

<script setup>
import axios from 'axios'

import { computed, ref, watch } from 'vue'
import { isValidReference, parseReference, toString } from '../cadastre.js';
import toast from "@/components/toast"

const props = defineProps({
  commune: {
    type: String,
    required: true
  },
  formError: {
    type: String,
    default: ''
  },
  canDelete: {
    type: Boolean,
    default: false
  },
  fieldId: {
    type: String,
    default: function () {
      return crypto.randomUUID()
    }
  }
})

const emit = defineEmits(['feature', 'delete'])

// Internal text field values
const prefix = ref('')
const section = ref('')
const number = ref('')

// State and validation
const isFetchingGeometry = ref(false)
const searchError = ref("")
const isError = computed(() => !!searchError.value || props.formError)

// Exposed values
const inputReference = computed(() => toString({
  commune: props.commune,
  prefix: prefix.value.trim(),
  section: section.value.trim(),
  number: number.value.trim()
}))
const feature = ref(null)

// Search logic
const cadastreRequestController = ref(null)
const searchReference = async (event) => {
  if (event.preventDefault) {
    event.preventDefault()
  }

  if (section.value === '' || number.value === '' || !isValidReference(inputReference.value)) {
    searchError.value = "La référence cadastrale n'est pas valide."
    return
  }

  const { commune: code_insee, section: parsedSection, prefix: com_abs, number: numero } = parseReference(inputReference.value)
  const _limit = 1
  const source_ign = 'PCI'
  isFetchingGeometry.value = true

  if (cadastreRequestController.value) {
    cadastreRequestController.value.abort()
  }
  cadastreRequestController.value = new AbortController()

  let featureCollection;
  try {
    ({ data: featureCollection } = await axios.get('https://apicarto.ign.fr/api/cadastre/parcelle', {
      params: { code_insee, section: parsedSection, numero, com_abs, _limit, source_ign },
      signal: cadastreRequestController.value.signal
    }))
  } catch (error) {
    if (error.name === 'CanceledError') {
      return
    }

    toast.error('Une erreur est survenue lors de la recherche de la parcelle.')
    console.error('Failed to fetch geometry for ref', inputReference.value, error)
  } finally {
    isFetchingGeometry.value = false
  }

  if (featureCollection.features.length) {
    searchError.value = ""
    feature.value = featureCollection.features.at(0)
  } else {
    feature.value = null
    searchError.value = "La référence cadastrale n'est pas reconnue dans cette commune."
  }
}

// Update reference when input values change
watch([prefix, section, number], () => {
  if (feature.value !== null) {
    feature.value = null
  }

  if (cadastreRequestController.value) {
    cadastreRequestController.value.abort()
  }

  isFetchingGeometry.value = false
})

// Emit signal when feature value changes
watch(feature, () => {
  emit('feature', { reference: inputReference.value, feature: feature.value })
})
</script>

<style scoped>
.fr-fieldset {
  flex-wrap: nowrap;
  margin-bottom: 0.5rem;
}

.fr-fieldset__element {
  flex: 1 1 auto;
  margin-bottom: 0;
}
</style>
