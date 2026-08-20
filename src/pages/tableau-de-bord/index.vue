<route lang="yaml">
meta:
  requiredRoles: ["certif", "audit"]
  forbiddenRoles: ["admin"]
  skipLinks:
    - Recherche: "#search"
  seo:
    title: "Tableau de bord API"
</route>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from "vue";
import {
  fetchPalmaresAnomalies,
  fetchBilanEnvois,
  fetchGeneralKpi,
  fetchEnvoisRejetes,
  fetchPalmaresAnomaliesGrouped,
  fetchRepetitions,
} from "@/api/endpoints/tableau-de-bord.api";
import { getErrorMessage } from "@/utils/error-api.utils";
import PieChartCustom from "@/components/tableau-de-bord/PieChartCustom.vue";
import BarGraphCustom from "@/components/tableau-de-bord/BarGraphCustom.vue";
import DatePicker from "@/components/tableau-de-bord/DatePicker.vue";
import ReferentielAnomalies from "@/components/tableau-de-bord/ReferentielAnomalies.vue";
import RejectsChart from "@/components/tableau-de-bord/RejectsChart.vue";
import Modal from "@/components/widgets/Modal.vue";
import ActionDropdown from "@/components/widgets/ActionDropdown.vue";
import AutoCompleteSearch from "@/components/operator/AutoCompleteSearch.vue";
import StatsCard from "@/components/tableau-de-bord/StatsCard.vue";
import BilanEnvoisTable from "@/components/tableau-de-bord/BilanEnvoisTable.vue";
import EnvoisRejetesTable from "@/components/tableau-de-bord/EnvoisRejetesTable.vue";
import AlertesBanniere from "@/components/tableau-de-bord/AlertesBanniere.vue";
import JaugeAvancement from "@/components/tableau-de-bord/JaugeAvancement.vue";
import HistoriqueParcellaireModal from "@/components/tableau-de-bord/HistoriqueParcellaireModal.vue";
import AlertesModal from "@/components/tableau-de-bord/AlertesModal.vue";
import { useIsMobile } from "@/composables/useIsMobile";
import { useTelechargements } from "@/composables/tableau-de-bord/useTelechargements";
import { useCC } from "@/composables/tableau-de-bord/useCC";
import { useBilanGraphique, calculerTaux } from "@/composables/tableau-de-bord/useBilanGraphique";
import { useRepetitions } from "@/composables/tableau-de-bord/useRepetitions";
import { useBilanFiltres, STATUT_OPTIONS, ETAT_OPTIONS } from "@/composables/tableau-de-bord/useBilanFiltres";
import { useEnvoisRejetes } from "@/composables/tableau-de-bord/useEnvoisRejetes";
import { useHistoriqueParcellaire } from "@/composables/tableau-de-bord/useHistoriqueParcellaire";
import successPicto from "@gouvfr/dsfr/artwork/pictograms/system/success.svg";
import errorPicto from "@gouvfr/dsfr/artwork/pictograms/system/error.svg";
import {
  formatPeriodLabel,
  formatDateControle,
  formatDateTableau,
  formatStartOfDay,
  formatEndOfDay,
  currentWeekRange,
  currentMonthRange,
} from "@/utils/date.formatters";
import type {
  Unit,
  ResumeKpi,
  CompareKpi,
  AnomalieCode,
  EvolutionPeriode,
  PageResult,
  BilanEnvoiItem,
  DownloadAction,
  ChartRow,
  ChangePeriodPayload,
} from "@/types/tableau-de-bord";
import { storeToRefs } from "pinia";
import { useUserStore } from "@/stores/user";
import { getDashboardSummary } from "@/cartobio-api";
import { usePreferences } from "@/stores/preferences";

const userStore = useUserStore();
const isMobile = useIsMobile();
const { user } = storeToRefs(userStore);

// État global
const isLoading = ref(true);
const searchQuery = ref("");
const modalReferentielAnomalies = ref<boolean>(false);
const modalBilanEnvoisAgrandi = ref<boolean>(false);

// Période
const preferencesStore = usePreferences();
const { unit } = storeToRefs(preferencesStore);
const baseDate = new Date();
const fromBase = ref<Date | null>(null);
const toBase = ref<Date | null>(null);

// Données
const resumeKpi = ref<ResumeKpi | null>(null);
const palmaresAnomalies = ref<AnomalieCode[] | null>(null);
const evolutionEnvois = ref<EvolutionPeriode[] | null>(null);
const compareKpi = ref<CompareKpi | null>(null);
const comparePalmaresAnomalies = ref<AnomalieCode[] | null>(null);
const compareEvolutionEnvois = ref<EvolutionPeriode[] | null>(null);
const bilanEnvois = ref<PageResult<BilanEnvoiItem>>({
  data: [],
  meta: { total: 0, page: 1, limit: 5 },
});
const avancement = ref(null);

// Références DOM des graphiques
const bilanChartCurrentRef = ref<HTMLElement | null>(null);
const bilanChartCompareRef = ref<HTMLElement | null>(null);
const rejectsChartRef = ref<HTMLElement | null>(null);
const palmaresAnomaliesRef = ref<HTMLElement | null>(null);

// Composables
const { downloadJson, downloadXlsx, fetchAllPages, downloadRangeAsXlsx, downloadCanvasPng, downloadComparisonPng } =
  useTelechargements();

const { copiedValue } = useCC();

const graphique = useBilanGraphique({
  unit,
  baseDate,
  fromBase,
  toBase,
  resumeKpi,
  palmaresAnomalies,
  evolutionEnvois,
  compareKpi,
  comparePalmaresAnomalies,
  compareEvolutionEnvois,
});
const {
  bilanViewMode,
  bilanChartType,
  detailAnomalies,
  drillDownGroupe,
  compareRangeOverride,
  compareHasData,
  bilanHasData,
  bilanBarHasData,
  compareBarHasData,
  compareRange,
  currentPeriodLabel,
  compareRangeLabel,
  bilanChartX,
  bilanChartY,
  compareChartX,
  compareChartY,
  bilanPieColors,
  comparePieColors,
  bilanBarCategories,
  bilanBarSeries,
  compareBarSeries,
  tauxValidation,
  tauxRejet,
  onSegmentClick,
  onBarSegmentClick,
  retourCategories,
} = graphique;

