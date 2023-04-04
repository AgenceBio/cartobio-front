<template>
  <div class="horizontal-stack">
    <div class="fr-input-group">
      <label :for="`parcel-prefix-${fieldId}`" class="fr-label">
        Préfixe (facultatif)
        <span class="fr-hint-text">Exemple : 000, 011</span>
      </label>

      <div class="fr-input-wrap">
        <input type="search" class="fr-input" :id="`parcel-prefix-${fieldId}`" placeholder="000" pattern="\d{2,3}" :disabled="communeEmpty" v-model="prefix" />
      </div>
    </div>

    <div class="fr-input-group">
      <label :for="`parcel-section-${fieldId}`" class="fr-label">
        Section
        <span class="fr-hint-text">Exemple : A, AD</span>
      </label>

      <div class="fr-input-wrap">
        <input type="search" class="fr-input" :id="`parcel-section-${fieldId}`" :disabled="communeEmpty" pattern="[a-zA-Z\d]{1,2}" v-model="section" required />
      </div>
    </div>

    <div class="fr-input-group">
      <label :for="`parcel-number-${fieldId}`" class="fr-label" aria-label="Numéro de parcelle">
        N° de parcelle
        <span class="fr-hint-text">Exemple : 250, 1</span>
      </label>

      <div class="fr-input-wrap">
        <input type="search" class="fr-input" :id="`parcel-number-${fieldId}`" pattern="\d{1,4}" :disabled="communeEmpty" v-model="number" required />
      </div>
    </div>
  </div>
</template>

<script setup>
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
  }
})

const emit = defineEmits(['change'])

const fieldId = ref(crypto.randomUUID())
const reference = ref(props.reference)
const parsedReference = computed(() => parseReference(reference.value))

const prefix = ref(trimLeadingZero(parsedReference.value.prefix))
const section = ref(trimLeadingZero(parsedReference.value.section))
const number = ref(trimLeadingZero(parsedReference.value.number))

const communeEmpty = computed(() => props.commune === '')

watch([prefix, section, number], ([prefix, section, number]) => {
  const tentative = toString({ commune: props.commune, prefix, section, number })

  if (isValidReference(tentative)) {
    reference.value = tentative
    emit('change', parseReference(tentative))
  }
})
</script>

<style scoped>
.horizontal-stack {
  display: flex;
  gap: 1em;
}
</style>
