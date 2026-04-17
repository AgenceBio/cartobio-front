<template>
  <div class="button-group" :class="{ 'editing-bg': isEditing }">
    <div :class="[props.isCompare ? 'info-box-left' : 'info-box-right']">
      <div class="geometric-diff-viewer fr-mb-2w" v-if="diffOnMap" aria-live="polite">
        <div class="legend" v-if="openList === null">
          <div class="legend-item" @click="toggleList('added')">
            <span class="legend-color added"></span>
            Ajoutées
            <span class="nb-class">{{ addNb }}</span>

            <button class="fr-btn fr-btn--sm fr-btn--tertiary-no-outline" @click="onFilter('added')">
              <span class="ri-focus-3-line"></span>
            </button>
          </div>

          <div class="legend-item">
            <span class="legend-color modified" @click="toggleList('modified')"></span>
            Modifiées
            <span class="nb-class">{{ modifiedNb }}</span>

            <button class="fr-btn fr-btn--sm fr-btn--tertiary-no-outline" @click="onFilter('modified')">
              <span class="ri-focus-3-line"></span>
            </button>
          </div>

          <div class="legend-item">
            <span class="legend-color removed" @click="toggleList('deleted')"></span>
            Supprimées
            <span class="nb-class">{{ deleteNb }}</span>
            <button class="fr-btn fr-btn--sm fr-btn--tertiary-no-outline" @click="onFilter('deleted')">
              <span class="ri-focus-3-line"></span>
            </button>
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
              <button class="fr-btn fr-btn--sm fr-btn--tertiary-no-outline" @click="onLocate">
                <span class="ri-focus-3-line"></span>
              </button>
            </div>
            <div class="submenu-list">
              <ul>
                <li v-for="f in addedFeatures" :key="f.getId()" class="submenu-item" @click="zoomToFeature(f)">
                  {{ "Parcelle TODO" }}
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
              <button class="fr-btn fr-btn--sm fr-btn--tertiary-no-outline" @click="onLocate">
                <span class="ri-focus-3-line"></span>
              </button>
            </div>
            <div class="submenu-list">
              <ul>
                <li v-for="f in modifiedFeatures" :key="f.getId()" class="submenu-item" @click="zoomToFeature(f)">
                  {{ "Parcelle TODO" }}
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
              <button class="fr-btn fr-btn--sm fr-btn--tertiary-no-outline" @click="onLocate">
                <span class="ri-focus-3-line"></span>
              </button>
            </div>
            <div class="submenu-list">
              <ul>
                <li v-for="f in deletedFeatures" :key="f.getId()" class="submenu-item" @click="zoomToFeature(f)">
                  {{ "Parcelle TODO" }}
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <hr v-if="diffOnMap" />

      <span><i class="ri-custom-size" /> {{ sizeParcelles }} ha</span>
      <span>
        <i class="ri-collage-line" />
        {{ nbParcelles }} parcelle{{ nbParcelles > 1 ? "s" : "" }}
      </span>
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

const onFilter = (type: "added" | "modified" | "deleted") => {
  if (!diffLayer.value) return;

  const source = diffLayer.value.getSource();
  const features = source.getFeatures();

  features.forEach((f) => {
    const status = f.get("status");
    f.setStyle(
      status === type
        ? undefined // style normal
        : () => null, // cache la feature
    );
  });
};

const resetFilter = () => {
  if (!diffLayer.value) return;
  diffLayer.value
    .getSource()
    .getFeatures()
    .forEach((f) => {
      f.setStyle(undefined);
    });
};

const toggleList = (type: string) => {
  openList.value = openList.value === type ? null : type;
};

const zoomToFeature = (feature) => {
  if (!map?.value) return;
  const extent = feature.getGeometry()?.getExtent();
  if (!extent) return;

  map.value.getView().fit(extent, {
    duration: 500,
    padding: [50, 50, 50, 50],
    maxZoom: 18,
  });
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

const updateFeatureCounts = (layer) => {
  const features = layer?.getSource()?.getFeatures() || [];

  addedFeatures.value = features.filter((f) => f.get("status") === "added");
  modifiedFeatures.value = features.filter((f) => f.get("status") === "modified");
  deletedFeatures.value = features.filter((f) => f.get("status") === "deleted");

  addNb.value = addedFeatures.value.length;
  modifiedNb.value = modifiedFeatures.value.length;
  deleteNb.value = deletedFeatures.value.length;
};

onMounted(() => {
  if (!map?.value) return;

  createScaleLine();

  const layers = map.value.getLayers();

  addListener.value = layers.on("add", (e) => {
    if (e.element.get("name") === "diffLayer") {
      diffOnMap.value = true;
      diffLayer.value = e.element;

      updateFeatureCounts(e.element);
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
  padding: 24px;
  border-radius: 6px;
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
  padding: 24px;
  border-radius: 6px;
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
}
.legend {
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
  background: rgba(251, 184, 246, 1);
  border-color: rgba(247, 103, 239, 1);
}
.legend-color.removed {
  background-color: rgba(246, 246, 246, 0.3);
  background-image: repeating-linear-gradient(
    -45deg,
    rgba(207, 207, 207, 1) 0,
    rgba(207, 207, 207, 1) 1px,
    transparent 1px,
    transparent 4px
  );
  border: 2px dashed rgba(246, 246, 246, 0.3);
  border-radius: 4px;
}

.legend-color.modified {
  background: rgba(255, 165, 0, 0.3);
  border-color: orange;
  border-style: dashed;
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
  padding: 4px 8px;
  cursor: pointer;
}

.submenu-item:hover {
  background: #f0f0f0;
}

.title-submenu {
  display: flex;
  align-items: center;
  gap: 3px;
  margin-left: -24px;
  margin-right: -24px;
  margin-top: -24px;
  width: calc(100% + 48px);
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

.submenu-item {
  margin-left: -12px;
  margin-right: -12px;
}

.submenu-list ul li:nth-child(odd) {
  background: var(--light-options-primary-color-975-active-blue-france-975-active, #cbcbfa);
}

.submenu-list ul li:nth-child(even) {
  background: var(--light-decisions-background-background-alt-blue-france, #f5f5fe);
}

.submenu-list  {
  max-height: 105px;
  overflow-x: visible;

  overflow-y: scroll;
}
</style>
