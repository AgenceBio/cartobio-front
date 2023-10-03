import { defineStore } from 'pinia'
import { computed, ref, watch } from 'vue'

import { AnnotationTags } from '@/referentiels/ab.js'

/**
 * @typedef {import('@/referentiels/ab.js').ANNOTATIONS} AnnotationId
 * @typedef {import('@/referentiels/ab.js').UserAnnotation} UserAnnotation
 * @typedef {import('vue').Readonly} Readonly
 * @typedef {import('vue').Ref} Ref
 */

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

  const all = computed(() => collection.value.features)
  const hasFeatures = computed(() => collection.value.features.length > 0)

  const hits = computed(() => {
    return collection.value.features
      .filter(applyAnnotationsFacets)
      // .filter(applyRulesFacets)
  })

  const allSelected = computed(() => {
    const collectedIds = collectIds(collection.value.features)

    return collectedIds.toString() === selectedIds.value.sort().toString()
  })

  const activeFeature = computed(() => {
    return activeId.value ? getFeatureById(activeId.value) : null
  })

  /*
   * Annotations Corner
   */
  const activeAnnotations = ref([])

  /**
   * Collects all annotations within all features
   * It helps build interactive facets, for example.
   */
  const annotations = computed(() => {
    const map = collection.value.features.reduce((map, feature) => {
      /** @type {UserAnnotation[]} */(feature.properties.annotations ?? []).forEach(annotation => {
        if (!map.has(annotation.code)) {
          map.set(annotation.code, {
            active: activeAnnotations.value.includes(annotation.code),
            code: annotation.code,
            count: 0,
            featureIds: [],
            label: AnnotationTags[annotation.code].label
          })
        }

        const stats = map.get(annotation.code)

        map.set(annotation.code, {
          ...stats,
          count: stats.count + 1,
          featureIds: [...stats.featureIds, feature.id]
        })
      })

      return map
    }, new Map())

    return Array.from(map).sort(([,{count: countA}], [,{ count: countB}]) => {
      return countB - countA
    }).map(([, stats]) => stats)
  })

  /**
   * Check if a feature complies with the annotation filtering criteria.
   * Ideally, applied as an Array iteration callback.
   *
   * @param {Feature} feature
   * @returns {Boolean}
   */
  function applyAnnotationsFacets (feature) {
    if (activeAnnotations.value.length === 0) {
      return true
    }

    return (feature.properties.annotations ?? []).some(({ code }) => activeAnnotations.value.includes(code))
  }

  /**
   * Activate or deactivate annotations
   * They are reflected in the `hits` computed property
   *
   * @param {AnnotationId} annotationId
   */
  function toggleAnnotation (annotationId) {
    activeAnnotations.value = activeAnnotations.value.includes(annotationId)
      ? activeAnnotations.value.filter(id => id !== annotationId)
      : [...activeAnnotations.value, annotationId]
  }


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
    selectedIds.value = allSelected.value ? [] : collectIds(hits.value)
  }

  function toggleSingleSelected (featureId) {
    selectedIds.value = selectedIds.value.includes(featureId)
      // we remove it if it was available
      ? selectedIds.value.filter(id => id !== featureId)
      // otherwise, we add it to the select list
      : selectedIds.value.concat([featureId])
  }

  function select (...ids) {
    selectedIds.value = Array.from(new Set([...selectedIds.value, ...ids]))
  }

  function unselect (...ids) {
    selectedIds.value = selectedIds.value.filter(id => ids.includes(id) === false)
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
    activeAnnotations.value = []
    hoveredId.value = null
    setAll([])
  }

  return {
    activeId,
    hoveredId,
    selectedIds,
    // computed
    activeFeature,
    all,
    allSelected,
    annotations,
    collection,
    hasFeatures,
    hits,
    hoveredFeature,
    selectedFeatures,
    // methods
    $reset,
    bindMaplibreFeatureState,
    bindMaplibreInteractions,
    getFeatureById,
    select,
    setAll,
    toggleAllSelected,
    toggleAnnotation,
    toggleSingleSelected,
    unselect,
    updateMatchingFeatures
  }
})