const repetitionsState = useRepetitions();
const {
  repetitions,
  modalAlertes,
  vueAlertes,
  selectedRepetitionGroupe,
  selectedRepetitionEnvoi,
  groupeAOuvrirKey,
  rechercheAlertesBrouillon,
  repetitionsApercu,
  repetitionsRestantes,
  rechercheAlertesAppliquee,
  alertesPage,
  alertesLimit,
  alertesTotal,
  alertesMaxPage,
  changerPageAlertes,
  masquerRepetition,
  ouvrirModalAlertes,
  fermerModalAlertes,
  ouvrirDetailRepetition,
  retourListeAlertes,
  validerRechercheAlertes,
} = repetitionsState;

const filtres = useBilanFiltres({ fromBase, toBase, bilanEnvois, isLoading });
const {
  statutFiltreBrouillon,
  etatFiltreBrouillon,
  rechercheBilanBrouillon,
  filtreMenuOuvert,
  nombreFiltresActifs,
  ordreDate,
  toggleFiltreMenu,
  chargerBilanEnvois,
  validerFiltresBilan,
  reinitialiserFiltresBilan,
  validerRechercheBilan,
  changerPageBilan,
  changerTriDate,
} = filtres;

const rejetes = useEnvoisRejetes({ fromBase, toBase });
const {
  envoisRejetes,
  rechercheRejetsBrouillon,
  changerTriDate: changerTriDateReject,
  ordreDate: ordreDateReject,
  chargerEnvoisRejetes,
  validerRechercheRejets,
  changerPageRejetes,
} = rejetes;

const historique = useHistoriqueParcellaire({ isLoading });
const {
  modalHistoriqueEnvoi,
  vueModal,
  currentNumeroBio,
  currentNumeroClient,
  currentAuditDate,
  historiqueCurrentParcellaire,
  selectedEnvoi,
  envoiOrigine,
  openDetailsEnvoi,
  selectHistoriqueEnvoi,
  retourHistorique,
  retournerEnvoiOrigine,
  fermerModalHistorique,
} = historique;

// Téléchargements : configuration des menus
const tableDownloadActions: DownloadAction[] = [
  { id: "json", label: "Télécharger en JSON pour la période séléctionné", icon: "fr-icon-file-line" },
  { id: "xlsx", label: "Télécharger en XLSX pour la période séléctionné", icon: "fr-icon-file-line" },
  { id: "xlsx-week", label: "Télécharger la semaine courante (XLSX)", icon: "fr-icon-calendar-line" },
  { id: "xlsx-month", label: "Télécharger le mois courant (XLSX)", icon: "fr-icon-calendar-line" },
];

const chartDownloadActions: DownloadAction[] = [
  { id: "png", label: "Télécharger l'image (PNG)", icon: "fr-icon-image-line" },
  { id: "json", label: "Télécharger les données pour la période séléctionné (JSON)", icon: "fr-icon-file-line" },
  { id: "xlsx", label: "Télécharger les donnéespour la période séléctionné (XLSX)", icon: "fr-icon-file-line" },
  { id: "json-week", label: "Télécharger la semaine courante (JSON)", icon: "fr-icon-calendar-line" },
  { id: "json-month", label: "Télécharger le mois courant (JSON)", icon: "fr-icon-calendar-line" },
];

const palmaresDownloadActions: DownloadAction[] = [
  { id: "png", label: "Télécharger l'image (PNG)", icon: "fr-icon-image-line" },
  ...tableDownloadActions,
];

// Mappage des lignes pour l'export
function mapBilanRows(data: BilanEnvoiItem[]) {
  return data.map((envoi) => ({
    "N° client": envoi.numeroClient,
    "N° BIO": envoi.numeroBio,
    État: envoi.etat === "UNKNOWN" ? "—" : envoi.etat === "UPDATED" ? "Mise à jour" : "Création",
    "Date d'envoi": formatDateTableau(envoi.createdAt),
    Statut: envoi.statut === "VALID" ? "Validé" : "Rejeté",
  }));
}

function mapRejectsRows(data: BilanEnvoiItem[]) {
  return data.map((envoi) => ({
    "N° client": envoi.numeroClient,
    "N° BIO": envoi.numeroBio,
    "Date d'audit": envoi.auditDate ? formatDateControle(envoi.auditDate) : "—",
    Rejets: (envoi.details ?? []).map((detail) => getErrorMessage(detail.code, "short")).join(", "),
    "Date d'envoi": formatDateTableau(envoi.createdAt),
  }));
}

const bilanChartRowsForExport = computed<ChartRow[]>(() =>
  bilanChartX.value.map((label, index) => ({
    période: currentPeriodLabel.value,
    catégorie: label,
    valeur: bilanChartY.value[index],
    unité: detailAnomalies.value ? "nombre" : "%",
  })),
);

const compareChartRowsForExport = computed<ChartRow[]>(() => [
  ...compareChartX.value.map((label, index) => ({
    période: compareRangeLabel.value,
    catégorie: label,
    valeur: compareChartY.value[index],
    unité: detailAnomalies.value ? "nombre" : "%",
  })),
  ...bilanChartRowsForExport.value,
]);

async function chartRowsForRange(from: Date, to: Date, periodLabel: string): Promise<ChartRow[]> {
  const anomalies = await fetchPalmaresAnomalies(formatStartOfDay(from), formatEndOfDay(to));
  if (!detailAnomalies.value) {
    const kpi = await fetchGeneralKpi(formatStartOfDay(from), formatEndOfDay(to));
    const taux = calculerTaux(kpi);
    return [
      { période: periodLabel, catégorie: "Acceptés", valeur: taux.validation, unité: "%" },
      { période: periodLabel, catégorie: "Rejetés", valeur: taux.rejet, unité: "%" },
    ];
  }
  const { x, y } = drillDownGroupe.value
    ? graphique.anomaliesDetailChartData(anomalies, drillDownGroupe.value.key)
    : graphique.anomaliesTopChartData(anomalies);
  return x.map((label, index) => ({
    période: periodLabel,
    catégorie: label,
    valeur: y[index],
    unité: "nombre",
  }));
}

