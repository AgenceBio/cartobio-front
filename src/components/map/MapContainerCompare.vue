<template>
  <div class="flex" role="group" aria-label="Comparaison de deux cartes interactives">
    <div
      ref="mapRef"
      aria-label="Carte gauche, première version"
      class="openlayers-container"
      @mousemove="onMouseMove1"
      @mouseleave="onMouseLeave"
    >
      <slot name="map1" v-if="map" />
    </div>

    <div class="separator"></div>

    <div
      ref="mapRef2"
      class="openlayers-container"
      aria-label="Carte droite, seconde version"
      @mousemove="onMouseMove2"
      @mouseleave="onMouseLeave"
    >
      <slot name="map2" v-if="map2" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, provide, shallowRef, onUpdated } from "vue";
import { Map, View } from "ol";
import { useGeographic } from "ol/proj";
import { defaults as defaultInteractions } from "ol/interaction";
import VectorLayer from "ol/layer/Vector";

interface Props {
  layerId?: string;
}

const props = withDefaults(defineProps<Props>(), {
  layerId: "plan-features-layer",
});

const mapRef = ref<HTMLElement | null>(null);
const map = shallowRef<Map | null>(null);
const mapRef2 = ref<HTMLElement | null>(null);
const map2 = shallowRef<Map | null>(null);

provide("map", map);
provide("map2", map2);

defineExpose({ map, map2 });

const initMap = (): void => {
  useGeographic();
  const view = new View({
    center: [0, 0],
    zoom: 2,
    constrainResolution: true,
  });
  map.value = new Map({
    controls: [],
    view,
    interactions: defaultInteractions({
      doubleClickZoom: true,
      dragPan: true,
      mouseWheelZoom: true,
      pinchZoom: true,
    }),
  });
  map2.value = new Map({
    controls: [],
    view,
    interactions: defaultInteractions({
      doubleClickZoom: true,
      dragPan: true,
      mouseWheelZoom: true,
      pinchZoom: true,
    }),
  });
};

let currentHoveredFeature1 = null;
let currentHoveredFeature2 = null;

const getLayer = (mapInstance: Map) => {
  return mapInstance.getLayers().getArray().find((l) => l.get("name") === props.layerId) as VectorLayer<any>;
};

const clearHover = () => {
  if (currentHoveredFeature1) {
    currentHoveredFeature1.set("hover", false);
    currentHoveredFeature1 = null;
  }
  if (currentHoveredFeature2) {
    currentHoveredFeature2.set("hover", false);
    currentHoveredFeature2 = null;
  }

  const layer1 = getLayer(map.value);
  const layer2 = getLayer(map2.value);
  layer1?.changed();
  layer2?.changed();
};

const detectAndHighlight = (mapInstance: Map, pixel: number[]) => {
  const layer = getLayer(mapInstance);
  if (!layer) return null;

  const feature = mapInstance.forEachFeatureAtPixel(
    pixel,
    (f, layerCandidate) => {
      return layerCandidate === layer ? f : null;
    }
  );

  return feature;
};

const onMouseMove1 = (event: MouseEvent): void => {
  if (!map.value || !map2.value || !mapRef.value) return;

  const rect = mapRef.value.getBoundingClientRect();
  const pixel1 = [event.clientX - rect.left, event.clientY - rect.top];
  const coordinate = map.value.getCoordinateFromPixel(pixel1);

  const feature1 = detectAndHighlight(map.value, pixel1);

  let feature2 = null;
  if (coordinate) {
    const pixel2 = map2.value.getPixelFromCoordinate(coordinate);
    if (pixel2) {
      feature2 = detectAndHighlight(map2.value, pixel2);
    }
  }

  if (currentHoveredFeature1 !== feature1 || currentHoveredFeature2 !== feature2) {
    clearHover();

    if (feature1) {
      feature1.set("hover", true);
      currentHoveredFeature1 = feature1;
    }
    if (feature2) {
      feature2.set("hover", true);
      currentHoveredFeature2 = feature2;
    }

    const layer1 = getLayer(map.value);
    const layer2 = getLayer(map2.value);
    layer1?.changed();
    layer2?.changed();
  }
};

const onMouseMove2 = (event: MouseEvent): void => {
  if (!map.value || !map2.value || !mapRef2.value) return;

  const rect = mapRef2.value.getBoundingClientRect();
  const pixel2 = [event.clientX - rect.left, event.clientY - rect.top];
  const coordinate = map2.value.getCoordinateFromPixel(pixel2);

  const feature2 = detectAndHighlight(map2.value, pixel2);

  let feature1 = null;
  if (coordinate) {
    const pixel1 = map.value.getPixelFromCoordinate(coordinate);
    if (pixel1) {
      feature1 = detectAndHighlight(map.value, pixel1);
    }
  }

  if (currentHoveredFeature1 !== feature1 || currentHoveredFeature2 !== feature2) {
    clearHover();

    if (feature1) {
      feature1.set("hover", true);
      currentHoveredFeature1 = feature1;
    }
    if (feature2) {
      feature2.set("hover", true);
      currentHoveredFeature2 = feature2;
    }

    const layer1 = getLayer(map.value);
    const layer2 = getLayer(map2.value);
    layer1?.changed();
    layer2?.changed();
  }
};

const onMouseLeave = (): void => {
  clearHover();
};

onMounted(() => {
  initMap();
  if (mapRef.value && mapRef2.value) {
    map.value?.setTarget(mapRef.value);
    map2.value?.setTarget(mapRef2.value);
  }
});

onUpdated(() => {
  map.value?.updateSize();
  map2.value?.updateSize();
});

const diffOnMap = ref<"map1" | "map2" | null>(null);

onMounted(() => {
  if (map.value) {
    map.value.getLayers().on("add", (e) => {
      if (e.element.get("name") === "diffLayer") {
        diffOnMap.value = "map1";
      }
    });
    map.value.getLayers().on("remove", (e) => {
      if (e.element.get("name") === "diffLayer") {
        diffOnMap.value = null;
      }
    });
  }

  if (map2.value) {
    map2.value.getLayers().on("add", (e) => {
      if (e.element.get("name") === "diffLayer") {
        diffOnMap.value = "map2";
      }
    });
    map2.value.getLayers().on("remove", (e) => {
      if (e.element.get("name") === "diffLayer") {
        diffOnMap.value = null;
      }
    });
  }
});
</script>

<style>
@import "ol/ol.css";
</style>

<style scoped>
.openlayers-container {
  z-index: 0;
  height: 80vh;
  flex: 1;
}

.flex {
  display: flex;
}

.separator {
  position: relative;
  width: 3px;
  background: white;
  z-index: 0;
}
</style>