<template>
  <aside ref="mapContainer" class="maplibre-container">
    <slot v-if="map" />
  </aside>
</template>

<script setup>
import { onMounted, onUpdated, provide, ref, shallowRef, watch } from 'vue'
import { Map as MapLibre, NavigationControl, ScaleControl } from 'maplibre-gl'

const map = shallowRef(null)
const mapContainer = ref(null)

provide('map', map)

const props = defineProps({
  showAttribution: {
    type: Boolean,
    default: false
  },
  bounds: {
    type: Array,
    required: true
  },
  controls: {
    type: Boolean,
    default: true
  },
  mapId: String,
  minInitialZoom: {
    type: [Number, String],
    default: 14,
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
    attributionControl: false,
    container: mapContainer.value,
    hash: false,
    bounds: props.bounds,
    padding: 50,
    ...props.options,
    locale: {
      'AttributionControl.ToggleAttribution': 'Déplier/replier les informations',
      'Map.Title': 'Cartographie du parcellaire',
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
        el.className = 'maplibregl-ctrl maplibregl-ctrl-group cartobio-controls'
        return el
      }
    }, 'bottom-right')
  }

  if (props.showAttribution) {
    map.value.addControl({
      onAdd: () => {
        const el = document.createElement('div')
        el.className = 'maplibregl-ctrl maplibregl-ctrl-attrib'
        el.innerHTML = '<a href="https://docs-cartobio.agencebio.org/agriculteurs.trices/annexes/legendes-de-la-carte" target="_blank">Sources des données et licences</a>'
        return el
      }
    }, 'bottom-right')

    map.value.addControl(new ScaleControl({ maxWidth: 80, unit: 'metric' }), 'bottom-right')
  }

  map.value.once('load', () => {
    // avoid the map to be too much on the nose of a single feature
    const zoom = Math.min(map.value.getZoom(), parseFloat(props.minInitialZoom))
    map.value.setZoom(zoom)

    if (props.mapId) {
      const canvas = map.value.getCanvas()
      // until is merged and released https://github.com/maplibre/maplibre-gl-js/pull/4147
      canvas.setAttribute('aria-label', map.value._getUIString('Map.Title'))
      canvas.setAttribute('id', props.mapId)
    }

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
  overflow: visible;

  [tabindex]:focus {
    outline-style: solid !important;
  }
}

.maplibregl-ctrl-bottom-left {
  z-index: 10;    /* has to be above maplibregl-ctrl-bottom-right to overlap it */
}

.maplibregl-ctrl-bottom-right {
  display: grid;
  grid-template-columns: auto 40px auto;
  grid-template-areas:
    'null null custom-controls'
    'null null group-controls'
    'attribution scale scale';

  padding: 0;

  .maplibregl-ctrl {
    margin: 0;
  }

  .maplibregl-ctrl-attrib {
    background-color: hsla(0,0%,100%, .90);
    font-size: 0.75rem;
    grid-area: attribution;
    margin-right: 1rem;
  }
  .maplibregl-ctrl-scale {
    grid-area: scale;
  }

  .maplibregl-ctrl-group {
    grid-area: group-controls;
    margin-right: 1rem;
    margin-bottom: 1rem;
  }

  .cartobio-controls {
    grid-area: custom-controls;
  }
}

.legend > * {
  pointer-events: initial;
}
</style>

<style lang="postcss" scoped>
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
</style>
