<!-- eslint-disable vue/valid-template-root -->
<template></template>

<script>
import GeojsonLayer from "@/components/Map/GeojsonLayer.vue"
import { useFeaturesStore } from "@/stores/index.js"
import { inject } from "vue"

export default {
  extends: GeojsonLayer,
  props: {
    name: {
      type: String,
      required: true,
      default: 'parcellaire-operateur'
    },
    data: {
      type: Object,
      default: () => {
        const featureStore = useFeaturesStore()
        return featureStore.collection
      }
    },
  },
  inject: ['map'],
  setup() {
    const featureStore = useFeaturesStore()
    const map = inject('map')

    featureStore.bindMaplibreFeatureState(map.value, 'parcellaire-operateur/data')
    featureStore.bindMaplibreInteractions(map.value, 'parcellaire-operateur/geometry')
  }
}
</script>
