import { defineStore } from 'pinia'
import { computed, ref, watch } from 'vue'

/**
 * @typedef {import('@/referentiels/ab.js').UserAnnotation} UserAnnotation
 */

/**
 * @typedef {import('@agencebio/cartobio-types').CartoBioFeatureCollection} CartoBioFeatureCollection
 * @typedef {import('@agencebio/cartobio-types').CartoBioFeature} CartoBioFeature
 */

export function collectIds (features) {
  return features.map(({ id }) => String(id)).sort()
}

export const useFeaturesStore = defineStore('features', () => {
  const selectedIds = ref([])
  const activeId = ref(null)
  const hoveredId = ref(null)
  /**
   * @type {reactive<CartoBioFeatureCollection>}
   */
  const collection = ref({
    type: 'FeatureCollection',
    features: []
  })

  /**
   * @type {reactive<CartoBioFeatureCollection>}
   */
  const candidateCollection = ref({
    type: 'FeatureCollection',
    features: []
  })

  /**
   * @return {CartoBioFeature}
   */
  function getFeatureById (id) {
    return collection.value.features.find(feature => String(feature.id) === String(id))
  }

  /**
   * @type {ComputedRef<CartoBioFeature[]>}
   */
  const all = computed(() => collection.value.features)

  /**
   * @type {ComputedRef<CartoBioFeature[]>}
   */
  const allCandidate = computed(() => mergeFeatures(collection.value.features, candidateCollection.value.features))

  /**
   * @type {ComputedRef<Boolean>}
   */
  const isDirty = computed(() => JSON.stringify(all.value) !== JSON.stringify(allCandidate.value))

  /**
   * @type {ComputedRef<Boolean>}
   */
  const hasFeatures = computed(() => collection.value.features.length > 0)

  /**
   * @type {ComputedRef<CartoBioFeature[]>}
   */
  const allSelected = computed(() => {
    const collectedIds = collectIds(collection.value.features)

    return collectedIds.toString() === selectedIds.value.sort().toString()
  })

  /**
   * @type {ComputedRef<CartoBioFeature>}
   */
  const activeFeature = computed(() => {
    return activeId.value ? getFeatureById(activeId.value) : null
  })

  /**
   * @type {ComputedRef<CartoBioFeature|null>}
   */
  const hoveredFeature = computed(() => {
    return hoveredId.value ? getFeatureById(hoveredId.value) : null
  })

  /**
   * @type {ComputedRef<CartoBioFeature[]>}
   */
  const selectedFeatures = computed(() => {
    return selectedIds.value.map(getFeatureById)
  })

  /**
   * @param {CartoBioFeature[]} features
   */
  function setAll (features) {
    collection.value.features = [...features]
  }

  /**
   *
   * @param {CartoBioFeature[]} features
   */
  function setCandidate (features) {
    candidateCollection.value.features = [...features]
  }

  function toggleAllSelected () {
    selectedIds.value = allSelected.value ? [] : collectIds(all.value)
  }

  /**
   * @param {String} featureId
   */
  function toggleSingleSelected (featureId) {
    selectedIds.value = selectedIds.value.includes(String(featureId))
      // we remove it if it was available
      ? selectedIds.value.filter(id => String(id) !== String(featureId))
      // otherwise, we add it to the select list
      : selectedIds.value.concat([String(featureId)])
  }

  /**
   * @param  {...String} ids
   */
  function select (...ids) {
    selectedIds.value = Array.from(new Set([...selectedIds.value, ...ids.map(String)]))
  }

  /**
   * @param  {...String} ids
   */
  function unselect (...ids) {
    selectedIds.value = selectedIds.value.filter(id => ids.map(String).includes(String(id)) === false)
  }

  function bindMaplibreFeatureState (map, source) {
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

  function bindMaplibreInteractions (map, layer) {
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

  /**
   * Update feature properties based on a matching Feature ID
   *
   * @param {CartoBioFeature[]} target
   * @param {CartoBioFeature[]} source
   * @returns {CartoBioFeature[]}
   */
  function mergeFeatures (target, source) {
    return target.map(feature => {
      const matchingFeature = source.find(({ id }) => feature.id === id)

      if (matchingFeature) {
        return {
          ...feature,
          properties: JSON.parse(JSON.stringify({
            ...feature.properties,
            ...matchingFeature.properties
          }))
        }
      }

      return feature
    })
  }

  /**
   * @param {CartoBioFeature[]} features
   */
  function updateMatchingFeatures (features) {
    collection.value.features = mergeFeatures(collection.value.features, features)
  }

  function commitCandidate () {
    collection.value.features = [...candidateCollection.value.features]
  }

  function $reset () {
    selectedIds.value = []
    activeId.value = null
    hoveredId.value = null
    setAll([])
    setCandidate([])
  }

  return {
    activeId,
    hoveredId,
    selectedIds,
    // computed
    activeFeature,
    all,
    allCandidate,
    allSelected,
    collection,
    hasFeatures,
    hoveredFeature,
    isDirty,
    selectedFeatures,
    // methods
    $reset,
    bindMaplibreFeatureState,
    bindMaplibreInteractions,
    getFeatureById,
    select,
    setAll,
    setCandidate,
    commitCandidate,
    toggleAllSelected,
    toggleSingleSelected,
    unselect,
    updateMatchingFeatures
  }
})
