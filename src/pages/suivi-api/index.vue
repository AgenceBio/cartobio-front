<route lang="yaml">
meta:
  requiredRoles: ["certif", "audit"]
  forbiddenRoles: ["admin"]
  requiredPermissions: ["canAccessApiDashboard"]
  skipLinks:
    - Recherche: "#search"
  seo:
    title: "Suivi des envois par APIs"
</route>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onBeforeUnmount } from "vue";
import dayjs from "dayjs";
import {
  fetchPalmaresAnomalies,
  fetchBilanEnvois,
  fetchGeneralKpi,
  fetchEnvoisRejetes,
  fetchPalmaresAnomaliesGrouped,
  fetchRepetitions,
} from "@/api/endpoints/tableau-de-bord.api";
import { getErrorMessage, GROUPE_ANOMALIE_OPTIONS } from "@/utils/error-api.utils";
import PieChartCustom from "@/components/suivi-api/PieChartCustom.vue";
import BarGraphCustom from "@/components/suivi-api/BarGraphCustom.vue";
import DatePicker from "@/components/suivi-api/DatePicker.vue";
import ReferentielAnomalies from "@/components/suivi-api/ReferentielAnomalies.vue";
import Modal from "@/components/widgets/Modal.vue";
import ActionDropdown from "@/components/widgets/ActionDropdown.vue";
import AutoCompleteSearch from "@/components/operator/AutoCompleteSearch.vue";
import StatsCard from "@/components/suivi-api/StatsCard.vue";
import BilanEnvoisTable from "@/components/suivi-api/BilanEnvoisTable.vue";
import EnvoisRejetesTable from "@/components/suivi-api/EnvoisRejetesTable.vue";
import AlertesBanniere from "@/components/suivi-api/AlertesBanniere.vue";
import JaugeAvancement from "@/components/suivi-api/JaugeAvancement.vue";
import HistoriqueParcellaireModal from "@/components/suivi-api/HistoriqueParcellaireModal.vue";
import AlertesModal from "@/components/suivi-api/AlertesModal.vue";
import { useIsMobile } from "@/composables/useIsMobile";
import { useTelechargements } from "@/composables/suivi-api/useTelechargements";
import { useCC } from "@/composables/suivi-api/useCC";
import { useBilanGraphique } from "@/composables/suivi-api/useBilanGraphique";
import { useRepetitions } from "@/composables/suivi-api/useRepetitions";
import { useBilanFiltres, STATUT_OPTIONS, ETAT_OPTIONS } from "@/composables/suivi-api/useBilanFiltres";
import { useEnvoisRejetes } from "@/composables/suivi-api/useEnvoisRejetes";
import { useHistoriqueParcellaire } from "@/composables/suivi-api/useHistoriqueParcellaire";
import successPicto from "@gouvfr/dsfr/artwork/pictograms/system/success.svg";
import errorPicto from "@gouvfr/dsfr/artwork/pictograms/system/error.svg";
import {
  formatPeriodLabel,
  formatStartOfDay,
  formatEndOfDay,
  currentWeekRange,
  currentMonthRange,
} from "@/utils/date.formatters";
import { formatNumberWithSpaces } from "@/utils/numbers.formatters";
import type {
  ResumeKpi,
  CompareKpi,
  AnomalieCode,
  EvolutionPeriode,
  PageResult,
  BilanEnvoiItem,
  DownloadAction,
  ChartRow,
  ChangePeriodPayload,
} from "@/types/suivi-api";
import Spinner from "@/components/widgets/Spinner.vue";

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
const modalRejetsAgrandi = ref<boolean>(false);

// Période
const preferencesStore = usePreferences();
const { unit } = storeToRefs(preferencesStore);
const baseDate = new Date();

const { from, to } = currentWeekRange();

const fromBase = ref<Date | null>(from);
const toBase = ref<Date | null>(to);

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

// Composables
const { downloadXlsx, fetchAllPages, downloadRangeAsXlsx, downloadCanvasPng, downloadComparisonPng } =
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
  repetitionsModal,
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
  typeFiltreAlertes,
  changerPageAlertes,
  masquerRepetition,
  ouvrirModalAlertes,
  fermerModalAlertes,
  ouvrirDetailRepetition,
  retourListeAlertes,
  validerRechercheAlertes,
  changerTypeFiltreAlertes,
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
  groupeFiltreBrouillon,
  groupeFiltreApplique,
  filtreGroupeOuvert,
  ordreDate: ordreDateReject,
  changerTriDate: changerTriDateReject,
  chargerEnvoisRejetes,
  validerRechercheRejets,
  changerPageRejetes,
  toggleFiltreGroupe,
  validerFiltreGroupe,
  reinitialiserFiltreGroupe,
  fetchRejetsFiltres,
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

