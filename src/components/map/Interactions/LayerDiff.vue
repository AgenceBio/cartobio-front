<template>
  <div class="geometric-diff-viewer">
    <div class="legend">
      <div class="legend-item"><span class="legend-color added"></span> Ajouté</div>
      <div class="legend-item"><span class="legend-color removed"></span> Supprimé</div>
      <div class="legend-item"><span class="legend-color modified"></span> Modifié</div>
    </div>
  </div>
  <div v-if="whoIsOlder" class="versionrecente" :class="[whoIsOlder === 'r1_old_r2_new' ? 'right' : 'left']">
    <p class="fr-text--xs fr-p-0 fr-mb-0">Version la + récente</p>
  </div>
</template>

//
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
  if (!map2?.value) return;

  if (diffLayer.value) {
    map2.value.removeLayer(diffLayer.value);
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
  });

  map2.value.addLayer(diffLayer.value);
}

function getStyle(type: "added" | "deleted" | "modified") {
  switch (type) {
    case "added":
      return new Style({
        fill: new Fill({ color: "rgba(0,255,0,0.3)" }),
        stroke: new Stroke({ color: "green", width: 3 }),
      });
    case "deleted":
      return new Style({
        fill: new Fill({ color: "rgba(255,0,0,0.3)" }),
        stroke: new Stroke({ color: "red", width: 3, lineDash: [6, 4] }),
      });
    case "modified":
      return new Style({
        fill: new Fill({ color: "rgba(255,165,0,0.3)" }),
        stroke: new Stroke({ color: "orange", width: 3, lineDash: [2, 4] }),
      });
    default:
      return new Style();
  }
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
  if (diffLayer.value && map2?.value) {
    map2.value.removeLayer(diffLayer.value);
  }
});
</script>

<style scoped>
.geometric-diff-viewer {
  position: absolute;
  top: 10px;
  left: 42.5%;
  background: white;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  font-size: 0.85rem;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
  z-index: 10000;
}
.legend {
  display: flex;
  gap: 1rem;
}
.legend-item {
  display: flex;
  align-items: center;
  gap: 0.4rem;
}
.legend-color {
  width: 14px;
  height: 14px;
  border: 1px solid #000;
}
.legend-color.added {
  background: rgba(0, 255, 0, 0.3);
  border-color: green;
}
.legend-color.removed {
  background: rgba(255, 0, 0, 0.3);
  border-color: red;
  border-style: dashed;
}
.legend-color.modified {
  background: rgba(255, 165, 0, 0.3);
  border-color: orange;
  border-style: dashed;
}

.versionrecente {
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  padding: 5px 10px;
  z-index: 1;

  position: absolute;
  max-width: 100%;
  top: 10px;

  background: #adf7ff;
  border-radius: 50px;
}

.versionrecente.right {
  right: 10px;
}

.versionrecente.left {
  left: 10px;
}
</style>
