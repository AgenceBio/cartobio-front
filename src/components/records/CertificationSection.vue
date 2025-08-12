<script setup>
import { computed } from "vue";
import { isCertificationImmutable } from "@/referentiels/ab.js";
import { useFeaturesSetsStore } from "@/stores/features-sets.js";
import { usePermissions } from "@/stores/permissions.js";
import { useRecordStore } from "@/stores/record.js";
import { CertificationState } from "@agencebio/cartobio-types";
import { useUserStore } from "@/stores/user";

const recordStore = useRecordStore();
const featuresSets = useFeaturesSetsStore();
const permissions = usePermissions();
const { isOcAudit } = useUserStore();
const { record } = recordStore;

const displayCallout = computed(() => record.audit_demandes && isCertificationImmutable(record.certification_state));

const canEndAudit = computed(
  () => permissions.canEditParcellaire && permissions.isOc && recordStore.hasFeatures && !featuresSets.hasRequiredSets,
);
</script>

<template>
  <!-- //   <div class="demandes fr-callout fr-callout--blue-ecume fr-mb-2w" v-if="displayCallout">
//     <h3 class="fr-callout__title">Demandes formulées lors de l'audit</h3>

//     <div>{{ record.audit_demandes }}</div>
//   </div> -->

  <!-- Agri -->

  <div
    v-if="permissions.isAgri && record.certification_state !== CertificationState.OPERATOR_DRAFT"
    class="fr-alert fr-alert--info fr-alert--sm fr-mb-2w"
  >
    <p v-if="record.certification_state === CertificationState.CERTIFIED" class="fr-text--sm">
      Votre parcellaire a été certifié, vous ne pouvez plus modifier les données.
    </p>
    <p v-else class="fr-text--sm">
      Votre parcellaire est en cours de certification, vous ne pouvez plus modifier les données.
    </p>
  </div>

  <!-- OC -->
  <div
    v-if="
      permissions.isOc &&
      isOcAudit &&
      !permissions.canEditParcellaire &&
      record.certification_state === CertificationState.CERTIFIED
    "
    class="fr-alert fr-alert--info fr-alert--sm fr-mb-2w"
  >
    <p class="fr-text--sm">Le parcellaire a été certifié", vous ne pouvez plus modifier les données.</p>
  </div>
  <!-- <div class="fr-callout fr-callout--blue-ecume fr-mb-2w" v-if="permissions.isOc && record.audit_notes">
    <h3 class="fr-callout__title">Notes finales de l'audit</h3>

    <div>{{ record.audit_notes }}</div>
  </div> -->

  <div
    class="fr-callout fr-callout--blue-ecume fr-mb-2w"
    v-if="canEndAudit && record.certification_state === CertificationState.OPERATOR_DRAFT"
  >
    <h3 class="fr-callout__title">Parcellaire complet <span aria-hidden="true">🎉</span></h3>

    <span v-if="!permissions.canSaveAudit">L'auditeur doit maintenant terminer l'audit.</span>
  </div>

  <div
    class="fr-callout fr-callout--blue-ecume fr-mb-2w"
    v-else-if="canEndAudit && record.certification_state === CertificationState.AUDITED"
  >
    <h3 class="fr-callout__title">Audit terminé</h3>

    <span v-if="!permissions.canSendAudit">L'auditeur doit maintenant soumettre l'audit pour certification.</span>
  </div>

  <div
    class="fr-callout fr-callout--blue-ecume fr-mb-2w"
    v-else-if="canEndAudit && record.certification_state === CertificationState.PENDING_CERTIFICATION"
  >
    <h3 class="fr-callout__title">Certification en cours</h3>

    <span v-if="!permissions.canCertify">Le chargé de certification doit maintenant certifier le parcellaire.</span>
  </div>
</template>

<style scoped></style>
