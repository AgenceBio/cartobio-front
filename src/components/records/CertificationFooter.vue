<script setup>
import { computed, ref } from "vue";
import { useFeaturesSetsStore } from "@/stores/features-sets.js";
import { useOperatorStore } from "@/stores/operator.js";
import { usePermissions } from "@/stores/permissions.js";
import { useRecordStore } from "@/stores/record.js";
import CertificationModal from "@/components/forms/CertificationForm.vue";
import SaveAuditModal from "@/components/forms/SaveAuditForm.vue";
import { CertificationState } from "@agencebio/cartobio-types";

const recordStore = useRecordStore();
const operatorStore = useOperatorStore();
const featuresSets = useFeaturesSetsStore();
const permissions = usePermissions();
const { record } = recordStore;
const { operator } = operatorStore;

const showSaveAuditModal = ref(false);
const showCertificationModal = ref(false);

const canEndAudit = computed(
  () => permissions.canEditParcellaire && permissions.isOc && recordStore.hasFeatures && !featuresSets.hasRequiredSets,
);

function handleSaveAudit({ patch }) {
  recordStore.updateInfo({
    ...patch,
    certification_state: CertificationState.AUDITED,
    audit_date: new Date().toISOString().split("T")[0],
  });

  showSaveAuditModal.value = false;
}

function handleSendAudit() {
  recordStore.updateInfo({
    certification_state: CertificationState.PENDING_CERTIFICATION,
  });
}

function handleCertify({ patch }) {
  recordStore.updateInfo({
    ...patch,
    certification_state: CertificationState.CERTIFIED,
  });

  showCertificationModal.value = false;
}
</script>

<template>
  <div class="fr-grid-row fr-p-8v justify-end banner">
    <template v-if="canEndAudit && record.certification_state === CertificationState.OPERATOR_DRAFT">
      <button v-if="permissions.canSaveAudit" class="fr-btn" @click="showSaveAuditModal = true">
        Terminer l'audit
      </button>
    </template>
    <template v-else-if="canEndAudit && record.certification_state === CertificationState.AUDITED">
      <button v-if="permissions.canSendAudit" class="fr-btn" @click="handleSendAudit">
        Soumettre pour certification
      </button>
    </template>
    <template v-else-if="canEndAudit && record.certification_state === CertificationState.PENDING_CERTIFICATION">
      <button v-if="permissions.canCertify" class="fr-btn" @click="showCertificationModal = true">
        Certifier le parcellaire
      </button>
    </template>
  </div>
  <Teleport to="body">
    <SaveAuditModal v-if="showSaveAuditModal" @close="showSaveAuditModal = false" @submit="handleSaveAudit" />
    <CertificationModal
      :operator="operator"
      :record="record"
      v-if="showCertificationModal"
      @close="showCertificationModal = false"
      @submit="handleCertify"
    />
  </Teleport>
</template>

<style scoped>
.justify-end {
  justify-content: flex-end;
}

.banner {
  position: absolute;
  width: 100%;
  background-color: white;
  border-top: 1px solid var(--grey-900-175);
  transform: translateY(-100%); /** TMP: en attendant le vrai layout */
}
</style>
