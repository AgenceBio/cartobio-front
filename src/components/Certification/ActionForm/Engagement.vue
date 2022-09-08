<template>
  <form @submit.prevent="handleSubmit">
    <div class="fr-input-group">
      <label class="fr-label">Date d'engagement</label>
      <div class="fr-input-wrap fr-icon-calendar-line">
        <input type="date" class="fr-input" v-model="value" required />

        <!-- <button class="link" type="button">utiliser la date de notification ({{ currentUser.dateEngagement }})</button>
        <button class="link" type="button">utiliser la date de 1<sup>er</sup> engagement ({{ currentUser.datePremierEngagement }})</button> -->
      </div>
    </div>

    <slot name="footer" />
  </form>
</template>

<script setup>
import { ref, unref } from 'vue'
import { isABLevel,  } from '@/referentiels/ab.js'

const emit = defineEmits(['form:valid', 'form:error'])

const value = ref(null)

function handleSubmit () {
  emit('form:valid', { type: 'UPDATE_ENGAGEMENT', value: unref(value) })
}
</script>