const COLONNES_BILAN_XLSX = ["N° client", "N° BIO", "État", "Date d'envoi", "Heure d'envoi", "Statut"];
const COLONNES_REJETS_XLSX = ["N° client", "N° BIO", "Date d'audit", "Rejets", "Date d'envoi", "Heure d'envoi"];
const COLONNES_GRAPHIQUE_XLSX = ["période", "catégorie", "valeur", "unité"];

const periodeTelechargement = computed(() => {
  const label = unit.value ? formatPeriodLabel(unit.value, fromBase.value ?? baseDate) : null;
  return (label ?? "").toLowerCase();
});

const titrePngBilan = computed(() => {
  const morceaux = ["Bilan des envois"];
  if (detailAnomalies.value) {
    morceaux.push(drillDownGroupe.value ? `anomalies « ${drillDownGroupe.value.label} »` : "détail des anomalies");
  }
  morceaux.push(periodeTelechargement.value);
  return morceaux.join(" — ");
});

// Téléchargements : configuration des menus
const tableDownloadActions: DownloadAction[] = [
  { id: "xlsx", label: "Télécharger en XLSX pour la période séléctionnée", icon: "fr-icon-file-line" },
  { id: "xlsx-week", label: "Télécharger en XLSX la semaine en cours", icon: "fr-icon-file-line" },
  { id: "xlsx-month", label: "Télécharger en XLSX le mois courant", icon: "fr-icon-file-line" },
];

const chartDownloadActions: DownloadAction[] = [
  { id: "png", label: "Télécharger l'image (PNG)", icon: "fr-icon-image-line" },
  { id: "xlsx", label: "Télécharger en XLSX pour la période séléctionnée", icon: "fr-icon-file-line" },
];

function formatTimestampForXlsx(value: string) {
  const timestamp = dayjs(value);
  return { date: timestamp.format("YYYY-MM-DD"), time: timestamp.format("HH:mm:ss") };
}

function mapBilanRows(data: BilanEnvoiItem[]) {
  return data.map((envoi) => ({
    "N° client": envoi.numeroClient,
    "N° BIO": envoi.numeroBio,
    État: envoi.etat === "UNKNOWN" ? "—" : envoi.etat === "UPDATED" ? "Mise à jour" : "Création",
    "Date d'envoi": formatTimestampForXlsx(envoi.createdAt).date,
    "Heure d'envoi": formatTimestampForXlsx(envoi.createdAt).time,
    Statut: envoi.statut === "VALID" ? "Validé" : "Rejeté",
  }));
}

