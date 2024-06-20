<template>
  <div class="fr-alert fr-alert--warning fr-mt-6v" v-if="featuresSet.hasRequiredSets">
    <p v-for="([ruleId, result]) in featuresSet.required" :key="ruleId">
      {{ result.errorMessage }} pour {{ inflex(result.count, 'parcelle', 'parcelles') }}.

      <!-- <button v-if="!featuresSet.isToggled(ruleId)" @click="featuresSet.toggle(ruleId)" class="fr-btn fr-btn--sm fr-btn--tertiary fr-icon-arrow-right-line fr-btn--icon-right">
        voir
      </button> -->
    </p>
  </div>

</template>

<script setup>
import { useFeaturesSetsStore } from '@/stores/features-sets.js'

const featuresSet = useFeaturesSetsStore()
const plural = new Intl.PluralRules('fr-FR', { type: 'cardinal' })

const inflex = (n, one, many) => {
  const rule = plural.select(n)
  return rule === 'one' ? `${n} ${one}` : `${n} ${many}`
}
</script>
