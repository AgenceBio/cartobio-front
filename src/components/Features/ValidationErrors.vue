<template>
  <p v-for="([ruleId, result]) in validationRulesWithFailures" :key="ruleId">
    {{ ruleId === 'NOT_EMPTY' ? `Il manque un type de culture dans ${result.failures} parcelles.` : '' }}
    {{ ruleId === 'ENGAGEMENT_DATE' ? `Il manque une date d'engagement dans ${result.failures} parcelles.` : '' }}
    {{ ruleId === 'CONVERSION_LEVEL' ? `Il manque un niveau de conversion dans ${result.failures} parcelles.` : '' }}
    {{ ruleId === 'MAYBE_AB' ? `Le niveau de conversion en agriculture biologique a besoin d'être précisé dans ${result.failures} parcelles.` : '' }}
    {{ ruleId === 'CPF' ? 'Certaines cultures ont besoin d\'être précisées.' : '' }}
  </p>
</template>

<script setup>
import { computed, defineProps } from "vue"

const props = defineProps({
  validationResult: {
    type: Object,
    required: true
  }
})

const validationRulesWithFailures = computed(() => {
  return Object.entries(props.validationResult.rules)
          .filter(([, { failures }]) => failures)
})
</script>
