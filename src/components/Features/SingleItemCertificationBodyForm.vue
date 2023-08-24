<template>
  <div class="fr-card fr-p-3w fr-mb-3w">
    <h6 class="fr-mb-0">{{ featureName(feature) }}
      ({{ (surface(feature) / 10_000).toLocaleString('fr-FR', { maximumFractionDigits: 2 }) }} ha)</h6>
    <ul v-if="details.length">
      <li v-for="(detail, index) in details" :key="index">
        {{ detail }}
      </li>
    </ul>
  </div>

  <form @submit.prevent="emit('submit', { ids: [feature.id], patch })">
    <figure class="fr-quote fr-py-1w fr-px-2w fr-my-2w" v-if="feature.properties.commentaires">
      <blockquote>
        <p>{{ feature.properties.commentaires }}</p>
      </blockquote>
      <figcaption>
        <p class="fr-quote__author">Notes de l'exploitant‧e</p>
      </figcaption>
    </figure>

    <div class="fr-input-group">
      <CultureSelector :cultures="patch.cultures" @change="$cultures => patch.cultures = $cultures" />
    </div>

    <ConversionLevelSelector v-model="patch.conversion_niveau" />

    <div :class="{'fr-input-group': true, 'fr-input-group--disabled': !isAB}">
      <label class="fr-label">Date d'engagement</label>
      <div class="fr-input-wrap fr-icon-calendar-line">
        <input type="date" class="fr-input" v-model="patch.engagement_date" name="engagement_date" :required="isEngagementDateRequired" :disabled="!isAB" min="1985-01-01" :max="maxDate" />
      </div>
    </div>

    <div class="fr-input-group">
      <label class="fr-label" for="auditeur_notes">Vos notes de certification</label>
      <textarea class="fr-input" id="auditeur_notes" name="auditeur_notes" v-model="patch.auditeur_notes" />
    </div>

    <div class="fr-input-group fr-mt-4w">
      <button class="fr-btn" type="submit">Enregistrer</button>
    </div>
  </form>
</template>

<script setup>
import { reactive, computed } from 'vue';

import { featureDetails, featureName, surface } from '@/components/Features/index.js'
import { isABLevel, applyValidationRules, RULE_ENGAGEMENT_DATE } from '@/referentiels/ab.js'
import CultureSelector from "@/components/Features/CultureSelector.vue";
import ConversionLevelSelector from "@/components/Features/ConversionLevelSelector.vue";

const props = defineProps({
  feature: {
    type: Object,
    required: true
  }
})

const patch = reactive({
  conversion_niveau: props.feature.properties.conversion_niveau || '',
  cultures: props.feature.properties.cultures,
  engagement_date: props.feature.properties.engagement_date,
  auditeur_notes: props.feature.properties.auditeur_notes || '',
})

const emit = defineEmits(['submit'])
const isAB = computed(() => isABLevel(patch.conversion_niveau))
const maxDate = computed(() => new Date().toISOString().split('T').at(0))
const isEngagementDateRequired = computed(() => applyValidationRules([RULE_ENGAGEMENT_DATE], { properties: patch }).success === 0)
const details = await featureDetails(props.feature)
</script>

<style scoped>
.fr-quote {
  background-color: var(--background-contrast-info);
  border-left: none;
  border-radius: 5px;
}
  .fr-quote blockquote p {
    font-weight: normal;
  }
</style>
