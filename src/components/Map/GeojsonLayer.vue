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
  },
  before: String
})

const map = inject('map')

watch(map, () => {
  map.value.on('styledata', () => {
    if (map.value.getLayer(`${props.name}-geometry`)) {
      return;
    }

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
          "fill-outline-color": "#fff",
          "fill-color": [
            'case',
            ['boolean', ['feature-state', 'selected'], false],
            "#ffcc00",
            ['boolean', ['feature-state', 'hover'], false],
            "#00ffff",
            ['boolean', ['==', ['get', "TYPE"], "BOR"], false],
            //--blue-france-main-525
            "#6a6af4",
            //--blue-france-sun-113-625
            "#000091"
          ],
          "fill-opacity": 0.9,
        }
      }, props.before)
  })
})
</script>
