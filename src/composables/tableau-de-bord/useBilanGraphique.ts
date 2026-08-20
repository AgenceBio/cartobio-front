import { computed, ref, type Ref } from "vue";
import dayjs from "dayjs";
import { getErrorMessage, getErrorColor, ErrorGroups, type ErrorCode } from "@/utils/error-api.utils";
import { getWeek, formatPeriodLabel, capitalize } from "@/utils/date.formatters";
import type {
  Unit,
  AnomalieCode,
  ErrorGroupKey,
  EvolutionPeriode,
  ResumeKpi,
  CompareKpi,
  BarSerie,
  DateRange,
} from "@/types/tableau-de-bord";

export const groupesAnomalies: { key: ErrorGroupKey; label: string }[] = [
  { key: "import", label: "Opérateur" },
  { key: "dateValidation", label: "Dates parcellaire" },
  { key: "parcelErrors", label: "Parcelles" },
  { key: "parcelWarnings", label: "Avertissements parcelles" },
];

export function calculerTaux(kpi: CompareKpi | null): { validation: number; rejet: number } {
  if (!kpi || kpi.totalEnvoyes === 0) return { validation: 0, rejet: 0 };
  return {
    validation: Math.round((kpi.totalValides / kpi.totalEnvoyes) * 100),
    rejet: Math.round((kpi.totalRejetes / kpi.totalEnvoyes) * 100),
  };
}

