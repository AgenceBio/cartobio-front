<template>
  <header class="fr-mb-2w fr-pr-4v">
    <div class="fr-grid-row fr-grid-row--middle header fr-py-1w sticky" id="headerRecord">
      <div class="fr-grid-row fr-text--xs">
        <p class="exploit-name fr-text--sm fr-my-auto fr-pb-0" @click="redirectToParcellaire()">
          <b>{{ operator.nom }}</b>
        </p>
        <template v-if="permissions.isOc">
          <button
            v-if="operatorStore.operator.epingle"
            class="fr-btn fr-btn--sm fr-btn--tertiary-no-outline"
            @click="unpin(operatorStore.operator.numeroBio)"
            aria-label="Désepingler le parcellaire"
            v-tooltip="tooltips.unpin"
          >
            <i class="ri-pushpin-fill" aria-hidden="true" />
          </button>
          <button
            v-else
            class="fr-btn fr-btn--sm fr-btn--tertiary-no-outline fr-mt-0"
            @click="pin(operatorStore.operator.numeroBio)"
            aria-label="Epingler le parcellaire"
            v-tooltip="tooltips.pin"
          >
            <i class="ri-pushpin-line" aria-hidden="true" />
          </button>
        </template>
      </div>
      <fieldset class="fr-segmented fr-segmented--sm" v-if="modelOnglet === 'fullTab'">
        <div class="fr-segmented__elements">
          <div
            class="fr-segmented__element"
            aria-label="Vue partagée tableau / carte"
            v-tooltip="{ text: 'Vue partagée tableau / carte' }"
          >
            <input type="radio" id="segmented-1-1" name="segmented-1" value="split" v-model="modelOnglet" />
            <label class="fr-label" for="segmented-1-1">
              <span class="ri-layout-column-line fr-mx-1w" aria-hidden="true"></span>
            </label>
          </div>
          <div class="fr-segmented__element" aria-label="Vue tableau" v-tooltip="{ text: 'Vue tableau' }">
            <input value="fullTab" type="radio" id="segmented-1-2" name="segmented-1" v-model="modelOnglet" />
            <label class="fr-label" for="segmented-1-2">
              <span class="fr-icon-list-unordered fr-icon--sm fr-mx-1w" aria-hidden="true"></span>
            </label>
          </div>
          <div class="fr-segmented__element" aria-label="Vue carte" v-tooltip="{ text: 'Vue carte' }">
            <input type="radio" id="segmented-1-3" name="segmented-1" value="fullMap" v-model="modelOnglet" />
            <label class="fr-label" for="segmented-1-3">
              <span class="fr-icon-road-map-line fr-icon--sm fr-mx-1w" aria-hidden="true"></span>
            </label>
          </div>
        </div>
      </fieldset>
    </div>

    <div class="header">
      <div class="flex-space-between">
        <p class="fr-sr-only operator-name" :data-numerobio="operator.numeroBio">{{ operator.nom }}</p>
        <div v-tooltip="tooltips.selectVersion" class="seamless-select fr-grid-row">
          <b class="version-name fr-mr-2w">
            {{
              record.version_name && record.version_name.length > 32 && modelOnglet != "fullTab"
                ? record.version_name.slice(0, 32) + "…"
                : record.version_name
            }}
          </b>

          <select
            class="version-name fr-ml-2w"
            name="select-version"
            id="select-version"
            v-model="selectedRecord"
            @change="redirectToRecord(selectedRecord)"
          >
            <option :value="recordList.record_id" :key="recordList.record_id" v-for="recordList in sortedRecords">
              &nbsp;{{ recordList.version_name }}
            </option>
          </select>
        </div>
        <div class="margin-left">
          <span
            class="fr-tag fr-tag--sm tag-attestation fr-my-auto"
            :class="{ 'fr-tag--disabled': record.certification_state !== 'CERTIFIED' }"
            :disabled="record.certification_state !== 'CERTIFIED'"
            v-tooltip="record.certification_state !== 'CERTIFIED' ? tooltips.disabledTag : {}"
            @click="
              () => {
                if (record.certification_state === 'CERTIFIED') {
                  attestationModal = true;
                }
              }
            "
          >
            <span class="fr-icon-file-line fr-icon--sm fr-mr-1v" aria-hidden="true"></span>
            Attestation
          </span>
          <span
            v-if="storage.syncQueues[record.record_id]"
            class="fr-my-auto fr-icon-refresh-line fr-icon--sm"
            v-tooltip="tooltips.changeNotSync"
            role="img"
            aria-label="Changements non-synchronisés"
          >
          </span>
          <span
            v-else-if="storage.records[record.record_id]"
            class="fr-my-auto fr-icon-cloud-line fr-icon--sm fr-ml-2v"
            role="img"
            v-tooltip="tooltips.changeSync"
            aria-label="Prêt pour travailler hors ligne"
          >
          </span>

          <ActionDropdown
            with-icons
            smallList
            icon-class="ri-more-line fr-btn--sm actions-list"
            icon-style="font-size: 1.2em; "
            v-tooltip="tooltips.actionsParcellaire"
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
                class="fr-btn fr-btn--tertiary-no-outline fr-icon-cloud-close"
                @click.stop.prevent="deleteDownloadModal = record.record_id"
              >
                Arrêter le mode hors connexion et vider le cache
              </button>
              <button
                v-else
                type="button"
                class="history-action fr-btn--sm fr-btn fr-btn--tertiary-no-outline fr-btn--icon-left fr-icon-cloud-check"
                :disabled="!isOnline || readonly"
                @click.stop.prevent="tryDownloadRecord(record)"
              >
                Préparer pour travailler hors connexion
              </button>
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

            <hr class="fr-mb-0 fr-pb-2w" />
            <li class="fr-mt-0">
              <span class="fr-text--sm fr-text-bold fr-ml-2w"> <b>Télécharger le parcellaire</b> </span>
            </li>
            <ExportActions
              :operator="operator"
              :collection="collection"
              :record="record"
              @close="exportModal = false"
              :hasError="tags.filter((e) => e.errorMessage != undefined)"
            />
          </ActionDropdown>
        </div>
        <br />
      </div>
    </div>

    <p v-if="readonly" class="readonly-badge">Lecture seule</p>

    <div class="fr-mt-2w">
      <div class="flex-space-between">
        <div class="fr-grid-row header">
          <ParcellaireState :record="record" />
        </div>
        <div class="fr-my-auto">
          <ControlSegment v-model="tab" id="tab-top" />
        </div>
      </div>
    </div>
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
    <Modal @close="attestationModal = false" v-if="attestationModal">
      <template #title> Attestation de production </template>
      <div>
        <p>Générez votre attestation de production, cela peut prendre quelques minutes.</p>
        <p>Restez sur cette page ou revenez ultérieurement.</p>
      </div>
      <template #footer>
        <div class="fr-btns-group fr-btns-group--icon-left" role="group" aria-label="Actions d'export">
          <button
            type="button"
            @click="exportAttestationPdf(record)"
            class="fr-btn fr-btn--secondary button-export fr-btn--icon-left"
            :class="{ 'fr-icon-download-line': !isPdfLoading }"
            :disabled="
              record.certification_state !== 'CERTIFIED' ||
              isPdfLoading ||
              errorText[record.record_id] ||
              isPdfGenerating
            "
          >
            <Spinner v-if="isPdfLoading"> </Spinner>
            <template v-if="fetchHasAttestationProduction(record)">Télécharger l'attestation de production</template>
            <template v-else>Générer l'attestation de production</template>
          </button>
          <p v-if="errorText[record.record_id]" class="fr-px-1w fr-text--sm fr-text--sm fr-error-text fr-mt-0">
            {{ errorText[record.record_id] }}
          </p>
          <button
            class="fr-btn fr-btn--secondary fr-icon-refresh-line fr-btn--icon-left"
            @click="() => exportAttestationPdf(record, true)"
            data-content-piece="Export PDF"
            aria-label="Re-générer l'attestation de production au format PDF"
            title="Générer une nouvelle attestation pour mettre à jour mes informations"
            :disabled="!fetchHasAttestationProduction(record) || isPdfLoading"
          >
            Re-générer l'attestation
          </button>
        </div>
      </template>
    </Modal>
  </Teleport>
