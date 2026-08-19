<template>
  <div class="chart-container">
    <canvas ref="canvasRef"></canvas>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount, watch } from "vue";
import { Chart, BarController, BarElement, CategoryScale, LinearScale, Tooltip, Legend } from "chart.js";
import type { TooltipModel, ChartType } from "chart.js";

Chart.register(BarController, BarElement, CategoryScale, LinearScale, Tooltip, Legend);

interface Serie {
  name: string;
  data: number[];
  color?: string;
}

interface Props {
  categories: string[];
  series: Serie[];
  comparisonSeries?: Serie[];
  unitTooltip?: string;
  month?: string;
}

const props = withDefaults(defineProps<Props>(), {
  comparisonSeries: () => [],
  unitTooltip: "",
  month: "",
});

const canvasRef = ref<HTMLCanvasElement | null>(null);

let chartInstance: Chart | null = null;
let tooltipEl: HTMLSpanElement | null = null;

const defaultColors = ["#00A95F", "#6DD897", "#E91719", "#F27979", "#CECECE"];
const COMPARISON_OPACITY = 0.4;
const weekOrdinals = ["1re", "2e", "3e", "4e", "5e", "6e"];

const displayCategories = computed(() =>
  props.month
    ? props.categories.map((_, index) => `${weekOrdinals[index] ?? `${index + 1}e`} semaine`)
    : props.categories,
);

function colorWithOpacity(color: string, opacity: number) {
  if (!color.startsWith("#")) {
    return color;
  }

  let hex = color.slice(1);

  if (hex.length === 3) {
    hex = hex
      .split("")
      .map((character) => character + character)
      .join("");
  }

  if (hex.length !== 6) {
    return color;
  }

  const red = parseInt(hex.slice(0, 2), 16);
  const green = parseInt(hex.slice(2, 4), 16);
  const blue = parseInt(hex.slice(4, 6), 16);

  return `rgba(${red}, ${green}, ${blue}, ${opacity})`;
}

function getSeriesColor(serie: Serie, index: number) {
  return serie.color ?? defaultColors[index % defaultColors.length];
}

const getOrCreateTooltipEl = (): HTMLSpanElement => {
  if (tooltipEl) {
    return tooltipEl;
  }

  tooltipEl = document.createElement("span");

  tooltipEl.className = "fr-tooltip chart-tooltip";
  tooltipEl.setAttribute("role", "tooltip");
  tooltipEl.setAttribute("aria-hidden", "true");
  tooltipEl.style.position = "absolute";
  tooltipEl.style.pointerEvents = "none";

  const parent = canvasRef.value?.parentNode as HTMLElement;

  parent.style.position = "relative";
  parent.appendChild(tooltipEl);

  return tooltipEl;
};

const externalTooltipHandler = (context: { chart: Chart; tooltip: TooltipModel<ChartType> }) => {
  const { chart, tooltip } = context;
  const el = getOrCreateTooltipEl();

  if (tooltip.opacity === 0) {
    el.classList.remove("fr-tooltip--shown");
    el.setAttribute("aria-hidden", "true");
    return;
  }

  const dataPoint = tooltip.dataPoints?.[0];

  if (!dataPoint) {
    return;
  }

  const realLabel = props.month ? `${props.categories[dataPoint.dataIndex]} — ${props.month}` : dataPoint.label;

  el.innerHTML = `
    ${realLabel} - ${dataPoint.dataset.label} :
    ${dataPoint.formattedValue}${props.unitTooltip}
  `;

  el.setAttribute("aria-hidden", "false");
  el.classList.add("fr-tooltip--shown");

  const { offsetLeft, offsetTop } = chart.canvas;

  el.style.left = `${offsetLeft + tooltip.caretX}px`;
  el.style.top = `${offsetTop + tooltip.caretY}px`;

  el.style.transform = tooltip.yAlign === "bottom" ? "translate(-50%, 8px)" : "translate(-50%, calc(-100% - 8px))";
};

