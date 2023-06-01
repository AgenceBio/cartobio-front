<template>
  <p>
    <span class="fr-icon-info-line" aria-hidden="true" />
    {{ featureName(feature) }}
  </p>

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
      <label class="fr-label">Type de culture</label>
      <CultureSelector v-model="patch.TYPE" />
    </div>

    <div class="fr-input-group">
      <label class="fr-label">Niveau de conversion</label>

      <div class="fr-radio-group fr-my-1w" v-for="niveau in conversionLevels" :key="niveau.value">
        <input type="radio" :id="'conversion-' + niveau.value" :value="niveau.value" v-model="patch.conversion_niveau" name="conversion_niveau">
        <label class="fr-label" :for="'conversion-' + niveau.value">
          {{ niveau.label }}
        </label>
      </div>
    </div>

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

import { featureName } from '@/components/Features/index.js'
import { userFacingConversionLevels as conversionLevels, isABLevel, applyValidationRules, RULE_ENGAGEMENT_DATE } from '@/referentiels/ab.js'
import CultureSelector from "@/components/Features/CultureSelector.vue";

const props = defineProps({
  feature: {
    type: Object,
    required: true
  }
})

const patch = reactive({
  TYPE: props.feature.properties.TYPE,
  conversion_niveau: props.feature.properties.conversion_niveau,
  engagement_date: props.feature.properties.engagement_date,
  auditeur_notes: props.feature.properties.auditeur_notes || '',
})

const emit = defineEmits(['submit'])
const isAB = computed(() => isABLevel(patch.conversion_niveau))
const maxDate = computed(() => new Date().toISOString().split('T').at(0))
const isEngagementDateRequired = computed(() => applyValidationRules([RULE_ENGAGEMENT_DATE], { properties: patch }).success === 0)
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