</template>

<script setup>
import { computed, ref, watch } from "vue";
import { storeToRefs } from "pinia";

import ParcellaireState from "@/components/records/State.vue";
import OperatorHistoryModal from "@/components/records/HistoryModal/index.vue";
import DeleteParcellaireModal from "@/components/records/DeleteParcelaireModal.vue";
import FullStorageModal from "@/components/versions/FullStorageModal.vue";
import DeleteDownloadModal from "@/components/versions/DeleteDownloadModal.vue";
import { usePreferences } from "@/stores/preferences.js";
import Modal from "@/components/widgets/Modal.vue";

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

import { pinOperator, unpinOperator, getPDFData, getHasAttestationProduction } from "@/cartobio-api";
import ActionDropdown from "../widgets/ActionDropdown.vue";
import ExportActions from "./ExportActions.vue";
import toast from "@/utils/toast.js";
import { useRouter } from "vue-router";

import ControlSegment from "@/components/records/ControlSegment.vue";

const router = useRouter();

const props = defineProps({
  disableActions: {
    type: Boolean,
    default: false,
  },
  stateFS: {
    type: Boolean,
    default: false,
  },
  stateTab: {
    type: String,
    required: true,
  },
  noButtonFS: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(["modeDisplay"]);

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
const preferences = usePreferences();

const attestationModal = ref(false);
const hasAttestationProduction = ref({});
const isPdfLoading = ref(false);
const isPdfGenerating = ref(false);
const errorText = ref({});

const tab = ref(props.stateTab);

const { record } = recordStore;
const { operator } = operatorStore;
const featuresSets = useFeaturesSetsStore();
const { collection } = storeToRefs(featuresStore);
const { params: mapParams } = storeToRefs(preferences);

const { tags } = storeToRefs(featuresSets);
const canDisplayHistory = computed(() => Array.isArray(record.audit_history) && record.audit_history.length);

const versionMenu = ref(false);
const versionMenuRef = ref(null);
const showEditVersionModal = ref(false);

const modelOnglet = ref(props.stateFS);

const tooltips = {
  pin: { text: "Épingler le parcellaire", position: "top" },
  unpin: { text: "Désepingler le parcellaire", position: "top" },
  selectVersion: { text: "Sélectionner une version de parcellaire", position: "bottom" },
  exportActions: { text: "Ouvrir le menu d'export", position: "top" },
  actionsParcellaire: { text: "Ouvrir le menu du parcellaire", position: "top" },
  fullScreen: { text: "Ouvrir le mode fullscreen", position: "bottom" },
  changeSync: { text: "Prêt pour travailler hors ligne", position: "top" },
  changeNotSync: { text: "Changements non-synchronisés", position: "top" },
  disabledTag: {
    text: "Non disponible car votre parcellaire n'a pas encore été certifié par votre OC.",
    position: "bottom",
  },
};

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

async function redirectToRecord(recordTo) {
  mapParams.value.currentMode = "consult";
  await router.push(`/exploitations/${operatorStore.operator.numeroBio}/${recordTo}`);
}

async function redirectToParcellaire() {
  await router.push("/exploitations/" + (operatorStore.operator ? operatorStore.operator.numeroBio : ""));
}

async function tryDownloadRecord(record) {
  if (readonly.value) {
    return;
  }
  if (!(await storage.addRecord(record.record_id))) {
    fullStorageModal.value = true;
  } else {
    toast.success("Le parcellaire est prêt pour travailler hors connexion");
  }
}

const sortedRecords = computed(() => operatorStore.records);

const selectedRecord = ref(record.record_id);

async function exportAttestationPdf(record, force = false) {
  if (record.certification_state !== "CERTIFIED" || isPdfLoading.value) {
    return;
  }

  try {
    isPdfLoading.value = true;
    const response = await getPDFData(record.numerobio, record.record_id, null, force);
    if (response.status === 204) {
      isPdfGenerating.value = true;
      return;
    }
    const linkSource = `data:application/pdf;base64,${response.data}`;
    const a = document.createElement("a");
    a.href = linkSource;
    a.download = `cartobio_attestation_${record.annee_reference_controle}_${record.numerobio}.pdf`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(linkSource);
    hasAttestationProduction.value[record.record_id] = true;
  } catch (error) {
    if (error.code === "ERR_CANCELED") {
      isPdfLoading.value = false;
      return;
    }

    if (error.response?.data?.message) {
      errorText.value[record.record_id] = error.response.data.message;
    }
    throw new Error("Erreur lors du téléchargement du PDF: Réessayez plus tard");
  } finally {
    isPdfLoading.value = false;
  }
}

function fetchHasAttestationProduction(record) {
  if (record.certification_state !== "CERTIFIED") {
    return false;
  }
  if (hasAttestationProduction.value[record.record_id] != undefined) {
    return hasAttestationProduction.value[record.record_id];
  }

  hasAttestationProduction.value[record.record_id] = false;

  getHasAttestationProduction(record.record_id).then((res) => {
    hasAttestationProduction.value[record.record_id] = res.hasAttestationProduction;
  });
  return false;
}

/*
 * * Watchers
 */

watch(
  () => props.stateFS,
  (newValue) => {
    modelOnglet.value = newValue;
  },
);

watch(
  () => modelOnglet.value,
  (newValue) => {
    console.log("Changement de header", modelOnglet.value);
    emit("modeDisplay", newValue);
  },
);

watch(
  () => props.stateTab,
  (newValue) => {
    tab.value = newValue;
  },
);

watch(
  () => tab.value,
  (newValue) => {
    emit("changeTab", newValue);
  },
);
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

.break > hr {
  margin-bottom: 0px !important;
  padding-bottom: 1px !important;
}

.seamless-select {
  gap: 5px;
  position: relative;
  padding-right: 1rem;
  font-weight: normal;
  background-image: url("data:image/svg+xml,%3Csvg width='24' height='24' viewBox='0 0 24 24' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cg id='Direction=Bas'%3E%3Cpath id='Ic&%23195;&%23180;ne' fill-rule='evenodd' clip-rule='evenodd' d='M12 13.172L16.95 8.222L18.364 9.636L12 16L5.63599 9.636L7.04999 8.222L12 13.172Z' fill='%23000091'/%3E%3C/g%3E%3C/svg%3E%0A");
  background-position: right center;
  background-repeat: no-repeat;
  justify-content: flex-end;
  font-size: 20px;
  color: var(--light-decisions-background-background-action-high-blue-france, #000091);

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

.exploit-name {
  color: #161616;
  cursor: pointer;
}

.attestation-tag {
  display: flex;
  height: fit-content;
}

.tag-attestation {
  background-color: var(--background-action-low-blue-france);
  color: var(--text-action-high-blue-france);
  cursor: pointer;
  transition: background-color 0.2s ease;
  padding: 0.125rem 0.5rem;
  height: fit-content;
}

.tag-attestation:hover {
  background-color: var(--background-action-low-blue-france-hover);
}

.buttons-attestation {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.buttons-attestation > button {
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  text-align: center;
}

.readonly-badge {
  padding: 0px 8px;
  border-radius: 9999px;
  font-size: 12px;
  display: inline-flex;
  align-items: center;
  background-color: var(--background-default-grey-active);
  margin-bottom: 0.5em;
  font-weight: 400;
  line-height: 23px;
  white-space: nowrap;
}

.margin-left {
  margin-left: auto;
}

.ri-more-2-line.fr-btn--sm {
  padding: 0.25rem 0.45rem;
}

.flex-space-between {
  display: flex;
  justify-content: space-between;
}

.fr-tag--disabled {
  opacity: 0.5;
  cursor: not-allowed;
  color: #929292;
  background-color: #e5e5e5;
}
</style>
<style>
.ri-more-2-line.fr-btn--sm {
  padding: 0.25rem 0.45rem;
}
</style>
