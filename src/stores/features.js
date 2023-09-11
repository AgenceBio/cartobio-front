import { defineStore } from 'pinia'
import { computed, reactive, ref, toRaw, unref, watch } from 'vue'

export function collectIds (features) {
  return features.map(({ id }) => id).sort()
}

export const useFeaturesStore = defineStore('features', () => {
  const selectedIds = ref([])
  const activeId = ref(null)
  const hoveredId = ref(null)
  const collection = ref({
    type: 'FeatureCollection',
    features: []
  })

  function getFeatureById (id) {
    return collection.value.features.find(feature => feature.id === id)
  }

  const allSelected = computed(() => {
    const collectedIds = collectIds(collection.value.features)

    return collectedIds.toString() === selectedIds.value.sort().toString()
  })

  const activeFeature = computed(() => {
    return activeId.value ? getFeatureById(activeId.value) : null
  })

  const hasFeatures = computed(() => collection.value.features.length > 0)

  const hoveredFeature = computed(() => {
    return hoveredId.value ? getFeatureById(hoveredId.value) : null
  })

  const selectedFeatures = computed(() => {
    return selectedIds.value.map(getFeatureById)
  })

  function setAll (features) {
    collection.value.features = [...features]
  }

  function toggleAllSelected () {
    selectedIds.value = allSelected.value ? [] : collectIds(collection.value.features)
  }

  function toggleSingleSelected (featureId) {
    selectedIds.value = selectedIds.value.includes(featureId)
      // we remove it if it was available
      ? selectedIds.value.filter(id => id !== featureId)
      // otherwise, we add it to the select list
      : selectedIds.value.concat([featureId])
  }

  function bindMaplibreFeatureState ({ map, source }) {
    watch(hoveredId, (id, previousId) => {
      if (id) {
        map.setFeatureState({ source, id }, { hover: true })
      }

      if (previousId){
        map.setFeatureState({ source, id: previousId }, { hover: false })
      }
    })

    watch(() => selectedIds, (currentIds) => {
      currentIds.value.forEach(id => {
        map.setFeatureState({ source, id }, { selected: true })
      })

      collection.value.features.forEach(({ id }) => {
        const { selected } = map.getFeatureState({ id, source })
        if (selected && !currentIds.value.includes(id)) {
          map.setFeatureState({ source, id }, { selected: false })
        }
      })
    }, { deep: true })

    watch(activeId, (id, previousId) => {
      if (id) {
        map.setFeatureState({ source, id }, { selected: true })
      }

      if (previousId){
        map.setFeatureState({ source, id: previousId }, { selected: false })
      }
    })

    map.on("styledata", () => {
      if (map.getSource(source) === undefined) {
        return;
      }

      selectedIds.value.forEach(id => {
        map.setFeatureState({ source, id }, { selected: true })
      })
    })
  }

  function bindMaplibreInteractions ({ map, layer }) {
    map.on('mousemove', layer, ({ features }) => {
      if (features.length) {
        hoveredId.value = features[0].id
        map.getCanvas().style.cursor = "pointer"
      }
    })

    map.on('mouseleave', layer, () => {
      if (hoveredId.value) {
        hoveredId.value = null
        map.getCanvas().style.cursor = ""
      }
    })

    map.on('click', layer, ({ lngLat }) => {
      const point = map.project(lngLat)
      const features = map.queryRenderedFeatures(point, { layers: [layer] })

      if (features.length) {
        toggleSingleSelected(features[0].id)
      }
    })
  }

  function updateMatchingFeatures (features) {
    collection.value.features = collection.value.features.map(feature => {
      const matchingFeature = features.find(({ id }) => feature.id === id)

      if (matchingFeature) {
        feature.properties = {
          ...feature.properties,
          ...matchingFeature.properties
        }
      }

      return feature
    })
  }

  function $reset () {
    selectedIds.value = []
    activeId.value = null
    hoveredId.value = null
    collection.value.features = []
  }

  return {
    activeId,
    hoveredId,
    selectedIds,
    // computed
    activeFeature,
    hasFeatures,
    hoveredFeature,
    selectedFeatures,
    allSelected,
    collection,
    // methods
    $reset,
    getFeatureById,
    setAll,
    toggleAllSelected,
    toggleSingleSelected,
    bindMaplibreFeatureState,
    bindMaplibreInteractions,
    updateMatchingFeatures
  }
})
