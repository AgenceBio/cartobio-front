<template>
  <div class="fr-alert fr-alert--warning fr-mb-3w" v-if="hasFailures">
    <p>Parcellaire incomplet</p>
  </div>

  <div class="fr-callout fr-callout--blue-ecume" v-else-if="!isAudited && isComplete">
    <h3 class="fr-callout__title">Parcellaire complet <span aria-hidden>🎉</span></h3>

    <button class="fr-btn">Terminer l'audit</button>
  </div>

  <div class="fr-callout fr-callout--green-emeraude" v-else-if="isAudited && isComplete">
    <button class="fr-btn fr-btn--secondary fr-m-0" @click="exportModal = true">Télécharger le parcellaire</button>
  </div>

  <Teleport to="body">
    <FeaturesExportModal :operator="operator" :collection="features" v-model="exportModal" />
  </Teleport>
</template>

<script setup>
import { computed, ref } from 'vue'
import { applyValidationRules } from '@/referentiels/ab.js'

import FeaturesExportModal from '@/components/Features/ExportModal.vue'

const props = defineProps({
  operator: {
    type: Object,
    required: true
  },
  features: {
    type: Object,
    required: true
  },
  record: {
    type: Object,
    required: true
  },
  validationRules: {
    type: Object,
    required: true
  }
})

const validationModal = ref(false)
const exportModal = ref(false)
const validationResult = computed(() => applyValidationRules(props.validationRules.rules, ...props.features.features))
const hasFailures = computed(() => Boolean(validationResult.value.failures))
const isComplete = computed(() => hasFailures.value === false)
const isAudited = computed(() => ['AUDITED', 'CERTIFIED'].includes(props.record.certification_state.value))
</script>
