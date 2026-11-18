import type {
  GeneralKpiResponse,
  HistoriqueResponse,
  ImportErrorDetail,
  ImportJobEtat,
  ImportJobResult,
  RepetitionsResponse,
  StatsQueryInput,
  TableauBilanResponse,
  TableauErreursResponse,
  TopAnomaliesGroupedResponse,
} from "@agencebio/cartobio-types";
import type { ErrorGroups } from "@/utils/error-api.utils";

export type Unit = "day" | "week" | "month" | "year";

export type OrdreTri = NonNullable<StatsQueryInput["ordreDate"]>;

export type ErreurEnvoi = ImportErrorDetail;

export type HistoriqueEnvoi = HistoriqueResponse[number];

export type RepetitionGroupe = RepetitionsResponse["data"][number];

export type RepetitionEnvoi = RepetitionGroupe["envois"][number];

export type EvolutionPeriode = TopAnomaliesGroupedResponse[number];

export type AnomalieCode = EvolutionPeriode["errors"][number];

export type ErrorGroupKey = keyof typeof ErrorGroups;

export type PageResult<T> = {
  data: T[];
  meta: { total: number; page: number; limit: number };
};

export type ResumeKpi = GeneralKpiResponse["data"];

export type CompareKpi = Pick<ResumeKpi, "totalEnvoyes" | "totalValides" | "totalRejetes">;

export type BilanEnvoisPage = TableauBilanResponse;

export type BilanEnvoiItem = BilanEnvoisPage["data"][number];

export type EnvoisRejetesPage = TableauErreursResponse;

export type EnvoiRejeteItem = EnvoisRejetesPage["data"][number];

export type BilanFiltres = {
  recherche?: string;
  statuts?: ImportJobResult[];
  etats?: ImportJobEtat[];
};

export type ModalContext = {
  numeroClient: string | null;
  numeroBio: string | null;
  auditDate: string | null;
};

export type GroupeErreursParcelle = {
  key: string;
  label: string;
  erreurs: ErreurEnvoi[];
};

export type DownloadAction = {
  id: string;
  label: string;
  icon: string;
};

export type BarSerie = {
  name: string;
  data: number[];
  color: string;
};

export type ChartRow = {
  période: string;
  catégorie: string;
  "référence de période"?: string;
  valeur: number;
  unité: string;
};

export type DateRange = { from: Date; to: Date };

export type ChangePeriodPayload = {
  compareRange: { start: Date; end: Date };
  comparePeriod: Unit;
};
