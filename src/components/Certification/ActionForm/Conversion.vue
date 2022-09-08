<template>
  <form @submit.prevent="($event) => emit('form:valid', { type: 'UPDATE_CONVERSION', value })">
    <div class="fr-input-group">
      <label class="fr-label">Niveau de conversion</label>
      <select class="fr-select" v-model="value" required>
        <option v-for="niveau in conversionLevels" :key="niveau.value" :value="niveau.value">{{ niveau.label }}</option>
      </select>
    </div>

    <slot name="footer" />
  </form>
</template>

<script setup>
import { ref } from 'vue'
import { conversionLevels } from '@/referentiels/ab.js'

const emit = defineEmits(['form:valid', 'form:error'])

const value = ref(null)
</script>
