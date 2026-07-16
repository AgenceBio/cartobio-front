<template>
  <div class="flex" role="group" aria-label="Comparaison de deux cartes interactives">
    <div
      ref="mapRef"
      aria-label="Carte gauche, première version"
      class="openlayers-container"
      @mousemove="onMouseMove1"
      @mouseleave="onMouseLeave1"
    >
      <slot name="map1" v-if="map" />
    </div>

    <div class="separator"></div>

    <div
      ref="mapRef2"
      class="openlayers-container"
      aria-label="Carte droite, seconde version"
      @mousemove="onMouseMove2"
      @mouseleave="onMouseLeave2"
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

let currentHoveredFeature1 = null;
let currentHoveredFeature2 = null;

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

const getLayer = (mapInstance: Map) => {
  return mapInstance
    .getLayers()
    .getArray()
    .find((l) => l.get("name") === props.layerId);
};

const detectAndHighlight = (mapInstance: Map, pixel: number[]) => {
  const layer = getLayer(mapInstance);
  if (!layer) return null;

  const feature = mapInstance.forEachFeatureAtPixel(pixel, (f, layerCandidate) => {
    return layerCandidate === layer ? f : null;
  });

  return feature;
};

const clearHoverState = () => {
  if (currentHoveredFeature1) {
    currentHoveredFeature1.set("onhovered-compare", false);
    currentHoveredFeature1 = null;
  }
  if (currentHoveredFeature2) {
    currentHoveredFeature2.set("onhovered-compare", false);
    currentHoveredFeature2 = null;
  }
};

const onMouseMove1 = (event: MouseEvent): void => {
  if (!map.value || !map2.value || !mapRef.value) return;

  const rect = mapRef.value.getBoundingClientRect();
  const pixel = [event.clientX - rect.left, event.clientY - rect.top];
  const coordinate = map.value.getCoordinateFromPixel(pixel);
  const feature1 = detectAndHighlight(map.value, pixel);

  let feature2 = null;
  if (coordinate) {
    const pixel2 = map2.value.getPixelFromCoordinate(coordinate);

    if (pixel2) {
      map2.value.dispatchEvent({
        type: "pointermove",
        pixel: pixel2,
        coordinate: coordinate,
        originalEvent: event,
        map: map2.value,
        frameState: map2.value.frameState_,
      });
      feature2 = detectAndHighlight(map2.value, pixel2);
    }
  }

  // Enlever l'état des anciennes features si on a changé de feature
  if (feature1 !== currentHoveredFeature1 || feature2 !== currentHoveredFeature2) {
    clearHoverState();
  }

  if (feature1) {
    feature1.set("onhovered-compare", true);
    currentHoveredFeature1 = feature1;
  }
  if (feature2) {
    feature2.set("onhovered-compare", true);
    currentHoveredFeature2 = feature2;
  }

  const layer1 = getLayer(map.value);
  const layer2 = getLayer(map2.value);
  layer1?.changed();
  layer2?.changed();
};

const onMouseMove2 = (event: MouseEvent): void => {
  if (!map.value || !map2.value || !mapRef2.value) return;

  const rect = mapRef2.value.getBoundingClientRect();
  const pixel = [event.clientX - rect.left, event.clientY - rect.top];
  const coordinate = map2.value.getCoordinateFromPixel(pixel);
  const feature2 = detectAndHighlight(map2.value, pixel);

  let feature1 = null;

  if (coordinate) {
    const pixel1 = map.value.getPixelFromCoordinate(coordinate);

    if (pixel1) {
      map.value.dispatchEvent({
        type: "pointermove",
        pixel: pixel1,
        coordinate: coordinate,
        originalEvent: event,
        map: map.value,
        frameState: map.value.frameState_,
      });
      feature1 = detectAndHighlight(map.value, pixel1);
    }
  }

  if (feature1 !== currentHoveredFeature1 || feature2 !== currentHoveredFeature2) {
    clearHoverState();
  }

  if (feature1) {
    feature1.set("onhovered-compare", true);
    currentHoveredFeature1 = feature1;
  }
  if (feature2) {
    feature2.set("onhovered-compare", true);
    currentHoveredFeature2 = feature2;
  }

  const layer1 = getLayer(map.value);
  const layer2 = getLayer(map2.value);
  layer1?.changed();
  layer2?.changed();
};

const onMouseLeave1 = (): void => {
  if (!map2.value) return;

  clearHoverState();

  map2.value.dispatchEvent({
    type: "pointerout",
    pixel: [-1, -1],
    coordinate: undefined,
    map: map2.value,
  });

  const layer1 = getLayer(map.value);
  const layer2 = getLayer(map2.value);
  layer1?.changed();
  layer2?.changed();
};

const onMouseLeave2 = (): void => {
  if (!map.value) return;

  clearHoverState();

  map.value.dispatchEvent({
    type: "pointerout",
    pixel: [-1, -1],
    coordinate: undefined,
    map: map.value,
  });

  const layer1 = getLayer(map.value);
  const layer2 = getLayer(map2.value);
  layer1?.changed();
  layer2?.changed();
};
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
