<template>
  <div class="button-group" :class="{ 'editing-bg': isEditing }">
    <div :class="[props.isCompare ? 'info-box-left' : 'info-box-right']">
      <div class="geometric-diff-viewer fr-mb-2w" v-if="diffOnMap" aria-live="polite">
        <div class="legend" v-if="openList === null">
          <div
            class="legend-item"
            @click="toggleList('added')"
            @mouseenter="onHoverList('added')"
            @mouseleave="onLeaveList()"
          >
            <div>
              <span class="legend-color added"></span>
              <span class="fr-ml-1w">Ajoutées</span>
            </div>
            <div>
              <span :class="{ 'nb-class': addNb === 0, 'nb-class-more': addNb > 0 }">{{ addNb }}</span>
              <button
                class="fr-btn fr-btn--sm fr-btn--tertiary-no-outline"
                :disabled="addNb === 0"
                @click.prevent.stop="onFocusType('added')"
              >
                <span class="ri-focus-3-line"></span>
              </button>
            </div>
          </div>

          <div
            class="legend-item"
            @click="toggleList('modified')"
            @mouseenter="onHoverList('modified')"
            @mouseleave="onLeaveList()"
          >
            <div>
              <span class="legend-color modified" @click="toggleList('modified')"></span>
              <span class="fr-ml-1w">Modifiées</span>
            </div>
            <div>
              <span :class="{ 'nb-class': modifiedNb === 0, 'nb-class-more': modifiedNb > 0 }"> {{ modifiedNb }}</span>

              <button
                class="fr-btn fr-btn--sm fr-btn--tertiary-no-outline"
                :disabled="modifiedNb === 0"
                @click.prevent.stop="onFocusType('modified')"
              >
                <span class="ri-focus-3-line"></span>
              </button>
            </div>
          </div>

          <div
            class="legend-item"
            @click="toggleList('deleted')"
            @mouseenter="onHoverList('deleted')"
            @mouseleave="onLeaveList()"
          >
            <div>
              <span class="legend-color removed" @click="toggleList('deleted')"></span>
              <span class="fr-ml-1w">Supprimées</span>
            </div>
            <div>
              <span :class="{ 'nb-class': deleteNb === 0, 'nb-class-more': deleteNb > 0 }">{{ deleteNb }}</span>
              <button
                class="fr-btn fr-btn--sm fr-btn--tertiary-no-outline"
                :disabled="deleteNb === 0"
                @click.prevent.stop="onFocusType('deleted')"
              >
                <span class="ri-focus-3-line"></span>
              </button>
            </div>
          </div>
        </div>
        <div v-else>
          <div v-if="openList === 'added'" class="submenu">
            <div class="title-submenu">
              <button
                @click="openList = null"
                type="button"
                class="fr-btn fr-btn--sm fr-btn--tertiary-no-outline fr-icon-arrow-left-s-line"
              >
                Retour
              </button>
              <span class="legend-color added"></span>
              Ajoutées
              <span class="nb-class-sublist">{{ addNb }}</span>
              <button class="fr-btn fr-btn--sm fr-btn--tertiary-no-outline" @click="onFocusType()">
                <span class="ri-focus-3-line"></span>
              </button>
            </div>
            <div class="submenu-list">
              <ul>
                <li
                  v-for="f in addedFeatures"
                  :key="f.getId()"
                  class="submenu-item"
                  @click="onClickFeature(f)"
                  @mouseenter="onHoverItem(f)"
                  @mouseleave="onLeaveItem"
                >
                  {{ f.get("label") }}
                </li>
              </ul>
            </div>
          </div>
          <div v-if="openList === 'modified'" class="submenu">
            <div class="title-submenu">
              <button
                @click="openList = null"
                type="button"
                class="fr-btn fr-btn--sm fr-btn--tertiary-no-outline fr-icon-arrow-left-s-line"
              >
                Retour
              </button>
              <span class="legend-color modified"></span>
              Modifiées
              <span class="nb-class-sublist">{{ modifiedNb }}</span>
              <button class="fr-btn fr-btn--sm fr-btn--tertiary-no-outline" @click="onFocusType()">
                <span class="ri-focus-3-line"></span>
              </button>
            </div>
            <div class="submenu-list">
              <ul>
                <li
                  v-for="f in modifiedFeatures"
                  :key="f.getId()"
                  class="submenu-item"
                  @click="onClickFeature(f)"
                  @mouseenter="onHoverItem(f)"
                  @mouseleave="onLeaveItem"
                >
                  {{ f.get("label") }}
                </li>
              </ul>
            </div>
          </div>
          <div v-if="openList === 'deleted'" class="submenu">
            <div class="title-submenu">
              <button
                @click="openList = null"
                type="button"
                class="fr-btn fr-btn--sm fr-btn--tertiary-no-outline fr-icon-arrow-left-s-line"
              >
                Retour
              </button>
              <span class="legend-color removed"></span>
              Supprimées
              <span class="nb-class-sublist">{{ deleteNb }}</span>
              <button class="fr-btn fr-btn--sm fr-btn--tertiary-no-outline" @click="onFocusType()">
                <span class="ri-focus-3-line"></span>
              </button>
            </div>
            <div class="submenu-list">
              <ul>
                <li
                  v-for="f in deletedFeatures"
                  :key="f.getId()"
                  class="submenu-item"
                  @click="onClickFeature(f)"
                  @mouseenter="onHoverItem(f)"
                  @mouseleave="onLeaveItem"
                >
                  {{ f.get("label") }}
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <hr v-if="diffOnMap" />
      <div class="status-parcelles" :style="{ paddingTop: !diffOnMap ? '24px' : '0px' }">
        <span><i class="ri-custom-size" /> {{ sizeParcelles }} ha</span>
        <span>
          <i class="ri-collage-line" />
          {{ nbParcelles }} parcelle{{ nbParcelles > 1 ? "s" : "" }}
        </span>
      </div>
    </div>

    <div class="attribution fr-text--xs" v-if="isCompare">
      <a href="https://docs-cartobio.agencebio.org/agriculteurs.trices/annexes/legendes-de-la-carte" target="_blank">
        Sources des données et licences
      </a>
    </div>

    <div id="scale-line" class="scale-line" v-if="isCompare"></div>

    <div class="group-button-right" v-if="isCompare">
      <div class="group-zoom">
        <button class="fr-btn fr-btn--sm fr-btn--tertiary-no-outline" @click="onZoomIn">
          <span class="fr-icon-add-line fr-icon--sm"></span>
        </button>
        <button class="fr-btn fr-btn--sm fr-btn--tertiary-no-outline" @click="onZoomOut">
          <span class="fr-icon-subtract-line fr-icon--sm"></span>
        </button>
      </div>
      <button class="fr-btn fr-btn--sm fr-btn--tertiary-no-outline" @click="onLocate">
        <span class="ri-focus-3-line"></span>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { inject, onMounted, onUnmounted, ref, Ref } from "vue";
