<template>
  <aside ref="mapContainer">
    <slot />
    <slot name="credits" />
  </aside>
</template>

<script setup>
import { provide, shallowRef, ref, onMounted, watch } from 'vue'
import { Map as MapLibre } from 'maplibre-gl'

const map = shallowRef(null)
const mapContainer = ref(null)

provide('map', map)

const props = defineProps({
  style: Object,
  bounds: Array,
})

const emit = defineEmits(['load'])

onMounted(() => {
  map.value = new MapLibre({
    container: mapContainer.value,
    hash: true,
    style: props.style,
    bounds: props.bounds,
    padding: 20,
  })

  map.value.once('load', () => emit('load', map.value))
})

watch(() => props.style, () => map.value.setStyle(props.style), { deep: true })
</script>

<style lang="postcss" scoped>
:deep(.maplibregl-control-container) {
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