async function onBilanTableDownload(action: string) {
  if (action === "json") {
    if (!fromBase.value || !toBase.value) return;
    const rows = mapBilanRows(
      await fetchAllPages(fetchBilanEnvois, fromBase.value.toISOString(), toBase.value.toISOString(), 500),
    );
    downloadJson(rows, "bilan-envois.json");
    return;
  }
  if (action === "xlsx") {
    if (!fromBase.value || !toBase.value) return;
    const rows = mapBilanRows(
      await fetchAllPages(fetchBilanEnvois, fromBase.value.toISOString(), toBase.value.toISOString(), 500),
    );
    downloadXlsx(rows, "bilan-envois.xlsx", "Bilan des envois");
    return;
  }
  if (action === "xlsx-week") {
    await downloadRangeAsXlsx(
      fetchBilanEnvois,
      mapBilanRows,
      currentWeekRange(),
      "bilan-envois-semaine-courante.xlsx",
      "Bilan des envois",
    );
    return;
  }
  if (action === "xlsx-month") {
    await downloadRangeAsXlsx(
      fetchBilanEnvois,
      mapBilanRows,
      currentMonthRange(),
      "bilan-envois-mois-courant.xlsx",
      "Bilan des envois",
    );
  }
}

async function onRejectsTableDownload(action: string) {
  if (action === "png") {
    downloadCanvasPng(palmaresAnomaliesRef.value, "palmares-rejets.png");
    return;
  }
  if (action === "json") {
    if (!fromBase.value || !toBase.value) return;
    const rows = mapRejectsRows(
      await fetchAllPages(fetchEnvoisRejetes, fromBase.value.toISOString(), toBase.value.toISOString(), 500),
    );
    downloadJson(rows, "envois-rejetes.json");
    return;
  }
  if (action === "xlsx") {
    if (!fromBase.value || !toBase.value) return;
    const rows = mapRejectsRows(
      await fetchAllPages(fetchEnvoisRejetes, fromBase.value.toISOString(), toBase.value.toISOString(), 500),
    );
    downloadXlsx(rows, "envois-rejetes.xlsx", "Envois rejetés");
    return;
  }
  if (action === "xlsx-week") {
    await downloadRangeAsXlsx(
      fetchEnvoisRejetes,
      mapRejectsRows,
      currentWeekRange(),
      "envois-rejetes-semaine-courante.xlsx",
      "Envois rejetés",
    );
    return;
  }
  if (action === "xlsx-month") {
    await downloadRangeAsXlsx(
      fetchEnvoisRejetes,
      mapRejectsRows,
      currentMonthRange(),
      "envois-rejetes-mois-courant.xlsx",
      "Envois rejetés",
    );
  }
}

async function onBilanChartDownload(action: string) {
  if (action === "png") {
    if (bilanChartType.value === "bar") {
      downloadCanvasPng(bilanChartCurrentRef.value, "bilan-envois.png");
      return;
    }
    if (bilanViewMode.value === "comparer") {
      downloadComparisonPng(
        bilanChartCompareRef.value,
        bilanChartCurrentRef.value,
        compareRangeLabel.value,
        currentPeriodLabel.value,
      );
    } else {
      downloadCanvasPng(bilanChartCurrentRef.value, "bilan-envois.png");
    }
    return;
  }
  if (action === "json") {
    const rows = bilanViewMode.value === "comparer" ? compareChartRowsForExport.value : bilanChartRowsForExport.value;
    downloadJson(rows, "bilan-graphique.json");
    return;
  }
  if (action === "xlsx") {
    const rows = bilanViewMode.value === "comparer" ? compareChartRowsForExport.value : bilanChartRowsForExport.value;
    downloadXlsx(rows, "bilan-graphique.xlsx", "Bilan graphique");
    return;
  }
  if (action === "json-week") {
    const { from, to } = currentWeekRange();
    const rows = await chartRowsForRange(from, to, "Semaine courante");
    downloadJson(rows, "bilan-graphique-semaine-courante.json");
    return;
  }
  if (action === "json-month") {
    const { from, to } = currentMonthRange();
    const rows = await chartRowsForRange(from, to, "Mois courant");
    downloadJson(rows, "bilan-graphique-mois-courant.json");
  }
}

// Changements de période
const changePeriod = (e: ChangePeriodPayload) => {
  fromBase.value = e.compareRange.start;
  toBase.value = e.compareRange.end;
  unit.value = e.comparePeriod;
};

const changeComparePeriod = (e: { compareRange: { start: Date; end: Date } }) => {
  compareRangeOverride.value = { from: e.compareRange.start, to: e.compareRange.end };
  chargerComparePeriode();
};

async function chargerComparePeriode() {
  if (!compareRange.value) return;
  const { from, to } = compareRange.value;
  const [palmares, kpi, evolution] = await Promise.all([
    fetchPalmaresAnomalies(formatStartOfDay(from), formatEndOfDay(to)),
    fetchGeneralKpi(formatStartOfDay(from), formatEndOfDay(to)),
    fetchPalmaresAnomaliesGrouped(formatStartOfDay(from), formatEndOfDay(to)),
  ]);
  comparePalmaresAnomalies.value = palmares;
  compareKpi.value = kpi;
  compareEvolutionEnvois.value = evolution;
}

async function chargerAlertes() {
  const res = await fetchRepetitions(
    alertesPage.value,
    alertesLimit.value,
    rechercheAlertesAppliquee.value || undefined,
  );
  repetitions.value = res.data ?? [];
  alertesTotal.value = res.meta?.total ?? 0;
}

watch([rechercheAlertesAppliquee, alertesPage], () => {
  chargerAlertes();
});

// Chargement principal
watch([fromBase, toBase], async ([from, to]) => {
  if (!from || !to) return;
  isLoading.value = true;
  drillDownGroupe.value = null;
  graphique.compareOffset.value = 0;
  compareRangeOverride.value = null;

  resumeKpi.value = await fetchGeneralKpi(formatStartOfDay(from), formatEndOfDay(to));
  await chargerBilanEnvois(1);
  palmaresAnomalies.value = await fetchPalmaresAnomalies(formatStartOfDay(from), formatEndOfDay(to));
  await chargerEnvoisRejetes(1);
  evolutionEnvois.value = await fetchPalmaresAnomaliesGrouped(formatStartOfDay(from), formatEndOfDay(to));

  if (bilanViewMode.value === "comparer") await chargerComparePeriode();
  isLoading.value = false;
});

watch(detailAnomalies, () => {
  drillDownGroupe.value = null;
});

watch(bilanViewMode, (mode) => {
  if (mode === "comparer") chargerComparePeriode();
});

onMounted(async () => {
  isLoading.value = true;
  await chargerAlertes();
  avancement.value = await getDashboardSummary([], new Date().getFullYear());
  isLoading.value = false;
});
</script>

