<template>
  <div class="rejects-chart">
    <div class="rejects-chart__canvas-wrapper">
      <canvas ref="canvasRef"></canvas>
    </div>
    <ul class="rejects-chart__legend">
      <li v-for="item in sortedData" :key="item.code" class="rejects-chart__legend-item">
        <span class="rejects-chart__legend-dot" :style="{ backgroundColor: getColor(item.code) }"></span>
        <span>{{ getLabel(item.code) }}</span>
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount, watch } from "vue";
import {
  Chart,
  BarController,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  type Plugin,
  type ChartType,
  type TooltipModel,
} from "chart.js";
import { getErrorMessage, ErrorCode, getErrorColor } from "@/utils/error-api.utils.ts";

Chart.register(BarController, BarElement, CategoryScale, LinearScale, Tooltip);

interface RejectItem {
  code: ErrorCode;
  count: number;
}

type RejectData = RejectItem[] | Record<string, RejectItem>;

const props = withDefaults(
  defineProps<{
    rejectData: RejectData;
    title?: string;
  }>(),
  {
    title: "Palmarès des causes de rejets cette semaine",
  },
);

const canvasRef = ref<HTMLCanvasElement | null>(null);
let chartInstance: Chart | null = null;
let tooltipEl: HTMLDivElement | null = null;

const sortedData = computed<RejectItem[]>(() => {
  const rawArray = Array.isArray(props.rejectData) ? props.rejectData : Object.values(props.rejectData);
  return [...rawArray].sort((a, b) => b.count - a.count);
});

function getLabel(code: ErrorCode): string {
  return getErrorMessage(code, "short");
}

function getColor(code: ErrorCode): string {
  return getErrorColor(code);
}

function lightenColor(hex: string, amount = 0.35): string {
  const num = parseInt(hex.replace("#", ""), 16);
  const r = Math.min(255, Math.floor(((num >> 16) & 0xff) + (255 - ((num >> 16) & 0xff)) * amount));
  const g = Math.min(255, Math.floor(((num >> 8) & 0xff) + (255 - ((num >> 8) & 0xff)) * amount));
  const b = Math.min(255, Math.floor((num & 0xff) + (255 - (num & 0xff)) * amount));
  return `rgb(${r}, ${g}, ${b})`;
}

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

  const item = sortedData.value[tooltip.dataPoints[0].dataIndex];
  if (!item) return;

  el.textContent = `${getLabel(item.code)} : ${item.count}`;
  el.setAttribute("aria-hidden", "false");
  el.className = "fr-tooltip chart-tooltip";
  el.classList.add("fr-tooltip--shown");

  el.style.left = `${tooltip.caretX}px`;
  el.style.top = `${tooltip.caretY}px`;
  el.style.transform = "translate(-50%, -100%)";
}

const cylinderCapsPlugin: Plugin<"bar"> = {
  id: "cylinderCaps",
  afterDatasetsDraw(chart) {
    const { ctx } = chart;
    const meta = chart.getDatasetMeta(0);

    meta.data.forEach((bar, index) => {
      const { x, y, width } = bar.getProps(["x", "y", "width"], true);
      const rx = width / 2;
      const ry = width / 6;
      const item = sortedData.value[index];

      if (!item) {
        return;
      }

      const color = getColor(item.code);
      ctx.save();
      ctx.fillStyle = lightenColor(color, 0.35);
      ctx.beginPath();
      ctx.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    });
  },
};

function buildChart(): void {
  if (!canvasRef.value) return;

  const labels = sortedData.value.map((_, index) => `N°${index + 1}`);
  const data = sortedData.value.map((item) => item.count);
  const backgroundColor = sortedData.value.map((item) => getColor(item.code));
  const maxValue = data.length ? Math.max(...data) : 0;
  const yMax = maxValue + 1;

  if (chartInstance) {
    chartInstance.data.labels = labels;
    chartInstance.data.datasets[0].data = data;
    chartInstance.data.datasets[0].backgroundColor = backgroundColor;
    chartInstance.options.scales!.y!.max = yMax;
    chartInstance.update();
    return;
  }

  chartInstance = new Chart(canvasRef.value, {
    type: "bar",
    data: {
      labels,
      datasets: [
        {
          data,
          backgroundColor,
          borderWidth: 0,
          borderRadius: 0,
          maxBarThickness: 60,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          enabled: false,
          external: externalTooltipHandler,
        },
      },
      scales: {
        y: {
          beginAtZero: true,
          max: yMax,
          grid: { color: "#eee" },
          ticks: {
            stepSize: 1,
            precision: 0,
          },
        },
        x: {
          grid: { display: false },
        },
      },
    },
    plugins: [cylinderCapsPlugin],
  });
}

onMounted(() => {
  buildChart();
});

watch(
  () => props.rejectData,
  () => {
    buildChart();
  },
  { deep: true },
);

onBeforeUnmount(() => {
  if (chartInstance) {
    chartInstance.destroy();
    chartInstance = null;
  }
  tooltipEl?.remove();
});
</script>

<style scoped>
.rejects-chart__canvas-wrapper {
  position: relative;
  height: 260px;
}

.rejects-chart__legend {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  list-style: none;
  padding: 16px 0 0;
  margin: 0;
}

.rejects-chart__legend-item {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
}

.rejects-chart__legend-dot {
  width: 10px;
  height: 10px;
  border-radius: 0;
  display: inline-block;
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
