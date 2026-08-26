import { describe, it, expect, vi, beforeEach } from "vitest";
import { mount, flushPromises } from "@vue/test-utils";
import IndexPage from "./index.vue";

const apiMocks = vi.hoisted(() => ({
  fetchGeneralKpi: vi.fn(),
  fetchBilanEnvois: vi.fn(),
  fetchPalmaresAnomalies: vi.fn(),
  fetchPalmaresAnomaliesGrouped: vi.fn(),
  fetchEnvoisRejetes: vi.fn(),
  fetchRepetitions: vi.fn(),
  fetchHistoriqueParcellaire: vi.fn(),
}));

const cartobioApiMocks = vi.hoisted(() => ({
  getDashboardSummary: vi.fn(),
}));

vi.mock("@/api/endpoints/tableau-de-bord.api.ts", () => apiMocks);

vi.mock("@/cartobio-api", () => cartobioApiMocks);

vi.mock("@/utils/error-api.utils.ts", () => ({
  getErrorMessage: (code) => `MSG_${code}`,
  getErrorColor: () => "#eeeeee",
  getErrorTextColor: () => "#000000",
  ErrorCode: {},
  ErrorGroups: {
    import: ["E_IMPORT"],
    dateValidation: ["E_DATE"],
    parcelErrors: ["E_PARCELLE"],
    parcelWarnings: ["E_WARNING"],
  },
}));

vi.mock("xlsx", () => ({
  utils: {
    json_to_sheet: vi.fn(),
    book_new: vi.fn(() => ({})),
    book_append_sheet: vi.fn(),
  },
  writeFile: vi.fn(),
}));

vi.mock("@/composables/useIsMobile", async () => {
  const { ref } = await import("vue");
  const useIsMobile = () => ref(false);
  return {
    default: useIsMobile,
    useIsMobile,
  };
});

const globalStubs = {
  PieChartCustom: {
    name: "PieChartCustom",
    template: "<div class='pie-chart-stub' />",
    props: ["x", "y", "name", "colors", "unitTooltip"],
    emits: ["segment-click"],
  },
  BarGraphCustom: {
    name: "BarGraphCustom",
    template: "<div class='bar-graph-stub' />",
    props: ["categories", "series", "comparisonSeries"],
    emits: ["segment-click"],
  },
  DatePicker: {
    name: "DatePicker",
    template: "<div class='date-picker-stub' />",
    props: ["unit", "baseDate", "isCompare"],
    emits: ["validate"],
  },
  Pagination: {
    name: "Pagination",
    template: "<div class='pagination-stub' />",
    props: ["currentPage", "maxPage"],
    emits: ["change-page"],
  },
  RejectsChart: true,
  AutoCompleteSearch: true,
  ReferentielAnomalies: { template: "<div />" },
  DownloadMenu: { template: "<div><slot /></div>" },
  ActionDropdown: { template: "<div><slot /></div>" },
  AccordionGroup: { template: "<div><slot /></div>" },
  AccordionSection: {
    template: "<section><slot name='right' /><slot /></section>",
    props: ["title", "open"],
  },
  Modal: {
    name: "Modal",
    template:
      "<div class='modal-stub'><slot name='header' /><slot /><slot name='footer' /></div>",
  },
};


const kpi = {
  totalEnvoyes: 10,
  totalValides: 7,
  totalRejetes: 3,
  anomaliePlusFrequente: { code: "E_IMPORT" },
};

const envoi = {
  jobId: 1,
  numeroClient: "C123",
  numeroBio: "B456",
  etat: "CREATION",
  statut: "VALID",
  createdAt: "2026-08-10T09:00:00.000",
  auditDate: "2026-08-10",
  erreurs: [],
};

const page = (data, total = data.length) => ({
  data,
  meta: { total, page: 1, limit: 5 },
});

const periode = {
  compareRange: {
    start: new Date("2026-08-03T00:00:00"),
    end: new Date("2026-08-09T23:59:59"),
  },
  comparePeriod: "week",
};

