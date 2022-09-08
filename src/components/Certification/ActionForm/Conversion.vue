<template>
  <form @submit.prevent="handleSubmit">
    <div class="fr-input-group">
      <label class="fr-label">Niveau de conversion</label>
      <select class="fr-select" v-model="value" required>
        <option v-for="niveau in conversionLevels" :key="niveau.value" :value="niveau.value">{{ niveau.label }}</option>
      </select>
    </div>

    <div class="fr-input-group">
      <label class="fr-label">Effectif en date du</label>
      <div class="fr-input-wrap fr-icon-calendar-line">
        <input type="date" class="fr-input" v-model="dateValue" required />
      </div>
    </div>

    <slot name="footer" />
  </form>
</template>

<script setup>
import { ref, unref } from 'vue'
import { conversionLevels } from '@/referentiels/ab.js'

const emit = defineEmits(['form:valid', 'form:error'])

const value = ref(null)
const dateValue = ref(new Date().toISOString().split('T')[0])

function handleSubmit () {
  emit('form:valid', { type: 'UPDATE_CONVERSION', value: { niveau: unref(value), date: unref(dateValue) } })
}
</script>
