<template>
  <fieldset class="fr-input-group" v-for="(culture) in uuidedCultures" :key="culture.id">
    <label class="fr-label">Type de culture</label>

    <CultureTypeSelector :from-pac="culture.TYPE" :modelValue="culture.CPF" @update:modelValue="$CPF => updateCulture(culture.id, 'CPF', $CPF)" />

    <button type="button" class="fr-btn fr-btn--sm fr-btn--tertiary-no-outline fr-icon-delete-line fr-btn--icon-left" :disabled="!canBeDeleted" @click="removeCulture(culture.id)">
      Supprimer
    </button>
  </fieldset>

  <button type="button" class="fr-btn fr-btn--tertiary-no-outline fr-icon-add-line fr-btn--icon-left" @click="appendEmptyCulture">
    Ajouter une autre culture
  </button>
</template>

<script setup>
import { computed } from 'vue'
import CultureTypeSelector from './CultureTypeSelector.vue';

const props = defineProps({
  cultures: {
    type: Array,
    required: true
  }
})

const emit = defineEmits(['change'])

const uuidedCultures = computed(() => {
  return props.cultures.map(culture => ({
    ...culture,
    id: culture.id ?? self.crypto.randomUUID()
  }))
})

const canBeDeleted = computed(() => uuidedCultures.value.length > 1)

function appendEmptyCulture () {
  const appendedCultures = [...uuidedCultures.value, { CPF: '', id: self.crypto.randomUUID() }]

  emit('change', appendedCultures)
}

function removeCulture (cultureId) {
  const updatedCultures = uuidedCultures.value.filter(({ id }) => id !== cultureId)

  emit('change', updatedCultures)
}

function updateCulture (cultureId, field, value) {
  const updatedCultures = uuidedCultures.value.map(culture => culture.id === cultureId ? ({
    ...culture,
    [field]: value
  }) : culture)

  emit('change', updatedCultures)
}
</script>
