<template>
  <div class="fr-alert fr-alert--warning fr-mb-3w" v-if="featuresSet.hasRequiredItems">
    <p v-for="([ruleId, result]) in featuresSet.results" :key="ruleId">
      {{ result.errorMessage }} pour {{ inflex(result.count, 'parcelle', 'parcelles') }}.

      <button class="fr-link fr-icon-arrow-right-line fr-link--icon-right">voir</button>
    </p>
  </div>

</template>

<script setup>
import { useFeaturesSetsStore } from '@/stores/index.js'

const featuresSet = useFeaturesSetsStore()
const plural = new Intl.PluralRules('fr-FR', { type: 'cardinal' })

const inflex = (n, one, many) => {
  const rule = plural.select(n)
  return rule === 'one' ? `${n} ${one}` : `${n} ${many}`
}
</script>
