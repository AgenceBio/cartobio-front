<template>
  <span :class="['fr-badge', stateInfo.color]" :aria-label="date ? `${stateInfo.label} en ${dateLabel}` : stateInfo.label">
    {{ stateInfo.label }}
    <span v-if="date" class="year">{{ dateLabel }}</span>
  </span>
</template>

<script setup>
import { computed } from 'vue'

import { CERTIFICATION_STATE, certificationStates } from '@/referentiels/ab.js'

const props = defineProps({
  state: String,
  date: String
})

const stateId = computed(() => props.state in certificationStates ? props.state : CERTIFICATION_STATE.UNKNOWN)
const stateInfo = computed(() => certificationStates[stateId.value])
const dateLabel = computed(() => {
  return props.date
    ? new Date(props.date).toLocaleDateString('fr-FR', { year: 'numeric'})
    : ''
})
</script>

<style scoped>
.fr-badge {
  white-space: nowrap;
}
.year::before {
  content: "|";
  opacity: .3;
  padding: 0 .3rem;
}
</style>