import type { Map as OlMap } from "ol";
import ScaleLine from "ol/control/ScaleLine.js";
import { Style, Fill, Stroke } from "ol/style";

const props = defineProps<{
  isCompare?: boolean;
  nbParcelles: number;
  sizeParcelles: number;
  isEditing?: boolean;
}>();

const map = inject<Ref<OlMap>>(!props.isCompare ? "map" : "map2");
if (!map) throw new Error("Pas de map disponible");

const emit = defineEmits<{
  (e: "locate"): void;
  (e: "select", feature: any): void;
}>();

const modifiedNb = ref(0);
const addNb = ref(0);
const deleteNb = ref(0);

const diffOnMap = ref(false);
const diffLayer = ref<any>(null);
const openList = ref<string | null>(null);

const addedFeatures = ref<any[]>([]);
const modifiedFeatures = ref<any[]>([]);
const deletedFeatures = ref<any[]>([]);

const addListener = ref(null);
const removeListener = ref(null);

const lanFeaturesMap = ref<Map<string, any>>(new Map());
const lastHoveredListFeature = ref<any>(null);

const onZoomIn = () => {
  if (!map?.value) return;
  const view = map.value.getView();
  view.setZoom((view.getZoom() || 0) + 1);
};

const onZoomOut = () => {
  if (!map?.value) return;
  const view = map.value.getView();
  view.setZoom((view.getZoom() || 1) - 1);
};

const onLocate = () => emit("locate");

const toggleList = (type: string) => {
  openList.value = openList.value === type ? null : type;
};

const zoomToFeature = (feature: any) => {
  if (!map?.value) return;
  const extent = feature.getGeometry()?.getExtent();
  if (!extent) return;

  map.value.getView().fit(extent, {
    duration: 500,
    padding: [50, 50, 50, 50],
    maxZoom: 18,
  });
};

const computeLabels = () => {
  const features = diffLayer.value?.getSource()?.getFeatures() || [];

  features.forEach((f: any) => {
    const lanFeature = getUnderlyingLanFeature(f);

    let label = "Parcelle";

    if (lanFeature) {
      const ilot = lanFeature.get("NUMERO_I");
      const parcelle = lanFeature.get("NUMERO_P");

      if (ilot || parcelle) {
        label = `Ilot ${ilot ?? "?"} Parcelle ${parcelle ?? "?"}`;
      } else {
        label = lanFeature.get("NOM") || label;
      }
    }

    f.set("label", label);
  });
};

