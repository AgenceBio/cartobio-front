<template>
  <header class="fr-mb-2w">
    <div class="fr-grid-row fr-grid-row--middle header">
      <div class="fr-grid-row">
        <p class="fr-sr-only operator-name" :data-numerobio="operator.numeroBio">{{ operator.nom }}</p>
        <div class="seamless-select fr-grid-row">
          <b class="version-name">{{ record.version_name }}</b>

          <select class="version-name" name="select-version" id="select-version" v-model="selectedRecord">
            <option
              :value="record.record_id"
              :key="record.record_id"
              v-for="record in sortedRecords"
              @click="redirectToRecord(record)"
            >
              {{ record.version_name }}
            </option>
          </select>
        </div>
        <p v-if="readonly" class="readonly-badge">Lecture seule</p>
      </div>
      <div class="fr-grid-row">
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
        <ActionDropdown
          v-if="hasFeatures && !readonly"
          with-icons
          smallList
          icon-class="fr-icon-download-line fr-btn--sm"
        >
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
          smallList
          icon-class="ri-more-2-line fr-btn--sm"
          icon-style="font-size: 1.2em"
        >
          <li v-if="!disableActions && permissions.canEditVersion">
            <button
              class="fr-btn fr-btn--sm fr-icon-edit-line fr-btn--tertiary-no-outline edit-version-info"
              @click="showEditVersionModal = true"
              aria-label="Modifier la version du parcellaire"
            >
              Modifier les données de la version
            </button>
          </li>
          <li class="break">
            <hr />
          </li>
          <li class="">
            <button
              v-if="storage.syncQueues[record.record_id]"
              type="button"
              class="fr-btn fr-btn--tertiary-no-outline fr-icon-refresh-line"
              disabled
            >
              Changements non-synchronisés
            </button>
            <button
              v-else-if="storage.records[record.record_id]"
              type="button"
              class="fr-btn fr-btn--tertiary-no-outline fr-icon-success-fill"
              @click.stop.prevent="deleteDownloadModal = record.record_id"
            >
              Supprimer des téléchargements hors-ligne
            </button>
            <button
              v-else
              type="button"
              class="history-action fr-btn--sm fr-btn fr-btn--tertiary-no-outline fr-btn--icon-left fr-icon-calendar-2-line"
              :disabled="!isOnline || readonly"
              @click.stop.prevent="tryDownloadRecord(record)"
            >
              Télécharger pour travailler hors connexion
            </button>

            <!-- ri-cloud-off-line -->
          </li>
          <li class="break">
            <hr />
          </li>
          <li v-if="canDisplayHistory" class="">
            <button
              class="history-action fr-btn--sm fr-btn fr-btn--tertiary-no-outline fr-btn--icon-left fr-icon-time-line"
              @click="historyModal = true"
              aria-label="Afficher l'historique des modifications"
            >
              Historique général du parcellaire
            </button>
          </li>
        </ActionDropdown>
      </div>
    </div>

    <p class="state fr-subtitle fr-mt-1w">
      <ParcellaireState :record="record" />
    </p>
  </header>

  <Teleport to="body">
    <OperatorHistoryModal :record="record" :operator="operator" v-if="historyModal" @close="historyModal = false" />
    <DeleteParcellaireModal :record="record" v-if="deleteModal" @close="deleteModal = false" />
    <EditVersionModal v-if="showEditVersionModal" @close="showEditVersionModal = false" />
    <FullStorageModal v-if="fullStorageModal" @close="fullStorageModal = false" />
    <DeleteDownloadModal
      v-if="deleteDownloadModal"
      :record-id="deleteDownloadModal"
      @close="deleteDownloadModal = null"
    />
  </Teleport>
</template>

<script setup>
import { computed, ref } from "vue";
import { storeToRefs } from "pinia";

import ParcellaireState from "@/components/records/State.vue";
import OperatorHistoryModal from "@/components/records/HistoryModal/index.vue";
import DeleteParcellaireModal from "@/components/records/DeleteParcelaireModal.vue";
import FullStorageModal from "@/components/versions/FullStorageModal.vue";
import DeleteDownloadModal from "@/components/versions/DeleteDownloadModal.vue";

import { useFeaturesStore } from "@/stores/features.js";
import { useOperatorStore } from "@/stores/operator.js";
import { useFeaturesSetsStore } from "@/stores/features-sets.js";
import { useRecordStore } from "@/stores/record.js";
import { onClickOutside } from "@vueuse/core";
import EditVersionModal from "@/components/forms/EditVersionForm.vue";
import { usePermissions } from "@/stores/permissions.js";
import { useUserStore } from "@/stores/user";
import { useOnline } from "@vueuse/core";
import { useCartoBioStorage } from "@/stores/storage.js";

import { pinOperator, unpinOperator } from "@/cartobio-api";
import ActionDropdown from "../widgets/ActionDropdown.vue";
import ExportActions from "./ExportActions.vue";
import toast from "@/utils/toast.js";
import { useRouter } from "vue-router";

const router = useRouter();

defineProps({
  disableActions: {
    type: Boolean,
    default: false,
  },
});

const exportModal = ref(false);
const historyModal = ref(false);
const deleteModal = ref(false);
const deleteDownloadModal = ref(null);
const fullStorageModal = ref(false);

const featuresStore = useFeaturesStore();
const operatorStore = useOperatorStore();
const recordStore = useRecordStore();
const userStore = useUserStore();
const permissions = usePermissions();
const isOnline = useOnline();
const storage = useCartoBioStorage();

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

async function redirectToRecord(record) {
  await router.push(`/exploitations/${operatorStore.operator.numeroBio}/${record.record_id}`);
}

async function tryDownloadRecord(record) {
  if (readonly.value) {
    return;
  }
  if (!(await storage.addRecord(record.record_id))) {
    fullStorageModal.value = true;
  } else {
    toast.success("Le parcellaire a bien été téléchargé.");
  }
}

const sortedRecords = computed(() => operatorStore.records);

const selectedRecord = ref(record.record_id);
</script>

<style scoped>
.header {
  justify-content: space-between;
}

.break {
  width: 100%;
  clear: both;
  padding: 0px 10px;
}
hr {
  margin-bottom: 0px !important;
  padding-bottom: 1px !important;
}

.seamless-select {
  gap: 5px;
  position: relative;
  padding-right: 1rem;
  font-weight: normal;
  background-image: url("data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTIiIGhlaWdodD0iNiIgdmlld0JveD0iMCAwIDEyIDYiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxwYXRoIGZpbGwtcnVsZT0iZXZlbm9kZCIgY2xpcC1ydWxlPSJldmVub2RkIiBkPSJNNiA2TDAgMEgxMkw2IDZaIiBmaWxsPSIjMDAwMDkxIi8+Cjwvc3ZnPgo=");
  background-position: right center;
  background-repeat: no-repeat;
  justify-content: flex-end;
  color: black;

  & label {
    display: inline;
  }

  /* super hacky way to hide a select behind
   our custom div and still be able to interact with it
   (there is no way to open select fields programmatically) */
  & select {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    opacity: 0;
  }
}
.font-blue {
  color: black;
}
</style>
