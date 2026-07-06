
import type { ErrorGroups, ErrorCode } from "@/utils/error-api.utils";

export type Unit = "day" | "week" | "month" | "year";

export type ErreurEnvoi = {
  numeroBio: string | null;
  parcelleId: string | number | null;
  parcelleName: string | null;
  code: string;
  message: string | null;
};

export type HistoriqueEnvoi = {
  jobId: number;
  statut: string;
  createdAt: string;
  payload: unknown;
  parcelles?: { id: string | number; nom?: string; name?: string | null }[];
  erreurs: ErreurEnvoi[];
  details?: { code: string }[];
  numeroClient?: string | null;
  numeroBio?: string | null;
  etat?: string;
  auditDate?: string;
};

export type RepetitionEnvoi = {
  jobId: number;
  statut: string;
  etat: string;
  createdAt: string;
  erreurs: ErreurEnvoi[];
};

export type RepetitionGroupe = {
  numeroBio: string;
  numeroClient: string;
  auditDate: string;
  envois: RepetitionEnvoi[];
};

export type AnomalieCode = { code: string; count: number };

export type ErrorGroupKey = keyof typeof ErrorGroups;

export type EvolutionPeriode = {
  period: string;
  accepted: number;
  refused: number;
  errorCount: number;
  errors: AnomalieCode[];
};

export type PageResult<T> = {
  data: T[];
  meta: { total: number; page: number; limit: number };
};

export type ResumeKpi = {
  totalEnvoyes: number;
  totalValides: number;
  totalRejetes: number;
  anomaliePlusFrequente?: { code: ErrorCode } | null;
};

export type CompareKpi = {
  totalEnvoyes: number;
  totalValides: number;
  totalRejetes: number;
};

export type BilanEnvoiItem = {
  jobId: number;
  numeroClient: string | null;
  numeroBio: string | null;
  etat: string;
  statut: string;
  createdAt: string;
  auditDate?: string;
  details?: { code: string }[];
  erreurs?: ErreurEnvoi[];
};

export type BilanFiltres = {
  recherche?: string;
  statuts?: string[];
  etats?: string[];
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
  valeur: number;
  unité: string;
};

export type DateRange = { from: Date; to: Date };

export type ChangePeriodPayload = {
  compareRange: { start: Date; end: Date };
  comparePeriod: Unit;
};