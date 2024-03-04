import { useOperatorStore, useRecordStore, useUserStore } from "@/stores/index.js"
import { ROLES } from "@/stores/user.js"
import { CERTIFICATION_STATE } from "@/referentiels/ab.js"
import { computed } from "vue"
import { defineStore } from "pinia"

export const usePermissions = defineStore('permissions', () => {
  const userStore = useUserStore();
  const recordStore = useRecordStore();
  const operatorStore = useOperatorStore();

  // Tests

  function canEditParcellaire () {
    if (isOc.value) {
      return true;
    }

    if (isAgri.value) {
      return recordStore.record.certification_state === CERTIFICATION_STATE.OPERATOR_DRAFT;
    }

    return false;
  }

  function $reset () {
    userStore.$reset()
    recordStore.$reset()
  }

  // Returned permissions

  const isOc = computed(() => {
    return [ROLES.OC_CERTIF, ROLES.OC_AUDIT]
        .some(role => userStore.roles.includes(role));
  })

  const isAgri = computed(() => {
    return userStore.roles.includes(ROLES.OPERATEUR);
  })

  const canAddParcelle = computed(() => {
    return canEditParcellaire();
  })

  const canDeleteFeature = computed(() => {
    return canEditParcellaire();
  })

  const canDeleteParcellaire = computed(() => {
    return canEditParcellaire();
  })

  const canCreateVersion = computed(() => {
    return operatorStore.records?.length && canEditParcellaire();
  })

  const canChangeCulture = computed(() => {
    return canEditParcellaire();
  })

  const canChangeGeometry = computed(() => {
    return canEditParcellaire();
  })

  const canAddParcelleNote = computed(() => {
    return Boolean(recordStore.record.certification_state);
  })

  const canChangeConversionLevel = computed(() => {
    return isOc.value;
  })

  const canSaveAudit = computed(() => {
    return userStore.roles.includes(ROLES.OC_AUDIT);
  })

  const canSendAudit = computed(() => {
    return userStore.roles.includes(ROLES.OC_AUDIT);
  })

  const canCertify = computed(() => {
    return userStore.roles.includes(ROLES.OC_CERTIF);
  })

  const canAddAnnotations = computed(() => isOc.value)
  const canViewAnnotations = computed(() => isOc.value)
  const canExportAnnotations = computed(() => isOc.value)

  return {
    isOc,
    isAgri,
    canAddAnnotations,
    canExportAnnotations,
    canViewAnnotations,
    canAddParcelle,
    canDeleteFeature,
    canDeleteParcellaire,
    canCreateVersion,
    canChangeCulture,
    canChangeGeometry,
    canAddParcelleNote,
    canChangeConversionLevel,
    canSaveAudit,
    canSendAudit,
    canCertify,
    $reset
  }
})
