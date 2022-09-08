<template>
  <form>
    <div class="fr-input-group">
      <label class="fr-label">Type de culture</label>
      <select class="fr-select" v-model="value">
        <option v-for="([code, libellé]) in codesPac" :key="code" :value="code">
          {{ libellé }}
        </option>
      </select>
    </div>

    <slot name="footer" />
  </form>
</template>

<script setup>
import { ref } from 'vue'
import { liste as codesPac } from '@/referentiels/pac.js'

defineEmits(['form:valid', 'form:error'])

const value = ref(null)
</script>
