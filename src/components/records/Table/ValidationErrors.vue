<template>
  <div>
    <div
      class="fr-grid-row fr-px-4v fr-py-4v groupe-notifications"
      tabindex="0"
      aria-expanded="open"
      :aria-controls="`group-content-notifications`"
      :class="{ 'groupe-titre-on': open }"
      @click.stop="open = !open"
      @keydown.enter="open = !open"
    >
      <div class="fr-grid-row groupe-titre">
        <b class="fr-text--lg font-blue fr-mb-0">Notifications</b>
      </div>
      <div class="fr-grid-row gap-10 actions-notifications">
        <span class="color-green fr-mb-0 bg-bourgeon fr-px-1v fr-text--sm fr-text--bold count">
          <span class="fr-icon fr-icon-notification-3-line fr-icon--sm color-green" aria-hidden="true"></span>
          {{ countNotif }}
        </span>
        <span class="fr-icon fr-icon-arrow-down-s-line font-blue" :aria-checked="open" aria-role="button" />
      </div>
    </div>

    <div :hidden="!open" class="notifications-content fr-mx-4v fr-mb-2v">
      <div
        v-for="[ruleId, result] in featuresSet.required"
        :key="ruleId"
        class="notification notification-item fr-p-3v fr-mt-2v"
      >
        <div class="left-block">
          <p class="error-text fr-mb-0 fr-px-1v fr-text--sm fr-text--bold">
            <span class="fr-icon fr-icon-warning-line fr-icon--sm fr-mr-1v" aria-hidden="true"></span>
            {{ result.count }} parcelle{{ result.count > 1 ? "s" : "" }}
          </p>
          <h4 class="fr-text--sm fr-mb-0 notification-label" :title="result.label">
            {{ result.label }}
          </h4>
        </div>
        <button
          class="fr-btn fr-btn--tertiary-no-outline fr-btn--sm"
          :aria-label="`${result.errorMessage} pour ${result.count} parcelle${result.count > 1 ? 's' : ''}`"
          @click.stop="selectParcelles(ruleId)"
        >
          Afficher
        </button>
      </div>

      <div
        v-for="[ruleId, result] in featuresSet.rotationErrors"
        :key="ruleId"
        class="notification-item fr-p-3v fr-mt-2v notification"
      >
        <div class="left-block">
          <p class="warning-text fr-mb-0 fr-px-1v fr-text--sm fr-text--bold">
            <i class="ri-exchange-funds-line fr-mr-1v" aria-hidden="true"></i>
            {{ result.count }} parcelle{{ result.count > 1 ? "s" : "" }}
          </p>
          <h4 class="fr-text--sm fr-mb-0 notification-label" :title="result.label">
            {{ result.label }}
          </h4>
        </div>
        <button
          class="fr-btn fr-btn--tertiary-no-outline fr-btn--sm"
          :aria-label="`${result.errorMessage} pour ${result.count} parcelle${result.count > 1 ? 's' : ''}`"
          @click.stop="selectParcelles(ruleId)"
        >
          Afficher
        </button>
      </div>

      <div
        v-if="record.record_id !== operatorStore.records?.[0]?.record_id"
        class="notification notification-item fr-p-3v fr-mt-2v"
      >
        <div class="left-block">
          <p class="notifications-icon fr-mb-0 fr-px-1v fr-text--sm fr-text--bold">
            <span class="fr-icon fr-icon-notification-3-line fr-icon--sm fr-mr-1v" aria-hidden="true"></span>1
          </p>
          <h4 class="fr-text--sm fr-mb-0">Cette version du parcellaire n'est pas la plus récente.</h4>
        </div>
      </div>

      <div v-if="showAgriPendingCertificationState()" class="notification notification-item fr-p-3v fr-mt-2v">
        <div class="left-block">
          <p class="notifications-icon fr-mb-0 fr-px-1v fr-text--sm fr-text--bold">
            <span class="fr-icon fr-icon-notification-3-line fr-icon--sm fr-mr-1v" aria-hidden="true"></span>1
          </p>
          <h4 class="fr-text--sm fr-mb-0">
            Votre parcellaire est en cours de certification, vous ne pouvez plus modifier les données.
          </h4>
        </div>
      </div>

      <div v-if="showOCPendingCertificationState()" class="notification notification-item fr-p-3v fr-mt-2v">
        <div class="left-block">
          <p class="notifications-icon fr-mb-0 fr-px-1v fr-text--sm fr-text--bold">
            <span class="fr-icon fr-icon-notification-3-line fr-icon--sm fr-mr-1v" aria-hidden="true"></span>1
          </p>
          <h4 class="fr-text--sm fr-mb-0">Le chargé de certification doit maintenant certifier le parcellaire.</h4>
        </div>
      </div>

      <div v-if="showAgriCertifiedState()" class="notification notification-item fr-p-3v fr-mt-2v">
        <div class="left-block">
          <p class="notifications-icon fr-mb-0 fr-px-1v fr-text--sm fr-text--bold">
            <span class="fr-icon fr-icon-notification-3-line fr-icon--sm fr-mr-1v" aria-hidden="true"></span>1
          </p>
          <h4 class="fr-text--sm fr-mb-0">
            Votre parcellaire a été certifié, vous ne pouvez plus modifier les données.
          </h4>
        </div>
      </div>

      <div v-if="showOCCertifiedState()" class="notification notification-item fr-p-3v fr-mt-2v">
        <div class="left-block">
          <p class="notifications-icon fr-mb-0 fr-px-1v fr-text--sm fr-text--bold">
            <span class="fr-icon fr-icon-notification-3-line fr-icon--sm fr-mr-1v" aria-hidden="true"></span>1
          </p>
          <h4 class="fr-text--sm fr-mb-0">Ce parcellaire a été certifié, vous ne pouvez plus modifier les données.</h4>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from "vue";
