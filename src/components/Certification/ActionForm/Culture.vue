<template>
  <form @submit.prevent="handleSubmit">
    <div class="fr-input-group">
      <label class="fr-label">Type de culture</label>
      <select class="fr-select" name="culture" v-model="value" required>
        <option v-for="([code, libellé]) in codesPac" :key="code" :value="code">
          {{ libellé }}
        </option>
      </select>
    </div>

    <slot name="footer" />
  </form>
</template>

<script setup>
import { ref, unref } from 'vue'
import { liste as codesPac } from '@/referentiels/pac.js'

const emit = defineEmits(['form:valid', 'form:error'])

const value = ref(null)

function handleSubmit () {
  emit('form:valid', { type: 'UPDATE_CULTURE', value: unref(value) })
}
</script>
