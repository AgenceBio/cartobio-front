<template></template>

<script setup>
import { inject, watch } from 'vue'

const props = defineProps({
  data: {
    type: Object,
    required: true,
  },
  name: {
    type: String,
    required: true,
  }
})

const map = inject('map')

watch(map, () => {
  map.value.once('load', () => {
    map.value
      .addSource(props.name, {
        type: 'geojson',
        data: props.data
      })
      .addLayer({
        id: `${props.name}-geometry`,
        source: props.name,
        type: 'fill',
        paint: {
          "fill-color": [
            'case',
            // ['boolean', ['feature-state', 'selected'], false],
            // "#ffcc00",
            ['boolean', ['feature-state', 'hover'], false],
            "#00ffff",
            "#000091"
          ],
          "fill-opacity": 0.9,
        }
      })
  })
})
</script>
