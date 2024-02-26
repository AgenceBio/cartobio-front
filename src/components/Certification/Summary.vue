<template>
  <div class="fr-callout fr-callout--blue-ecume" v-if="canEndAudit && record.certification_state === CERTIFICATION_STATE.OPERATOR_DRAFT">
    <h3 class="fr-callout__title">Parcellaire complet <span aria-hidden="true">🎉</span></h3>

    <button v-if="permissions.canSaveAudit" class="fr-btn" @click="showSendOffModal = true">Terminer l'audit</button>
    <span v-else>L'auditeur doit maintenant terminer l'audit.</span>
  </div>

  <div class="fr-callout fr-callout--blue-ecume" v-else-if="canEndAudit && record.certification_state === CERTIFICATION_STATE.AUDITED">
    <h3 class="fr-callout__title">Audit terminé</h3>

    <button v-if="permissions.canSendAudit" class="fr-btn" @click="handleSendAudit">Soumettre pour certification</button>
    <span v-else>L'auditeur doit maintenant soumettre l'audit pour certification.</span>
  </div>

  <div class="fr-callout fr-callout--blue-ecume" v-else-if="canEndAudit && record.certification_state === CERTIFICATION_STATE.PENDING_CERTIFICATION">
    <h3 class="fr-callout__title">Certification en cours</h3>

    <button v-if="permissions.canCertify" class="fr-btn" @click="showCertificationModal = true">Certifier le parcellaire</button>
    <span v-else>Le chargé de certification doit maintenant certifier le parcellaire.</span>
  </div>

  <div class="fr-callout fr-callout--blue-ecume" v-if="record.audit_notes">
    <h3 class="fr-callout__title">Notes finales de l'audit</h3>

    <div v-html="record.audit_notes" />
  </div>

  <Teleport to="body">
    <SendOffModal :operator="operator" :record="record" v-if="showSendOffModal" @close="showSendOffModal = false" @submit="handleSaveAudit" />
    <CertificationModal :operator="operator" :record="record" v-if="showCertificationModal" @close="showCertificationModal = false" @submit="handleCertify" />
  </Teleport>
</template>

<script setup>
import { computed, ref } from 'vue'
import { CERTIFICATION_STATE } from '@/referentiels/ab.js'
import { updateAuditState } from '@/cartobio-api.js'
import { useFeaturesSetsStore, usePermissions, useRecordStore } from '@/stores/index.js'
import CertificationModal from "@/components/Certification/CertificationModal.vue"
import SendOffModal from "@/components/Certification/SendOffModal.vue"
import toast from "@/components/toast.js"

const recordStore = useRecordStore()
const featuresSets = useFeaturesSetsStore()
const permissions = usePermissions()

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
  }
})

const showSendOffModal = ref(false)
const showCertificationModal = ref(false)

const canEndAudit = computed(() => recordStore.hasFeatures && !featuresSets.hasRequiredItems)

async function handleSaveAudit ({ record_id: recordId, patch }) {
  let record
  try {
    record = await updateAuditState(recordId, {
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

  recordStore.update(record)
  showSendOffModal.value = false
}

async function handleSendAudit () {
  const record = await updateAuditState(
    props.record.record_id,
    { certification_state: CERTIFICATION_STATE.PENDING_CERTIFICATION }
  )

  recordStore.update(record)
}

async function handleCertify ({ record_id: recordId, patch }) {
  const record = await updateAuditState(recordId, {
      ...patch,
      certification_state: CERTIFICATION_STATE.CERTIFIED
    }
  )

  recordStore.update(record)
  showCertificationModal.value = false
}
</script>
