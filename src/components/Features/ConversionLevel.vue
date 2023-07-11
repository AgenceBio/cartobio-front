<template>
  <span v-if="requiresPrecision" class="fr-badge fr-badge--warning fr-badge--sm">
    {{ conversionLevel.shortLabel }}
  </span>
  <span v-else>
    {{ conversionLevel.shortLabel }}
    <time class="fr-text--xs" :datetime="conversionDate" v-if="(withDate && conversionDate && isAB)" :title="`Parcelle ${conversionLevel.shortLabel} engagée en bio le ${ddmmmmyyyy(conversionDate)}`">
      {{ mmyyyy(conversionDate) }}
    </time>
  </span>
</template>

<script setup>
import { computed } from 'vue'
import { getConversionLevel, isABLevel } from '@/referentiels/ab.js'
import { mmyyyy, ddmmmmyyyy } from '@/components/dates.js';

const props = defineProps({
  feature: {
    type: Object,
    required: true
  },
  withDate: {
    type: Boolean,
    default: false
  }
})

const conversionLevel = computed(() => getConversionLevel(props.feature.properties.conversion_niveau))
const conversionDate = computed(() => props.feature.properties.engagement_date && new Date(props.feature.properties.engagement_date).toISOString())
const isAB = computed(() => isABLevel(props.feature.properties.conversion_niveau))
const requiresPrecision = computed(() => !props.feature.properties.conversion_niveau || props.feature.properties.conversion_niveau === 'AB?')
</script>

<style scoped>
time {
  color: var(--text-mention-grey);
}
</style>
