<script setup>
import { computed, ref } from 'vue'
import { CERTIFICATION_STATE, isCertificationImmutable } from '@/referentiels/ab.js'
import { updateAuditState } from '@/cartobio-api.js'
import { useFeaturesSetsStore } from "@/stores/features-sets.js"
import { useOperatorStore } from "@/stores/operator.js"
import { usePermissions } from "@/stores/permissions.js"
import { useRecordStore } from "@/stores/record.js"
import CertificationModal from "@/components/record/modals/CertificationModal.vue"
import SaveAuditModal from "@/components/record/modals/SaveAuditModal.vue"
import toast from "@/components/toast.js"

const recordStore = useRecordStore()
const operatorStore = useOperatorStore()
const featuresSets = useFeaturesSetsStore()
const permissions = usePermissions()
const { record } = recordStore
const { operator } = operatorStore

const displayCallout = computed(() => record.audit_demandes && isCertificationImmutable(record.certification_state))
const showSaveAuditModal = ref(false)
const showCertificationModal = ref(false)

const canEndAudit = computed(() => permissions.isOc && recordStore.hasFeatures && !featuresSets.hasRequiredSets)

async function handleSaveAudit ({ record_id: recordId, patch }) {
  let newRecord
  try {
    newRecord = await updateAuditState(recordId, {
          ...patch,
          certification_state: CERTIFICATION_STATE.AUDITED
        }
    )
  } catch (e) {
    if (e.response?.status === 400) {
      toast.error(e.response.data.error)
      return
    }

    throw e
  }

  recordStore.update(newRecord)
  showSaveAuditModal.value = false
}

async function handleSendAudit () {
  let newRecord
  try {
    newRecord = await updateAuditState(
        record.record_id,
        { certification_state: CERTIFICATION_STATE.PENDING_CERTIFICATION }
    )
  } catch (e) {
    if (e.response?.status === 400) {
      toast.error(e.response.data.error)
      return
    }

    throw e
  }

  recordStore.update(newRecord)
}

async function handleCertify ({ record_id: recordId, patch }) {
  let newRecord
  try {
    newRecord = await updateAuditState(recordId, {
          ...patch,
          certification_state: CERTIFICATION_STATE.CERTIFIED
        }
    )
  } catch (e) {
    if (e.response?.status === 400) {
      toast.error(e.response.data.error)
      return
    }

    throw e
  }

  recordStore.update(newRecord)
  showCertificationModal.value = false
}
</script>

<template>
  <div class="demandes fr-callout fr-callout--blue-ecume fr-mb-2w" v-if="displayCallout">
    <h3 class="fr-callout__title">Demandes formulées lors de l'audit</h3>

    <div v-html="record.audit_demandes" />
  </div>

  <!-- Agri -->

  <div
      v-if="permissions.isAgri && record.certification_state !== CERTIFICATION_STATE.OPERATOR_DRAFT"
      class="fr-alert fr-alert--info fr-alert--sm fr-mb-2w"
  >
    <p class="fr-text--sm">Votre parcellaire est en cours de certification, vous ne pouvez pas modifier les données.</p>
  </div>

  <!-- OC -->


  <div class="fr-callout fr-callout--blue-ecume fr-mb-2w" v-if="permissions.isOc && record.audit_notes">
    <h3 class="fr-callout__title">Notes finales de l'audit</h3>

    <div v-html="record.audit_notes" />
  </div>


  <div class="fr-callout fr-callout--blue-ecume fr-mb-2w" v-if="canEndAudit && record.certification_state === CERTIFICATION_STATE.OPERATOR_DRAFT">
    <h3 class="fr-callout__title">Parcellaire complet <span aria-hidden="true">🎉</span></h3>

    <button v-if="permissions.canSaveAudit" class="fr-btn" @click="showSaveAuditModal = true">Terminer l'audit</button>
    <span v-else>L'auditeur doit maintenant terminer l'audit.</span>
  </div>

  <div class="fr-callout fr-callout--blue-ecume fr-mb-2w" v-else-if="canEndAudit && record.certification_state === CERTIFICATION_STATE.AUDITED">
    <h3 class="fr-callout__title">Audit terminé</h3>

    <button v-if="permissions.canSendAudit" class="fr-btn" @click="handleSendAudit">Soumettre pour certification</button>
    <span v-else>L'auditeur doit maintenant soumettre l'audit pour certification.</span>
  </div>

  <div class="fr-callout fr-callout--blue-ecume fr-mb-2w" v-else-if="canEndAudit && record.certification_state === CERTIFICATION_STATE.PENDING_CERTIFICATION">
    <h3 class="fr-callout__title">Certification en cours</h3>

    <button v-if="permissions.canCertify" class="fr-btn" @click="showCertificationModal = true">Certifier le parcellaire</button>
    <span v-else>Le chargé de certification doit maintenant certifier le parcellaire.</span>
  </div>

  <Teleport to="body">
    <SaveAuditModal :operator="operator" :record="record" v-if="showSaveAuditModal" @close="showSaveAuditModal = false" @submit="handleSaveAudit" />
    <CertificationModal :operator="operator" :record="record" v-if="showCertificationModal" @close="showCertificationModal = false" @submit="handleCertify" />
  </Teleport>
</template>

<style scoped>

</style>
