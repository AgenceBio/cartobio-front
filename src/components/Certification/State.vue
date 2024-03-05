<template>
  <span :class="['fr-badge', stateInfo.color]" :aria-label="dateLabel ? `${stateInfo.label} en ${dateLabel}` : stateInfo.label">
    {{ stateInfo.label }}
    <span v-if="showDate && dateLabel" class="year">{{ dateLabel }}</span>
  </span>
</template>

<script setup>
import { computed } from 'vue'

import { CERTIFICATION_STATE, certificationStates, yearLabel } from '@/referentiels/ab.js'

const props = defineProps({
  record: Object,
  showDate: {
    type: Boolean,
    default: true
  }
})

const stateId = computed(() => props.record.certification_state in certificationStates ? props.record.certification_state : CERTIFICATION_STATE.UNKNOWN)
const stateInfo = computed(() => certificationStates[stateId.value])
const dateLabel = computed(() => yearLabel(props.record))
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
