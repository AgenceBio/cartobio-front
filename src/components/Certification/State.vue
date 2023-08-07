<template>
  <span :class="['fr-badge', stateInfo.color]">
    {{ stateInfo.label }}
    <span
      v-if="date"
      class="year"
    >{{ dateLabel }}</span>
  </span>
</template>

<script setup>
import { readonly, computed } from 'vue'

import { CERTIFICATION_STATE } from '@/referentiels/ab.js'

const props = defineProps({
  state: {
    type: String,
    default: ''
  },
  date: {
    type: String,
    default: ''
  }
})

const STATE_MAP = readonly({
  UNKNOWN: {
    label: 'Non renseigné',
    color: 'fr-badge--warning'
  },
  [CERTIFICATION_STATE.OPERATOR_DRAFT]: {
    label: 'Parcellaire importé',
    color: 'fr-badge--info'
  },
  [CERTIFICATION_STATE.AUDITED]: {
    label: 'Audit terminé',
    color: 'fr-badge--new'
  },
  [CERTIFICATION_STATE.PENDING_CERTIFICATION]: {
    label: 'Certification en cours',
    color: 'fr-badge--new'
  },
  [CERTIFICATION_STATE.CERTIFIED]: {
    label: 'Certifié',
    color: 'fr-badge--success'
  },
})

const stateId = computed(() => props.state in STATE_MAP ? props.state : 'UNKNOWN')
const stateInfo = computed(() => STATE_MAP[stateId.value])
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