export function useBilanGraphique(options: {
  unit: Ref<Unit>;
  baseDate: Date;
  fromBase: Ref<Date | null>;
  toBase: Ref<Date | null>;
  resumeKpi: Ref<ResumeKpi | null>;
  palmaresAnomalies: Ref<AnomalieCode[] | null>;
  evolutionEnvois: Ref<EvolutionPeriode[] | null>;
  compareKpi: Ref<CompareKpi | null>;
  comparePalmaresAnomalies: Ref<AnomalieCode[] | null>;
  compareEvolutionEnvois: Ref<EvolutionPeriode[] | null>;
}) {
  const {
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
  } = options;

  const bilanViewMode = ref<"consulter" | "comparer">("consulter");
  const bilanChartType = ref<"pie" | "bar">("pie");
  const detailAnomalies = ref<boolean>(false);
  const drillDownGroupe = ref<{ key: ErrorGroupKey; label: string } | null>(null);
  const compareOffset = ref<number>(1);
  const compareRangeOverride = ref<DateRange | null>(null);

  const tauxValidation = computed(() => {
    if (!resumeKpi.value || resumeKpi.value.totalEnvoyes === 0) return 0;
    return Math.round((resumeKpi.value.totalValides / resumeKpi.value.totalEnvoyes) * 100);
  });

  const tauxRejet = computed(() => {
    if (!resumeKpi.value || resumeKpi.value.totalEnvoyes === 0) return 0;
    return Math.round((resumeKpi.value.totalRejetes / resumeKpi.value.totalEnvoyes) * 100);
  });

  const donutBilanX = computed(() => ["Acceptés", "Rejetés"]);
  const donutBilanY = computed(() => {
    if (!resumeKpi.value) return [0, 0];
    return [tauxValidation.value, tauxRejet.value];
  });

  const compareTaux = computed(() => calculerTaux(compareKpi.value));
  const compareDonutY = computed(() => {
    if (!compareKpi.value) return [0, 0];
    return [compareTaux.value.validation, compareTaux.value.rejet];
  });

  function grouperAnomalies(source: AnomalieCode[] | null) {
    const items = source ?? [];
    return groupesAnomalies
      .map((groupe) => {
        const codes = items.filter((a) =>
          (ErrorGroups[groupe.key] as string[]).includes(a.code),
        );
        return { ...groupe, count: codes.reduce((total, a) => total + a.count, 0) };
      })
      .filter((groupe) => groupe.count > 0);
  }

  function anomaliesTopChartData(source: AnomalieCode[] | null) {
    const groupes = grouperAnomalies(source);
    return { x: groupes.map((g) => g.label), y: groupes.map((g) => g.count) };
  }

  function anomaliesDetailChartData(source: AnomalieCode[] | null, groupeKey: ErrorGroupKey) {
    const items = (source ?? []).filter((a) =>
      (ErrorGroups[groupeKey] as string[]).includes(a.code),
    );
    return {
      x: items.map((a) => getErrorMessage(a.code, "short")),
      y: items.map((a) => a.count),
    };
  }

  function getPieErrorColors(source: AnomalieCode[] | null, groupKey?: ErrorGroupKey): string[] {
    const items = source ?? [];
    if (groupKey) {
      return items
        .filter((anomaly) => (ErrorGroups[groupKey] as string[]).includes(anomaly.code))
        .map((anomaly) => getErrorColor(anomaly.code));
    }
    return grouperAnomalies(source).map((group) => {
      const firstErrorCode = ErrorGroups[group.key][0];
      return getErrorColor(firstErrorCode);
    });
  }

  const bilanPieColors = computed(() => {
    if (!detailAnomalies.value) return ["#009081", "#E1000F"];
    return getPieErrorColors(palmaresAnomalies.value, drillDownGroupe.value?.key);
  });

  const comparePieColors = computed(() => {
    if (!detailAnomalies.value) return ["#009081", "#E1000F"];
    return getPieErrorColors(comparePalmaresAnomalies.value, drillDownGroupe.value?.key);
  });

  const bilanChartX = computed(() => {
    if (!detailAnomalies.value) return donutBilanX.value;
    return drillDownGroupe.value
      ? anomaliesDetailChartData(palmaresAnomalies.value, drillDownGroupe.value.key).x
      : anomaliesTopChartData(palmaresAnomalies.value).x;
  });

  const bilanChartY = computed(() => {
    if (!detailAnomalies.value) return donutBilanY.value;
    return drillDownGroupe.value
      ? anomaliesDetailChartData(palmaresAnomalies.value, drillDownGroupe.value.key).y
      : anomaliesTopChartData(palmaresAnomalies.value).y;
  });

  const compareChartX = computed(() => {
    if (!detailAnomalies.value) return donutBilanX.value;
    return drillDownGroupe.value
      ? anomaliesDetailChartData(comparePalmaresAnomalies.value, drillDownGroupe.value.key).x
      : anomaliesTopChartData(comparePalmaresAnomalies.value).x;
  });

  const compareChartY = computed(() => {
    if (!detailAnomalies.value) return compareDonutY.value;
    return drillDownGroupe.value
      ? anomaliesDetailChartData(comparePalmaresAnomalies.value, drillDownGroupe.value.key).y
      : anomaliesTopChartData(comparePalmaresAnomalies.value).y;
  });

  const compareHasData = computed(() => {
    if (!compareKpi.value) return false;
    if (detailAnomalies.value) return (comparePalmaresAnomalies.value?.length ?? 0) > 0;
    return compareKpi.value.totalEnvoyes > 0;
  });

const bilanHasData = computed(() =>
  (bilanChartY.value ?? []).some((v: number) => v > 0)
);

const bilanBarHasData = computed(() =>
  (bilanBarSeries.value ?? []).some((s: any) => (s.data ?? []).some((v: number) => v > 0))
);

const compareBarHasData = computed(() =>
  (compareBarSeries.value ?? []).some((s: any) => (s.data ?? []).some((v: number) => v > 0))
);

  const compareRange = computed<DateRange | null>(() => {
    if (compareRangeOverride.value) return compareRangeOverride.value;
    if (!fromBase.value || !toBase.value) return null;
    const from = dayjs(fromBase.value).subtract(compareOffset.value, unit.value).toDate();
    const to = dayjs(toBase.value).subtract(compareOffset.value, unit.value).toDate();
    return { from, to };
  });

  const currentPeriodLabel = computed(() => {
    const date = fromBase.value ?? baseDate;
    if (unit.value === "week") {
      const now = new Date();
      const isCurrentWeek =
        getWeek(date) === getWeek(now) && date.getFullYear() === now.getFullYear();
      return isCurrentWeek ? "Cette semaine" : `Semaine ${getWeek(date)}`;
    }
    const label = formatPeriodLabel(unit.value, date, false);
    return label.charAt(0).toUpperCase() + label.slice(1);
  });


  const compareRangeLabel = computed(() => {
    if (!compareRange.value) return "";
    const { from, to } = compareRange.value;
    if (unit.value === "week") {
      return `S${getWeek(from)} - ${dayjs(from).format("DD/MM")} au ${dayjs(to).format("DD/MM/YYYY")}`;
    }
    if (unit.value === "month") {
      return from.toLocaleDateString("fr-FR", { month: "long", year: "numeric" });
    }
    if (unit.value === "year") return String(from.getFullYear());
    return dayjs(from).format("DD/MM/YYYY");
  });

  // Graph Bar
  function getErrorCount(period: EvolutionPeriode, code: string): number {
    return period.errors.find((error) => error.code === code)?.count ?? 0;
  }

  function getErrorCodes(source: EvolutionPeriode[] | null): string[] {
    return [
      ...new Set(
        (source ?? []).flatMap((period) => period.errors.map((error) => error.code)),
      ),
    ];
  }

  const chartGranularity = computed<"day" | "week">(() => {
    if (!fromBase.value || !toBase.value) return "day";
    const diffInDays =
      (toBase.value.getTime() - fromBase.value.getTime()) / (1000 * 60 * 60 * 24);
    return diffInDays <= 7 ? "day" : "week";
  });

  const ordinalRules = new Intl.PluralRules("fr-FR", { type: "ordinal" });
  const ordinalSuffixes: Record<string, string> = { one: "ère", other: "ème" };

  function formatOrdinal(n: number): string {
    return `${n}${ordinalSuffixes[ordinalRules.select(n)] ?? "ème"}`;
  }

  function formatBarCategory(period: string, index: number): string {
    const date = new Date(period);
    if (chartGranularity.value === "day") {
      return capitalize(
        new Intl.DateTimeFormat("fr-FR", { weekday: "long" }).format(date),
      );
    }
    return `${formatOrdinal(index + 1)} semaine`;
  }

  function construireSeriesBar(source: EvolutionPeriode[] | null): BarSerie[] {
    if (!source) return [];
    if (!detailAnomalies.value) {
      return [
        {
          name: "Acceptés",
          data: source.map((period) => Number(period.accepted ?? 0)),
          color: "#009081",
        },
        {
          name: "Rejetés",
          data: source.map((period) => Number(period.refused ?? 0)),
          color: "#E1000F",
        },
      ];
    }
    const errorCodes = getErrorCodes(source);
    return errorCodes.map((code) => {
      const errorCode = code as ErrorCode;
      return {
        name: getErrorMessage(errorCode, "short"),
        data: source.map((period) => getErrorCount(period, code)),
        color: getErrorColor(errorCode),
      };
    });
  }

  const bilanBarCategories = computed(
    () =>
      evolutionEnvois.value?.map((period, index) =>
        formatBarCategory(period.period, index),
      ) ?? [],
  );

  const bilanBarSeries = computed(() => construireSeriesBar(evolutionEnvois.value));
  const compareBarSeries = computed(() => construireSeriesBar(compareEvolutionEnvois.value));

  function onSegmentClick(payload: { index: number }, source: AnomalieCode[] | null) {
    if (!detailAnomalies.value || drillDownGroupe.value) return;
    const groupes = grouperAnomalies(source);
    const groupe = groupes[payload.index];
    if (groupe) drillDownGroupe.value = { key: groupe.key, label: groupe.label };
  }

  function onBarSegmentClick(payload: { datasetIndex: number }) {
    if (!detailAnomalies.value || drillDownGroupe.value) return;
    const groupe = groupesAnomalies[payload.datasetIndex];
    if (groupe) drillDownGroupe.value = { key: groupe.key, label: groupe.label };
  }

  function retourCategories() {
    drillDownGroupe.value = null;
  }

  return {
    bilanViewMode,
    bilanChartType,
    detailAnomalies,
    drillDownGroupe,
    compareOffset,
    compareRangeOverride,
    tauxValidation,
    tauxRejet,
    donutBilanX,
    donutBilanY,
    compareTaux,
    compareDonutY,
    bilanPieColors,
    comparePieColors,
    bilanChartX,
    bilanChartY,
    compareChartX,
    compareChartY,
    compareHasData,
    bilanHasData,
    bilanBarHasData,
    compareBarHasData,
    compareRange,
    currentPeriodLabel,
    compareRangeLabel,
    chartGranularity,
    bilanBarCategories,
    bilanBarSeries,
    compareBarSeries,
    grouperAnomalies,
    anomaliesTopChartData,
    anomaliesDetailChartData,
    onSegmentClick,
    onBarSegmentClick,
    retourCategories,
  };
}