const onFocusType = (status: string | null = null) => {
  if (!map?.value) return;

  const featuresMap: Record<string, any[]> = {
    added: addedFeatures.value,
    modified: modifiedFeatures.value,
    deleted: deletedFeatures.value,
  };

  const features = featuresMap[status ?? openList.value] || [];
  if (!features.length) return;

  const extents = features.map((f) => f.getGeometry()?.getExtent()).filter(Boolean);
  if (!extents.length) return;

  const combined = extents.reduce(
    (acc, ext) => [
      Math.min(acc[0], ext[0]),
      Math.min(acc[1], ext[1]),
      Math.max(acc[2], ext[2]),
      Math.max(acc[3], ext[3]),
    ],
    [Infinity, Infinity, -Infinity, -Infinity],
  );

  map.value.getView().fit(combined, {
    duration: 500,
    padding: [50, 50, 50, 50],
    maxZoom: 18,
  });
};

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
      return undefined;
  }
}

function getStyleAccentue(type: "added" | "deleted" | "modified") {
  switch (type) {
    case "added":
      return new Style({
        fill: new Fill({ color: "rgba(251, 184, 246, 0.6)" }), // + opaque
        stroke: new Stroke({ color: "rgba(247, 103, 239, 1)", width: 2 }),
      });

    case "deleted":
      return new Style({
        stroke: new Stroke({
          color: "rgba(160, 160, 160, 1)",
          width: 2,
        }),
        fill: new Fill({
          color: makeHatchPattern(),
        }),
      });

    case "modified":
      return new Style({
        fill: new Fill({ color: "rgba(255,165,0,0.55)" }), // + opaque
        stroke: new Stroke({
          color: "orange",
          width: 2,
          lineDash: [2, 4],
        }),
      });

    default:
      return undefined;
  }
}

const onHoverList = (type: "added" | "deleted" | "modified") => {
  if (!diffLayer.value) return;

  const features = diffLayer.value.getSource().getFeatures();

  features.forEach((f: any) => {
    const status = f.get("status");

    if (status === type) {
      f.setStyle(getStyleAccentue(status));
    } else {
      f.setStyle(
        new Style({
          fill: new Fill({ color: "rgba(0,0,0,0.05)" }),
          stroke: new Stroke({ color: "rgba(0,0,0,0.1)", width: 1 }),
        }),
      );
    }
  });
};

const onLeaveList = () => {
  if (!diffLayer.value) return;
  diffLayer.value
    .getSource()
    .getFeatures()
    .forEach((f: any) => {
      const status = f.get("status");
      f.setStyle(getStyle(status));
    });
};

const onHoverItem = (feature: any) => {
  if (!diffLayer.value) return;
  diffLayer.value
    .getSource()
    .getFeatures()
    .forEach((f: any) => {
      f.setStyle(f !== feature ? getStyle(f.get("status")) : getStyleAccentue(f.get("status")));
    });
  emit("select", feature);
};

const onLeaveItem = () => {
  if (!diffLayer.value) return;
  diffLayer.value
    .getSource()
    .getFeatures()
    .forEach((f: any) => f.setStyle(getStyle(f.get("status"))));
  lastHoveredListFeature.value = null;
};

const onClickFeature = (feature: any) => {
  zoomToFeature(feature);
  if (!props.isCompare) {
    emit("selectList", feature);
  } else {
    if (lastHoveredListFeature.value && lastHoveredListFeature.value !== feature) {
      lastHoveredListFeature.value.setStyle(undefined);
    }
    lastHoveredListFeature.value = feature;
    feature.setStyle(getStyle(feature.get("status")));
  }
};

const createScaleLine = () => {
  const el = document.getElementById("scale-line");
  if (!map?.value || !el) return;

  map.value.addControl(
    new ScaleLine({
      target: el,
      units: "metric",
      maxWidth: 100,
      minWidth: 100,
    }),
  );
};

const updateFeatureCounts = (layer: any) => {
  const features = layer?.getSource()?.getFeatures() || [];

  addedFeatures.value = features.filter((f) => f.get("status") === "added");
  modifiedFeatures.value = features.filter((f) => f.get("status") === "modified");
  deletedFeatures.value = features.filter((f) => f.get("status") === "deleted");

  addNb.value = addedFeatures.value.length;
  modifiedNb.value = modifiedFeatures.value.length;
  deleteNb.value = deletedFeatures.value.length;
};

