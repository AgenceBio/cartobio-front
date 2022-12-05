<template>
  <span :class="['fr-badge', state.color]">
    {{ state.label }}
    <span v-if="date" class="year">{{ date }}</span>
  </span>
</template>

<script setup>
import { readonly, computed } from 'vue'

import { CERTIFICATION_STATE } from '@/referentiels/ab.js'

const props = defineProps({
  state: String,
  date: String
})

const STATE_MAP = readonly({
  UNKNOWN: {
    label: 'Non renseigné',
    color: 'fr-badge--warning'
  },
  [CERTIFICATION_STATE.OPERATOR_DRAFT]: {
    label: 'Brouillon',
    color: 'fr-badge--info'
  },
  [CERTIFICATION_STATE.AUDITED]: {
    label: 'Audit terminé',
    color: 'fr-badge--new'
  },
  [CERTIFICATION_STATE.CERTIFIED]: {
    label: 'Certifié',
    color: 'fr-badge--success'
  },
})

const stateId = computed(() => props.state in STATE_MAP ? props.state : 'UNKNOWN')
const state = computed(() => STATE_MAP[stateId.value])
const date = computed(() => {
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
