<template>
  <div class="fr-alert fr-alert--warning fr-mb-3w" v-if="hasFailures">
    <ValidationErrors :validation-result="validationResult" />
  </div>

  <div class="fr-callout fr-callout--blue-ecume" v-else-if="record.certification_state === CERTIFICATION_STATE.OPERATOR_DRAFT">
    <h3 class="fr-callout__title">Parcellaire complet <span aria-hidden="true">🎉</span></h3>

    <button v-if="permissions.canSaveAudit" class="fr-btn" @click="handleSaveAudit">Terminer l'audit</button>
    <span v-else>L'auditeur doit maintenant envoyer l'audit.</span>
  </div>

  <div class="fr-callout fr-callout--blue-ecume" v-else-if="record.certification_state === CERTIFICATION_STATE.AUDITED">
    <h3 class="fr-callout__title">Audit terminé</h3>

    <button v-if="permissions.canSendAudit" class="fr-btn" @click="showSendOffModal = true">Envoyer l'audit</button>
    <span v-else>L'auditeur doit maintenant envoyer l'audit.</span>
  </div>

  <div class="fr-callout fr-callout--blue-ecume" v-else-if="record.certification_state === CERTIFICATION_STATE.PENDING_CERTIFICATION">
    <h3 class="fr-callout__title">Certification en cours</h3>

    <button v-if="permissions.canCertify" class="fr-btn" @click="showCertificationModal = true">Certifier le parcellaire</button>
    <span v-else>Le chargé de certification doit maintenant certifier le parcellaire.</span>
  </div>

  <div class="fr-callout fr-callout--blue-ecume" v-if="record.audit_notes">
    <h3 class="fr-callout__title">Notes finales de l'audit</h3>

    <div v-html="record.audit_notes" />
  </div>

  <Teleport to="body">
    <SendOffModal :operator="operator" :record="record" v-if="showSendOffModal" v-model="showSendOffModal" @submit="handleSendAudit" />
    <CertificationModal :operator="operator" :record="record" v-if="showCertificationModal" v-model="showCertificationModal" @submit="handleCertify" />
  </Teleport>
</template>

<script setup>
import { computed, ref } from 'vue'
import { applyValidationRules, CERTIFICATION_STATE } from '@/referentiels/ab.js'
import { updateAuditState } from '@/cartobio-api.js'
import { useRecordStore } from '@/stores/index.js'
import ValidationErrors from "@/components/Features/ValidationErrors.vue"
import CertificationModal from "@/components/Certification/CertificationModal.vue"
import SendOffModal from "@/components/Certification/SendOffModal.vue"
import { usePermissions } from "@/stores/permissions.js"

const recordStore = useRecordStore()
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
  },
  validationRules: {
    type: Object,
    required: true
  }
})

const showSendOffModal = ref(false)
const showCertificationModal = ref(false)
const validationResult = computed(() => applyValidationRules(props.validationRules.rules, ...props.features.features))
const hasFailures = computed(() => Boolean(validationResult.value.failures))

async function handleSaveAudit () {
  const record = await updateAuditState(
    { recordId : props.record.record_id },
    {
      certification_state: CERTIFICATION_STATE.AUDITED
    }
  )

  recordStore.update(record)
}

async function handleSendAudit ({ record_id: recordId, patch }) {
  const record = await updateAuditState({ recordId }, {
    ...patch,
    certification_state: CERTIFICATION_STATE.PENDING_CERTIFICATION
  })

  recordStore.update(record)
  showSendOffModal.value = false
}

async function handleCertify ({ record_id: recordId, patch }) {
  const record = await updateAuditState({ recordId }, {
      ...patch,
      certification_state: CERTIFICATION_STATE.CERTIFIED
    }
  )

  recordStore.update(record)
  showCertificationModal.value = false
}
</script>