import { useFeaturesSetsStore } from "@/stores/features-sets.js";
import { useOperatorStore } from "@/stores/operator";
import { useRecordStore } from "@/stores/record";
import { statsPush } from "@/stats.js";
import { useUserStore } from "@/stores/user";
import { CertificationState } from "@agencebio/cartobio-types";

const emit = defineEmits(["switch-tab"]);

const operatorStore = useOperatorStore();
const recordStore = useRecordStore();
const featuresSet = useFeaturesSetsStore();
const userStore = useUserStore();

const isAgri = computed(() => userStore.isAgri);

const { record } = recordStore;
const countNotif = computed(() => {
  return (
    (featuresSet.required.size ?? 0) +
    (featuresSet.rotationErrors.size ?? 0) +
    +(record.record_id !== operatorStore.records?.[0]?.record_id) +
    +showAgriPendingCertificationState() +
    +showOCPendingCertificationState() +
    +showAgriCertifiedState() +
    +showOCCertifiedState()
  );
});

const open = ref(false);

function selectParcelles(id) {
  featuresSet.toggle(id);

  if (featuresSet.isToggled(id)) {
    statsPush(["trackEvent", "Filtre parcelles", id]);
  }
  emit("switch-tab");
}

function showAgriPendingCertificationState() {
  return (
    isAgri.value &&
    [CertificationState.PENDING_CERTIFICATION, CertificationState.AUDITED].includes(record.certification_state)
  );
}

function showOCPendingCertificationState() {
  return (
    userStore.isOcAudit &&
    !userStore.isOcCertif &&
    [CertificationState.PENDING_CERTIFICATION].includes(record.certification_state)
  );
}

function showAgriCertifiedState() {
  return isAgri.value && [CertificationState.CERTIFIED].includes(record.certification_state);
}

function showOCCertifiedState() {
  return (
    userStore.isOcAudit && !userStore.isOcCertif && [CertificationState.CERTIFIED].includes(record.certification_state)
  );
}
</script>

<style scoped>
.groupe-notifications {
  gap: 12px;
  justify-content: space-between;
  border-top: 1px solid var(--artwork-decorative-blue-france);
  cursor: pointer;

  .groupe-titre {
    color: var(--light-decisions-text-text-action-high-blue-france, #000091);
    gap: 7px;
  }

  .actions-notifications {
    align-content: center;
  }
}

.groupe-titre-on {
  background-color: var(--blue-france-925-125);
}

.groupe-notifications:hover {
  background-color: var(--blue-france-925-125-hover);
}

.fr-icon[aria-checked="true"]::before {
  transform: rotate(180deg);
}

.gap-10 {
  gap: 10px;
}

.font-blue {
  color: var(--light-decisions-text-text-action-high-blue-france, #000091);
}

.notifications-content {
  .notification-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-bottom: 1px solid var(--light-decisions-artwork-artwork-decorative-blue-france, #ececfe);
    background: var(--light-decisions-background-background-default-grey, #fff);
  }
}

.left-block {
  gap: 8px;
  display: flex;
  align-items: center;
  flex: 1;
  min-width: 0;
}

.notification-label {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  min-width: 0;
}

.error-text {
  text-transform: uppercase;
  color: var(--text-default-error);
  background-color: var(--red-marianne-925-125);
  border-radius: 4px;
  flex-shrink: 0;
}

.warning-text {
  text-transform: uppercase;
  background-color: rgba(254, 236, 194, 1);
  border-radius: 4px;
  flex-shrink: 0;
}

.notifications-icon {
  color: var(--blue-ecume-sun-247-moon-675);
  background-color: var(--blue-ecume-925-125);
  white-space: nowrap;
  border-radius: 4px;
}

.color-green {
  color: var(--green-bourgeon-sun-425-moon-759);
}

.bg-bourgeon {
  background-color: var(--green-bourgeon-975-75);
  border-radius: 4px;
}

.count {
  display: flex;
  align-items: center;
  gap: 4px;
}
</style>
