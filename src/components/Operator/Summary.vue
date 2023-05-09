<template>
  <header>
    <h2 class="fr-h4 fr-mb-1w" :data-operator-id="operator.id">{{ operator.nom }}</h2>

    <p class="fr-subtitle">
      <ParcellaireState :state="record.certification_state" :date="record.created_at" />
    </p>

    <p v-if="canDisplayHistory" class="actions fr-btns-group fr-btns-group--inline-sm fr-btns-group--icon-left">
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

import { isCertificationImmutable } from '@/referentiels/ab.js'
import { useFeaturesStore } from '@/stores/index.js'

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

const exportModal = ref(false)
const historyModal = ref(false)
const featuresStore = useFeaturesStore()
const { collection } = storeToRefs(featuresStore)
const displayCallout = computed(() => props.record.audit_demandes && isCertificationImmutable(props.record.certification_state))
const canDisplayHistory = computed(() => Array.isArray(props.record.audit_history) && props.record.audit_history.length)
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
