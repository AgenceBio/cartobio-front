import { useRecordStore } from "@/stores/record.js";
import { useUserStore } from "@/stores/user.js";
import { computed } from "vue";
import { defineStore } from "pinia";
import { CertificationState } from "@agencebio/cartobio-types";
import { useOperatorStore } from "./operator";

export const usePermissions = defineStore("permissions", () => {
  const userStore = useUserStore();
  const recordStore = useRecordStore();
  const operatorStore = useOperatorStore();

  // proxy the values so as they can be overriden by unit tests
  const isOc = computed(() => userStore.isOc);
  const isAgri = computed(() => userStore.isAgri);

  function canEditRecord(record) {
    if (isOc.value && (record.oc_id === null || record.oc_id === userStore.user?.organismeCertificateur?.id)) {
      if (record.certification_state !== CertificationState.CERTIFIED || canCertify.value) {
        return true;
      }
    }

    if (isAgri.value) {
      return record.certification_state === CertificationState.OPERATOR_DRAFT;
    }

    return false;
  }

  // Tests
  const canEditParcellaire = computed(() => {
    return canEditRecord(recordStore.record);
  });

  function $reset() {
    userStore.$reset();
    recordStore.$reset();
  }

  // Returned permissions
  const canAddParcelle = canEditParcellaire;

  const canDeleteFeature = canEditParcellaire;

  const canDeleteParcellaire = canEditParcellaire;

  const canCreateVersion = computed(
    () =>
      (isOc.value || isAgri.value) &&
      operatorStore.operator.notifications?.etatCertification !== "ARRETEE" &&
      operatorStore.operator.notifications?.etatCertification !== "RETIREE",
  );
  const canEditVersion = canEditParcellaire;

  const canChangeCulture = canEditParcellaire;
  const canChangeGeometry = canEditParcellaire;

  const canChangeConversionLevel = computed(() => isOc.value && canEditParcellaire.value);

  const canSaveAudit = computed(() => Boolean(userStore.isOcAudit));
  const canSendAudit = computed(() => Boolean(userStore.isOcAudit));
  const canCertify = computed(() => Boolean(userStore.isOcCertif));
  const canChangeAuditDate = isOc;
  const canChangeCertificationDate = computed(() => Boolean(userStore.isOcCertif));
  const canAddAnnotations = isOc;
  const canViewAnnotations = isOc;
  const canExportAnnotations = isOc;

  return {
    // convenience proxy
    isOc,
    isAgri,
    //
    canAddAnnotations,
    canExportAnnotations,
    canViewAnnotations,
    canAddParcelle,
    canDeleteFeature,
    canDeleteParcellaire,
    canEditRecord,
    canEditParcellaire,
    canCreateVersion,
    canEditVersion,
    canChangeCulture,
    canChangeGeometry,
    canChangeConversionLevel,
    canSaveAudit,
    canSendAudit,
    canChangeAuditDate,
    canChangeCertificationDate,
    canCertify,
    $reset,
  };
});
