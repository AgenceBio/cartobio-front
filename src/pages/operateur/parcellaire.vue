<route lang="yaml">
meta:
  requiresAuth: true
  requiresGeodata: true
</route>

<template>
  <div class="full-width">
    <section class="fr-py-2w">
      <h2 class="fr-h3">Mon parcellaire</h2>

      <div class="fr-form-group">
        <fieldset class="fr-fieldset">
          <legend class="fr-fieldset__legend">Options d'affichage</legend>
          <ul class="fr-fieldset__content">
            <li v-for="(layer, id) in selectableLayerStyles" :key="id" :aria-disabled="!layer.checkFn()" class="fr-checkbox-group">
              <input type="checkbox" :checked="layer.checked" :disabled="!layer.checkFn()" @input="layer.checked = !layer.checked" :id="'options-' + id" />
              <label class="fr-label" :for="'options-' + id">
                {{ layer.label }}
                <span class="fr-hint-text" v-if="layer.helpText" v-html="layer.helpText" />
              </label>
            </li>
          </ul>
        </fieldset>
      </div>

      <table class="fr-table fr-table--bordered parcelles">
        <caption>Groupes de culture</caption>
        <tbody>
          <tr v-for="(group, key) in featureGroups" :key="key">
            <th>
              <span class="color-badge" :style="{ '--accent-color': group.accentColor }" />
              {{ group.label }}
            </th>
            <td class="numeric">{{ inHa(group.surface) }}&nbsp;ha</td>
          </tr>
        </tbody>
      </table>
    </section>

    <MapContainer class="map" @load="loadSourceAndLayers" @zoom:change="zoomLevel = $event" :style="mapStyles" :bounds="mapBounds">
      <Popup :lnglat="popupLngLat" maxWidth="450px" v-if="selectedFeatureId" @popup:closed="selectedFeatureId = null">
        <OperatorPlotForm :features="[selectedFeature]" @submit="handleSingleFeatureEditSubmit" @cancel="selectedFeatureId = null" />
      </Popup>
    </MapContainer>
  </div>
</template>

<script setup>
import { computed, ref, toRefs, unref, shallowRef, watch, nextTick, reactive } from 'vue'
import groupBy from 'array.prototype.groupby'
import bbox from '@turf/bbox'
import area from '@turf/area'
import centroid from '@turf/centroid'
import { featureCollection } from '@turf/helpers'
import { all as mergeAll } from 'deepmerge'
import { libelléFromCode, groupLibelléFromCode } from '../../referentiels/pac.js'
import { conversionLevels, getConversionLevel, isABLevel } from '../../referentiels/ab.js'

import baseStyle from '../../map-styles/base.json'
import cadastreStyle from '../../map-styles/cadastre.json'
import infrastructureStyle from '../../map-styles/infrastructure.json'
import surroundingsStyle from '../../map-styles/surroundings.json'

import store from '../../store.js'
import MapContainer from '../../components/Map/MapContainer.vue'
import Popup from '../../components/Map/Popup.vue'
import OperatorPlotForm from '../../components/Features/OperatorPlotForm.vue'


const { currentUser, parcellaire } = toRefs(store.state)
const hoveredFeatureId = ref(null)
const zoomLevel = ref(null)

// user single selected/feature focus
const selectedFeatureId = ref(null)
const selectedFeature = computed(() => selectedFeatureId.value ? getFeatureById(selectedFeatureId.value) : null)

// user selected/checked features
const selectedFeatureIds = ref(new Set())
const selectedFeatures = computed(() => Array.from(selectedFeatureIds.value).map(getFeatureById))

const map = shallowRef(null)
const mapBounds = bbox(parcellaire.value)
const popupLngLat = ref([0, 0])

const inHa = (value) => parseFloat((value / 10000)).toLocaleString('fr-FR', { maximumFractionDigits: 2, minimumFractionDigits: 2 })

const colorPalette = [
  "#ff73fa",
  "#76b100",
  "#ba00ae",
  "#01c672",
  "#0045b4",
  "#e1cc00",
  "#7c2d82",
  "#feff7c",
  "#ff8dee",
  "#408b00",
  "#b61300",
  "#ac9200"
]

const selectableLayerStyles = reactive({
  cadastre: {
    checked: true,
    label: 'Afficher le cadastre',
    helpText: 'Le niveau de zoom doit être suffisant pour qu\'il s\'affiche.',
    checkFn: () => zoomLevel.value >= 13
  },
  surroundings: {
    checked: false,
    label: 'Afficher les parcelles environnantes',
    checkFn: () => true
  },
})

const featureGroups = computed(() => {
  const groups = groupBy(parcellaire.value.features, (feature) => {
    return feature.properties.TYPE
  })

  return Object.entries(groups).map(([key, features], i) => ({
    label: libelléFromCode(key),
    key,
    accentColor: colorPalette[i%12],
    features,
    surface: area(featureCollection(features)),
  })).sort((a, b) => b.surface - a.surface)
})

const featureGroupsStyles = computed(() => {
  return featureGroups.value.flatMap(({ features, accentColor }) => ([
    ['in', ['get', 'id'], ['literal', features.map(({ id }) => id)]],
    accentColor
  ]))
})

const mapStyles = computed(() => {
  return mergeAll([
    baseStyle,
    infrastructureStyle,
    selectableLayerStyles.surroundings.checked ? surroundingsStyle : {},
    parcellaire.value ? {
      sources: {
        'parcellaire-operateur': {
          type: 'geojson',
          data: unref(parcellaire)
        }
      },
      layers: [
        {
          id: 'parcellaire-operateur-geometry',
          source: 'parcellaire-operateur',
          type: 'fill',
          paint: {
            "fill-color": [
              'case',
              ['boolean', ['feature-state', 'selected'], false],
              "#ffcc00",
              ['boolean', ['feature-state', 'hover'], false],
              "#0080ff",
              ...featureGroupsStyles.value,
              "black"
            ],
            "fill-opacity": 1,
          }
        }
      ]
    } : {},
    selectableLayerStyles.cadastre.checked ? cadastreStyle : {},
  ])
})

