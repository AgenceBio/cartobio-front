<template>
  <header>
    <h2 class="fr-h4 fr-mb-1w" :data-operator-id="operator.id">{{ operator.nom }}</h2>

    <p class="fr-subtitle">
      <ParcellaireState :state="record.certification_state" :date="record.created_at" />
    </p>

    <div class="fr-alert fr-alert--warning fr-mb-3w" v-if="hasFailures">
      <p v-for="([ruleId, result]) in validationRulesWithFailures" :key="ruleId">
        {{ ruleId === 'NOT_EMPTY' ? `Il manque un type de culture dans ${result.failures} parcelles.` : '' }}
        {{ ruleId === 'CPF' ? 'Certaines cultures ont besoin d\'être précisées.' : '' }}
      </p>
    </div>

    <p v-if="canDisplayHistory && disableActions === false" class="actions fr-btns-group fr-btns-group--inline-sm fr-btns-group--icon-left">
      <button class="fr-btn fr-btn--tertiary-no-outline fr-btn--icon-left fr-icon-calendar-2-line" @click="historyModal = true">
        Historique
      </button>

      <button class="fr-btn fr-btn--tertiary-no-outline fr-btn--icon-left fr-icon-road-map-line" @click="exportModal = true">
        Exporter
      </button>
    </p>

    <div class="fr-callout fr-callout--blue-ecume" v-if="displayCallout">
      <h3 class="fr-callout__title">Demandes formulées lors de l'audit</h3>

      <div v-html="record.audit_demandes" />
    </div>
  </header>

  <Teleport to="body">
    <OperatorHistoryModal :record="record" :operator="operator" v-if="historyModal" v-model="historyModal" />
  </Teleport>


  <Teleport to="body">
    <FeaturesExportModal :operator="operator" :collection="collection" v-if="exportModal" v-model="exportModal" />
  </Teleport>
</template>

<script setup>
import { computed, ref } from 'vue'
import { storeToRefs } from 'pinia'

import ParcellaireState from '@/components/Certification/State.vue'
import OperatorHistoryModal from '@/components/Operator/HistoryModal.vue'
import FeaturesExportModal from '@/components/Features/ExportModal.vue'

import { applyValidationRules, isCertificationImmutable, OPERATOR_RULES } from '@/referentiels/ab.js'
import { useFeaturesStore } from '@/stores/index.js'

const props = defineProps({
  operator: {
    type: Object,
    required: true
  },
  record: {
    type: Object,
    required: true
  },
  disableActions: {
    type: Boolean,
    default: false
  }
})

const exportModal = ref(false)
const historyModal = ref(false)
const featuresStore = useFeaturesStore()
const { collection } = storeToRefs(featuresStore)
const displayCallout = computed(() => props.record.audit_demandes && isCertificationImmutable(props.record.certification_state))
const canDisplayHistory = computed(() => Array.isArray(props.record.audit_history) && props.record.audit_history.length)

const validationResult = computed(() => applyValidationRules(OPERATOR_RULES, ...featuresStore.collection.features))
const hasFailures = computed(() => Boolean(validationResult.value.failures))
const validationRulesWithFailures = computed(() => Object.entries(validationResult.value.rules).filter(([, { failures }]) => failures))
</script>

<style scoped>
header {
  position: relative;
}


@media screen and (min-width: 62em) {
  p.actions {
    align-items: end;
    flex-direction: column;
    position: absolute;
    right: 0;
    top: 0;
  }
    p.actions .fr-btn {
      margin-bottom: 0;
    }
}
</style>
