<template>
  <MapContainer
    :controls="controls"
    class="map map--preview"
    :options="{ interactive: false, hash: false, trackResize: false }"
    :bounds="mapBounds"
  >
    <GeojsonLayer
      :style="baseStyle"
      name="base"
    />
    <GeojsonLayer
      :data="collection"
      name="parcellaire-operateur"
    />
  </MapContainer>
</template>

<script setup>
import { computed } from 'vue'
import bbox from '@turf/bbox'

import MapContainer from './MapContainer.vue'
import GeojsonLayer from './GeojsonLayer.vue'
import baseStyle from '@/map-styles/base.json'

const props = defineProps({
  controls: Boolean,
  collection: {
    type: Object,
    required: true
  }
})

const mapBounds = computed(() => bbox(props.collection))
</script>

<style scoped>
.map {
  background: #ccc;
  height: 276px;
  max-width: 40vw;
  width: 100%;
}
</style>
