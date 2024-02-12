<!-- eslint-disable vue/valid-template-root -->
<template></template>

<script>
import GeojsonLayer from "@/components/Map/GeojsonLayer.vue"
import { useFeaturesStore } from "@/stores/index.js"
import { inject, watch } from "vue"

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
    showNumerosIlots: {
      type: Boolean,
      default: false
    },
    style: {
      type: Object,
      default: (props) => ({
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
              "visibility": props.showNumeroIlots ? "visible" : "none",
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

    watch(() => props.showNumerosIlots, (showNumeroIlots) => {
      const visibility = showNumeroIlots ? 'visible' : 'none'

      if (map.value.isStyleLoaded()) {
        map.value.setLayoutProperty('parcellaire-operateur/numeros-ilots', 'visibility', visibility)
      }
      else {
        map.value.once('load', () => map.value.setLayoutProperty('parcellaire-operateur/numeros-ilots', 'visibility', visibility))
      }
    }, { immediate: true })

    if (props.interactive) {
      featureStore.bindMaplibreFeatureState(map.value, 'parcellaire-operateur/data')
      featureStore.bindMaplibreInteractions(map.value, 'parcellaire-operateur/geometry')
    }
  }
}
</script>
