<template>
  <span :class="['fr-badge', 'fr-badge--sm', 'fr-badge--no-icon', state.color]">
    {{ state.label }}
    <span v-if="date" class="year">{{ date }}</span>
  </span>
</template>

<script setup>
import { readonly, computed } from 'vue'

const props = defineProps({
  record: {
    type: Object,
    required: true
  }
})

const STATE_MAP = readonly({
  UNKNOWN: {
    label: 'Parcellaire inconnu',
    color: ''
  },
  OPERATOR_DRAFT: {
    label: 'Brouillon',
    color: 'fr-badge--blue-ecume'
  },
  AUDITED: {
    label: 'Audit terminé',
    color: 'fr-badge--warning'
  },
  CERTIFIED: {
    label: 'Certifié',
    color: 'fr-badge--success'
  },
})

const stateId = computed(() => props.record.certification_state in STATE_MAP ? props.record.certification_state : 'UNKNOWN')
const state = computed(() => STATE_MAP[stateId.value])
const date = computed(() => {
  return props.record.created_at
    ? new Date(props.record.created_at).toLocaleDateString('fr-FR', { year: 'numeric'})
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