<template>
  <div>
    <div class="fr-container fr-py-6w">
      <div class="fr-grid-row fr-grid-row--center">
        <div class="fr-col-6">
          <h1 class="fr-h2 fr-mb-1w" style="color: var(--blue-france-sun-113-625)">
            Tableau de bord <br />des envois par APIs
          </h1>
          <p :class="isMobile ? 'fr-text--lead' : ''">{{ user.organismeCertificateur?.nom || "ADMIN" }}</p>
        </div>
        <div class="fr-m-auto" :class="isMobile ? 'fr-col-6' : 'fr-col-6'">
          <AutoCompleteSearch
            id="search"
            v-model="searchQuery"
            :placeholder="isMobile ? 'Rechercher...' : null"
            class="mobile-autocomplete"
            :class="{ 'is-mobile': isMobile }"
          />
        </div>
      </div>
    </div>

    <div class="around-container">
      <div class="fr-container fr-py-6w">
        <div class="fr-grid-row" v-if="avancement">
          <JaugeAvancement
            class="fr-col-4 fr-mb-4w"
            :title="'Avancement des certifications ' + new Date().getFullYear()"
            label="Envoyés et validés"
            :info-text="'Certifications envoyées et validées depuis le 1er janvier ' + new Date().getFullYear()"
            :value="avancement.countCertifiees"
            :max="avancement.countCertifiees + avancement.countEnAttentes + avancement.countNonAuditees"
          />
        </div>
        <!-- Alertes de répétitions -->
        <AlertesBanniere
          :apercu="repetitionsApercu"
          :restantes="repetitionsRestantes"
          @masquer="masquerRepetition"
          @ouvrir="ouvrirModalAlertes"
        />
        <!-- Ligne filtres + sélecteur de période -->
        <div class="fr-grid-row fr-grid-row--gutters fr-mb-4w stats-row">
          <div class="fr-col-12 fr-col-lg-8 stats-row__filters"></div>
          <div class="fr-col-12 fr-col-lg-4 fr-text--right stats-row__date-picker">
            <DatePicker v-model:unit="unit" :base-date="baseDate" @validate="changePeriod" />
          </div>
        </div>

        <!-- KPI -->
        <div v-if="resumeKpi && resumeKpi.totalValides >= 0">
          <div class="fr-grid-row fr-grid-row--gutters fr-mb-4w">
            <div class="fr-col-12 fr-col-md-6 fr-col-lg-3">
              <div class="parcellaire-bloc-envoye">
                <p class="fr-text--xl fr-mb-1w">
                  Parcellaires envoyés
                  {{ formatPeriodLabel(unit, fromBase ?? baseDate).toLowerCase() }}
                </p>
                <p class="fr-mb-0 global-envoie">{{ resumeKpi.totalEnvoyes ?? "—" }}</p>
              </div>
            </div>
            <div class="fr-col-12 fr-col-md-6 fr-col-lg-3">
              <StatsCard
                title="Envois validés"
                :value="resumeKpi.totalValides ?? 0"
                :total="resumeKpi.totalEnvoyes ?? 0"
                :badge="tauxValidation"
                :picto="successPicto"
                picto-alt="Succès"
              />
            </div>
            <div class="fr-col-12 fr-col-md-6 fr-col-lg-3">
              <StatsCard
                title="Envois rejetés"
                :value="resumeKpi.totalRejetes ?? 0"
                :total="resumeKpi.totalEnvoyes ?? 0"
                :badge="tauxRejet"
                variant="error"
                :picto="errorPicto"
                picto-alt="Erreur"
              />
            </div>
            <div class="fr-col-12 fr-col-md-6 fr-col-lg-3">
              <StatsCard
                :title="`Anomalie la plus fréquente ${formatPeriodLabel(unit, fromBase ?? baseDate).toLowerCase()}`"
                :value="getErrorMessage(resumeKpi.anomaliePlusFrequente?.code, 'short') ?? '—'"
                variant="warning"
              />
            </div>
          </div>
        </div>
        <div v-else class="card fr-mb-4w">
          <div class="bilan-empty bilan-empty--kpi">Aucune donnée</div>
        </div>

        <!-- Bilan des envois : tableau + graphique -->
        <div class="fr-grid-row fr-grid-row--gutters">
          <div class="fr-col-12 fr-col-lg-6">
            <div class="card">
              <div class="download-title-row fr-mb-2w">
                <h2 class="fr-h6 fr-mb-0">Bilan des envois</h2>
                <div class="table-actions">
                  <button
                    type="button"
                    class="fr-btn fr-btn--tertiary-no-outline fr-icon-arrow-right-up-line"
                    aria-label="Agrandir le tableau bilan des envois"
                    @click="modalBilanEnvoisAgrandi = true"
                  >
                    <span class="fr-sr-only">Agrandir le tableau bilan des envois</span>
                  </button>
                </div>
              </div>

              <div class="fr-table__header">
                <div class="fr-search-bar">
                  <label class="fr-label" for="table-search-input">Rechercher N° BIO / N° Client</label>
                  <input
                    id="table-search-input"
                    class="fr-input"
                    aria-describedby="table-search-input-messages"
                    type="search"
                    v-model="rechercheBilanBrouillon"
                    @keyup.enter="validerRechercheBilan"
                  />
                  <div id="table-search-input-messages" class="fr-messages-group" aria-live="polite"></div>
                  <button type="button" class="fr-btn" @click="validerRechercheBilan">Rechercher</button>
                </div>
                <ul class="fr-btns-group fr-btns-group--right fr-btns-group--inline-md fr-btns-group--icon-left">
                  <li>
                    <div class="filtre-wrapper">
                      <button
                        type="button"
                        class="fr-btn fr-btn--secondary"
                        :aria-expanded="filtreMenuOuvert"
                        aria-controls="filtre-panel-bilan"
                        @click="toggleFiltreMenu"
                      >
                        <i class="ri-filter-3-line"></i>
                        <span class="fr-ml-1w">Filtrer</span>
                        <span v-if="nombreFiltresActifs > 0" class="fr-badge fr-badge--sm fr-badge--info filtre-count">
                          {{ nombreFiltresActifs }}
                        </span>
                      </button>
                      <div
                        v-show="filtreMenuOuvert"
                        id="filtre-panel-bilan"
                        class="filtre-panel"
                        role="dialog"
                        aria-label="Filtres du tableau"
                      >
                        <div class="filtre-panel__header">
                          <h3 class="fr-h6 fr-mb-0">Filtres</h3>
                        </div>
                        <div class="filtre-panel__body">
                          <fieldset class="fr-fieldset filtre-panel__section">
                            <legend class="fr-fieldset__legend fr-text--bold fr-mb-1w">Statut</legend>
                            <div class="filtre-panel__elements">
                              <div
                                v-for="option in STATUT_OPTIONS"
                                :key="option.value"
                                class="fr-checkbox-group fr-checkbox-group--sm"
                              >
                                <input
                                  :id="`statut-${option.value}`"
                                  type="checkbox"
                                  :value="option.value"
                                  v-model="statutFiltreBrouillon"
                                />
                                <label class="fr-label" :for="`statut-${option.value}`">{{ option.label }}</label>
                              </div>
                            </div>
                          </fieldset>
                          <hr class="filtre-panel__separator" />
                          <fieldset class="fr-fieldset filtre-panel__section">
                            <legend class="fr-fieldset__legend fr-text--bold fr-mb-1w">État</legend>
                            <div class="filtre-panel__elements">
                              <div
                                v-for="option in ETAT_OPTIONS"
                                :key="option.value"
                                class="fr-checkbox-group fr-checkbox-group--sm"
                              >
                                <input
                                  :id="`etat-${option.value}`"
                                  type="checkbox"
                                  :value="option.value"
                                  v-model="etatFiltreBrouillon"
                                />
                                <label class="fr-label" :for="`etat-${option.value}`">{{ option.label }}</label>
                              </div>
                            </div>
                          </fieldset>
                        </div>
                        <div class="filtre-panel__actions">
                          <button
                            type="button"
                            class="fr-btn fr-btn--tertiary-no-outline fr-btn--sm"
                            @click="reinitialiserFiltresBilan"
                          >
                            Réinitialiser
                          </button>
                          <button type="button" class="fr-btn fr-btn--sm" @click="validerFiltresBilan">Valider</button>
                        </div>
                      </div>
                    </div>
                  </li>
                  <li>
                    <ActionDropdown
                      noWrap
                      with-icons
                      icon-class="fr-icon-more-line fr-btn--sm"
                      icon-style="font-size: 1.2em"
                    >
                      <template v-for="action in tableDownloadActions" :key="action.id">
                        <li>
                          <button
                            type="button"
                            class="fr-btn fr-btn--sm fr-btn--tertiary-no-outline fr-btn--icon-left"
                            :class="action.icon"
                            @click="onBilanTableDownload(action.id)"
                          >
                            {{ action.label }}
                          </button>
                        </li>
                      </template>
                    </ActionDropdown>
                  </li>
                </ul>
              </div>

              <BilanEnvoisTable
                v-if="bilanEnvois.data.length"
                :envois="bilanEnvois.data"
                :page="bilanEnvois.meta.page"
                :max-page="Math.ceil(bilanEnvois.meta.total / bilanEnvois.meta.limit)"
                :ordre-date="ordreDate"
                table-id="table-bilan-envoi"
                @change-page="changerPageBilan"
                @open-details="openDetailsEnvoi"
                @change-tri-date="changerTriDate"
                :large="false"
              />
              <div v-else class="bilan-empty bilan-empty--table">Aucune donnée</div>
            </div>
          </div>

          <!-- Graphique bilan -->
          <div class="fr-col-12 fr-col-lg-6">
            <div class="card">
              <div class="bilan-header fr-mb-2w">
                <h2 class="fr-h6 fr-mb-0">Bilan des envois</h2>
                <div class="bilan-header__right">
                  <div class="fr-segmented fr-segmented--sm">
                    <div class="fr-segmented__elements">
                      <div class="fr-segmented__element">
                        <input
                          v-model="bilanChartType"
                          type="radio"
                          id="segmented-pie"
                          name="bilan-chart-mode"
                          value="pie"
                        />
                        <label class="fr-label" for="segmented-pie">
                          <span class="fr-icon-pie-chart-line fr-icon--sm" aria-hidden="true"></span>
                          <span class="fr-sr-only">Afficher sous forme de diagramme circulaire</span>
                        </label>
                      </div>
                      <div class="fr-segmented__element">
                        <input
                          v-model="bilanChartType"
                          type="radio"
                          id="segmented-bar"
                          name="bilan-chart-mode"
                          value="bar"
                        />
                        <label class="fr-label" for="segmented-bar">
                          <span class="fr-icon-bar-chart-2-line fr-icon--sm" aria-hidden="true"></span>
                          <span class="fr-sr-only">Afficher sous forme d'histogramme</span>
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div class="bilan-controls fr-mb-3w">
                <div class="flex">
                  <div class="fr-segmented fr-segmented--sm">
                    <div class="fr-segmented__elements">
                      <div class="fr-segmented__element">
                        <input
                          v-model="bilanViewMode"
                          type="radio"
                          id="segmented-consulter"
                          name="bilan-mode"
                          value="consulter"
                        />
                        <label class="fr-label" for="segmented-consulter">Consulter</label>
                      </div>
                      <div class="fr-segmented__element">
                        <input
                          v-model="bilanViewMode"
                          type="radio"
                          id="segmented-comparer"
                          name="bilan-mode"
                          value="comparer"
                        />
                        <label class="fr-label" for="segmented-comparer">Comparer</label>
                      </div>
                    </div>
                  </div>
                  <div class="fr-checkbox-group fr-checkbox-group--sm">
                    <input v-model="detailAnomalies" type="checkbox" id="checkbox-detail-anomalies" />
                    <label class="fr-label" for="checkbox-detail-anomalies">Détail des anomalies</label>
                  </div>
                </div>
                <ActionDropdown
                  noWrap
                  with-icons
                  icon-class="fr-icon-more-line fr-btn--sm"
                  icon-style="font-size: 1.2em"
                >
                  <li v-for="action in chartDownloadActions" :key="action.id">
                    <button
                      type="button"
                      class="fr-btn fr-btn--sm fr-btn--tertiary-no-outline fr-btn--icon-left"
                      :class="action.icon"
                      @click="onBilanChartDownload(action.id)"
                    >
                      {{ action.label }}
                    </button>
                  </li>
                </ActionDropdown>
              </div>

              <button
                v-if="detailAnomalies && drillDownGroupe"
                type="button"
                class="fr-btn fr-btn--tertiary-no-outline fr-icon-arrow-left-line fr-btn--icon-left fr-mb-2w"
                @click="retourCategories"
              >
                {{ drillDownGroupe.label }}
              </button>
              <div
                v-else
                class="fr-btn fr-btn--tertiary-no-outline fr-mb-2w"
                aria-hidden="true"
                style="visibility: hidden"
              >
                &nbsp;
              </div>

              <div v-if="bilanChartType === 'pie'">
                <div v-if="bilanViewMode === 'consulter'" ref="bilanChartCurrentRef" class="align-center">
                  <PieChartCustom
                    v-if="bilanHasData"
                    :x="bilanChartX"
                    :y="bilanChartY"
                    :name="detailAnomalies ? ['Anomalies'] : ['Validés', 'Rejetés']"
                    :colors="bilanPieColors"
                    :unit-tooltip="detailAnomalies ? '' : '%'"
                    @segment-click="(p: { index: number }) => onSegmentClick(p, palmaresAnomalies)"
                  />
                  <div v-else class="bilan-empty">Aucune donnée</div>
                </div>
                <div v-else class="bilan-compare">
                  <div class="bilan-compare__col" ref="bilanChartCompareRef">
                    <div class="bilan-compare__nav">
                      <DatePicker
                        :unit="unit"
                        :base-date="fromBase ?? baseDate"
                        is-compare
                        @validate="changeComparePeriod"
                      />
                    </div>
                    <template v-if="compareHasData">
                      <PieChartCustom
                        :x="compareChartX"
                        :y="compareChartY"
                        :name="detailAnomalies ? ['Anomalies'] : ['Validés', 'Rejetés']"
                        :colors="comparePieColors"
                        :unit-tooltip="detailAnomalies ? '' : '%'"
                        @segment-click="(p: { index: number }) => onSegmentClick(p, comparePalmaresAnomalies)"
                      />
                    </template>
                    <div v-else class="bilan-empty">Aucune donnée</div>
                  </div>
                  <div class="bilan-compare__col" ref="bilanChartCurrentRef">
                    <div class="bilan-compare__nav bilan-compare__nav--static" style="height: 2.5rem">
                      {{ currentPeriodLabel }}
                    </div>
                    <template v-if="bilanHasData">
                      <PieChartCustom
                        :x="bilanChartX"
                        :y="bilanChartY"
                        :name="detailAnomalies ? ['Anomalies'] : ['Validés', 'Rejetés']"
                        :colors="bilanPieColors"
                        :unit-tooltip="detailAnomalies ? '' : '%'"
                        @segment-click="(p: { index: number }) => onSegmentClick(p, palmaresAnomalies)"
                      />
                    </template>
                    <div v-else class="bilan-empty">Aucune donnée</div>
                  </div>
                </div>
              </div>
              <div v-else>
                <template v-if="bilanViewMode === 'consulter'">
                  <div ref="bilanChartCurrentRef">
                    <BarGraphCustom
                      v-if="bilanBarHasData"
                      :categories="bilanBarCategories"
                      :series="bilanBarSeries"
                      @segment-click="onBarSegmentClick"
                    />
                    <div v-else class="bilan-empty">Aucune donnée</div>
                  </div>
                </template>
                <div v-else>
                  <div class="bilan-compare__nav fr-grid-row fr-grid-row--cente">
                    <DatePicker
                      :unit="unit"
                      :base-date="fromBase ?? baseDate"
                      is-compare
                      @validate="changeComparePeriod"
                      class="fr-col-6"
                    />
                    <b class="fr-col center">{{ currentPeriodLabel }}</b>
                  </div>
                  <div ref="bilanChartCurrentRef">
                    <template v-if="bilanBarHasData || compareBarHasData">
                      <BarGraphCustom
                        class="fr-mt-4w"
                        :categories="bilanBarCategories"
                        :series="bilanBarSeries"
                        :comparison-series="compareBarSeries"
                        @segment-click="onBarSegmentClick"
                        :label-period="currentPeriodLabel"
                        :label-period-compare="compareRangeLabel"
                      />
                    </template>
                    <div v-else class="bilan-empty">Aucune donnée</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Envois rejetés + palmarès -->
        <div v-if="resumeKpi" class="fr-grid-row fr-grid-row--gutters fr-mt-4w">
          <div class="fr-col-12 fr-col-lg-8">
            <div class="card">
              <div class="download-title-row fr-mb-2w">
                <h2 class="fr-h6 fr-mb-0">
                  Envois rejetés {{ formatPeriodLabel(unit, fromBase ?? baseDate).toLowerCase() }}
                </h2>
              </div>
              <div class="fr-table__header">
                <div class="fr-search-bar">
                  <label class="fr-label" for="table-search-rejetes-input">Rechercher</label>
                  <input
                    id="table-search-rejetes-input"
                    class="fr-input"
                    aria-describedby="table-search-rejetes-messages"
                    placeholder="Rechercher"
                    type="search"
                    v-model="rechercheRejetsBrouillon"
                    @keyup.enter="validerRechercheRejets"
                  />
                  <div id="table-search-rejetes-messages" class="fr-messages-group" aria-live="polite"></div>
                  <button type="button" class="fr-btn" @click="validerRechercheRejets">Rechercher</button>
                </div>
                <ul class="fr-btns-group fr-btns-group--right fr-btns-group--inline-md fr-btns-group--icon-left">
                  <li>
                    <ActionDropdown
                      noWrap
                      with-icons
                      icon-class="fr-icon-more-line fr-btn--sm"
                      icon-style="font-size: 1.2em"
                    >
                      <li v-for="action in tableDownloadActions" :key="action.id">
                        <button
                          type="button"
                          class="fr-btn fr-btn--sm fr-btn--tertiary-no-outline fr-btn--icon-left"
                          :class="action.icon"
                          @click="onRejectsTableDownload(action.id)"
                        >
                          {{ action.label }}
                        </button>
                      </li>
                    </ActionDropdown>
                  </li>
                </ul>
              </div>
              <EnvoisRejetesTable
                v-if="envoisRejetes.data.length"
                :envois="envoisRejetes.data"
                :page="envoisRejetes.meta.page"
                :ordre-date="ordreDateReject"
                :max-page="Math.ceil(envoisRejetes.meta.total / envoisRejetes.meta.limit)"
                @change-page="changerPageRejetes"
                @open-details="openDetailsEnvoi"
                @change-tri-date="changerTriDateReject"
              />
              <div v-else class="bilan-empty bilan-empty--table">Aucune donnée</div>
            </div>
          </div>

          <div class="fr-col-12 fr-col-lg-4" ref="rejectsChartRef">
            <div class="card">
              <div class="download-title-row fr-mb-2w">
                <h2 class="fr-h6 fr-mb-0">
                  Palmarès des causes de rejets {{ formatPeriodLabel(unit, fromBase ?? baseDate).toLowerCase() }}
                </h2>
                <ActionDropdown
                  noWrap
                  with-icons
                  icon-class="fr-icon-more-line fr-btn--sm"
                  icon-style="font-size: 1.2em"
                >
                  <li v-for="action in palmaresDownloadActions" :key="action.id">
                    <button
                      type="button"
                      class="fr-btn fr-btn--sm fr-btn--tertiary-no-outline fr-btn--icon-left"
                      :class="action.icon"
                      @click="onRejectsTableDownload(action.id)"
                    >
                      {{ action.label }}
                    </button>
                  </li>
                </ActionDropdown>
              </div>
              <div ref="palmaresAnomaliesRef">
                <RejectsChart v-if="palmaresAnomalies?.length" :reject-data="palmaresAnomalies" />
                <div v-else class="bilan-empty">Aucune donnée</div>
              </div>
            </div>
          </div>
        </div>
        <div v-else>
          <span>Aucun envoi parcellaire cette semaine</span>
        </div>
      </div>
    </div>

    <!-- Modale bilan agrandi -->
    <Modal
      v-if="modalBilanEnvoisAgrandi"
      data-track-content
      data-content-name="Bilan des envois agrandi"
      @close="modalBilanEnvoisAgrandi = false"
    >
      <template #header>
        <button
          class="fr-btn fr-btn--close"
          type="button"
          aria-controls="global-modal"
          @click="modalBilanEnvoisAgrandi = false"
        >
          Fermer
        </button>
      </template>
      <div class="download-title-row fr-mb-2w">
        <h2 class="fr-h6 fr-mb-0">Bilan des envois</h2>
      </div>
      <div class="fr-table__header">
        <div class="fr-search-bar">
          <label class="fr-label" for="table-search-agrandi-input">Rechercher</label>
          <input
            id="table-search-agrandi-input"
            class="fr-input"
            aria-describedby="table-search-agrandi-input-messages"
            placeholder="Rechercher"
            type="search"
            v-model="rechercheBilanBrouillon"
            @keyup.enter="validerRechercheBilan"
          />
          <div id="table-search-agrandi-input-messages" class="fr-messages-group" aria-live="polite"></div>
          <button type="button" class="fr-btn" @click="validerRechercheBilan">Rechercher</button>
        </div>
        <ul class="fr-btns-group fr-btns-group--right fr-btns-group--inline-md fr-btns-group--icon-left">
          <li>
            <div class="filtre-wrapper">
              <button
                type="button"
                class="fr-btn fr-btn--secondary"
                :aria-expanded="filtreMenuOuvert"
                aria-controls="filtre-panel-bilan"
                @click="toggleFiltreMenu"
              >
                <i class="ri-filter-3-line"></i>
                <span class="fr-ml-1w">Filtrer</span>
                <span v-if="nombreFiltresActifs > 0" class="fr-badge fr-badge--sm fr-badge--info filtre-count">
                  {{ nombreFiltresActifs }}
                </span>
              </button>
              <div
                v-show="filtreMenuOuvert"
                id="filtre-panel-bilan"
                class="filtre-panel"
                role="dialog"
                aria-label="Filtres du tableau"
              >
                <div class="filtre-panel__header">
                  <h3 class="fr-h6 fr-mb-0">Filtres</h3>
                </div>
                <div class="filtre-panel__body">
                  <fieldset class="fr-fieldset filtre-panel__section">
                    <legend class="fr-fieldset__legend fr-text--bold fr-mb-1w">Statut</legend>
                    <div class="filtre-panel__options">
                      <div
                        v-for="option in STATUT_OPTIONS"
                        :key="option.value"
                        class="fr-checkbox-group fr-checkbox-group--sm"
                      >
                        <input
                          :id="`statut-${option.value}`"
                          type="checkbox"
                          :value="option.value"
                          v-model="statutFiltreBrouillon"
                        />
                        <label class="fr-label" :for="`statut-${option.value}`">{{ option.label }}</label>
                      </div>
                    </div>
                  </fieldset>
                  <hr class="filtre-panel__separator" />
                  <fieldset class="fr-fieldset filtre-panel__section">
                    <legend class="fr-fieldset__legend fr-text--bold fr-mb-1w">État</legend>
                    <div class="filtre-panel__options">
                      <div
                        v-for="option in ETAT_OPTIONS"
                        :key="option.value"
                        class="fr-checkbox-group fr-checkbox-group--sm"
                      >
                        <input
                          :id="`etat-${option.value}`"
                          type="checkbox"
                          :value="option.value"
                          v-model="etatFiltreBrouillon"
                        />
                        <label class="fr-label" :for="`etat-${option.value}`">{{ option.label }}</label>
                      </div>
                    </div>
                  </fieldset>
                </div>
                <div class="filtre-panel__actions">
                  <button
                    type="button"
                    class="fr-btn fr-btn--tertiary-no-outline fr-btn--sm"
                    @click="reinitialiserFiltresBilan"
                  >
                    Réinitialiser
                  </button>
                  <button type="button" class="fr-btn fr-btn--sm" @click="validerFiltresBilan">Valider</button>
                </div>
              </div>
            </div>
          </li>
          <li>
            <ActionDropdown noWrap with-icons icon-class="fr-icon-more-line fr-btn--sm" icon-style="font-size: 1.2em">
              <template v-for="action in tableDownloadActions" :key="action.id">
                <li>
                  <button
                    type="button"
                    class="fr-btn fr-btn--sm fr-btn--tertiary-no-outline fr-btn--icon-left"
                    :class="action.icon"
                    @click="onBilanTableDownload(action.id)"
                  >
                    {{ action.label }}
                  </button>
                </li>
              </template>
            </ActionDropdown>
          </li>
        </ul>
      </div>
      <BilanEnvoisTable
        v-if="bilanEnvois.data.length"
        :envois="bilanEnvois.data"
        :page="bilanEnvois.meta.page"
        :max-page="Math.ceil(bilanEnvois.meta.total / bilanEnvois.meta.limit)"
        table-id="table-bilan-envoi-agrandi"
        :ordre-date="ordreDate"
        large
        @change-page="changerPageBilan"
        @open-details="openDetailsEnvoi"
        @change-tri-date="changerTriDate"
      />
      <div v-else class="bilan-empty bilan-empty--table">Aucune donnée</div>
    </Modal>

    <!-- Modale historique parcellaire -->
    <HistoriqueParcellaireModal
      v-model="modalHistoriqueEnvoi"
      :vue-modal="vueModal"
      :is-loading="isLoading"
      :numero-bio="currentNumeroBio"
      :numero-client="currentNumeroClient"
      :audit-date="currentAuditDate"
      :historique="historiqueCurrentParcellaire"
      :selected-envoi="selectedEnvoi"
      :envoi-origine="envoiOrigine"
      @close="fermerModalHistorique"
      @select-envoi="selectHistoriqueEnvoi"
      @retour-historique="retourHistorique"
      @retour-origine="retournerEnvoiOrigine"
      @open-referentiel="modalReferentielAnomalies = true"
    />

    <!-- Modale alertes -->
    <AlertesModal
      v-model="modalAlertes"
      :vue-alertes="vueAlertes"
      :repetitions="repetitions"
      :groupe-a-ouvrir-key="groupeAOuvrirKey"
      :selected-groupe="selectedRepetitionGroupe"
      :selected-envoi="selectedRepetitionEnvoi"
      :recherche-brouillon="rechercheAlertesBrouillon"
      :page="alertesPage"
      :max-page="alertesMaxPage"
      :total="alertesTotal"
      @update:recherche-brouillon="rechercheAlertesBrouillon = $event"
      @close="fermerModalAlertes"
      @retour-liste="retourListeAlertes"
      @ouvrir-detail="ouvrirDetailRepetition"
      @valider-recherche="validerRechercheAlertes"
      @changer-page="changerPageAlertes"
    />

    <!-- Référentiel des anomalies -->
    <ReferentielAnomalies v-model="modalReferentielAnomalies" @close="modalReferentielAnomalies = false" />

    <div class="fr-messages-group" aria-live="polite">
      <p v-if="copiedValue" class="fr-message fr-message--info">{{ copiedValue }}</p>
    </div>
  </div>