const initLanLayer = () => {
  if (!map?.value) return;
  const lanLayer = map.value
    .getLayers()
    .getArray()
    .find((l) => l.get("name") === "plan-features-layer");
  if (!lanLayer) return;

  const source = (lanLayer as any).getSource();
  const loadFeatures = () => {
    lanFeaturesMap.value = new Map(source.getFeatures().map((f: any) => [String(f.getId()), f]));
  };

  loadFeatures();
  source.on("change", loadFeatures);
};

onMounted(() => {
  if (!map?.value) return;

  createScaleLine();
  initLanLayer();

  const layers = map.value.getLayers();

  addListener.value = layers.on("add", (e) => {
    if (e.element.get("name") === "diffLayer") {
      diffOnMap.value = true;
      diffLayer.value = e.element;

      updateFeatureCounts(e.element);
      computeLabels();
    }

    if (e.element.get("name") === "plan-features-layer") {
      initLanLayer();
    }
  });

  removeListener.value = layers.on("remove", (e) => {
    if (e.element.get("name") === "diffLayer") {
      diffOnMap.value = false;
      addNb.value = 0;
      modifiedNb.value = 0;
      deleteNb.value = 0;
    }
  });
});

onUnmounted(() => {
  addListener.value = null;
  removeListener.value = null;
});

const getUnderlyingLanFeature = (diffFeature: any) => {
  if (!map?.value) return null;

  const geom = diffFeature?.getGeometry?.();
  if (!geom) return null;

  const coord = geom.getFirstCoordinate?.();
  if (!coord) return null;

  const pixel = map.value.getPixelFromCoordinate(coord);

  let found: any = null;

  map.value.forEachFeatureAtPixel(
    pixel,
    (feature, layer) => {
      if (layer?.get("name") === "plan-features-layer") {
        found = feature;
        return true;
      }
      return false;
    },
    {
      hitTolerance: 3,
    },
  );

  return found;
};
</script>

<style scoped>
.button-group {
  position: absolute;
  bottom: 0;
  z-index: 1;
  display: inline-flex;
  max-width: 50vw;
  border-radius: 4px;
}

.group-button-right {
  position: absolute;
  bottom: 0;
  right: 0;

  display: flex;
  justify-content: space-between;
  flex-direction: column;
  gap: 2px;

  border-radius: 4px;
}

.group-button-right > button {
  background: white;
  width: 30px;
  height: 30px;
  justify-content: center;
  margin-right: 1rem;
}

.group-zoom > button {
  background: white;
  width: 30px;
  height: 30px;
  justify-content: center;
}

.group-zoom {
  display: flex;
  flex-direction: column;
  box-shadow: 0px 4px 12px 0px rgba(0, 0, 18, 0.16);
}

.mode-choice {
  background: #ffffff;
  padding: 6px;
  justify-content: space-between;
  gap: 10px;
  height: fit-content;
  position: absolute;
  bottom: 10px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 10px;
  border-radius: 4px;
}

.active {
  border-radius: 4px;
}

.info-box-left {
  font-size: 14px;
  position: absolute;
  bottom: 1rem;
  left: 1rem;
  font-weight: 500;
  border-radius: 4px;
  display: flex;
  flex-direction: column;
  background: #ffffff;
  box-shadow: 0px 4px 12px 0px rgba(0, 0, 18, 0.16);
}

.info-box-right {
  font-size: 14px;
  position: absolute;
  bottom: 1rem;
  right: 1.5rem;
  font-weight: 500;
  border-radius: 4px;
  display: flex;
  box-shadow: 0px 4px 12px 0px rgba(0, 0, 18, 0.16);
  overflow: visible;

  flex-direction: column;
  background: #ffffff;
}

.parcelles {
  background-color: white;

  padding: 16px;
  gap: 12px;

  background: rgba(255, 255, 255, 0.9);

  border-radius: 20px;
}

.surface {
  background-color: white;

  padding: 16px;
  gap: 12px;

  background: rgba(255, 255, 255, 0.9);

  border-radius: 20px;
}

.info-box-open {
  background: #ffffff;
  padding: 8px 12px;
  border-radius: 6px;
  display: flex;
  flex-direction: column;
  font-size: 14px;
  position: absolute;
  bottom: 8rem;
  left: 1rem;
  font-weight: 500;
}

.group-button-right {
  bottom: 10px;
  right: 10px;
  display: flex;
  gap: 10px;
}

.button-group {
  width: 100%;
}

i[class^="ri"],
i[class*=" ri"] {
  font-size: 1.2em;
}

