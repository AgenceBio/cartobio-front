<template>
  <li>
    <button
      class="fr-btn fr-icon-france-line fr-btn--tertiary-no-outline"
      @click="geojsonExport"
      data-content-piece="Export GeoJson"
      aria-label="Exporter au format GeoJSON (.geojson)"
    >
      Télécharger au format .geojson
    </button>
  </li>
  <li class="break">
    <hr />
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
  <li class="break">
    <hr />
  </li>

  <li v-if="exporter.toFileData">
    <button
      class="fr-btn fr-icon-table-line fr-btn--tertiary-no-outline"
      data-content-piece="Export OC"
      ref="autofocusedElement"
      @click="ocExport"
      :aria-label="`Exporter le parcellaire au format ${exporter.label} (.${exporter.extension})`"
    >
      Télécharger au format .{{ exporter.extension }}
    </button>
  </li>
  <li class="break">
    <hr />
  </li>
</template>

<script setup>
import { computed, ref, toRaw, onMounted } from "vue";
import { fromId } from "@/utils/exports.js";
import { useFocus } from "@vueuse/core";
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

onMounted(async () => {
  hasAttestationProduction.value = (await getHasAttestationProduction(props.record.record_id)).hasAttestationProduction;
});
</script>

<style scoped>
.break {
  width: 100%;
  clear: both;
  padding: 0px 10px;
}
hr {
  margin-bottom: 0px !important;
  padding-bottom: 1px !important;
}
</style>
