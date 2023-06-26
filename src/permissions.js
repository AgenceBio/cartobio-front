import { useRecordStore, useUserStore } from "@/stores/index.js"
import { ROLES } from "@/stores/user.js"
import { CERTIFICATION_STATE } from "@/referentiels/ab.js"
import { computed } from "vue"

export const usePermissions = () => {
  const userStore = useUserStore();
  const recordStore = useRecordStore();

  // Tests

  const isOc = () => {
    return userStore.role === ROLES.OC;
  }

  const isAgri = () => {
    return userStore.role === ROLES.OPERATEUR;
  }

  const canEditParcellaire = () => {
    if (isOc()) {
      return true;
    }

    if (isAgri()) {
      console.log(recordStore.record.certification_state)
      return recordStore.record.certification_state === CERTIFICATION_STATE.OPERATOR_DRAFT;
    }

    return false;
  }

  // Returned permissions

  const canAddParcelle = computed(() => {
    return canEditParcellaire();
  })

  const canDeleteParcellaire = computed(() => {
    return canEditParcellaire();
  })

  const canChangeCulture = computed(() => {
    return canEditParcellaire();
  })

  const canAddParcelleNote = computed(() => {
    return Boolean(recordStore.record.certification_state);
  })

  const canChangeConversionLevel = computed(() => {
    return isOc()
  })

  return {
    canAddParcelle,
    canDeleteParcellaire,
    canChangeCulture,
    canAddParcelleNote,
    canChangeConversionLevel
  }
}