</template>

<style scoped>
.flex {
  display: flex;
  align-items: center;
  gap: 10px;
}
.justify-between {
  justify-content: space-between;
  display: flex;
}

.around-container {
  background: var(--light-decisions-background-background-alt-blue-france, #f5f5fe);
}

/* Premier bloc KPI */
.parcellaire-bloc-envoye {
  color: var(--light-decisions-artwork-artwork-major-blue-france, #000091);
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
}
.global-envoie {
  color: var(--light-decisions-artwork-artwork-major-blue-france, #000091);
  font-family: Marianne;
  font-size: 48px;
  font-style: normal;
  font-weight: 700;
  line-height: 56px;
}

/* Ligne KPI */
.fr-grid-row--gutters.stats-row {
  align-items: stretch;
}
.stats-row [class*="fr-col-"] {
  display: flex;
}
.stats-row__filters {
  margin-bottom: 1rem;
}

.card {
  background: #fff;
  border-radius: 16px;
  padding: 24px 32px;
}
.align-center :deep(figure) {
  margin: auto;
}

/* En-têtes de cartes */
.download-title-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
}
.bilan-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
}
.bilan-controls {
  display: flex;
  align-items: center;
  gap: 24px;
  flex-wrap: wrap;
  justify-content: space-between;
}
.table-actions {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

/* Comparaison */
.bilan-compare {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 24px;
}
.bilan-compare__col {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
}
.bilan-compare__empty {
  color: var(--text-mention-grey);
  padding: 24px 0;
}
.bilan-compare__nav {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 8px;
}
.bilan-compare__nav > div {
  color: var(--blue-france-sun-113-625);
}

.bilan-compare__nav--static {
  color: var(--text-mention-grey);
}

/* Filtrer Menu */
.filtre-wrapper {
  position: relative;
  display: inline-block;
  vertical-align: top;
}
.filtre-count {
  margin-left: 0.5rem;
}
.filtre-panel {
  position: absolute;
  top: calc(100% + 6px);
  right: 0;
  background: #fff;
  border: 1px solid var(--border-default-grey, #ddd);
  border-radius: 8px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.18);
  width: 300px;
  max-width: 90vw;
  z-index: 20;
  overflow: hidden;
}
.filtre-panel__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.75rem 1rem;
  border-bottom: 1px solid var(--border-default-grey, #eee);
  background: var(--background-alt-grey, #f6f6f6);
}
.filtre-panel__body {
  padding: 1rem;
  max-height: 320px;
  overflow-y: auto;
}
.filtre-panel__section {
  margin: 0;
  padding: 0;
  border: none;
}
.filtre-panel__options {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}
.filtre-panel__separator {
  border: none;
  border-top: 1px solid var(--border-default-grey, #eee);
  margin: 1rem 0;
}
.filtre-panel__actions {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  padding: 0.75rem 1rem;
  border-top: 1px solid var(--border-default-grey, #eee);
  background: var(--background-alt-grey, #fafafa);
}
.filtre-panel__actions .fr-btn {
  margin: 0;
}

@media (min-width: 48rem) {
  .stats-row__filters {
    margin-bottom: 0;
  }
}
@media (max-width: 48rem) {
  .bilan-compare {
    flex-direction: column;
  }
  .stats-row__date-picker {
    margin-top: 1rem;
  }

  .download-title-row,
  .bilan-header {
    align-items: flex-start;
    flex-wrap: wrap;
  }
  .global-envoie {
    font-size: 32px;
    line-height: 40px;
  }
}
@media (max-width: 30rem) {
  .flex {
    flex-direction: column;
    align-items: flex-start;
  }
  .bilan-header,
  .download-title-row {
    flex-direction: column;
    align-items: flex-start;
  }
}

.bilan-empty {
  width: 100%;
  min-height: 320px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-mention-grey);
}
.bilan-empty--table {
  min-height: 360px;
}
.bilan-empty--kpi {
  min-height: 140px;
}

.center {
  text-align: center;
}

.stats-row__date-picker > .comparator {
  width: fit-content;
  margin-left: auto;
  margin-right: 0;
}
</style>