const handleMassGroupEditSubmit = (formState) => {
  parcellaire.value.features
    .filter(({ id }) => selectedFeatureIds.value.has(id))
    .forEach(({ properties }) => {
      Object.entries(formState)
        .filter(([key, value]) => value !== undefined)
        .forEach(([key, value]) => properties[key] = value)
    })

  clearSelectedFeatures()
}

const handleSingleFeatureEditSubmit = (formState) => {
  const feature = selectedFeature.value

  Object.entries(formState)
      .filter(([key, value]) => value !== undefined)
      .forEach(([key, value]) => feature.properties[key] = value)

  selectedFeatureId.value = null
}

function clearSelectedFeatures () {
  selectedFeatureIds.value = new Set()
}

const getFeatureById = (id) => {
  return parcellaire.value.features.find(feature => feature.id === id)
}

const handleFeatureSelectionFromTable = (id) => {
  if (selectedFeatureId.value === id) {
    selectedFeatureId.value = null
    return
  }

  selectedFeatureId.value = id
  zoomInto(getFeatureById(id), { maxZoom: 15 })
}

function zoomInto (featureOrFeatureCollection, { maxZoom }) {
  const bounds = bbox(featureOrFeatureCollection)
  const { center, zoom, bearing } = map.value.cameraForBounds(bounds, { padding: 50, maxZoom }) ?? {}
  if (center && zoom) {
    map.value.flyTo({ center, zoom, bearing })
  }
}

function dateDDMMYYY (date) {
  return new Date(date).toLocaleDateString('fr-FR', {
    dateStyle: 'short',
    timeZone: 'Europe/Paris'
  })
}

function loadSourceAndLayers (maplibreMap) {
  map.value = maplibreMap

  zoomInto(parcellaire.value, { maxZoom: 13 })

  watch(hoveredFeatureId, (id, previousId) => {
    if (id) {
      maplibreMap.setFeatureState({ source: 'parcellaire-operateur', id }, { hover: true })
    }

    if (previousId){
      maplibreMap.setFeatureState({ source: 'parcellaire-operateur', id: previousId }, { hover: false })
    }
  })

  watch(() => selectedFeatureIds, (currentIds) => {
    currentIds.value.forEach(id => {
      maplibreMap.setFeatureState({ source: 'parcellaire-operateur', id }, { selected: true })
    })

    parcellaire.value.features.forEach(({ id }) => {
      const { selected } = maplibreMap.getFeatureState({ id, source: 'parcellaire-operateur' })
      if (selected && !currentIds.value.has(id)) {
        maplibreMap.setFeatureState({ source: 'parcellaire-operateur', id }, { selected: false })
      }
    })
  }, { deep: true })

  watch(selectedFeatureId, (id, previousId) => {
    if (id) {
      maplibreMap.setFeatureState({ source: 'parcellaire-operateur', id }, { selected: true })

      popupLngLat.value = centroid(selectedFeature.value).geometry.coordinates
    }

    if (previousId){
      map.value.setFeatureState({ source: 'parcellaire-operateur', id: previousId }, { selected: false })
    }
  })

  maplibreMap.on('mousemove', 'parcellaire-operateur-geometry', ({ features }) => {
    if (features.length) {
      hoveredFeatureId.value = features[0].id
      map.value.getCanvas().style.cursor = "pointer"
    }
  })

  maplibreMap.on('mouseleave', 'parcellaire-operateur-geometry', () => {
    if (hoveredFeatureId.value) {
      hoveredFeatureId.value = null
      maplibreMap.getCanvas().style.cursor = ""
    }
  })

  maplibreMap.on('click', 'parcellaire-operateur-geometry', ({ lngLat }) => {
    const point = maplibreMap.project(lngLat)
    const features = maplibreMap.queryRenderedFeatures(point, { layers: ['parcellaire-operateur-geometry'] })

    if (features.length) {
      selectedFeatureId.value = features[0].id
      nextTick(() => document.querySelector('tr[aria-current="true"]')?.scrollIntoView({ behavior: 'smooth', block: 'center' }))
    }
  })
}
</script>

<style scoped>
.full-width {
  display: flex;
  position: relative;
}

[aria-current="true"] {
  font-weight: bold;
}

ul.fr-fieldset__content {
  list-style: none;
}

.full-width > section {
  flex: 0 0 50vw;
  padding: 0 var(--spacing);
  position: relative;
}

table.parcelles {
  border-collapse: collapse;
  margin: 1.5rem 0;
  width: 100%;
}
  table.parcelles caption {
    font-weight: bold;
    text-align: left;
  }
  table.parcelles .color-badge {
    background-color: var(--accent-color);
    display: inline-block;
    height: 14px;
    width: 14px;
  }

  table.parcelles tr.hovered {
    background-color: #00ffff50;
    cursor: pointer;
  }
  table.parcelles .numeric {
    font-variant-numeric: tabular-nums;
    text-align: right;
  }
  table.parcelles tr[aria-current="true"] {
    background-color: #ffcc00;
  }


.rowIdCell small {
  font-weight: normal;
  margin-left: .5rem;
}

.culture-type,
.culture-group {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  display: block;
  max-width: 350px;
}

.map {
  background: #ccc;
  height: calc(100vh - 3rem);
  position: sticky;
  top: calc((var(--spacing) * 3) + var(--spacing));
  width: max(50vw, 450px);
}
</style>
