<template>
  <header class="fr-mb-2w">
    <div class="fr-grid-row fr-grid-row--middle header">
      <div class="fr-grid-row">
        <p class="fr-sr-only operator-name" :data-numerobio="operator.numeroBio">{{ operator.nom }}</p>
        <h2 class="fr-h4 fr-my-0 version-name">
          {{ record.version_name }}
        </h2>
        <template v-if="permissions.isOc">
          <button
            v-if="operatorStore.operator.epingle"
            class="fr-btn fr-btn--sm fr-btn--tertiary-no-outline ri-pushpin-fill"
            @click="unpin(operatorStore.operator.numeroBio)"
            aria-label="Désepingler le parcellaire"
          ></button>
          <button
            v-else
            class="fr-btn fr-btn--sm fr-btn--tertiary-no-outline ri-pushpin-line"
            @click="pin(operatorStore.operator.numeroBio)"
            aria-label="Epingler le parcellaire"
          ></button>
        </template>

        <p v-if="readonly" class="readonly-badge">Lecture seule</p>
      </div>
      <div class="fr-grid-row">
        <ActionDropdown v-if="hasFeatures && !readonly" with-icons icon-class="fr-icon-download-line fr-btn--sm">
          <ExportActions
            :operator="operator"
            :collection="collection"
            :record="record"
            @close="exportModal = false"
            :hasError="tags.filter((e) => e.errorMessage != undefined)"
          />
        </ActionDropdown>
        <ActionDropdown
          v-if="!disableActions && permissions.canEditVersion"
          with-icons
          icon-class="ri-more-2-line fr-btn--sm"
          icon-style="font-size: 1.2em"
        >
          <li v-if="!disableActions && permissions.canEditVersion">
            <button
              class="fr-btn fr-icon-edit-line fr-btn--tertiary-no-outline edit-version-info"
              @click="showEditVersionModal = true"
              aria-label="Modifier la version du parcellaire"
            >
              Modifier la version
            </button>
          </li>
          <li v-if="canDisplayHistory">
            <button
              class="history-action fr-btn fr-btn--tertiary-no-outline fr-btn--icon-left fr-icon-calendar-2-line"
              @click="historyModal = true"
              aria-label="Afficher l'historique des modifications"
            >
              Historique
            </button>
          </li>
        </ActionDropdown>
      </div>
    </div>

    <p class="state fr-subtitle">
      <ParcellaireState :record="record" />
    </p>
  </header>

  <Teleport to="body">
    <OperatorHistoryModal :record="record" :operator="operator" v-if="historyModal" @close="historyModal = false" />
    <DeleteParcellaireModal :record="record" v-if="deleteModal" @close="deleteModal = false" />
    <EditVersionModal v-if="showEditVersionModal" @close="showEditVersionModal = false" />
  </Teleport>
</template>

<script setup>
import { computed, ref } from "vue";
import { storeToRefs } from "pinia";

import ParcellaireState from "@/components/records/State.vue";
import OperatorHistoryModal from "@/components/records/HistoryModal/index.vue";
import DeleteParcellaireModal from "@/components/records/DeleteParcelaireModal.vue";

import { useFeaturesStore } from "@/stores/features.js";
import { useOperatorStore } from "@/stores/operator.js";
import { useFeaturesSetsStore } from "@/stores/features-sets.js";
import { useRecordStore } from "@/stores/record.js";
import { onClickOutside } from "@vueuse/core";
import EditVersionModal from "@/components/forms/EditVersionForm.vue";
import { usePermissions } from "@/stores/permissions.js";
import { useUserStore } from "@/stores/user";
import { pinOperator, unpinOperator } from "@/cartobio-api";
import ActionDropdown from "../widgets/ActionDropdown.vue";
import ExportActions from "./ExportActions.vue";

defineProps({
  disableActions: {
    type: Boolean,
    default: false,
  },
});

const exportModal = ref(false);
const historyModal = ref(false);
const deleteModal = ref(false);
const featuresStore = useFeaturesStore();
const operatorStore = useOperatorStore();
const recordStore = useRecordStore();
const userStore = useUserStore();
const permissions = usePermissions();
const { record } = recordStore;
const { operator } = operatorStore;
const featuresSets = useFeaturesSetsStore();
const { collection, hasFeatures } = storeToRefs(featuresStore);
const { tags } = storeToRefs(featuresSets);
const canDisplayHistory = computed(() => Array.isArray(record.audit_history) && record.audit_history.length);

const versionMenu = ref(false);
const versionMenuRef = ref(null);
const showEditVersionModal = ref(false);
const readonly = computed(
  () => permissions.isOc && record.oc_id != null && record.oc_id !== userStore.user?.organismeCertificateur?.id,
);
onClickOutside(versionMenuRef, ({ target }) => {
  if (!target.classList.contains("show-versions")) {
    versionMenu.value = false;
  }
});

function pin(numeroBio) {
  pinOperator(numeroBio).then(() => operatorStore.updatePinnedStatus(true));
}

function unpin(numeroBio) {
  unpinOperator(numeroBio).then(() => operatorStore.updatePinnedStatus(false));
}
</script>

<style scoped>
.header {
  justify-content: space-between;
}
</style>
