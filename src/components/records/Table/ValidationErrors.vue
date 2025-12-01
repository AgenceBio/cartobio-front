<template>
  <div>
    <div
      class="fr-grid-row fr-grid-row--middle notif-title"
      :class="{ 'fr-pb-4v': open }"
      @click.stop="open = !open"
      @keydown.enter="open = !open"
    >
      <h3 class="fr-text--lg fr-mb-0">Notifications</h3>
      <div class="fr-grid-row icons">
        <p class="color-green bg-bourgeon fr-px-1v fr-text--sm fr-text--bold count">
          <span class="fr-icon fr-icon-notification-3-line fr-icon--sm color-green" aria-hidden="true"></span>
          {{ countNotif }}
        </p>
        <span v-if="!open" class="fr-icon fr-icon-add-line fr-icon--sm color-green" aria-hidden="true"></span>
        <span v-else class="fr-icon fr-icon-subtract-line fr-icon--sm color-green" aria-hidden="true"></span>
      </div>
    </div>
    <div :hidden="!open">
      <!-- OPERATEUR : parcellaire AUDITED ou PENDING_CERTIFICATION -->
      <div
        v-if="
          permissions.isAgri &&
          (record.certification_state === CertificationState.AUDITED ||
            record.certification_state === CertificationState.PENDING_CERTIFICATION)
        "
        class="fr-grid-row fr-grid-row--middle notification fr-p-3v fr-mb-2v"
      >
        <div class="fr-grid-row fr-grid-row--middle left-block">
          <p class="notifications-icon fr-mb-0 fr-px-1v">
            <span class="fr-icon fr-icon-notification-3-line fr-icon--sm fr-mr-1v"></span>1
          </p>
          <h4 class="fr-text--md fr-mb-0">
            Votre parcellaire est en cours de certification, vous ne pouvez plus modifier les données.
          </h4>
        </div>
      </div>

      <!-- OPERATEUR : parcellaire CERTIFIED -->
      <div
        v-if="permissions.isAgri && record.certification_state === CertificationState.CERTIFIED"
        class="fr-grid-row fr-grid-row--middle notification fr-p-3v fr-mb-2v"
      >
        <div class="fr-grid-row fr-grid-row--middle left-block">
          <p class="notifications-icon fr-mb-0 fr-px-1v">
            <span class="fr-icon fr-icon-notification-3-line fr-icon--sm fr-mr-1v"></span>1
          </p>
          <h4 class="fr-text--md fr-mb-0">
            Votre parcellaire a été certifié, vous ne pouvez plus modifier les données.
          </h4>
        </div>
      </div>

      <!-- AUDITEUR : parcellaire CERTIFIED -->
      <div
        v-if="permissions.isOc && userStore.isOcAudit && record.certification_state === CertificationState.CERTIFIED"
        class="fr-grid-row fr-grid-row--middle notification fr-p-3v fr-mb-2v"
      >
        <div class="fr-grid-row fr-grid-row--middle left-block">
          <p class="notifications-icon fr-mb-0 fr-px-1v">
            <span class="fr-icon fr-icon-notification-3-line fr-icon--sm fr-mr-1v"></span>1
          </p>
          <h4 class="fr-text--md fr-mb-0">Ce parcellaire a été certifié, vous ne pouvez plus modifier les données.</h4>
        </div>
      </div>

      <!-- AUDITEUR : parcellaire PENDING_CERTIFICATION -->
      <div
        v-if="
          permissions.isOc &&
          userStore.isOcAudit &&
          record.certification_state === CertificationState.PENDING_CERTIFICATION
        "
        class="fr-grid-row fr-grid-row--middle notification fr-p-3v fr-mb-2v"
      >
        <div class="fr-grid-row fr-grid-row--middle left-block">
          <p class="notifications-icon fr-mb-0 fr-px-1v">
            <span class="fr-icon fr-icon-notification-3-line fr-icon--sm fr-mr-1v"></span>1
          </p>
          <h4 class="fr-text--md fr-mb-0">
            Certification en cours : Le chargé de certification doit maintenant certifier le parcellaire.
          </h4>
        </div>
      </div>

      <div
        v-for="[ruleId, result] in featuresSet.required"
        :key="ruleId"
        class="fr-grid-row fr-grid-row--middle notification fr-p-3v fr-mb-2v"
        style="flex-wrap: nowrap"
      >
        <div class="fr-grid-row fr-grid-row--middle left-block" style="flex: 1; min-width: 0; flex-wrap: nowrap">
          <p class="error-text fr-mb-0 fr-px-1v fr-text--sm fr-text--bold" style="flex-shrink: 0">
            <span class="fr-icon fr-icon-warning-line fr-icon--sm fr-mr-1v" aria-hidden="true"></span
            >{{ result.count }} parcelle{{ result.count > 1 ? "s" : "" }}
          </p>
          <h4
            class="fr-text--sm fr-mb-0"
            style="overflow: hidden; text-overflow: ellipsis; white-space: nowrap; min-width: 0"
            :title="result.label"
          >
            {{ result.label }}
          </h4>
        </div>
        <button
          class="fr-btn fr-btn--tertiary-no-outline fr-icon-search-line fr-btn--icon-right"
          :aria-label="`${result.errorMessage} pour ${result.count} parcelle${result.count > 1 ? 's' : ''}`"
          @click="selectParcelles(ruleId)"
          style="flex-shrink: 0"
        >
          Afficher
        </button>
      </div>
      <div
        v-for="[ruleId, result] in featuresSet.rotationErrors"
        :key="ruleId"
        class="fr-grid-row fr-grid-row--middle notification fr-p-3v fr-mb-2v"
        style="flex-wrap: nowrap"
      >
        <div class="fr-grid-row fr-grid-row--middle left-block" style="flex: 1; min-width: 0; flex-wrap: nowrap">
          <p class="warning-text fr-mb-0 fr-px-1v fr-text--sm fr-text--bold" style="flex-shrink: 0">
            <span class="fr-icon fr-icon-warning-line fr-icon--sm fr-mr-1v" aria-hidden="true"></span
            >{{ result.count }} parcelle{{ result.count > 1 ? "s" : "" }}
          </p>
          <h4
            class="fr-text--sm fr-mb-0"
            style="overflow: hidden; text-overflow: ellipsis; white-space: nowrap; min-width: 0"
            :title="result.label"
          >
            {{ result.label }}
          </h4>
        </div>
        <button
          class="fr-btn fr-btn--tertiary-no-outline fr-icon-search-line fr-btn--icon-right"
          :aria-label="`${result.errorMessage} pour ${result.count} parcelle${result.count > 1 ? 's' : ''}`"
          @click="selectParcelles(ruleId)"
          style="flex-shrink: 0"
        >
          Afficher
        </button>
      </div>

      <div
        v-if="record.record_id !== operatorStore.records?.[0]?.record_id"
        class="fr-grid-row fr-grid-row--middle notification fr-p-3v fr-mb-2v"
      >
        <div class="fr-grid-row fr-grid-row--middle left-block">
          <p class="notifications-icon fr-mb-0 fr-px-1v">
            <span class="fr-icon fr-icon-notification-3-line fr-icon--sm fr-mr-1v" aria-hidden="true"></span>1
          </p>
          <h4 class="fr-text--md fr-mb-0">Cette version du parcellaire n'est pas la plus récente.</h4>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from "vue";
