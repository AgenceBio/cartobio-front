<script setup>
import { ref, onMounted } from "vue";
import Spinner from "@/components/widgets/Spinner.vue";
import { getPDFData, getHasAttestationProduction } from "@/cartobio-api.js";
import Modal from "@/components/widgets/Modal.vue";
import { useFeaturesStore } from "@/stores/features.js";

const featuresStore = useFeaturesStore();

const props = defineProps({
  record: {
    type: Object,
    required: true,
  },
});

const hasPac = props.record.geojson
  ? props.record.geojson.features.some((f) => f.properties?.attente_pac === true)
  : featuresStore.hasPac;

const emit = defineEmits(["close"]);

const ATTESTATION_OPTIONS = [
  {
    label: "Attestation du parcellaire PAC",
    description: "Liste des parcelles déclarées à la PAC avec le détail par parcelle.",
    type: "pac",
    labelpdf: "pac",
    active: hasPac,
  },
  {
    label: "Fichier ZIP : Attestation du parcellaire PAC + liste des parcelles",
    description:
      "Fichier zippé contenant l'attestation du parcellaire PAC avec le détail par parcelle ainsi qu'une version allégée avec uniquement la liste des parcelles.",
    type: "zip",
    labelpdf: "PAC",
    active: hasPac,
  },
  {
    label: "Liste des parcelles de l'exploitation",
    description: "Liste des parcelles contrôlées de l'exploitation sans détail.",
    type: "complet",
    labelpdf: "liste_complete",
    active: true,
  },
];

const isPdfLoading = ref({ complet: false, pac: false, zip: false });
const isPdfGenerating = ref(false);
const errorText = ref({ complet: null, pac: null, zip: null });
const hasAttestationProduction = ref({ complet: null, pac: null, zip: null });
const isLoading = ref(true);
const selectedType = ref(hasPac ? ATTESTATION_OPTIONS[0] : ATTESTATION_OPTIONS[2]);

onMounted(async () => {
  if (props.record.certification_state !== "CERTIFIED") {
    isLoading.value = false;
    return;
  }

  await Promise.all(
    ATTESTATION_OPTIONS.map(({ type }) =>
      getHasAttestationProduction(props.record.record_id, type).then((res) => {
        hasAttestationProduction.value[type] = res.hasAttestationProduction;
      }),
    ),
  );
  isLoading.value = false;
});

