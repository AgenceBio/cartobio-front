<template>
  <li v-if="exporter.toFileData">
    <button
      class="fr-btn fr-icon-table-line fr-btn--tertiary-no-outline"
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
  </li>

  <li v-if="exporter.toClipboard">
    <button
      class="fr-btn fr-btn--tertiary-no-outline"
      :class="{ 'fr-icon-check-line': copied, 'fr-icon-clipboard-line': !copied }"
      @click="ocClipboardExport"
      data-content-piece="Export presse-papiers"
      aria-label="Copier le parcellaire dans le presse-papiers"
    >
      Copier dans le presse-papiers
    </button>
  </li>

  <li>
    <button
      class="fr-btn fr-icon-france-line fr-btn--tertiary-no-outline"
      @click="geojsonExport"
      data-content-piece="Export GeoJson"
      aria-label="Exporter au format GeoJSON (.geojson)"
    >
      GeoJSON
      <small>(<code aria-label="Extension de fichier .geojson">.geojson</code>)</small>
    </button>
  </li>

  <li v-if="record.certification_state === 'CERTIFIED'">
    <button
      class="fr-btn fr-btn--tertiary-no-outline button-disabled"
      :class="{ 'fr-icon-file-line': !isPdfLoading }"
      @click="exportAttestationPdf"
      data-content-piece="Export PDF"
      :disabled="pdfError || isPdfLoading || hasError.length > 0"
      aria-label="Télécharger l'attestation de production au format PDF"
    >
      <div v-if="isPdfLoading">
        <Spinner :hint="'Cela peut prendre jusqu\'à 2 minutes, merci de rester sur la page du parcellaire.'">
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

    <div v-if="hasError.length > 0" class="fr-alert fr-alert--warning">
      <p>Génération de l'attestation de production non disponible car des informations obligatoires sont manquantes.</p>
    </div>

    <button
      v-if="isPdfLoading"
      @click="exportAttestationPdf"
      class="fr-btn fr-p-0w fr-btn--tertiary-no-outline-no-outline fr-btn--sm"
      aria-label="Annuler le téléchargement de l'attestation"
    >
      Annuler le téléchargement
    </button>
  </li>
</template>

<script setup>
import { computed, ref, toRaw } from "vue";
import { fromId } from "@/utils/exports.js";
import { useFocus } from "@vueuse/core";
import Spinner from "@/components/widgets/Spinner.vue";
import { usePermissions } from "@/stores/permissions.js";
import { statsPush } from "@/stats.js";
import { getPDFData } from "@/cartobio-api.js";

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

async function exportAttestationPdf() {
  if (isPdfLoading.value) {
    controller.abort();
    return;
  }

  controller = new AbortController();

  try {
    isPdfLoading.value = true;
    const response = await getPDFData(props.record.numerobio, props.record.record_id, controller.signal);
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
</script>
