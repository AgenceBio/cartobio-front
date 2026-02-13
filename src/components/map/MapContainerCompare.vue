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

const onMouseMove1 = (event: MouseEvent): void => {
  if (!map.value || !map2.value || !mapRef.value) return;

  const rect = mapRef.value.getBoundingClientRect();
  const pixel = [event.clientX - rect.left, event.clientY - rect.top];
  const coordinate = map.value.getCoordinateFromPixel(pixel);

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
    }
  }
};

const onMouseMove2 = (event: MouseEvent): void => {
  if (!map.value || !map2.value || !mapRef2.value) return;

  const rect = mapRef2.value.getBoundingClientRect();
  const pixel = [event.clientX - rect.left, event.clientY - rect.top];
  const coordinate = map2.value.getCoordinateFromPixel(pixel);

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
    }
  }
};

const onMouseLeave1 = (): void => {
  if (!map2.value) return;

  map2.value.dispatchEvent({
    type: "pointerout",
    pixel: [-1, -1],
    coordinate: undefined,
    map: map2.value,
  });
};

const onMouseLeave2 = (): void => {
  if (!map.value) return;

  map.value.dispatchEvent({
    type: "pointerout",
    pixel: [-1, -1],
    coordinate: undefined,
    map: map.value,
  });
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
