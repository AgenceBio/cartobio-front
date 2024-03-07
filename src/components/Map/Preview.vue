<template>
  <MapContainer :controls="controls" class="map map--preview" :options="{ interactive: false, hash: false, trackResize: false }" minInitialZoom="22" :bounds="mapBounds">
    <GeojsonLayer :style="planStyle" name="plan" />
    <FeaturesLayer :data="collection" />
  </MapContainer>
</template>

<script setup>
import { computed } from 'vue'
import { bounds } from '@/components/Features/index.js'

import MapContainer from './MapContainer.vue'
import GeojsonLayer from './GeojsonLayer.vue'
import planStyle from '@/map-styles/plan.json'
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
