<template>
  <i v-if="!feature.properties.conversion_niveau">
    Donnée inconnue
  </i>
  <span class="certification-details" v-else-if="isABLevel(feature.properties.conversion_niveau)">
    <abbr :title="conversionLevel.label">{{ conversionLevel.shortLabel }}</abbr>
    <small v-if="feature.properties.engagement_date">
      engagée le {{ dateDDMMYYY(feature.properties.engagement_date) }}
    </small>
    <small v-else>
      date engagement inconnue
    </small>
  </span>
  <span v-else>
    {{ conversionLevel.shortLabel }}
  </span>
</template>

<script setup>
import { computed } from 'vue'
import { getConversionLevel, isABLevel } from '@/referentiels/ab.js'

const props = defineProps({
  feature: {
    type: Object,
    required: true
  }
})

const conversionLevel = computed(() => getConversionLevel(props.feature.properties.conversion_niveau))


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
