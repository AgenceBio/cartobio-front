<template>
  <header>
    <h4 class="fr-h4 fr-mb-1w">{{ operator.nom }}</h4>
    <p class="fr-subtitle">
      <ParcellaireState :state="record.certification_state" :date="record.created_at" />
    </p>
    <p class="actions">
      <button :disabled="!canDisplayHistory" class="fr-btn fr-btn--tertiary-no-outline fr-btn--icon-left fr-icon-calendar-2-line" @click="historyModal = true">
        Historique
      </button>
    </p>

    <div class="fr-callout fr-callout--blue-ecume" v-if="displayCallout">
      <h3 class="fr-callout__title">Demandes formulées lors de l'audit</h3>

      <div v-html="record.audit_demandes" />
    </div>
  </header>

  <Teleport to="body">
    <OperatorHistoryModal :record="record" :operator="operator" v-model="historyModal" />
  </Teleport>
</template>

<script setup>
import { computed, ref } from 'vue'

import ParcellaireState from '@/components/Certification/State.vue'
import OperatorHistoryModal from '@/components/Operator/HistoryModal.vue'

import { isCertificationImmutable } from '@/referentiels/ab.js'

const props = defineProps({
  operator: {
    type: Object,
    required: true
  },
  record: {
    type: Object,
    required: true
  }
})

const historyModal = ref(false)
const displayCallout = computed(() => props.record.audit_demandes && isCertificationImmutable(props.record.certification_state))
const canDisplayHistory = computed(() => Array.isArray(props.record.audit_history) && props.record.audit_history.length)
</script>

<style scoped>
header {
  position: relative;
}

@media screen and (min-width: 62em) {
  p.actions {
    position: absolute;
    right: 0;
    top: 0;
  }
}
</style>
