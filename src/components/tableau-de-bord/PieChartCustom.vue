<template>
  <figure class="chart-container" :class="[`chart-container--${size}`]" :aria-labelledby="titleId">
    <figcaption :id="titleId" class="fr-sr-only">
      {{ accessibleDescription }}
    </figcaption>

    <div class="chart-wrapper">
      <canvas ref="canvasRef" role="img" :aria-label="accessibleDescription" />
    </div>

    <ul class="chart-legend" :class="[`chart-legend--${size}`]" aria-hidden="true">
      <li v-for="(label, index) in x" :key="label">
        <span class="chart-legend__dot" :style="{ backgroundColor: legendColors[index % legendColors.length] }" />
        <span> {{ label }} ({{ y[index] }}{{ unitTooltip }}) </span>
      </li>
    </ul>

    <table class="fr-sr-only">
      <caption>
        Données du graphique
      </caption>
      <thead>
        <tr>
          <th scope="col">Catégorie</th>
          <th scope="col">Valeur</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(label, index) in x" :key="label">
          <th scope="row">{{ label }}</th>
          <td>{{ y[index] }}{{ unitTooltip }}</td>
        </tr>
      </tbody>
    </table>
  </figure>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from "vue";
import { Chart, PieController, ArcElement, Tooltip } from "chart.js";
import type { ChartType, TooltipModel } from "chart.js";

Chart.register(PieController, ArcElement, Tooltip);

interface Props {
  x: string[];
  y: number[];
  name?: string[];
  colors?: string[];
  unitTooltip?: string;
  title?: string;
  size?: "sm" | "md" | "lg";
}

const props = withDefaults(defineProps<Props>(), {
  name: () => [],
  colors: () => [],
  unitTooltip: "%",
  title: "Répartition des données",
  size: "md",
});

const emit = defineEmits<{
  (e: "segment-click", payload: { label: string; value: number; index: number }): void;
}>();

const canvasRef = ref<HTMLCanvasElement | null>(null);
const titleId = `chart-title-${crypto.randomUUID()}`;
let chartInstance: Chart<"doughnut"> | null = null;
let tooltipEl: HTMLDivElement | null = null;

const defaultColors = ["#009081", "#e1000f", "#6e3d89", "#f4732a", "#666666"];

const legendColors = computed(() => (props.colors.length ? props.colors : defaultColors));

const accessibleDescription = computed(() => {
  const values = props.x.map((label, i) => `${label} : ${props.y[i]}${props.unitTooltip}`).join(", ");
  return `${props.title}. ${values}.`;
});

function getOrCreateTooltipEl() {
  if (tooltipEl) return tooltipEl;

  const parent = canvasRef.value?.parentElement;
  if (!parent) return null;

  parent.style.position = "relative";

  tooltipEl = document.createElement("div");
  tooltipEl.className = "fr-tooltip fr-placement";
  tooltipEl.setAttribute("role", "tooltip");
  tooltipEl.setAttribute("aria-hidden", "true");
  tooltipEl.style.position = "absolute";
  tooltipEl.style.pointerEvents = "none";
  tooltipEl.style.whiteSpace = "nowrap";

  parent.appendChild(tooltipEl);
  return tooltipEl;
}

function externalTooltipHandler(context: { chart: Chart; tooltip: TooltipModel<ChartType> }) {
  const tooltip = context.tooltip;
  const el = getOrCreateTooltipEl();

  if (!el) return;

  if (tooltip.opacity === 0) {
    el.classList.remove("fr-tooltip--shown");
    el.setAttribute("aria-hidden", "true");
    return;
  }

  const point = tooltip.dataPoints[0];
  el.textContent = `${point.label} : ${point.formattedValue}${props.unitTooltip}`;
  el.setAttribute("aria-hidden", "false");
  el.className = "fr-tooltip chart-tooltip";

  el.classList.add("fr-tooltip--shown");

  el.style.left = `${tooltip.caretX}px`;
  el.style.top = `${tooltip.caretY}px`;
  el.style.transform = "translate(-50%, -100%)";
}

function buildChart() {
  if (!canvasRef.value) return;

  chartInstance = new Chart(canvasRef.value, {
    type: "doughnut",
    data: {
      labels: props.x,
      datasets: [
        {
          label: props.name[0] ?? props.title,
          data: props.y,
          backgroundColor: legendColors.value,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      onClick: (_, elements) => {
        if (!elements.length) return;

        const index = elements[0].index;
        emit("segment-click", {
          label: props.x[index],
          value: props.y[index],
          index,
        });
      },
      plugins: {
        legend: { display: false },
        tooltip: { enabled: false, external: externalTooltipHandler },
      },
    },
  });
}

function updateChart() {
  if (!chartInstance) return;

  chartInstance.data.labels = props.x;
  chartInstance.data.datasets[0].label = props.name[0] ?? props.title;
  chartInstance.data.datasets[0].data = props.y;
  chartInstance.data.datasets[0].backgroundColor = legendColors.value;
  chartInstance.update();
}

function downloadPng(filename = "graphique.png") {
  if (!chartInstance) return;

  const link = document.createElement("a");
  link.href = chartInstance.toBase64Image("image/png", 1);
  link.download = filename;
  link.click();
}

defineExpose({ downloadPng, canvas: canvasRef });

onMounted(buildChart);
watch(() => [props.x, props.y, props.name, props.colors], updateChart, { deep: true });

onBeforeUnmount(() => {
  chartInstance?.destroy();
  tooltipEl?.remove();
});
</script>

<style scoped>
.chart-container {
  width: 100%;
  max-width: 360px;
  margin: 0;
  position: relative;
}

/* Hauteurs selon la taille */
.chart-container--sm .chart-wrapper {
  height: 180px;
}

.chart-container--md .chart-wrapper {
  height: 240px;
}

.chart-container--lg .chart-wrapper {
  height: 320px;
}

.chart-wrapper {
  position: relative;
}

.chart-wrapper canvas {
  width: 100% !important;
  height: 100% !important;
}

/* Légende selon la taille */
.chart-legend--sm {
  font-size: 0.6875rem;
  gap: 0.25rem 0.75rem;
}

.chart-legend--md {
  font-size: 0.75rem;
  gap: 0.25rem 1rem;
}

.chart-legend--lg {
  font-size: 0.875rem;
  gap: 0.5rem 1.25rem;
}

.chart-legend {
  display: flex;
  flex-wrap: wrap;
  margin: 0.75rem 0 0;
  padding: 0;
  list-style: none;
  line-height: 1.25rem;
  justify-content: center;
}

.chart-legend li {
  display: inline-flex;
  align-items: center;
}

.chart-legend__dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  margin-right: 0.375rem;
  flex-shrink: 0;
}

.chart-legend--lg .chart-legend__dot {
  width: 14px;
  height: 14px;
  margin-right: 0.5rem;
}

:deep(.chart-tooltip) {
  z-index: 2000;
  padding: 0.5rem 0.75rem;
  background-color: #fff;
  box-shadow: 0 2px 8px rgba(0, 0, 18, 0.16);
  font-size: 0.75rem;
  line-height: 1.25rem;
  color: var(--text-default-grey, #3a3a3a);
  white-space: nowrap;
  width: max-content;
  max-width: none;
}
</style>
