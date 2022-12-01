<template>
  <span :class="className">
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
const className = computed(() => props.feature.properties.conversion_niveau ? '' : 'fr-badge fr-badge--warning')
</script>

