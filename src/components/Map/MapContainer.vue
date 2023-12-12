<template>
  <aside ref="mapContainer" class="maplibre-container">
    <slot v-if="map" />
    <div class="legend">
      <slot name="legend" />
    </div>
    <slot name="credits" />
  </aside>
</template>

<script setup>
import { onMounted, onUpdated, provide, ref, shallowRef, watch } from 'vue'
import { Map as MapLibre, NavigationControl } from 'maplibre-gl'

const map = shallowRef(null)
const mapContainer = ref(null)

provide('map', map)

const props = defineProps({
  bounds: Array,
  controls: {
    type: Boolean,
    default: true
  },
  mode: {
    type: String,
  },
  options: {
    type: Object,
    default() {
      return {}
    }
  },
})

const emit = defineEmits(['zoom:change'])

onMounted(() => {
  map.value = new MapLibre({
    container: mapContainer.value,
    hash: false,
    bounds: props.bounds,
    padding: 50,
    ...props.options,
    locale: {
      'NavigationControl.ResetBearing': 'Restaurer l’orientation au nord',
      'NavigationControl.ZoomIn': 'Zoomer',
      'NavigationControl.ZoomOut': 'Dézoomer',
    }
  })

  if (props.controls) {
    map.value.addControl(new NavigationControl(), 'bottom-right')
    map.value.addControl({
      onAdd: () => {
        const el = document.createElement('div')
        el.className = 'maplibregl-ctrl maplibregl-ctrl-group cartobio-controls fr-mb-1w'
        return el
      }
    }, 'bottom-right')
  }

  map.value.once('load', () => {
    emit('zoom:change', map.value.getZoom())
  })

  map.value.on('zoomend', () => emit('zoom:change', map.value.getZoom()))
})

onUpdated(() => map.value && map.value.resize())

watch(() => props.bounds, (bounds) => {
  if (!bounds || !map.value) return
  map.value.fitBounds(bounds, { padding: 50 })
})

defineExpose({
  map,
})
</script>

<style>
@import "maplibre-gl/dist/maplibre-gl.css";

.maplibregl-map {
  font: inherit;
}

.maplibregl-ctrl-bottom-right {
  bottom: 1.5rem;
  right: 1.5rem;
  padding: 0;
}

.maplibregl-ctrl-bottom-right .maplibregl-ctrl-group {
  margin: 0;
}

.legend > * {
  pointer-events: initial;
}
</style>

<style lang="postcss" scoped>
:deep(.maplibregl-ctrl-attrib) {
  display: none;
}

:deep(.maplibregl-popup) {
  position: absolute;
  left: 0;
  top: 0;
}
:deep(.maplibregl-popup-content) {
  background: #fff;
  border: 1px solid var(--brand-color);
  border-radius: 3px;
  padding: 2rem 1rem 1rem;
  position: relative;
}
:deep(.maplibregl-popup-close-button) {
  position: absolute;
  right: .5rem;
  top: .5rem;
}

.maplibre-container .maplibregl-canvas-container {
  z-index: 0
}

.legend {
  position: absolute;
  height: 100%;
  width: 100%;
  z-index: 1;
  pointer-events: none;
}
</style>