function mountPage() {
  return mount(IndexPage, { global: { stubs: globalStubs } });
}

async function selectPeriode(wrapper) {
  const pickers = wrapper.findAllComponents({ name: "DatePicker" });
  pickers[0].vm.$emit("validate", periode);
  await flushPromises();
}

describe("Tableau de bord des APIs", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    apiMocks.fetchGeneralKpi.mockResolvedValue(kpi);
    apiMocks.fetchBilanEnvois.mockResolvedValue(page([envoi], 6));
    apiMocks.fetchPalmaresAnomalies.mockResolvedValue([
      { code: "E_IMPORT", count: 4 },
      { code: "E_PARCELLE", count: 2 },
    ]);
    apiMocks.fetchPalmaresAnomaliesGrouped.mockResolvedValue([]);
    apiMocks.fetchEnvoisRejetes.mockResolvedValue(page([]));
    apiMocks.fetchRepetitions.mockResolvedValue([]);
    apiMocks.fetchHistoriqueParcellaire.mockResolvedValue([envoi]);
    cartobioApiMocks.getDashboardSummary.mockResolvedValue({
      countCertifiees: 5,
      countEnAttentes: 2,
      countNonAuditees: 1,
    });
  });

  it("n'appelle aucune API tant qu'aucune période n'est sélectionnée", async () => {
    mountPage();
    await flushPromises();
    expect(apiMocks.fetchGeneralKpi).not.toHaveBeenCalled();
    expect(apiMocks.fetchBilanEnvois).not.toHaveBeenCalled();
  });

  it("charge toutes les données après sélection d'une période", async () => {
    const wrapper = mountPage();
    await selectPeriode(wrapper);

    expect(apiMocks.fetchGeneralKpi).toHaveBeenCalledTimes(1);
    expect(apiMocks.fetchBilanEnvois).toHaveBeenCalledTimes(1);
    expect(apiMocks.fetchPalmaresAnomalies).toHaveBeenCalledTimes(1);
    expect(apiMocks.fetchEnvoisRejetes).toHaveBeenCalledTimes(1);
    expect(apiMocks.fetchPalmaresAnomaliesGrouped).toHaveBeenCalledTimes(1);
    expect(apiMocks.fetchRepetitions).toHaveBeenCalledTimes(1);
  });

  it("affiche les cartes KPI avec les bons totaux et taux", async () => {
    const wrapper = mountPage();
    await selectPeriode(wrapper);
    const text = wrapper.text();

    expect(text).toContain("10"); // total envoyés
    expect(text).toContain("7"); // validés
    expect(text).toContain("3"); // rejetés
    expect(text).toContain("70"); // taux de validation
    expect(text).toContain("30"); // taux de rejet
    expect(text).toContain("MSG_E_IMPORT"); // anomalie la plus fréquente
  });

  it("affiche les lignes du tableau bilan des envois", async () => {
    const wrapper = mountPage();
    await selectPeriode(wrapper);

    const table = wrapper.find("#table-bilan-envoi");
    expect(table.exists()).toBe(true);
    expect(table.text()).toContain("C123");
    expect(table.text()).toContain("B456");
    expect(table.text()).toContain("Création");
    expect(table.text()).toContain("Validé");
  });

  it("affiche les bons libellés d'état (Mise à jour / —)", async () => {
    apiMocks.fetchBilanEnvois.mockResolvedValue(
      page([
        { ...envoi, jobId: 2, etat: "UPDATED", statut: "REJECTED" },
        { ...envoi, jobId: 3, etat: "UNKNOWN" },
      ]),
    );
    const wrapper = mountPage();
    await selectPeriode(wrapper);
    const text = wrapper.find("#table-bilan-envoi").text();

    expect(text).toContain("Mise à jour");
    expect(text).toContain("Rejeté");
  });

  it("recharge la page demandée via la pagination", async () => {
    const wrapper = mountPage();
    await selectPeriode(wrapper);

    wrapper
      .findAllComponents({ name: "Pagination" })[0]
      .vm.$emit("change-page", 2);
    await flushPromises();

    expect(apiMocks.fetchBilanEnvois).toHaveBeenLastCalledWith(
      2,
      expect.any(String),
      expect.any(String),
      expect.anything(),
    );
  });

  it("applique la recherche du tableau bilan des envois", async () => {
    const wrapper = mountPage();
    await selectPeriode(wrapper);

    const input = wrapper.find("#table-search-input");
    await input.setValue("C123");
    await input.trigger("keyup.enter");
    await flushPromises();

    expect(apiMocks.fetchBilanEnvois).toHaveBeenLastCalledWith(
      1,
      expect.any(String),
      expect.any(String),
      expect.objectContaining({ recherche: "C123" }),
    );
  });

  it("applique les filtres statut/état du tableau", async () => {
    const wrapper = mountPage();
    await selectPeriode(wrapper);

    await wrapper.find("[aria-controls='filtre-panel-bilan']").trigger("click");
    await wrapper.find("#statut-REJECTED").setValue(true);
    const valider = wrapper
      .findAll("#filtre-panel-bilan button")
      .find((b) => b.text() === "Valider");
    await valider.trigger("click");
    await flushPromises();

    expect(apiMocks.fetchBilanEnvois).toHaveBeenLastCalledWith(
      1,
      expect.any(String),
      expect.any(String),
      expect.objectContaining({ statuts: ["REJECTED"] }),
    );
  });

  it("bascule sur le détail des anomalies et permet le drill-down", async () => {
    const wrapper = mountPage();
    await selectPeriode(wrapper);

    await wrapper.find("#checkbox-detail-anomalies").setValue(true);
    await flushPromises();

    const pie = wrapper.findComponent({ name: "PieChartCustom" });
    expect(pie.props("x")).toEqual(["Opérateur", "Parcelles"]);

    pie.vm.$emit("segment-click", { index: 0 });
    await flushPromises();

    const retour = wrapper
      .findAll("button")
      .find((b) => b.text().includes("Opérateur"));
    expect(retour).toBeDefined();
  });

  it("charge la période de comparaison en mode « comparer »", async () => {
    const wrapper = mountPage();
    await selectPeriode(wrapper);

    await wrapper.find("#segmented-comparer").setValue(true);
    await flushPromises();

    expect(apiMocks.fetchGeneralKpi).toHaveBeenCalledTimes(2);
  });

  it("ouvre la modale de détail d'un envoi", async () => {
    const wrapper = mountPage();
    await selectPeriode(wrapper);

    const detailButton = wrapper
      .findAll("#table-bilan-envoi button")
      .find((b) => b.attributes("aria-label")?.includes("Voir le détail"));
    await detailButton.trigger("click");
    await flushPromises();

    expect(apiMocks.fetchHistoriqueParcellaire).toHaveBeenCalledWith(
      "C123",
      "B456",
      "2026-08-10",
    );
    expect(wrapper.find(".modal-stub").exists()).toBe(true);
  });
  it("affiche l'alerte d'erreur interne quand le statut est ERROR", async () => {
    apiMocks.fetchHistoriqueParcellaire.mockResolvedValue([
      { ...envoi, statut: "ERROR", erreurs: [] },
    ]);
    const wrapper = mountPage();
    await selectPeriode(wrapper);

    const detailButton = wrapper
      .findAll("#table-bilan-envoi button")
      .find((b) => b.attributes("aria-label")?.includes("Voir le détail"));
    expect(detailButton, "bouton détail introuvable").toBeDefined();

    await detailButton.trigger("click");
    await flushPromises();

    expect(apiMocks.fetchHistoriqueParcellaire).toHaveBeenCalledWith(
      "C123",
      "B456",
      "2026-08-10",
    );

    const alerte = wrapper.find(".modal-stub .fr-alert--error");
    expect(alerte.exists()).toBe(true);
    expect(alerte.text()).toContain("Erreur interne");
    expect(alerte.text()).toMatch(/erreur technique interne/);
  });
});