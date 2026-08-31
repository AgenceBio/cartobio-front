import { apiClient } from "@/cartobio-api";

export async function fetchGeneralKpi(from: string, to: string) {
  const { data } = await apiClient.get(`/v3/tdb-api/general-kpi?from=${from}&to=${to}`);
  return data.data;
}

type BilanFiltres = {
  recherche?: string;
  statuts?: string[];
  etats?: string[];
  ordreDate?: "asc" | "desc";
  codes?: string[];
};

export async function fetchBilanEnvois(page = 1, from: string, to: string, filtres?: BilanFiltres, limit = 4) {
  const params = new URLSearchParams({ page: String(page), limit: String(limit), from, to });
  if (filtres?.recherche) params.set("recherche", filtres.recherche);
  if (filtres?.statuts?.length) params.set("statuts", filtres.statuts.join(","));
  if (filtres?.etats?.length) params.set("etats", filtres.etats.join(","));
  if (filtres?.ordreDate) params.set("ordreDate", filtres.ordreDate);
  const { data } = await apiClient.get(`v3/tdb-api/tableau?${params.toString()}`);
  return data;
}

export async function fetchHistoriqueParcellaire(numeroClient: string, numeroBio: string, auditDate: string) {
  const { data } = await apiClient.get(
    `/v3/tdb-api/historique?numeroBio=${numeroBio}&numeroClient=${numeroClient}&auditDate=${auditDate}`,
  );

  return data;
}

export async function fetchPalmaresAnomalies(from: string, to: string) {
  const { data } = await apiClient.get(`/v3/tdb-api/top-anomalies?from=${from}&to=${to}`);

  return data.data;
}

export async function fetchEnvoisRejetes(page = 1, from: string, to: string, filtres?: BilanFiltres, limit = 3) {
  const params = new URLSearchParams({
    page: String(page),
    limit: String(limit),
    from,
    to,
  });

  if (filtres?.recherche) params.set("recherche", filtres.recherche);
  if (filtres?.ordreDate) params.set("ordreDate", filtres.ordreDate);
  if (filtres?.codes?.length) params.set("codes", filtres.codes.join(","));

  const { data } = await apiClient.get(`/v3/tdb-api/tableau-errors?${params.toString()}`);

  return data;
}

export async function fetchPalmaresAnomaliesGrouped(from: string, to: string) {
  const { data } = await apiClient.get(`/v3/tdb-api/top-anomalies-grouped?from=${from}&to=${to}`);

  return data;
}

export async function fetchRepetitions(page = 1, limit = 8, recherche?: string, type?: "envois" | "refus" | "all") {
  const annee = new Date().getFullYear();

  const params = new URLSearchParams({
    page: String(page),
    limit: String(limit),
    from: `${annee}-01-01`,
    to: `${annee}-12-31`,
  });

  if (recherche) params.set("recherche", recherche);
  if (type) params.set("type", type);

  const { data } = await apiClient.get(`/v3/tdb-api/repet-ano?${params.toString()}`);

  return data;
}

export async function fetchTopAnomaliesGrouped(from: string, to: string) {
  const params = new URLSearchParams({
    from,
    to,
  });
  const { data } = await apiClient.get(`/v3/tdb-api/top-anomalies-grouped?${params.toString()}`);
  return data;
}
