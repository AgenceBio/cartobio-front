import { useRecordStore } from "@/stores/record.js";
import { useUserStore } from "@/stores/user.js";
import { computed } from "vue";
import { defineStore } from "pinia";
import { CertificationState } from "@agencebio/cartobio-types";

export const usePermissions = defineStore("permissions", () => {
  const userStore = useUserStore();
  const recordStore = useRecordStore();

  // proxy the values so as they can be overriden by unit tests
  const isOc = computed(() => userStore.isOc);
  const isAgri = computed(() => userStore.isAgri);

  // Tests

  const canEditParcellaire = computed(() => {
    if (isOc.value) {
      return true;
    }

    if (isAgri.value) {
      return recordStore.record.certification_state === CertificationState.OPERATOR_DRAFT;
    }

    return false;
  });

  function $reset() {
    userStore.$reset();
    recordStore.$reset();
  }

  // Returned permissions
  const canAddParcelle = canEditParcellaire;

  const canDeleteFeature = canEditParcellaire;

  const canDeleteParcellaire = canEditParcellaire;

  const canCreateVersion = computed(() => isOc.value || isAgri.value);
  const canEditVersion = computed(() => canEditParcellaire.value);

  const canChangeCulture = canEditParcellaire;
  const canChangeGeometry = canEditParcellaire;

  const canAddParcelleNote = computed(() => {
    return Boolean(recordStore.record.certification_state);
  });

  const canChangeConversionLevel = isOc;

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
    startPage: computed(() => userStore.startPage),
    //
    canAddAnnotations,
    canExportAnnotations,
    canViewAnnotations,
    canAddParcelle,
    canDeleteFeature,
    canDeleteParcellaire,
    canEditParcellaire,
    canCreateVersion,
    canEditVersion,
    canChangeCulture,
    canChangeGeometry,
    canAddParcelleNote,
    canChangeConversionLevel,
    canSaveAudit,
    canSendAudit,
    canChangeAuditDate,
    canChangeCertificationDate,
    canCertify,
    $reset,
  };
});
