<script setup>
import { computed, ref } from 'vue'
import { isCertificationImmutable } from '@/referentiels/ab.js'
import { useFeaturesSetsStore } from "@/stores/features-sets.js"
import { useOperatorStore } from "@/stores/operator.js"
import { usePermissions } from "@/stores/permissions.js"
import { useRecordStore } from "@/stores/record.js"
import CertificationModal from "@/components/forms/CertificationForm.vue"
import SaveAuditModal from "@/components/forms/SaveAuditForm.vue"
import { CertificationState } from "@agencebio/cartobio-types"

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

function handleSaveAudit ({ patch }) {
  recordStore.updateInfo({
    ...patch,
    certification_state: CertificationState.AUDITED
  })

  showSaveAuditModal.value = false
}

function handleSendAudit () {
  recordStore.updateInfo({
    certification_state: CertificationState.PENDING_CERTIFICATION
  })
}

function handleCertify ({ patch }) {
  recordStore.updateInfo({
    ...patch,
    certification_state: CertificationState.CERTIFIED
  })

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
      v-if="permissions.isAgri && record.certification_state !== CertificationState.OPERATOR_DRAFT"
      class="fr-alert fr-alert--info fr-alert--sm fr-mb-2w"
  >
    <p class="fr-text--sm">Votre parcellaire est en cours de certification, vous ne pouvez pas modifier les données.</p>
  </div>

  <!-- OC -->


  <div class="fr-callout fr-callout--blue-ecume fr-mb-2w" v-if="permissions.isOc && record.audit_notes">
    <h3 class="fr-callout__title">Notes finales de l'audit</h3>

    <div v-html="record.audit_notes" />
  </div>


  <div class="fr-callout fr-callout--blue-ecume fr-mb-2w" v-if="canEndAudit && record.certification_state === CertificationState.OPERATOR_DRAFT">
    <h3 class="fr-callout__title">Parcellaire complet <span aria-hidden="true">🎉</span></h3>

    <button
        v-if="permissions.canSaveAudit"
        class="fr-btn"
        @click="showSaveAuditModal = true"
    >Terminer l'audit</button>
    <span v-else>L'auditeur doit maintenant terminer l'audit.</span>
  </div>

  <div class="fr-callout fr-callout--blue-ecume fr-mb-2w" v-else-if="canEndAudit && record.certification_state === CertificationState.AUDITED">
    <h3 class="fr-callout__title">Audit terminé</h3>

    <button
        v-if="permissions.canSendAudit"
        class="fr-btn"
        @click="handleSendAudit"
    >Soumettre pour certification</button>
    <span v-else>L'auditeur doit maintenant soumettre l'audit pour certification.</span>
  </div>

  <div class="fr-callout fr-callout--blue-ecume fr-mb-2w" v-else-if="canEndAudit && record.certification_state === CertificationState.PENDING_CERTIFICATION">
    <h3 class="fr-callout__title">Certification en cours</h3>

    <button
        v-if="permissions.canCertify"
        class="fr-btn" @click="showCertificationModal = true"
    >Certifier le parcellaire</button>
    <span v-else>Le chargé de certification doit maintenant certifier le parcellaire.</span>
  </div>

  <Teleport to="body">
    <SaveAuditModal :operator="operator" :record="record" v-if="showSaveAuditModal" @close="showSaveAuditModal = false" @submit="handleSaveAudit" />
    <CertificationModal :operator="operator" :record="record" v-if="showCertificationModal" @close="showCertificationModal = false" @submit="handleCertify" />
  </Teleport>
</template>

<style scoped>

</style>