const buildChart = () => {
  chartInstance?.destroy();

  if (!canvasRef.value) {
    return;
  }

  const comparisonDatasets = props.comparisonSeries.map((serie, index) => ({
    label: `Comparaison — ${serie.name}`,
    data: serie.data,
    backgroundColor: colorWithOpacity(getSeriesColor(serie, index), COMPARISON_OPACITY),
    borderWidth: 0,
    stack: "comparison",
    categoryPercentage: 0.85,
    barThickness: 16,
    maxBarThickness: 16,
  }));

  const currentDatasets = props.series.map((serie, index) => ({
    label: serie.name,
    data: serie.data,
    backgroundColor: getSeriesColor(serie, index),
    borderWidth: 0,
    stack: "current",
    categoryPercentage: 0.85,
    barPercentage: 0.9,
    maxBarThickness: 28,
  }));

  const comparisonDatasetCount = comparisonDatasets.length;

  chartInstance = new Chart(canvasRef.value, {
    type: "bar",

    data: {
      labels: displayCategories.value,
      datasets: [...comparisonDatasets, ...currentDatasets],
    },

    options: {
      responsive: true,
      maintainAspectRatio: false,

      scales: {
        x: {
          stacked: true,
          grid: {
            display: false,
          },
        },

        y: {
          stacked: true,
          beginAtZero: true,

          ticks: {
            precision: 0,
            callback: (value) => {
              const numberValue = Number(value);

              return Number.isInteger(numberValue) ? numberValue : "";
            },
          },
        },
      },

      plugins: {
        legend: {
          position: "bottom",
          align: "start",
          onClick: (e) => {
            e.native.stopPropagation();
          },

          labels: {
            usePointStyle: true,
            pointStyle: "rect",
            boxWidth: 12,
            boxHeight: 12,
            padding: 24,

            generateLabels: (chart) => {
              const defaultLabels = Chart.defaults.plugins.legend.labels.generateLabels(chart);

              const seen = new Set<string>();

              const orderedLabels = [
                ...defaultLabels.filter((item) => item.datasetIndex >= comparisonDatasetCount),
                ...defaultLabels.filter((item) => item.datasetIndex < comparisonDatasetCount),
              ];

              return orderedLabels.filter((item) => {
                const label = item.text.replace(/^Comparaison — /, "");

                if (seen.has(label)) {
                  return false;
                }

                seen.add(label);

                item.text = label;

                const isComparison = item.datasetIndex < comparisonDatasetCount;
                const serieIndex = isComparison ? item.datasetIndex : item.datasetIndex - comparisonDatasetCount;
                const serie = isComparison ? props.comparisonSeries[serieIndex] : props.series[serieIndex];

                if (serie) {
                  item.fillStyle = getSeriesColor(serie, serieIndex);
                }

                return true;
              });
            },
          },
        },

        tooltip: {
          enabled: false,
          external: externalTooltipHandler,
        },
      },
    },
  });
};

onMounted(buildChart);

watch(() => [props.categories, props.series, props.comparisonSeries, props.month], buildChart, { deep: true });

onBeforeUnmount(() => {
  chartInstance?.destroy();
  tooltipEl?.remove();
});
</script>

<style scoped>
.chart-container {
  width: 100%;
  height: 320px;
  position: relative;
}

.chart-container canvas {
  width: 100% !important;
  height: 100% !important;
}

:deep(.fr-tooltip.fr-placement)::before,
:deep(.fr-tooltip.fr-placement)::after {
  content: none;
}

:deep(.fr-tooltip.fr-placement) {
  background-color: white !important;
}

:deep(.chart-tooltip) {
  z-index: 2000;
  padding: 0.5rem 0.75rem;
  background-color: #fff;
  box-shadow: 0 2px 8px rgba(0, 0, 18, 0.16);
  font-size: 0.75rem;
  line-height: 1.25rem;
  color: var(--text-default-grey, #3a3a3a);
}
</style>
