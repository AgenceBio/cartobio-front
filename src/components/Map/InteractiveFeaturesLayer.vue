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
    showNumerosIlot: {
      type: Boolean,
      default: false
    },
    style: {
      type: Object,
      default: ({ showNumeroIlots }) => ({
        layers: [
          {
            "id": "numeros-ilots",
            "type": "symbol",
            "source": "data",
            "minzoom": 14,
            "layout": {
              "text-field": [
                "case",
                ["has", "NUMERO_I"],
                ["concat", ["get", "NUMERO_I"], " - ", ["get", "NUMERO_P"]],
                "",
              ],
              "text-font": ["Noto Sans Regular"],
              "text-size": 12,
              "visibility": showNumeroIlots ? "visible" : "none",
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

    watch(() => props.showNumerosIlot, (showNumeroIlots) => {
      map.value.setLayoutProperty('parcellaire-operateur/numeros-ilots', 'visibility', showNumeroIlots ? 'visible' : 'none')
    })

    featureStore.bindMaplibreFeatureState(map.value, 'parcellaire-operateur/data')
    featureStore.bindMaplibreInteractions(map.value, 'parcellaire-operateur/geometry')
  }
}
</script>
