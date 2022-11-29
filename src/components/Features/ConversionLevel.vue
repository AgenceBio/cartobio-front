<template>
  <span :class="['fr-badge', color]">
    {{ label }}
  </span>
</template>

<script setup>
import { computed } from 'vue'
import { getConversionLevel } from '@/referentiels/ab.js'

const props = defineProps({
  feature: {
    type: Object,
    required: true
  }
})

const conversionLevel = computed(() => getConversionLevel(props.feature.properties.conversion_niveau))
const label = computed(() => props.feature.properties.conversion_niveau ? conversionLevel.value.shortLabel : 'Inconnue')
const color = computed(() => props.feature.properties.conversion_niveau ? 'fr-badge--success' : 'fr-badge--warning')
</script>

<style scoped>
.fr-badge--success {
  background-color: transparent;
  color: var(--text-default-grey);
  font-weight: normal;
}
  .fr-badge--success::before {
    background-color: transparent;
  }
</style>
