<template>
  <Modal ref="modal" data-track-content data-content-name="Modale de modification de parcelle" v-bind="$attrs">
    <div class="fr-card fr-p-2w fr-mb-3w">
      <h6 class="fr-mb-0">
        <input class="fr-input" v-model="patch.NOM" placeholder="Nom de la parcelle" required="required" />
        ({{ inHa(surface(feature)) }} ha)</h6>

      <ul v-if="details.length">
        <li v-for="(detail, index) in details" :key="index">
          {{ detail }}
        </li>
      </ul>
    </div>

    <form @submit.prevent="emit('submit', { id: feature.id, properties: patch })" id="single-feature-edit-form">
      <AccordionGroup :constraint-toggle="!open">
        <AccordionSection title="Culture" :open="open">
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
        </AccordionSection>

        <AccordionSection title="Annotations d'audit" :open="open">
          <ConversionLevelSelector :readonly="!permissions.canChangeConversionLevel" v-model="patch.conversion_niveau" />

          <div class="fr-input-group" v-if="isAB">
            <label class="fr-label" for="engagement_date">Date d'engagement <span v-if="!isEngagementDateRequired">(facultatif)</span></label>
            <div class="fr-input-wrap fr-icon-calendar-line">
              <input type="date" class="fr-input" v-model="patch.engagement_date" name="engagement_date" id="engagement_date" :required="isEngagementDateRequired" :disabled="!isAB" min="1985-01-01" :max="maxDate" />
            </div>
          </div>

          <AnnotationsSelector v-if="permissions.canAddAnnotations" v-model="patch.annotations" :featureId="feature.properties.id" />

          <div class="fr-input-group">
            <label class="fr-label" for="auditeur_notes">Vos notes de certification (facultatif)</label>
            <textarea class="fr-input" id="auditeur_notes" name="auditeur_notes" v-model="patch.auditeur_notes" />
          </div>
        </AccordionSection>
      </AccordionGroup>
    </form>

    <template #title><slot name="title" /></template>

    <template #footer>
      <div class="fr-input-group">
        <button class="fr-btn" type="submit" form="single-feature-edit-form">Enregistrer</button>
      </div>
    </template>
  </Modal>
</template>

<script setup>
import { reactive, computed } from 'vue';

import { featureDetails, featureName, inHa, surface } from '@/components/Features/index.js'
import { isABLevel, applyValidationRules, RULE_ENGAGEMENT_DATE } from '@/referentiels/ab.js'
import { usePermissions } from '@/stores/index.js'

import AccordionGroup from '@/components/DesignSystem/AccordionGroup.vue'
import AccordionSection from '@/components/DesignSystem/Accordion.vue'
import Modal from '@/components/Modal.vue'
import AnnotationsSelector from "@/components/Features/AnnotationsSelector.vue";
import CultureSelector from "@/components/Features/CultureSelector.vue";
import ConversionLevelSelector from "@/components/Features/ConversionLevelSelector.vue";

const props = defineProps({
  feature: {
    type: Object,
    required: true
  },
  open: {
    type: Boolean,
    default: false
  }
})

const permissions = usePermissions()

const patch = reactive({
  NOM: featureName(props.feature, { placeholder: '' }),
  annotations: props.feature.properties.annotations || [],
  conversion_niveau: props.feature.properties.conversion_niveau || '',
  cultures: props.feature.properties.cultures || [],
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
