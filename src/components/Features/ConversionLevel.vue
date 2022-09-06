<template>
  <i v-if="!feature.properties.conversion_niveau">
    Donnée inconnue
  </i>
  <span class="certification-details" v-else-if="isABLevel(feature.properties.conversion_niveau)">
    <abbr :title="conversionLevel.label">{{ conversionLevel.shortLabel }}</abbr>
    <small>engagée le {{ dateDDMMYYY(feature.properties.engagement_date) }}</small>
  </span>
  <span v-else>
    {{ conversionLevel.shortLabel }}
  </span>
</template>

<script setup>

import { getConversionLevel, isABLevel } from '@/referentiels/ab.js'

const props = defineProps({
  feature: {
    type: Object,
    required: true
  }
})

const conversionLevel = getConversionLevel(props.feature.properties.conversion_niveau)


function dateDDMMYYY (date) {
  return new Date(date).toLocaleDateString('fr-FR', {
    dateStyle: 'short',
    timeZone: 'Europe/Paris'
  })
}
</script>

<style scoped>
  .certification-details {
    display: flex;
    flex-direction: column;
  }
</style>
