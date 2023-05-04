<!-- eslint-disable vue/valid-template-root -->
<template></template>

<script setup>
import { inject, watch } from 'vue'

const props = defineProps({
  data: {
    type: Object,
  },
  name: {
    type: String,
    required: true,
  },
  paint: {
    type: Object,
    default: () => ({
      "fill-outline-color": "#fff",
      "fill-color": [
        'case',
        ['boolean', ['feature-state', 'selected'], false],
        "#000091",
        ['boolean', ['feature-state', 'hover'], false],
        "#dcdcfc",
        ['boolean', ['==', ['get', "TYPE"], "BOR"], false],
        //--blue-france-main-525
        "#6a6af4",
        //--blue-france-sun-113-625
        "#eee"
      ],
      "fill-opacity": 1,
    })
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
        data: props.data ?? { type: 'FeatureCollection', features: [] }
      })
      .addLayer({
        id: `${props.name}-geometry`,
        source: props.name,
        type: 'fill',
        paint: props.paint
      }, props.before)
    .addLayer({
      id: `${props.name}-geometry-outline`,
      source: props.name,
      type: 'line',
      paint: {
        "line-width": 1,
        "line-color": "#000091",
        "line-opacity": 0.9,
      }
    }, props.before)
  })
})

watch(() => props.data, (featureCollection) => {
  map.value.getSource(props.name).setData(featureCollection)
})
</script>