.button-group > div {
  border-radius: 6px;
}

.scale-line {
  position: absolute;
  bottom: 0.15rem;
  right: 10rem;
}
.ol-scale-line {
  position: relative;
  bottom: 0px;
  left: 0px;
}

.attribution > a {
  position: absolute;
  display: flex;
  right: 160px;
  bottom: 15px;
  background-color: white;
  border-radius: 0px !important;
}

.attribution > .fr-btn {
  position: absolute;
  display: flex;
  right: 160px;
  bottom: 10px;
  background-color: white;
}

.geometric-diff-viewer {
  font-size: 0.85rem;
  z-index: 10000;
  max-width: 200px;
  margin-bottom: 8px;
}

.legend {
  padding: 12px 24px 0px 24px;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}

hr {
  margin: 0px 12px;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  justify-content: space-between;
  font-size: 12px;
  width: calc(100% + 16px);
  margin: 0 -8px;
  padding: 4px 8px;
  border-radius: 4px;
}

.legend-item > div {
  display: flex;
  align-items: center;
}

.legend-item:hover {
  background-color: var(--light-options-primary-color-975-hover-blue-france-975-hover, #dcdcfc);
  cursor: pointer;
}

.fr-btn--tertiary-no-outline:hover {
  background-color: rgba(0, 0, 0, 0.04) !important;
  transition: background-color 0.2s ease;
}

.legend-color {
  position: relative;
  width: 14px;
  height: 14px;
  border: 1px solid #000;
  background-color: #ffffff;
  box-sizing: border-box;
  flex-shrink: 0;
}

.legend-color.added {
  background-color: rgba(251, 184, 246, 1);
  border-color: rgba(247, 103, 239, 1);
}

.legend-color.removed {
  border: 2px dashed rgba(246, 246, 246, 0.3);
  border-radius: 4px;
}

.legend-color.removed::before {
  content: "";
  position: absolute;
  inset: 0;
  background-color: rgba(246, 246, 246, 0.3);
  background-image: repeating-linear-gradient(
    -45deg,
    rgba(207, 207, 207, 1) 0,
    rgba(207, 207, 207, 1) 1px,
    transparent 1px,
    transparent 4px
  );
  border-radius: 4px;
}

.legend-color.modified {
  border-color: orange;
  border-style: dashed;
}

.legend-color.modified::before {
  content: "";
  position: absolute;
  inset: 0;
  background: rgba(255, 165, 0, 0.3);
}

.nb-class {
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  padding: 2px 8px;
  gap: 2px;

  width: 24px;
  height: 24px;

  background: #eeeeee;
  border-radius: 12px;
}

.nb-class-sublist {
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  padding: 2px 8px;
  gap: 2px;

  width: 24px;
  color: var(--light-decisions-text-text-action-high-blue-france, #000091);

  height: 24px;

  background: var(--light-decisions-background-background-action-low-blue-france-active, #adadf9);
  border-radius: 12px;
}

.nb-class-more {
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  padding: 2px 8px;
  gap: 2px;

  width: 24px;
  color: var (--light-decisions-text-text-action-high-blue-france, #000091);

  height: 24px;

  border-radius: 12px;
  background: var(--light-decisions-background-background-action-low-blue-france, #e3e3fd);
}

.editing-bg {
  max-width: 34vw !important;
}

.mini-btn {
  margin-left: 4px;
  background: white;
  border: none;
  cursor: pointer;
}

.submenu {
  max-height: 150px;
}

.submenu-item {
  padding: 4px 8px 4px 20px;
  cursor: pointer;
}

.submenu-item:hover {
  background: var(--light-options-primary-color-975-hover-blue-france-975-hover, #dcdcfc);
}

.title-submenu {
  display: flex;
  align-items: center;
  gap: 3px;
  padding: 8px 0px;
  align-self: stretch;
  gap: 0.4rem;
  border-bottom: 1px solid var(--light-decisions-artwork-artwork-decorative-blue-france, #ececfe);

  background: var(--light-options-primary-color-975-active-blue-france-975-active, #cbcbfa);
  z-index: 100000000;
}

.submenu-list ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.submenu-list ul li:nth-child(odd) {
  background: #ffffff;
}

.submenu-list ul li:nth-child(even) {
  background: var(--light-decisions-background-background-alt-blue-france, #f5f5fe);
}

.submenu-list {
  max-height: 105px;
  overflow-x: visible;

  overflow-y: scroll;
}

.status-parcelles {
  padding: 0px 24px 24px 24px;
  display: flex;
  flex-direction: column;
}
</style>
