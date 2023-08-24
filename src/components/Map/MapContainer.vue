<template>
  <aside ref="mapContainer">
    <slot v-if="map" />
    <slot name="legend" />
    <slot name="credits" />
  </aside>
</template>

<script setup>
import { provide, shallowRef, ref, onMounted, onUpdated, watch } from 'vue'
import { Map as MapLibre, NavigationControl } from 'maplibre-gl'
import warningImg from '@/assets/map/warning.png?url'

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

const emit = defineEmits(['load', 'zoom:change'])

onMounted(() => {
  map.value = new MapLibre({
    container: mapContainer.value,
    hash: false,
    bounds: props.bounds,
    padding: 50,
    ...props.options,
  })

  if (props.controls) {
    map.value.addControl(new NavigationControl(), 'bottom-right')
  }

  map.value.once('load', ({ target: map }) => {
    emit('load', map)
    emit('zoom:change', map.getZoom())
  })

  map.value.on('zoomend', ({ target: map }) => emit('zoom:change', map.getZoom()))

  map.value.on('styleimagemissing', ({ target: map, id }) => {
    if (id !== 'warning') return
    map.loadImage(warningImg, (error, image) => {
      if (error) throw error
      map.addImage('warning', image)
    })
  })
})

onUpdated(() => map.value.resize())

watch(() => props.bounds, (bounds) => {
  if (!bounds) return
  map.value.fitBounds(bounds, { padding: 50 })
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
</style>
