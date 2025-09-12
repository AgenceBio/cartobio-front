<template>
  <component
    :is="Modal"
    v-bind="$attrs"
    icon="fr-icon-road-map-line"
    data-track-content
    data-content-name="Modale d'export"
  >
    <template #title>Export de parcellaire</template>

    <p>Réutilisez vos données dans d'autres applications sans avoir à les recopier.</p>

    <p>Choisissez un format qui vous semble adapté à votre usage.</p>

    <template #footer>
      <div class="fr-btns-group fr-btns-group--icon-left" role="group" aria-label="Actions d'export">
        <div class="fr-grid-row">
          <div class="fr-col" v-if="exporter.toFileData">
            <button
              class="fr-btn fr-icon-table-line fr-btn--secondary"
              data-content-piece="Export OC"
              ref="autofocusedElement"
              @click="ocExport"
              :aria-label="`Exporter le parcellaire au format ${exporter.label} (.${exporter.extension})`"
            >
              {{ exporter.label }}
              <small>
                (<code :aria-label="exporter.label">.{{ exporter.extension }}</code
                >)
              </small>
            </button>
          </div>

          <div class="fr-col" v-if="exporter.toClipboard">
            <button
              class="fr-btn fr-btn--secondary"
              :class="{ 'fr-icon-check-line': copied, 'fr-icon-clipboard-line': !copied }"
              @click="ocClipboardExport"
              data-content-piece="Export presse-papiers"
              aria-label="Copier le parcellaire dans le presse-papiers"
            >
              Copier dans le presse-papiers
            </button>
          </div>
        </div>

        <div class="">
          <button
            class="fr-btn fr-icon-france-line fr-btn--secondary"
            @click="geojsonExport"
            data-content-piece="Export GeoJson"
            aria-label="Exporter au format GeoJSON (.geojson)"
          >
            GeoJSON
            <small>(<code aria-label="Extension de fichier .geojson">.geojson</code>)</small>
          </button>
        </div>

        <div>
          <button
            class="fr-btn fr-btn--secondary button-disabled"
            :class="{ 'fr-icon-file-line': !isPdfLoading }"
            @click="exportAttestationPdf"
            data-content-piece="Export PDF"
            :disabled="record.certification_state !== 'CERTIFIED' || pdfError || isPdfLoading || hasError.length > 0"
            aria-label="Télécharger l'attestation de production au format PDF"
            :title="
              record.certification_state === 'CERTIFIED'
                ? 'Télécharger l\'attestation de production au format PDF'
                : 'Non disponible, le parcellaire n\'est pas certifié'
            "
          >
            <div v-if="isPdfLoading">
              <Spinner :hint="'Cela peut prendre plusieurs minutes, patientez sur la page ou revenez ultérieurement.'">
                Téléchargement...
              </Spinner>
            </div>
            <span v-else>
              <p class="fr-hint" v-if="pdfError">Erreur dans le téléchargement, veuillez réessayer plus tard</p>
              <p v-else>
                Attestation de production
                <small>(<code aria-label="Extension de fichier .pdf">.pdf</code>)</small>
              </p>
            </span>
          </button>
          <button
            v-if="hasAttestationProduction && !isPdfLoading"
            class="fr-btn fr-btn--tertiary-no-outline fr-icon-refresh-line"
            @click="() => exportAttestationPdf(true)"
            data-content-piece="Export PDF"
            aria-label="Re-générer l'attestation de production au format PDF"
            title="Générer une nouvelle attestation pour mettre à jour mes informations"
          >
            Re-générer l'attestation
          </button>
          <div
            v-if="record.certification_state === 'CERTIFIED' && hasError.length > 0"
            class="fr-alert fr-alert--warning"
          >
            <p>
              Génération de l'attestation de production non disponible car des informations obligatoires sont
              manquantes.
            </p>
          </div>

          <button
            v-if="isPdfLoading"
            @click="exportAttestationPdf"
            class="fr-btn fr-p-0w fr-btn--tertiary-no-outline fr-btn--sm"
            aria-label="Annuler le téléchargement de l'attestation"
          >
            Annuler le téléchargement
          </button>
        </div>
      </div>
    </template>
  </component>
</template>

<script setup>
import { computed, ref, toRaw, onMounted } from "vue";
import { fromId } from "@/utils/exports.js";
import { useFocus } from "@vueuse/core";
import Modal from "@/components/widgets/Modal.vue";
import Spinner from "@/components/widgets/Spinner.vue";
import { usePermissions } from "@/stores/permissions.js";
import { statsPush } from "@/stats.js";
import { getHasAttestationProduction, getPDFData } from "@/cartobio-api.js";

const props = defineProps({
  operator: {
    type: Object,
    required: true,
  },
  collection: {
    type: Object,
    required: true,
  },
  record: {
    type: Object,
    required: true,
  },
  hasError: {
    type: Object,
    required: false,
  },
});

const permissions = usePermissions();
let controller = new AbortController();

const organismeCertificateurId = computed(() => props.operator.organismeCertificateur.id);
const filenameBase = computed(() => `parcellaire-operateur-${props.operator.numeroBio}`);
const exporter = computed(function () {
  const exporterClass = fromId(organismeCertificateurId.value);
  return new exporterClass({
    featureCollection: props.collection,
    operator: props.operator,
    record: props.record,
    permissions,
  });
});
const copied = ref(false);
const isPdfLoading = ref(false);
const pdfError = ref(false);
const autofocusedElement = ref();
const hasAttestationProduction = ref(false);

useFocus(autofocusedElement, { initialValue: true });

function geojsonExport() {
  statsPush(["trackEvent", "Export", "Export GeoJSON"]);
  const blob = new Blob([JSON.stringify(toRaw(props.collection), null, 2)], { type: "application/json" });

  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = `${filenameBase.value}.json`;
  link.click();
}

function ocExport() {
  statsPush(["trackEvent", "Export", `Export OC (${props.operator.organismeCertificateur.nom})`]);
  const data = exporter.value.toFileData();
  const link = document.createElement("a");
  link.href = URL.createObjectURL(data);
  link.download = `${filenameBase.value}.${exporter.value.extension}`;
  link.mime = exporter.value.mime;
  link.click();
}

function ocClipboardExport() {
  statsPush(["trackEvent", "Export", `Export presse-papiers (${props.operator.organismeCertificateur.nom})`]);
  exporter.value.toClipboard();
  copied.value = true;

  setTimeout(() => {
    copied.value = false;
  }, 2000);
}

async function exportAttestationPdf(force = false) {
  if (isPdfLoading.value) {
    controller.abort();
    return;
  }

  controller = new AbortController();

  try {
    isPdfLoading.value = true;
    const response = await getPDFData(props.record.numerobio, props.record.record_id, controller.signal, force);
    const linkSource = `data:application/pdf;base64,${response.data}`;
    const a = document.createElement("a");
    a.href = linkSource;
    a.download = `cartobio_attestation_${props.record.annee_reference_controle}_${props.record.numerobio}.pdf`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(linkSource);
  } catch (error) {
    if (error.code === "ERR_CANCELED") {
      isPdfLoading.value = false;
      return;
    }
    pdfError.value = true;
    throw new Error("Erreur lors du téléchargement du PDF: Réessayez plus tard");
  } finally {
    isPdfLoading.value = false;
  }
}

onMounted(async () => {
  hasAttestationProduction.value = (await getHasAttestationProduction(props.record.record_id)).hasAttestationProduction;
});
</script>
