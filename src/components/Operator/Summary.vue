<template>
  <header>
    <h2 class="fr-h4 fr-mb-1w" :data-operator-id="operator.id">{{ operator.nom }}</h2>

    <div v-if="disableActions === false" class="actions fr-btns-group fr-btns-group--inline-sm fr-btns-group--icon-left">
      <button v-if="canDisplayHistory" class="fr-btn fr-btn--tertiary-no-outline fr-btn--icon-left fr-icon-calendar-2-line" @click="historyModal = true">
        Historique
      </button>

      <button class="fr-btn fr-btn--tertiary-no-outline fr-btn--icon-left fr-icon-road-map-line" @click="exportModal = true">
        Exporter
      </button>

      <button v-if="permissions.canDeleteParcellaire" class="fr-btn fr-btn--tertiary-no-outline fr-btn--icon-left fr-icon-delete-bin-line" @click="deleteModal = true">
        Supprimer
      </button>
    </div>

    <p class="state fr-subtitle">
      <ParcellaireState :state="record.certification_state" :date="record.created_at" />
    </p>

    <div class="demandes fr-callout fr-callout--blue-ecume" v-if="displayCallout">
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

  <Teleport to="body">
    <DeleteParcellaireModal :record="record" :operator="operator" v-if="deleteModal" v-model="deleteModal" />
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
import { useFeaturesStore } from '@/stores/index.js'
import { usePermissions } from "@/stores/permissions.js"

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
const featuresStore = useFeaturesStore()
const permissions = usePermissions()
const { collection } = storeToRefs(featuresStore)
const displayCallout = computed(() => props.record.audit_demandes && isCertificationImmutable(props.record.certification_state))
const canDisplayHistory = computed(() => Array.isArray(props.record.audit_history) && props.record.audit_history.length)

</script>

<style scoped>
header {
  display: grid;
  grid-template-columns: auto 1fr;
}

header > h2 {
  grid-column: 1;
}

header > p.state {
  grid-column: 1 / span 2;
  margin-top: 0;
}

header > div.demandes {
  grid-column: 1 / span 2;
  margin-top: 0;
}

@media screen and (min-width: 62em) {
  div.actions {
    grid-column: 2;
    display: flex;
    justify-content: flex-end;
    flex-direction: row;
    flex-wrap: wrap;
  }

  div.actions .fr-btn {
    margin-bottom: 0;
  }
}
</style>
