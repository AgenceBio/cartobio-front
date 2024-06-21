<template>
  <span :class="['fr-badge', stateInfo.color]" :aria-label="dateLabel ? `${stateInfo.label} en ${dateLabel}` : stateInfo.label">
    {{ stateInfo.label }}
    <span v-if="showDate && dateLabel" class="year">{{ dateLabel }}</span>
  </span>
</template>

<script setup>
import { computed } from 'vue'

import { certificationStatesLabels, yearLabel } from '@/referentiels/ab.js'
import { CertificationState } from "@agencebio/cartobio-types"

const props = defineProps({
  record: Object,
  showDate: {
    type: Boolean,
    default: true
  }
})

const stateId = computed(() => props.record.certification_state in certificationStatesLabels ? props.record.certification_state : CertificationState.UNKNOWN)
const stateInfo = computed(() => certificationStatesLabels[stateId.value])
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
