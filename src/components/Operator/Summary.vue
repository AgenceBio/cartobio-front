<template>
  <header class="fr-mt-3w fr-mb-5w">
    <h2 class="fr-h4 fr-my-1w" :data-operator-id="operator.id" :data-numerobio="operator.numeroBio">{{ operator.nom }}</h2>

    <p class="state fr-subtitle">
      <ParcellaireState :state="record.certification_state" :date="record.created_at" />
    </p>

    <div v-if="disableActions === false" class="actions fr-btns-group fr-btns-group--inline-sm fr-btns-group--icon-left">
      <button v-if="canDisplayHistory" class="history-action fr-btn fr-btn--tertiary-no-outline fr-btn--icon-left fr-icon-calendar-2-line" @click="historyModal = true">
        Historique
      </button>

      <button v-if="hasFeatures" class="export-action fr-btn fr-btn--tertiary-no-outline fr-btn--icon-left fr-icon-road-map-line" @click="exportModal = true">
        Export
      </button>

      <button v-if="permissions.canDeleteParcellaire && isSetup" class="import-action fr-btn fr-btn--tertiary-no-outline fr-btn--icon-left fr-icon-arrow-go-forward-line" @click="deleteModal = true">
        Réimporter
      </button>
    </div>

    <div class="demandes fr-callout fr-callout--blue-ecume" v-if="displayCallout">
      <h3 class="fr-callout__title">Demandes formulées lors de l'audit</h3>

      <div v-html="record.audit_demandes" />
    </div>
  </header>

  <Teleport to="body">
    <OperatorHistoryModal :record="record" :operator="operator" v-if="historyModal" v-model="historyModal" />
  </Teleport>


  <Teleport to="body">
    <FeaturesExportModal :operator="operator" :collection="collection" :record="record" v-if="exportModal" v-model="exportModal" />
  </Teleport>

  <Teleport to="body">
    <DeleteParcellaireModal :record="record" v-if="deleteModal" v-model="deleteModal" />
  </Teleport>
</template>

<script setup>
import { computed, ref } from 'vue'
import { storeToRefs } from 'pinia'

import ParcellaireState from '@/components/Certification/State.vue'
import OperatorHistoryModal from '@/components/Operator/HistoryModal.vue'
import FeaturesExportModal from '@/components/Features/ExportModal.vue'
import DeleteParcellaireModal from '@/components/Operator/DeleteParcelaireModal.vue'

import { isCertificationImmutable } from '@/referentiels/ab.js'
import { useFeaturesStore, usePermissions, useRecordStore } from '@/stores/index.js'

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
const deleteModal = ref(false)
const recordStore = useRecordStore()
const featuresStore = useFeaturesStore()
const permissions = usePermissions()
const { collection, hasFeatures } = storeToRefs(featuresStore)
const { isSetup } = storeToRefs(recordStore)
const displayCallout = computed(() => props.record.audit_demandes && isCertificationImmutable(props.record.certification_state))
const canDisplayHistory = computed(() => Array.isArray(props.record.audit_history) && props.record.audit_history.length)

</script>

<style scoped>
header {
  display: flex;
  flex-direction: column;

  & > p.state {
    margin: 0;
    order: -1;
  }
}

.actions {
  background: var(--light-background-alt-blue-france, #F5F5FE);
  display: flex;

  .import-action {
    margin-left: auto;
  }
}

@media screen and (min-width: 62em) {
  .actions {
    flex-direction: row;
    margin-left: 0;
    margin-right: 0;
  }

  div.actions .fr-btn {
    margin-bottom: 0;
  }
}
</style>
