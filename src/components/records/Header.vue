<template>
  <header class="fr-mb-2w">
    <div class="fr-grid-row fr-grid-row--middle header fr-py-1w" id="headerRecord">
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
      <button
        v-if="!isMobile && !noButtonFS"
        class="fr-btn fr-btn--sm fr-btn--tertiary-no-outline button-fullscreen"
        @click="emit('fullScreen')"
        v-tooltip="tooltips.fullScreen"
      >
        <span :class="[isFullScreen ? 'ri-collapse-diagonal-line' : 'ri-expand-diagonal-line']"></span>
      </button>
    </div>

    <div class="fr-grid-row fr-grid-row--middle header">
      <div class="fr-grid-row">
        <p class="fr-sr-only operator-name" :data-numerobio="operator.numeroBio">{{ operator.nom }}</p>
        <div v-tooltip="tooltips.selectVersion" class="seamless-select fr-grid-row">
          <b class="version-name fr-mr-2w">
            {{
              record.version_name && record.version_name.length > 32 && !noButtonFS
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
        <br />
      </div>
      <div class="fr-grid-row">
        <span
          class="fr-tag fr-tag--sm tag-attestation fr-my-auto"
          v-if="record.certification_state === 'CERTIFIED'"
          @click="
            () => {
              attestationModal = true;
            }
          "
        >
          <span class="fr-icon-file-line fr-icon--sm fr-mr-1v" aria-hidden="true"></span>Attestation</span
        >
        <ActionDropdown
          v-if="hasFeatures && !readonly"
          with-icons
          smallList
          icon-class="fr-icon-download-line fr-btn--sm export-action"
          v-tooltip="tooltips.exportActions"
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
              Préparer pour travailler hors connexion
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

    <p v-if="readonly" class="readonly-badge">Lecture seule</p>

    <p v-if="record.certification_state === 'OPERATOR_DRAFT'" class="state fr-subtitle fr-mt-1w">
      <ParcellaireState :record="record" />
    </p>
    <div v-else class="fr-highlight flex fr-mt-1w">
      <div>
        <div class="flex">
          <ParcellaireState :record="record" :show-date="true" />
        </div>
        <p class="fr-text--sm fr-mb-0">
          <b>Réalisé le {{ jjmmyyyy(record.audit_date) }}</b
          ><br /><span
            class="fr-mt-1w"
            v-if="
              (record?.audit_history ?? [])
                .filter((d) => d.type === 'CertificationStateChange')
                .sort((a, b) => new Date(b.date) - new Date(a.date))
                .at(-1)?.user?.nom ||
              (record?.audit_history ?? [])
                .filter((d) => d.type === 'CertificationStateChange')
                .sort((a, b) => new Date(b.date) - new Date(a.date))
                .at(-1)?.user?.prenom
            "
          >
            Par
            {{
              ((record?.audit_history ?? [])
                .filter((d) => d.type === "CertificationStateChange")
                .sort((a, b) => new Date(b.date) - new Date(a.date))
                .at(-1)?.user?.nom ?? "") +
              " " +
              ((record?.audit_history ?? [])
                .filter((d) => d.type === "CertificationStateChange")
                .sort((a, b) => new Date(b.date) - new Date(a.date))
                .at(-1)?.user?.prenom ?? "")
            }}
          </span>
        </p>
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
import { jjmmyyyy } from "@/utils/dates";

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
  noButtonFS: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(["fullScreen"]);

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
const recordAttestation = ref(null);
const hasAttestationProduction = ref({});
const isPdfLoading = ref(false);
const isPdfGenerating = ref(false);
const errorText = ref({});

const { record } = recordStore;
const { operator } = operatorStore;
const featuresSets = useFeaturesSetsStore();
const { collection, hasFeatures } = storeToRefs(featuresStore);
const { map: mapPrefs } = storeToRefs(preferences);

const { tags } = storeToRefs(featuresSets);
const canDisplayHistory = computed(() => Array.isArray(record.audit_history) && record.audit_history.length);

const versionMenu = ref(false);
const versionMenuRef = ref(null);
const showEditVersionModal = ref(false);

const isFullScreen = ref(props.stateFS);

const tooltips = {
  pin: { text: "Épingler le parcellaire", position: "top" },
  unpin: { text: "Désepingler le parcellaire", position: "top" },
  selectVersion: { text: "Sélectionner une version de parcellaire", position: "bottom" },
  exportActions: { text: "Ouvrir le menu d'export", position: "top" },
  actionsParcellaire: { text: "Ouvrir le menu du parcellaire", position: "top" },
  fullScreen: { text: "Ouvrir le mode fullscreen", position: "bottom" },
};

const windowWidth = ref(window.innerWidth);

const isMobile = computed(() => windowWidth.value < 992);

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
  mapPrefs.value.currentMode = "consult";
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
    toast.success("Le parcellaire a bien été téléchargé.");
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

watch(
  () => props.stateFS,
  (newValue) => {
    isFullScreen.value = newValue;
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
</style>
