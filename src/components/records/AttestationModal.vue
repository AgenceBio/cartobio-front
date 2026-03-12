<script setup>
import { ref, onMounted } from "vue";
import Spinner from "@/components/widgets/Spinner.vue";
import { getPDFData, getHasAttestationProduction } from "@/cartobio-api.js";
import Modal from "@/components/widgets/Modal.vue";

const props = defineProps({
  record: {
    type: Object,
    required: true,
  },
});

const emit = defineEmits(["close"]);

const ATTESTATION_OPTIONS = [
  { label: "Attestation PAC", type: "pac" },
  { label: "Attestation PAC (ZIP)", type: "zip" },
  { label: "Attestation complète", type: "complet" },
];

const isPdfLoading = ref({ complet: false, pac: false, zip: false });
const isPdfGenerating = ref(false);
const errorText = ref({ complet: null, pac: null, zip: null });
const hasAttestationProduction = ref({ complet: null, pac: null, zip: null });
const isLoading = ref(true);

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

async function exportAttestationPdf(type, force = false) {
  if (props.record.certification_state !== "CERTIFIED" || isPdfLoading.value[type]) {
    return;
  }

  try {
    isPdfLoading.value[type] = true;
    errorText.value[type] = null;
    console.log(props.record);
    const response = await getPDFData(props.record.numerobio, props.record.record_id, type, force);

    if (response.status === 204) {
      isPdfGenerating.value = true;
      return;
    }

    const extension = type === "zip" ? "zip" : "pdf";
    const mimeType = type === "zip" ? "application/zip" : "application/pdf";

    const byteChars = atob(response.data);
    const byteArray = new Uint8Array(byteChars.length);
    for (let i = 0; i < byteChars.length; i++) {
      byteArray[i] = byteChars.charCodeAt(i);
    }
    const blob = new Blob([byteArray], { type: mimeType });

    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `cartobio_attestation_${type}_${props.record.annee_reference_controle}_${props.record.numerobio}.${extension}`;

    document.body.appendChild(a);
    a.click();
    a.remove();

    window.URL.revokeObjectURL(url);
  } catch (error) {
    if (error.code === "ERR_CANCELED") {
      return;
    }
    errorText.value[type] = error.response?.data?.message ?? "Erreur lors du téléchargement. Réessayez plus tard.";
  } finally {
    isPdfLoading.value[type] = false;
  }
}
</script>

<template>
  <Modal large @close="emit('close')">
    <template #title> Attestation de production </template>

    <div v-if="isLoading" class="attestation-loading">
      <Spinner />
    </div>
    <div v-else>
      <p>Générez votre attestation de production, cela peut prendre quelques minutes.</p>
      <p>Restez sur cette page ou revenez ultérieurement.</p>
    </div>

    <template #footer>
      <div v-if="!isLoading" class="">
        <div v-for="option in ATTESTATION_OPTIONS" :key="option.type" class="fr-mb-2w">
          <div class="attestation-option-row">
            <p class="fr-text--bold fr-mb-0 attestation-option-label">{{ option.label }}</p>
            <div
              class="fr-mb-0 attestation-option-actions"
              role="group"
              :aria-label="`Actions d'export - ${option.label}`"
            >
              <button
                type="button"
                @click="exportAttestationPdf(option.type)"
                class="fr-btn fr-btn--secondary button-export fr-btn--icon-left"
                :class="{ 'fr-icon-download-line': !isPdfLoading[option.type] }"
                :disabled="
                  record.certification_state !== 'CERTIFIED' ||
                  isPdfLoading[option.type] ||
                  !!errorText[option.type] ||
                  isPdfGenerating
                "
              >
                <Spinner v-if="isPdfLoading[option.type]" />
                <template v-if="hasAttestationProduction[option.type]"> Télécharger </template>
                <template v-else> Générer</template>
              </button>
              <button
                class="fr-btn fr-btn--secondary fr-icon-refresh-line fr-btn--icon-left"
                @click="exportAttestationPdf(option.type, true)"
                data-content-piece="Export PDF"
                :aria-label="`Re-générer ${option.label.toLowerCase()} au format PDF`"
                :title="`Générer une nouvelle attestation ${option.label.toLowerCase()} pour mettre à jour mes informations`"
                :disabled="!hasAttestationProduction[option.type] || isPdfLoading[option.type]"
              >
                Re-générer
              </button>
            </div>
          </div>
          <p v-if="errorText[option.type]" class="fr-px-1w fr-text--sm fr-error-text fr-mt-0">
            {{ errorText[option.type] }}
          </p>
        </div>
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

.attestation-option-row {
  display: flex;
  align-items: center;
  gap: 1rem;
  width: 100%;
}

.attestation-option-label {
  flex: 1;
  white-space: nowrap;
}

.attestation-option-actions {
  margin-left: auto;
  display: flex;
  gap: 1rem;
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
