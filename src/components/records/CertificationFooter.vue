<script setup>
import { computed, ref, onUnmounted, watch } from "vue";
import { useFeaturesSetsStore } from "@/stores/features-sets.js";
import { useOperatorStore } from "@/stores/operator.js";
import { usePermissions } from "@/stores/permissions.js";
import { useRecordStore } from "@/stores/record.js";
import { useCartoBioStorage } from "@/stores/storage.js";
import CertificationModal from "@/components/forms/CertificationForm.vue";
import SaveAuditModal from "@/components/forms/SaveAuditForm.vue";
import { CertificationState } from "@agencebio/cartobio-types";
import { getTimeAgo } from "@/utils/record";
import { useOnline } from "@vueuse/core";

const isOnline = useOnline();

const storage = useCartoBioStorage();
const recordStore = useRecordStore();
const operatorStore = useOperatorStore();
const featuresSets = useFeaturesSetsStore();
const permissions = usePermissions();
const { record } = recordStore;
const { operator } = operatorStore;

const showSaveAuditModal = ref(false);
const showCertificationModal = ref(false);
const saveAuditAndSubmit = ref(false);

const canEndAudit = computed(
  () => permissions.canEditParcellaire && permissions.isOc && recordStore.hasFeatures && !featuresSets.hasRequiredSets,
);

function handleSaveAudit({ patch }) {
  recordStore.updateInfo({
    ...patch,
    certification_state: saveAuditAndSubmit.value
      ? CertificationState.PENDING_CERTIFICATION
      : CertificationState.AUDITED,
    audit_date: new Date().toISOString().split("T")[0],
  });
  saveAuditAndSubmit.value = false;
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

const timeAgo = ref(getTimeAgo(record));

const interval = setInterval(() => {
  timeAgo.value = getTimeAgo(record);
}, 60000);

const isQueueEmpty = computed(() => {
  return Object.keys(storage.syncQueues).length > 0 ? false : true;
});

watch(
  () => isQueueEmpty.value,
  (newValue) => {
    if (newValue && isOnline) {
      timeAgo.value = getTimeAgo(record);
    }
  },
);

onUnmounted(() => {
  clearInterval(interval);
});
</script>

<template>
  <div class="fr-grid-row fr-py-8v banner" style="display: flex; justify-content: space-between; align-items: center">
    <p style="margin: 0; text-align: left; padding: 4px 12px" class="fr-hint-text">Enregistré {{ timeAgo }}</p>

    <div>
      <template v-if="record.certification_state === CertificationState.OPERATOR_DRAFT">
        <button
          v-if="permissions.canSaveAudit && permissions.isOc"
          :disabled="!canEndAudit"
          class="fr-btn fr-ml-1v fr-btn--icon-right fr-btn--sm"
          @click="
            () => {
              showSaveAuditModal = true;
              saveAuditAndSubmit = true;
            }
          "
        >
          Terminer et soumettre <i class="ri-send-plane-line fr-ml-2v"></i>
        </button>
        <button
          v-if="permissions.canSaveAudit"
          :disabled="!canEndAudit"
          class="fr-btn fr-btn--secondary fr-ml-1v fr-icon-check-line fr-btn--icon-right fr-btn--sm"
          @click="
            () => {
              showSaveAuditModal = true;
              saveAuditAndSubmit = false;
            }
          "
        >
          Terminer
        </button>
      </template>
      <template v-else-if="record.certification_state === CertificationState.AUDITED">
        <button
          v-if="permissions.canSendAudit"
          :disabled="!canEndAudit"
          class="fr-btn fr-icon-check-line fr-btn--icon-right fr-btn--sm"
          @click="handleSendAudit"
        >
          Soumettre pour certification
        </button>
      </template>
      <template v-else-if="record.certification_state === CertificationState.PENDING_CERTIFICATION">
        <button
          v-if="permissions.canCertify"
          :disabled="!canEndAudit"
          class="fr-btn fr-icon-check-line fr-btn--icon-right fr-btn--sm"
          @click="showCertificationModal = true"
        >
          Certifier le parcellaire
        </button>
      </template>
    </div>
  </div>

  <Teleport to="body">
    <SaveAuditModal
      v-if="showSaveAuditModal"
      @close="
        () => {
          showSaveAuditModal = false;
          saveAuditAndSubmit = false;
        }
      "
      @submit="handleSaveAudit"
    />
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
  width: 100%;
  background-color: white;
  border-top: 1px solid var(--grey-900-175);
}
</style>