async function exportAttestationPdf(typeObj, force = false) {
  if (props.record.certification_state !== "CERTIFIED" || isPdfLoading.value[typeObj.type]) {
    return;
  }

  try {
    isPdfLoading.value[typeObj.type] = true;
    errorText.value[typeObj.type] = null;
    const response = await getPDFData(props.record.numerobio, props.record.record_id, typeObj.type, force);

    if (response.status === 204) {
      isPdfGenerating.value = true;
      return;
    }

    const extension = typeObj.type === "zip" ? "zip" : "pdf";
    const mimeType = typeObj.type === "zip" ? "application/zip" : "application/pdf";

    const byteChars = atob(response.data);
    const byteArray = new Uint8Array(byteChars.length);
    for (let i = 0; i < byteChars.length; i++) {
      byteArray[i] = byteChars.charCodeAt(i);
    }
    const blob = new Blob([byteArray], { type: mimeType });

    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${typeObj.type === "zip" ? "zip_" : ""}cartobio_attestation_${typeObj.labelpdf}_${props.record.annee_reference_controle}_${props.record.numerobio}.${extension}`;

    document.body.appendChild(a);
    a.click();
    a.remove();

    window.URL.revokeObjectURL(url);
    const res = await getHasAttestationProduction(props.record.record_id, typeObj.type);
    hasAttestationProduction.value[typeObj.type] = res.hasAttestationProduction;
  } catch (error) {
    if (error.code === "ERR_CANCELED") {
      return;
    }
    console.log(error);
    errorText.value[typeObj.type] =
      error.response?.data?.message ?? "Erreur lors du téléchargement. Réessayez plus tard.";
  } finally {
    isPdfLoading.value[typeObj.type] = false;
  }
}
</script>

<template>
  <Modal @close="emit('close')">
    <template #title> Attestation du parcellaire </template>

    <div v-if="isLoading" class="attestation-loading">
      <Spinner />
    </div>
    <div v-else>
      <div v-if="isPdfGenerating" class="fr-alert fr-alert--info fr-mb-1w">
        <h3 class="fr-alert__title">Votre PDF est en cours de génération</h3>

        <p>Le pdf sera bientôt disponible, nous vous invitons à revenir dans quelques minutes.</p>
      </div>
      <p>
        Votre attestation est disponible sous plusieurs formats. Sélectionnez le format souhaité puis générez votre
        attestation.
      </p>
      <p>Cela peut prendre quelques minutes, restez sur cette page ou revenez ultérieurement.</p>

      <fieldset class="fr-fieldset" id="options-form">
        <div class="fr-fieldset__element" v-for="option in ATTESTATION_OPTIONS" :key="option.type">
          <div class="fr-radio-group fr-radio-group--sm">
            <input
              :id="`attestation-${option.type}`"
              type="radio"
              name="attestation-type"
              :value="option"
              v-model="selectedType"
              :disabled="!option.active"
              class="attestation-option-radio"
            />
            <label class="fr-label" :for="`attestation-${option.type}`">
              {{ option.label }}
              <span class="fr-hint-text">{{ option.description }}</span>
            </label>
          </div>
        </div>
      </fieldset>
      <p v-if="errorText[selectedType.type]" class="fr-px-1w fr-text--sm fr-error-text fr-mt-1w">
        {{ errorText[selectedType.type] }}
      </p>
    </div>

    <template #footer>
      <div v-if="!isLoading" class="attestation-footer-actions">
        <button
          type="button"
          @click="exportAttestationPdf(selectedType)"
          class="fr-btn fr-btn--secondary button-export fr-btn--icon-left"
          :class="{ 'fr-icon-download-line': !isPdfLoading[selectedType.type] }"
          :disabled="
            record.certification_state !== 'CERTIFIED' ||
            isPdfLoading[selectedType.type] ||
            !!errorText[selectedType.type] ||
            isPdfGenerating
          "
        >
          <Spinner v-if="isPdfLoading[selectedType.type]" />
          <template v-if="hasAttestationProduction[selectedType.type]"> Télécharger </template>
          <template v-else> Générer </template>
        </button>
        <button
          class="fr-btn fr-btn--secondary fr-icon-refresh-line fr-btn--icon-left"
          v-if="!(!hasAttestationProduction[selectedType.type] || isPdfLoading[selectedType.type])"
          @click="exportAttestationPdf(selectedType, true)"
          data-content-piece="Export PDF"
          :aria-label="`Re-générer ${ATTESTATION_OPTIONS.find((o) => o.type === selectedType.type)?.label.toLowerCase()} au format PDF`"
          :title="`Générer une nouvelle attestation pour mettre à jour mes informations`"
          :disabled="!hasAttestationProduction[selectedType.type] || isPdfLoading[selectedType.type] || isPdfGenerating"
        >
          Re-générer
        </button>
      </div>
    </template>
  </Modal>
</template>

<style scoped>
.attestation-loading {
  display: flex;
  justify-content: center;
  padding: 2rem;
}

.attestation-options {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-top: 1rem;
}

.attestation-option {
  display: flex;
  align-items: flex-start;
  padding: 0.75rem 1rem;
  cursor: pointer;
}

.attestation-option-radio {
  flex-shrink: 0;
}

.attestation-option-content {
  display: flex;
  flex-direction: column;
  gap: 0.15rem;
}

.attestation-footer-actions {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  width: 100%;
}

.button-export :deep(.spin) {
  height: 25px;
  line-height: 25px;
  padding-left: 23px;
}

.button-export :deep(.spin::before) {
  border: solid 4px var(--background-alt-grey-hover);
  border-bottom-color: var(--background-action-high-blue-france);
  height: 20px;
  width: 20px;
  top: 10px;
  left: 5px;
}

.fr-error-text::before {
  padding-right: 22px;
}

.fr-modal__footer .fr-btns-group {
  margin-bottom: -1rem;
  width: none;
}
</style>