import { useFeaturesSetsStore } from "@/stores/features-sets.js";
import { useOperatorStore } from "@/stores/operator";
import { useUserStore } from "@/stores/user.js";
import { useRecordStore } from "@/stores/record";
import { statsPush } from "@/stats.js";
import { usePermissions } from "@/stores/permissions.js";

import { CertificationState } from "@agencebio/cartobio-types";

const emit = defineEmits(["switch-tab"]);

const operatorStore = useOperatorStore();
const recordStore = useRecordStore();
const userStore = useUserStore();
const permissions = usePermissions();

const featuresSet = useFeaturesSetsStore();

const isOc = computed(() => userStore.isOc);
const isAgri = computed(() => userStore.isAgri);

const { record } = recordStore;
const countNotif = computed(() => {
  let count = 0;

  count += featuresSet.required.size ?? 0;
  count += featuresSet.rotationErrors.size ?? 0;

  count += +(record.record_id !== operatorStore.records?.[0]?.record_id);

  if (
    permissions.isAgri &&
    (record.certification_state === CertificationState.AUDITED ||
      record.certification_state === CertificationState.PENDING_CERTIFICATION)
  ) {
    count++;
  }

  if (permissions.isAgri && record.certification_state === CertificationState.CERTIFIED) {
    count++;
  }

  if (permissions.isOc && userStore.isOcAudit && record.certification_state === CertificationState.CERTIFIED) {
    count++;
  }

  if (
    permissions.isOc &&
    userStore.isOcAudit &&
    record.certification_state === CertificationState.PENDING_CERTIFICATION
  ) {
    count++;
  }

  return count;
});

const open = ref(countNotif.value > 0 ? true : false);

function selectParcelles(id) {
  featuresSet.toggle(id);

  if (featuresSet.isToggled(id)) {
    statsPush(["trackEvent", "Filtre parcelles", id]);
  }
  emit("switch-tab");
}
</script>

<style scoped>
.notification {
  border: 1px solid var(--blue-france-950-100);
  justify-content: space-between;
}

.left-block {
  gap: 8px;
}

.error-text {
  text-transform: uppercase;
  color: var(--text-default-error);
  background-color: var(--red-marianne-925-125);
  border-radius: 4px;
}

.warning-text {
  text-transform: uppercase;
  background-color: rgba(254, 236, 194, 1);
}

.notifications-icon {
  color: var(--blue-ecume-sun-247-moon-675);
  background-color: var(--blue-ecume-925-125);
}

.color-green {
  color: var(--green-bourgeon-sun-425-moon-759);
}

.bg-bourgeon {
  background-color: var(--green-bourgeon-975-75);
}

.notif-title {
  justify-content: space-between;
  display: flex;
  align-items: center;
}

.icons {
  gap: 5px;
  display: flex;
  align-items: center;
}

.count {
  margin: auto;
}
</style>
