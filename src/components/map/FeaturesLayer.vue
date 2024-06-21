<!-- eslint-disable vue/valid-template-root -->
<template></template>

<script>
import GeojsonLayer from "@/components/map/GeojsonLayer.vue"
import { useFeaturesStore } from "@/stores/features.js"
import { inject } from "vue"

export default {
  extends: GeojsonLayer,
  props: {
    name: {
      type: String,
      default: 'parcellaire-operateur'
    },
    data: {
      type: Object,
      default: () => {
        const featureStore = useFeaturesStore()
        return featureStore.collection
      }
    },
    interactive: {
      type: Boolean,
      default: false
    },
    style: {
      type: Object,
      default: () => ({
        layers: [
          {
            "id": "numeros-ilots",
            "type": "symbol",
            "source": "data",
            "minzoom": 12,
            "layout": {
              "text-field": [
                "case",
                ["!=", ["to-string", ["get", "NUMERO_I"]], ""],
                ["concat", ["get", "NUMERO_I"], ".", ["get", "NUMERO_P"]],
                ["has", "NOM"],
                ["get", "NOM"],
                "",
              ],
              "text-font": ["Noto Sans Regular"],
              "text-size": 12,
              "visibility": "visible",
            },
            "paint": {
              "text-color": "rgba(0, 0, 0, 1)",
              "text-halo-color": "#ffffff",
              "text-halo-width": 2,
            }
          }
        ]
      }),
    }
  },
  inject: ['map'],
  setup(props) {
    const featureStore = useFeaturesStore()
    const map = inject('map')

    if (props.interactive) {
      featureStore.bindMaplibreFeatureState(map.value, 'parcellaire-operateur/data')
      featureStore.bindMaplibreInteractions(map.value, 'parcellaire-operateur/geometry')
    }
  }
}
</script>
