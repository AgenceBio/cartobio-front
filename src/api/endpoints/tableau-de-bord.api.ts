import { apiClient } from "@/api/client";
import type {
  GeneralKpiResponse,
  HistoriqueResponse,
  ImportJobEtat,
  ImportJobResult,
  ImportLogCode,
  RepetitionsResponse,
  StatsQueryInput,
  TableauBilanResponse,
  TableauErreursResponse,
  TopAnomaliesGroupedResponse,
  TopAnomaliesResponse,
} from "@agencebio/cartobio-types";

type BilanFiltres = {
  recherche?: string;
  statuts?: ImportJobResult[];
  etats?: ImportJobEtat[];
  ordreDate?: StatsQueryInput["ordreDate"];
  codes?: ImportLogCode[];
};

export async function fetchGeneralKpi(from: string, to: string): Promise<GeneralKpiResponse["data"]> {
  const { data } = await apiClient.get<GeneralKpiResponse>(`/v3/tdb-api/general-kpi?from=${from}&to=${to}`);
  return data.data;
}

export async function fetchBilanEnvois(
  page = 1,
  from: string,
  to: string,
  filtres?: BilanFiltres,
  limit = 4,
): Promise<TableauBilanResponse> {
  const params = new URLSearchParams({ page: String(page), limit: String(limit), from, to });
  if (filtres?.recherche) params.set("recherche", filtres.recherche);
  if (filtres?.statuts?.length) params.set("statuts", filtres.statuts.join(","));
  if (filtres?.etats?.length) params.set("etats", filtres.etats.join(","));
  if (filtres?.ordreDate) params.set("ordreDate", filtres.ordreDate);
  const { data } = await apiClient.get<TableauBilanResponse>(`v3/tdb-api/tableau?${params.toString()}`);
  return data;
}

export async function fetchHistoriqueParcellaire(
  numeroClient: string,
  numeroBio: string,
  auditDate: string,
): Promise<HistoriqueResponse> {
  const { data } = await apiClient.get<HistoriqueResponse>(
    `/v3/tdb-api/historique?numeroBio=${numeroBio}&numeroClient=${numeroClient}&auditDate=${auditDate}`,
  );

  return data;
}

export async function fetchPalmaresAnomalies(from: string, to: string): Promise<TopAnomaliesResponse["data"]> {
  const { data } = await apiClient.get<TopAnomaliesResponse>(`/v3/tdb-api/top-anomalies?from=${from}&to=${to}`);

  return data.data;
}

export async function fetchEnvoisRejetes(
  page = 1,
  from: string,
  to: string,
  filtres?: BilanFiltres,
  limit = 5,
): Promise<TableauErreursResponse> {
  const params = new URLSearchParams({
    page: String(page),
    limit: String(limit),
    from,
    to,
  });

  if (filtres?.recherche) params.set("recherche", filtres.recherche);
  if (filtres?.ordreDate) params.set("ordreDate", filtres.ordreDate);
  if (filtres?.codes?.length) params.set("codes", filtres.codes.join(","));

  const { data } = await apiClient.get<TableauErreursResponse>(`/v3/tdb-api/tableau-errors?${params.toString()}`);

  return data;
}

export async function fetchPalmaresAnomaliesGrouped(from: string, to: string): Promise<TopAnomaliesGroupedResponse> {
  const { data } = await apiClient.get<TopAnomaliesGroupedResponse>(
    `/v3/tdb-api/top-anomalies-grouped?from=${from}&to=${to}`,
  );

  return data;
}

export async function fetchRepetitions(
  page = 1,
  limit = 8,
  recherche?: string,
  type?: "envois" | "refus" | "all",
): Promise<RepetitionsResponse> {
  const annee = new Date().getFullYear();

  const params = new URLSearchParams({
    page: String(page),
    limit: String(limit),
    from: `${annee}-01-01`,
    to: `${annee}-12-31`,
  });

  if (recherche) params.set("recherche", recherche);
  if (type) params.set("type", type);

  const { data } = await apiClient.get<RepetitionsResponse>(`/v3/tdb-api/repet-ano?${params.toString()}`);

  return data;
}
