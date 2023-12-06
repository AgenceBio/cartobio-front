<template>
  <MapContainer :controls="controls" class="map map--preview" :options="{ interactive: false, hash: false, trackResize: false }" :bounds="mapBounds">
    <GeojsonLayer :style="baseStyle" name="base" />
    <FeaturesLayer />
  </MapContainer>
</template>

<script setup>
import { computed } from 'vue'
import { bounds } from '@/components/Features/index.js'

import MapContainer from './MapContainer.vue'
import GeojsonLayer from './GeojsonLayer.vue'
import baseStyle from '@/map-styles/base.json'
import FeaturesLayer from "@/components/Map/FeaturesLayer.vue"

const props = defineProps({
  controls: Boolean,
  collection: {
    type: Object,
    required: true
  }
})

const mapBounds = computed(() => bounds(props.collection))
</script>

<style scoped>
.map {
  background: #ccc;
  height: 276px;
  max-width: 40vw;
  width: 100%;
}
</style>
