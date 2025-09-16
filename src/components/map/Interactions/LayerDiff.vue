<template></template>

<script setup lang="ts">
import { ref, inject, onMounted, onUnmounted, Ref, watch } from "vue";
import { Map } from "ol";
import VectorLayer from "ol/layer/Vector";
import VectorSource from "ol/source/Vector";
import { Fill, Stroke, Style } from "ol/style";
import GeoJSON from "ol/format/GeoJSON";
import { useRecordStore } from "@/stores/record.js";

import { getGeometryEquals } from "@/cartobio-api.js";

const recordStore = useRecordStore();

const map1 = inject<Ref<Map | null>>("map");
const map2 = inject<Ref<Map | null>>("map2");
const whoIsOlder = ref<"r2_old_r1_new" | "r1_old_r2_new" | null>(null);
const { record } = recordStore;

const props = defineProps<{ recordIdCompare: string }>();

const diffLayer = ref<VectorLayer | null>(null);

async function fetchDiff(recordIdOld: string, recordIdNew: string) {
  const res = await getGeometryEquals(recordIdOld, recordIdNew);
  if (res.data) {
    const geojson = await res.data[0].geojson;
    whoIsOlder.value = await res.data[0].comparison_result;
    renderDiff(geojson);
  }
}

function renderDiff(geojson: any) {
  if (diffLayer.value) {
    map1?.value?.removeLayer(diffLayer.value);
    map2?.value?.removeLayer(diffLayer.value);
    diffLayer.value = null;
  }

  const format = new GeoJSON();
  const features = format.readFeatures(geojson);

  features.forEach((f) => {
    const status = f.get("status");
    f.setStyle(getStyle(status));
  });

  const diffSource = new VectorSource({ features });
  diffLayer.value = new VectorLayer({
    source: diffSource,
    zIndex: 999,
    name: "diffLayer",
  });

  if (whoIsOlder.value === "r1_old_r2_new") {
    map2?.value?.addLayer(diffLayer.value);
  } else if (whoIsOlder.value === "r2_old_r1_new") {
    map1?.value?.addLayer(diffLayer.value);
  }
}

function getStyle(type: "added" | "deleted" | "modified") {
  switch (type) {
    case "added":
      return new Style({
        fill: new Fill({ color: "rgba(251, 184, 246, 0.3)" }),
        stroke: new Stroke({ color: "rgba(247, 103, 239, 1)", width: 1 }),
      });
    case "deleted":
      return new Style({
        stroke: new Stroke({
          color: "rgba(207, 207, 207, 1)",
          width: 1,
        }),
        fill: new Fill({
          color: makeHatchPattern(),
        }),
      });
    case "modified":
      return new Style({
        fill: new Fill({ color: "rgba(255,165,0,0.3)" }),
        stroke: new Stroke({ color: "orange", width: 1, lineDash: [2, 4] }),
      });
    default:
      return new Style();
  }
}

function makeHatchPattern(
  lineWidth = 1,
  spacing = 10,
  lineColor = "rgba(207,207,207,1)",
  bg = "rgba(246,246,246,0.3)",
): CanvasPattern | null {
  const canvas = document.createElement("canvas");
  canvas.width = spacing * 2;
  canvas.height = spacing;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;

  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.strokeStyle = lineColor;
  ctx.lineWidth = lineWidth;
  ctx.beginPath();

  ctx.moveTo(canvas.width + spacing / 2, -spacing / 2);
  ctx.lineTo(-spacing / 2, canvas.height + spacing / 2);

  ctx.moveTo(spacing / 2, -spacing / 2);
  ctx.lineTo(-canvas.width + spacing / 2, canvas.height + spacing / 2);

  ctx.moveTo(canvas.width * 1.5 + spacing / 2, -spacing / 2);
  ctx.lineTo(canvas.width / 2 + spacing / 2, canvas.height + spacing / 2);

  ctx.stroke();

  return ctx.createPattern(canvas, "repeat");
}

watch(
  () => props.recordIdCompare,
  (newValue) => {
    fetchDiff(record.record_id, newValue);
  },
);

onMounted(() => {
  if (props.recordIdCompare) {
    fetchDiff(record.record_id, props.recordIdCompare);
  }
});

onUnmounted(() => {
  if (diffLayer.value) {
    map1?.value?.removeLayer(diffLayer.value);
    map2?.value?.removeLayer(diffLayer.value);
  }
});
</script>