function mapRejectsRows(data: BilanEnvoiItem[]) {
  return data.map((envoi) => ({
    "N° client": envoi.numeroClient,
    "N° BIO": envoi.numeroBio,
    "Date d'audit": envoi.auditDate ?? "—",
    Rejets: (envoi.details ?? []).map((detail) => getErrorMessage(detail.code, "short")).join(", "),
    "Date d'envoi": formatTimestampForXlsx(envoi.createdAt).date,
    "Heure d'envoi": formatTimestampForXlsx(envoi.createdAt).time,
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

const bilanBarRowsForExport = computed<ChartRow[]>(() => {
  return bilanBarCategories.value.flatMap((periode, index) =>
    bilanBarSeries.value.map((serie) => ({
      période: periode,
      catégorie: serie.name,
      valeur: serie.data[index] ?? 0,
      unité: "nombre",
    })),
  );
});

const compareBarRowsForExport = computed<ChartRow[]>(() => {
  const comparaison = bilanBarCategories.value.flatMap((periode, index) =>
    compareBarSeries.value.map((serie) => ({
      période: periode,
      catégorie: `${serie.name} — ${compareRangeLabel.value}`,
      valeur: serie.data[index] ?? 0,
      unité: "nombre",
    })),
  );

  const courant = bilanBarCategories.value.flatMap((periode, index) =>
    bilanBarSeries.value.map((serie) => ({
      période: periode,
      catégorie: `${serie.name} — ${currentPeriodLabel.value}`,
      valeur: serie.data[index] ?? 0,
      unité: "nombre",
    })),
  );

  return [...comparaison, ...courant];
});

async function onBilanTableDownload(action: string) {
  if (action === "xlsx") {
    if (!fromBase.value || !toBase.value) return;
    const rows = mapBilanRows(
      await fetchAllPages(fetchBilanEnvois, fromBase.value.toISOString(), toBase.value.toISOString(), 500),
    );
    downloadXlsx(rows, "bilan-envois.xlsx", "Bilan des envois", COLONNES_BILAN_XLSX);
    return;
  }
  if (action === "xlsx-week") {
    await downloadRangeAsXlsx(
      fetchBilanEnvois,
      mapBilanRows,
      currentWeekRange(),
      "bilan-envois-semaine-courante.xlsx",
      "Bilan des envois",
      COLONNES_BILAN_XLSX,
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
      COLONNES_BILAN_XLSX,
    );
  }
}

async function onRejectsTableDownload(action: string) {
  if (action === "xlsx") {
    if (!fromBase.value || !toBase.value) return;
    const rows = mapRejectsRows(
      await fetchAllPages(fetchRejetsFiltres, fromBase.value.toISOString(), toBase.value.toISOString(), 500),
    );
    downloadXlsx(rows, "envois-rejetes.xlsx", "Envois rejetés", COLONNES_REJETS_XLSX);
    return;
  }
  if (action === "xlsx-week") {
    await downloadRangeAsXlsx(
      fetchEnvoisRejetes,
      mapRejectsRows,
      currentWeekRange(),
      "envois-rejetes-semaine-courante.xlsx",
      "Envois rejetés",
      COLONNES_REJETS_XLSX,
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
      COLONNES_REJETS_XLSX,
    );
  }
}

const legendEntries = computed(() =>
  bilanChartX.value.map((label, i) => ({
    label: `${label} (${bilanChartY.value[i]}${detailAnomalies.value ? "" : "%"})`,
    color: bilanPieColors.value[i],
  })),
);

async function onBilanChartDownload(action: string) {
  if (action === "png") {
    if (bilanChartType.value === "bar") {
      downloadCanvasPng(bilanChartCurrentRef.value, "bilan-envois.png", undefined, titrePngBilan.value);
      return;
    }

    if (bilanViewMode.value === "comparer") {
      downloadComparisonPng(
        bilanChartCompareRef.value,
        bilanChartCurrentRef.value,
        compareRangeLabel.value,
        currentPeriodLabel.value,
        legendEntries.value,
        `Comparaison des envois — ${compareRangeLabel.value} vs ${currentPeriodLabel.value}`,
      );
    } else {
      downloadCanvasPng(bilanChartCurrentRef.value, "bilan-envois.png", legendEntries.value, titrePngBilan.value);
    }

    return;
  }

  if (action === "xlsx") {
    let rows: ChartRow[];

    if (bilanChartType.value === "bar") {
      rows = bilanViewMode.value === "comparer" ? compareBarRowsForExport.value : bilanBarRowsForExport.value;
    } else {
      rows = bilanViewMode.value === "comparer" ? compareChartRowsForExport.value : bilanChartRowsForExport.value;
    }

    downloadXlsx(rows, "bilan-graphique.xlsx", "Bilan graphique", COLONNES_GRAPHIQUE_XLSX);

    return;
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

async function chargerApercuAlertes() {
  const res = await fetchRepetitions(1, alertesLimit.value);
  repetitions.value = res.data ?? [];
}

async function chargerAlertesModal() {
  const res = await fetchRepetitions(
    alertesPage.value,
    alertesLimit.value,
    rechercheAlertesAppliquee.value || undefined,
    typeFiltreAlertes.value || undefined,
  );
  repetitionsModal.value = res.data ?? [];
  alertesTotal.value = res.meta?.total ?? 0;
}

watch([rechercheAlertesAppliquee, typeFiltreAlertes, alertesPage], () => {
  if (modalAlertes.value) chargerAlertesModal();
});

async function ouvrirModalToutesAlertes(groupe?: (typeof repetitions.value)[number]) {
  ouvrirModalAlertes(groupe);
  await chargerAlertesModal();
}

// Chargement principal
watch(
  [fromBase, toBase],
  async ([from, to]) => {
    if (!from || !to) return;

    isLoading.value = true;
    drillDownGroupe.value = null;

    graphique.compareOffset.value = 1;
    compareRangeOverride.value = null;

    await Promise.all([
      (resumeKpi.value = await fetchGeneralKpi(formatStartOfDay(from), formatEndOfDay(to))),
      chargerBilanEnvois(1),
      (palmaresAnomalies.value = await fetchPalmaresAnomalies(formatStartOfDay(from), formatEndOfDay(to))),
      chargerEnvoisRejetes(1),
      (evolutionEnvois.value = await fetchPalmaresAnomaliesGrouped(formatStartOfDay(from), formatEndOfDay(to))),
      bilanViewMode.value === "comparer" ? chargerComparePeriode() : Promise.resolve(),
    ]);

    isLoading.value = false;
  },
  { immediate: true },
);

watch(detailAnomalies, () => {
  drillDownGroupe.value = null;
});

watch(bilanChartType, (type) => {
  if (type === "bar" && drillDownGroupe.value) {
    drillDownGroupe.value = null;
  }
});

watch(bilanViewMode, (mode) => {
  if (mode === "comparer") chargerComparePeriode();
});

function fermerFiltresAuClicExterieur(event: MouseEvent) {
  const target = event.target as HTMLElement | null;

  if (target?.closest(".filtre-wrapper")) return;

  filtreMenuOuvert.value = false;
  filtreGroupeOuvert.value = false;
}

onMounted(() => {
  document.addEventListener("click", fermerFiltresAuClicExterieur);
});

onBeforeUnmount(() => {
  document.removeEventListener("click", fermerFiltresAuClicExterieur);
});

onMounted(async () => {
  isLoading.value = true;
  await chargerApercuAlertes();
  avancement.value = await getDashboardSummary([], new Date().getFullYear());
  isLoading.value = false;
});
</script>

<template>
  <div>
    <div class="fr-container fr-py-6w">
      <div class="fr-grid-row fr-grid-row--center">
        <div class="fr-col-6">
          <h1 class="fr-h2 fr-mb-1w" style="color: var(--blue-france-sun-113-625)">Suivi des envois par API</h1>
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
      <div class="fr-container fr-py-6w fr-pb-0w">
        <div class="fr-grid-row fr-mb-4w" v-if="avancement">
          <JaugeAvancement
            class="fr-col-6"
            :title="'Avancement des certifications ' + new Date().getFullYear()"
            label="Envoyés et validés"
            :info-text="'Certifications envoyées et validées depuis le 1er janvier ' + new Date().getFullYear()"
            :value="avancement.countCertifiees"
            :max="avancement.countCertifiees + avancement.countEnAttentes + avancement.countNonAuditees"
          />
          <div class="fr-col-6 flex">
            <button
              class="fr-btn fr-btn--tertiary-no-outline button-referentiel"
              type="button"
              @click="modalReferentielAnomalies = true"
            >
              Référentiel des anomalies
            </button>
          </div>
        </div>
        <div v-else>
          <Spinner>Chargement des données sur l'avancement des certifications</Spinner>
        </div>
        <!-- Alertes de répétitions -->
        <AlertesBanniere
          :apercu="repetitionsApercu"
          :restantes="repetitionsRestantes"
          @masquer="masquerRepetition"
          @ouvrir="ouvrirModalToutesAlertes"
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
                  <br />
                  {{ formatPeriodLabel(unit, fromBase ?? baseDate).toLowerCase() }}
                </p>
                <p class="fr-mb-0 global-envoie">{{ formatNumberWithSpaces(resumeKpi.totalEnvoyes) ?? "—" }}</p>
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
                :title="`Anomalie la plus fréquente \n ${formatPeriodLabel(unit, fromBase ?? baseDate).toLowerCase()}`"
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
          <div class="fr-col-12 fr-col-lg-6 flex-block">
            <div class="card">
              <div class="download-title-row fr-mb-2w">
                <h2 class="fr-h6 fr-mb-0">Bilan des envois</h2>
                <div class="table-actions">
                  <button
                    type="button"
                    class="fr-btn fr-btn--tertiary-no-outline fr-icon-arrow-right-up-line"
                    aria-label="Agrandir le tableau bilan des envois"
                    @click="modalBilanEnvoisAgrandi = true"
                  ></button>
                </div>
              </div>

              <div class="fr-table__header">
                <div class="fr-search-bar">
                  <label class="fr-label" for="table-search-input">Rechercher N° BIO / N° Client</label>
                  <input
                    id="table-search-input"
                    class="fr-input"
                    placeholder="Rechercher un N°"
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
                      icon-class="fr-icon-more-line fr-btn--sm fr-pr-1w fr-mr-0"
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
          <div class="fr-col-12 fr-col-lg-6 flex-block">
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
              <div class="drill-down-header">
                <span v-if="detailAnomalies">Détails des envois rejetés</span>
                <button
                  v-if="detailAnomalies && drillDownGroupe"
                  type="button"
                  class="fr-btn fr-btn--tertiary-no-outline fr-icon-arrow-left-line fr-btn--icon-left"
                  @click="retourCategories"
                >
                  {{ drillDownGroupe.label }}
                </button>
                <div v-else class="fr-btn fr-btn--tertiary-no-outline" aria-hidden="true" style="visibility: hidden">
                  &nbsp;
                </div>
              </div>

              <div v-if="bilanChartType === 'pie'">
                <div v-if="bilanViewMode === 'consulter'" ref="bilanChartCurrentRef" class="align-center">
                  <PieChartCustom
                    v-if="bilanHasData"
                    :x="bilanChartX"
                    :y="bilanChartY"
                    :name="detailAnomalies ? ['Anomalies'] : ['Validés', 'Rejetés']"
                    :colors="bilanPieColors"
                    :unit-tooltip="'%'"
                    :size="'lg'"
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
                        :compare-date="compareRange?.from"
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
                        :unit-tooltip="'%'"
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
                        :unit-tooltip="'%'"
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
                      :compare-date="compareRange?.from"
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
        <div v-if="resumeKpi" class="fr-grid-row fr-grid-row--gutters fr-mt-3v">
          <div class="fr-col-12 fr-col-lg-12 flex-block">
            <div class="card">
              <div class="download-title-row fr-mb-2w">
                <h2 class="fr-h6 fr-mb-0">
                  Envois rejetés {{ formatPeriodLabel(unit, fromBase ?? baseDate).toLowerCase() }}
                </h2>
                <div class="table-actions">
                  <button
                    type="button"
                    class="fr-btn fr-btn--tertiary-no-outline fr-icon-arrow-right-up-line"
                    aria-label="Agrandir le tableau des envois rejetés"
                    @click="modalRejetsAgrandi = true"
                  ></button>
                </div>
              </div>
              <div class="fr-table__header">
                <div class="fr-search-bar">
                  <label class="fr-label" for="table-search-rejetes-input">Rechercher</label>
                  <input
                    id="table-search-rejetes-input"
                    class="fr-input"
                    aria-describedby="table-search-rejetes-messages"
                    placeholder="Rechercher un N°"
                    type="search"
                    v-model="rechercheRejetsBrouillon"
                    @keyup.enter="validerRechercheRejets"
                  />
                  <div id="table-search-rejetes-messages" class="fr-messages-group" aria-live="polite"></div>
                  <button type="button" class="fr-btn" @click="validerRechercheRejets">Rechercher</button>
                </div>
                <ul class="fr-btns-group fr-btns-group--right fr-btns-group--inline-md fr-btns-group--icon-left">
                  <li>
                    <div class="filtre-wrapper">
                      <button
                        type="button"
                        class="fr-btn fr-btn--secondary"
                        :aria-expanded="filtreGroupeOuvert"
                        aria-controls="filtre-panel-rejets"
                        @click="toggleFiltreGroupe"
                      >
                        <i class="ri-filter-3-line"></i>
                        <span class="fr-ml-1w">Filtrer</span>
                        <span
                          v-if="groupeFiltreApplique.length > 0"
                          class="fr-badge fr-badge--sm fr-badge--info filtre-count"
                        >
                          {{ groupeFiltreApplique.length }}
                        </span>
                      </button>
                      <div
                        v-show="filtreGroupeOuvert"
                        id="filtre-panel-rejets"
                        class="filtre-panel"
                        role="dialog"
                        aria-label="Filtrer par groupe d'anomalies"
                      >
                        <div class="filtre-panel__header">
                          <h3 class="fr-h6 fr-mb-0">Filtres</h3>
                        </div>
                        <div class="filtre-panel__body">
                          <fieldset class="fr-fieldset filtre-panel__section">
                            <legend class="fr-fieldset__legend fr-text--bold fr-mb-1w">Catégorie d'anomalies</legend>

                            <div class="filtre-panel__elements">
                              <div
                                v-for="option in GROUPE_ANOMALIE_OPTIONS"
                                :key="option.value"
                                class="fr-checkbox-group fr-checkbox-group--sm"
                              >
                                <input
                                  type="checkbox"
                                  :id="`groupe-${option.value}`"
                                  :value="option.value"
                                  v-model="groupeFiltreBrouillon"
                                />

                                <label class="fr-label" :for="`groupe-${option.value}`">
                                  {{ option.label }}
                                </label>
                              </div>
                            </div>
                          </fieldset>
                        </div>
                        <div class="filtre-panel__actions">
                          <button
                            type="button"
                            class="fr-btn fr-btn--tertiary-no-outline fr-btn--sm"
                            @click="reinitialiserFiltreGroupe"
                          >
                            Réinitialiser
                          </button>
                          <button type="button" class="fr-btn fr-btn--sm" @click="validerFiltreGroupe">Valider</button>
                        </div>
                      </div>
                    </div>
                  </li>
                  <li>
                    <ActionDropdown
                      noWrap
                      with-icons
                      icon-class="fr-icon-more-line fr-btn--sm fr-pr-1w fr-mr-0"
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
        </div>
      </div>
    </div>
    <!-- Modale envois rejetés agrandi -->
    <Modal
      v-if="modalRejetsAgrandi"
      data-track-content
      mediumLarge
      data-content-name="Envois rejetés agrandi"
      @close="modalRejetsAgrandi = false"
    >
      <template #header>
        <button
          class="fr-btn fr-btn--close"
          type="button"
          aria-controls="global-modal"
          @click="modalRejetsAgrandi = false"
        >
          Fermer
        </button>
      </template>

      <div class="download-title-row fr-mb-2w">
        <h2 class="fr-h6 fr-mb-0">Envois rejetés</h2>
      </div>

      <div class="fr-table__header">
        <div class="fr-search-bar">
          <label class="fr-label" for="table-search-rejetes-agrandi-input">Rechercher</label>
          <input
            id="table-search-rejetes-agrandi-input"
            class="fr-input"
            aria-describedby="table-search-rejetes-agrandi-messages"
            placeholder="Rechercher un N°"
            type="search"
            v-model="rechercheRejetsBrouillon"
            @keyup.enter="validerRechercheRejets"
          />
          <div id="table-search-rejetes-agrandi-messages" class="fr-messages-group" aria-live="polite"></div>
          <button type="button" class="fr-btn" @click="validerRechercheRejets">Rechercher</button>
        </div>

        <ul class="fr-btns-group fr-btns-group--right fr-btns-group--inline-md fr-btns-group--icon-left">
          <li>
            <div class="filtre-wrapper">
              <button
                type="button"
                class="fr-btn fr-btn--secondary"
                :aria-expanded="filtreGroupeOuvert"
                aria-controls="filtre-panel-rejets-agrandi"
                @click="toggleFiltreGroupe"
              >
                <i class="ri-filter-3-line"></i>
                <span class="fr-ml-1w">Filtrer</span>
                <span v-if="groupeFiltreApplique.length > 0" class="fr-badge fr-badge--sm fr-badge--info filtre-count">
                  {{ groupeFiltreApplique.length }}
                </span>
              </button>
              <div
                v-show="filtreGroupeOuvert"
                id="filtre-panel-rejets-agrandi"
                class="filtre-panel"
                role="dialog"
                aria-label="Filtrer par groupe d'anomalies"
              >
                <div class="filtre-panel__header">
                  <h3 class="fr-h6 fr-mb-0">Filtres</h3>
                  <div></div>
                </div>
                <div class="filtre-panel__body">
                  <fieldset class="fr-fieldset filtre-panel__section">
                    <legend class="fr-fieldset__legend fr-text--bold fr-mb-1w">Catégorie d'anomalies</legend>

                    <div class="filtre-panel__elements">
                      <div
                        v-for="option in GROUPE_ANOMALIE_OPTIONS"
                        :key="option.value"
                        class="fr-checkbox-group fr-checkbox-group--sm"
                      >
                        <input
                          type="checkbox"
                          :id="`groupe-${option.value}`"
                          :value="option.value"
                          v-model="groupeFiltreBrouillon"
                        />

                        <label class="fr-label" :for="`groupe-${option.value}`">
                          {{ option.label }}
                        </label>
                      </div>
                    </div>
                  </fieldset>
                </div>
                <div class="filtre-panel__actions">
                  <button
                    type="button"
                    class="fr-btn fr-btn--tertiary-no-outline fr-btn--sm"
                    @click="reinitialiserFiltreGroupe"
                  >
                    Réinitialiser
                  </button>
                  <button type="button" class="fr-btn fr-btn--sm" @click="validerFiltreGroupe">Valider</button>
                </div>
              </div>
            </div>
          </li>
          <li>
            <ActionDropdown
              noWrap
              with-icons
              icon-class="fr-icon-more-line fr-btn--sm fr-pr-1w"
              icon-style="font-size: 1.2em"
            >
              <template v-for="action in tableDownloadActions" :key="action.id">
                <li>
                  <button
                    type="button"
                    class="fr-btn fr-btn--sm fr-btn--tertiary-no-outline fr-btn--icon-left"
                    :class="action.icon"
                    @click="onRejectsTableDownload(action.id)"
                  >
                    {{ action.label }}
                  </button>
                </li>
              </template>
            </ActionDropdown>
          </li>
        </ul>
      </div>

      <EnvoisRejetesTable
        v-if="envoisRejetes.data.length"
        :envois="envoisRejetes.data"
        :page="envoisRejetes.meta.page"
        :ordre-date="ordreDateReject"
        large
        :max-page="Math.ceil(envoisRejetes.meta.total / envoisRejetes.meta.limit)"
        @change-page="changerPageRejetes"
        @open-details="openDetailsEnvoi"
        @change-tri-date="changerTriDateReject"
      />
      <div v-else class="bilan-empty bilan-empty--table">Aucune donnée</div>
    </Modal>

    <!-- Modale bilan agrandi -->
    <Modal
      v-if="modalBilanEnvoisAgrandi"
      data-track-content
      mediumLarge
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
            placeholder="Rechercher un N°"
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
            <ActionDropdown
              noWrap
              with-icons
              icon-class="fr-icon-more-line fr-btn--sm fr-pr-1w"
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
      :repetitions="repetitionsModal"
      :groupe-a-ouvrir-key="groupeAOuvrirKey"
      :selected-groupe="selectedRepetitionGroupe"
      :selected-envoi="selectedRepetitionEnvoi"
      :recherche-brouillon="rechercheAlertesBrouillon"
      :page="alertesPage"
      :typeFiltre="typeFiltreAlertes"
      :max-page="alertesMaxPage"
      :total="alertesTotal"
      @update:recherche-brouillon="rechercheAlertesBrouillon = $event"
      @close="fermerModalAlertes"
      @retour-liste="retourListeAlertes"
      @ouvrir-detail="ouvrirDetailRepetition"
      @valider-recherche="validerRechercheAlertes"
      @changer-page="changerPageAlertes"
      @changer-type="changerTypeFiltreAlertes"
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
  padding-bottom: 5px;
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

.drill-down-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
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
  top: calc(100% + 0.25rem);
  right: 0;
  z-index: 20;

  width: 300px;
  max-width: 90vw;
  overflow: hidden;

  background: #fff;
  border: none;
  border-radius: 0.25rem;
  box-shadow: 0 2px 6px rgb(0 0 0 / 12%);
}

.filtre-panel__header {
  display: flex;
  align-items: center;
  justify-content: flex-start;

  padding: 0.75rem 1rem;

  background: #fff;
  border: none;
  text-align: left;
}

.filtre-panel__header h3 {
  width: 100%;
  text-align: left;
}

.filtre-panel__body {
  max-height: 320px;
  padding: 1rem;
  overflow-y: auto;
  background: #fff;
}

.filtre-panel__section {
  margin: 0;
  padding: 0;
  border: none;
}

.filtre-panel__elements,
.filtre-panel__options {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.filtre-panel__separator {
  margin: 1rem 0;
  border: none;
  border-top: 1px solid var(--border-default-grey, #eee);
}

.filtre-panel__actions {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;

  padding: 0.75rem 1rem;

  background: #fff;
  border: none;
}

.filtre-panel__actions .fr-btn {
  margin: 0;
}

.flex-block {
  display: flex;

  .card {
    flex: 1;
  }
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

.button-referentiel {
  align-self: end;
  margin-left: auto;
}

.fr-table__header .fr-search-bar {
  margin-bottom: 0rem;
}

:deep(.fr-btns-group .fr-btn) {
  margin: 0rem !important;
}
</style>
