<route lang="yaml">
meta:
  requiresAuth: true
  requiresGeodata: true
</route>

<template>
  <div class="full-width">
    <section>
      <OperatorPlotForm v-if="selectedFeatureIds.size" :features="selectedFeatures" @submit="handleMassGroupEditSubmit" @cancel="clearSelectedFeatures" class="mass-edit-form" />

      <div v-else>
        <h2>Ma certification AB</h2>

        <div class="field is-grouped">
          <div class="control">
            <ul>
              <li><button disabled><vue-feather type="save" /> Enregister les changements</button></li>
              <li><button disabled><vue-feather type="mail" /> Transmettre à Ecocert</button></li>
            </ul>
          </div>
        </div>

        <br />

        <label>
          Grouper les parcelles par
          <select @change="handleUserGroupingChoice">
            <option :value="key" v-for="({ label }, key) in groupingChoices" :key="key" :selected="value === userGroupingChoice">{{ label }}</option>
          </select>
        </label>
      </div>

      <table class="parcelles" v-for="({ features, label, surface, accentColor, key }) in featureGroups" :key="key" @mouseout="hoveredFeatureId = null">
        <caption v-if="label">
          <span class="color-badge" :style="{ '--accent-color': accentColor }" />
          {{ label }}
          ({{ surface }}&nbsp;ha)
        </caption>

        <thead>
          <tr>
            <td colspan="4" class="parcelles-group-header">
              <vue-feather type="corner-left-down" size="16" />
              <button type="button" class="link" @click="addFeaturesToSelection(features)">sélectionner</button> /
              <button type="button" class="link" @click="removeFeaturesFromSelection(features)">désélectionner</button>
              ces {{ features.length }} parcelles
            </td>
          </tr>
        </thead>

        <tr v-for="({ properties: props, id }) in features" :id="'p' + id" @mouseover="hoveredFeatureId = id" @click="toggleFeatureSelection({ id })" :key="props.NUMERO_I + props.NUMERO_P" :aria-current="id === selectedFeatureId" :class="{hovered: id === hoveredFeatureId, selected: selectedFeatureIds.has(id)}">
          <th scope="row" class="rowIdCell">
            <div class="show">
              <span>{{ props.NOM || `${props.NUMERO_I}.${props.NUMERO_P}` }}</span>
              <small v-if="props.NOM">({{ props.NUMERO_I }}.{{ props.NUMERO_P }})</small>
            </div>
            <div class="show-on-hover">
              <input class="feature-selection" type="checkbox" :checked="selectedFeatureIds.has(id)" @click.stop="toggleFeatureSelection({ id })" />
            </div>
          </th>
          <td>{{ props.SURF }}&nbsp;ha</td>
          <td>
            <span class="culture-type">{{ libelléFromCode(props.TYPE) }}</span><br>
            <small :title="props.TYPE_LIBELLE ?? groupLibelléFromCode(props.TYPE)" class="culture-group">{{ props.TYPE_LIBELLE ?? groupLibelléFromCode(props.TYPE) }}</small>
          </td>
          <td>
            <abbr :title="getConversionLevel(props.conversion_niveau).label">{{ getConversionLevel(props.conversion_niveau).shortLabel }}</abbr>
            <br v-if="isABLevel(props.conversion_niveau)" />
            <small v-if="isABLevel(props.conversion_niveau)">engagée le {{ dateDDMMYYY(props.engagement_date) }}</small>
          </td>
        </tr>
        <tfoot>
          <tr>
            <td colspan="4">
              <a href="#top">
                <vue-feather type="arrow-up" size="16" />
                retour en haut de page
              </a>
            </td>
          </tr>
        </tfoot>
      </table>
    </section>

    <MapContainer class="map" @load="loadSourceAndLayers" :style="mapStyles" :bounds="mapBounds">
      <Popup :lnglat="popupLngLat" maxWidth="450px" v-if="selectedFeatureId" @popup:closed="selectedFeatureId = null">
        <OperatorPlotForm :features="[selectedFeature]" @submit="handleSingleFeatureEditSubmit" @cancel="selectedFeatureId = null" />
      </Popup>
    </MapContainer>
  </div>
</template>

<script setup>
import { computed, ref, toRefs, unref, shallowRef, watch, nextTick } from 'vue'
import groupBy from 'array.prototype.groupby'
import bbox from '@turf/bbox'
import area from '@turf/area'
import centroid from '@turf/centroid'
import { featureCollection } from '@turf/helpers'
import { all as mergeAll } from 'deepmerge'
import { libelléFromCode, groupLibelléFromCode } from '../../referentiels/pac.js'
import { conversionLevels, getConversionLevel, isABLevel } from '../../referentiels/ab.js'
import { getOperatorParcelles } from '../../cartobio-api.js'

import baseStyle from '../../map-styles/base.json'
import cadastreStyle from '../../map-styles/cadastre.json'
import infrastructureStyle from '../../map-styles/infrastructure.json'

import store from '../../store.js'
import MapContainer from '../../components/Map/MapContainer.vue'
import Popup from '../../components/Map/Popup.vue'
import OperatorPlotForm from '../../components/Features/OperatorPlotForm.vue'

await getOperatorParcelles()

const { currentUser, parcellaire } = toRefs(store.state)
const hoveredFeatureId = ref(null)

// user single selected/feature focus
const selectedFeatureId = ref(null)
const selectedFeature = computed(() => selectedFeatureId.value ? getFeatureById(selectedFeatureId.value) : null)

// user selected/checked features
const selectedFeatureIds = ref(new Set())
const selectedFeatures = computed(() => Array.from(selectedFeatureIds.value).map(getFeatureById))

const map = shallowRef(null)
const mapBounds = bbox(parcellaire.value)
const popupLngLat = ref([0, 0])

const inHa = (value) => parseFloat((value / 10000).toFixed(2))

const groupingChoices = {
  '': { label: '…' },
  'COMMUNE': {
    label: 'commune',
    datapoint: (d) => d.properties.COMMUNE,
    groupLabelFn: (d) => d.properties.COMMUNE
  },
  'CULTURE': {
    label: 'culture',
    datapoint: (d) => d.properties.TYPE,
    groupLabelFn: (d) => libelléFromCode(d.properties.TYPE)
  },
  'NIVEAU_CONVERSION': {
    label: 'niveau de conversion',
    datapoint: (d) => d.properties.conversion_niveau || '',
    groupLabelFn: (d, groupingKey) => conversionLevels.find(({ value }) => value === groupingKey)?.label
  },
  'ANNEE_ENGAGEMENT': {
    label: 'année d\'engagement',
    datapoint: (d) => d.properties.engagement_date ? new Date(d.properties.engagement_date).getFullYear() : '',
    groupLabelFn: (d, groupingKey) => groupingKey || 'Année d\'engagement inconnue'
  },
  'TELEPAC': {
    label: 'déclaration PAC',
    datapoint: (d) => d.properties.declaration_pac,
    groupLabelFn: (d, groupingKey) => groupingKey === 'true' ? 'Déclarée à la PAC' : 'Non-déclarée à la PAC'
  },
}

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

const userGroupingChoice = ref('')
const handleUserGroupingChoice = ($event) => userGroupingChoice.value = $event.target.value

function addFeaturesToSelection (features) {
  const newIds = new Set()
  features.forEach(({ id }) => newIds.add(id))
  selectedFeatureIds.value = new Set([...selectedFeatureIds.value, ...newIds])
}

function removeFeaturesFromSelection (features) {
  const remainingIds = new Set([...selectedFeatureIds.value])
  features.forEach(({ id }) => remainingIds.delete(id))
  selectedFeatureIds.value = remainingIds
}

function toggleFeatureSelection (feature) {
  selectedFeatureIds.value.has(feature.id)
    ? removeFeaturesFromSelection([feature])
    : addFeaturesToSelection([feature])
}

const featureGroups = computed(() => {
  if (userGroupingChoice.value === '') {
    return [{
      label: '',
      key: 'none',
      accentColor: colorPalette[1],
      features: parcellaire.value.features,
      surface: inHa(area(featureCollection(parcellaire.value.features)))
    }]
  }

  const groups = groupBy(parcellaire.value.features, (feature) => {
    return groupingChoices[userGroupingChoice.value].datapoint(feature)
  })

  return Object.entries(groups).map(([key, features], i) => ({
    label: groupingChoices[userGroupingChoice.value].groupLabelFn(features[0], key),
    key,
    accentColor: colorPalette[i%12],
    features,
    surface: inHa(area(featureCollection(features)).toFixed(2)),
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
    cadastreStyle,
    infrastructureStyle,
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
            "fill-opacity": 0.9,
          }
        }
      ]
    } : {}
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

<style lang="postcss" scoped>
form select,
form textarea,
form input {
  max-width: 100%;
}

.full-width {
  display: flex;
  position: relative;
}

.full-width ul {
  list-style: none;
  padding: 0;
}

[aria-current] {
  font-weight: bold;
}

.full-width ol {
  list-style-position: inside;
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

  table.parcelles tr:nth-child(even) {
    background-color: #efefef;
  }
  table.parcelles tr.hovered {
    background-color: #00ffff50;
    cursor: pointer;
  }
  table.parcelles tr[aria-current="true"] {
    background-color: #ffcc00;
  }

.show-on-hover,
.hovered .show,
.selected .show {
  display: none;
}
  .hovered .show-on-hover,
  .selected .show-on-hover {
    display: inherit;
  }

.mass-edit-form {
  background: var(--background-default-grey);
  border: 1px solid #ccc;
  border-radius: 3px;
  box-shadow: 2px 2px 5px rgba(0, 0, 0, .1), -2px -2px 3px rgba(0, 0, 0, .1);
  margin: 1rem 0;
  padding: 1rem;
  position: sticky;
  top: 5rem;
  z-index: 10;
  max-width: 100%;
}


.rowIdCell small {
  font-weight: normal;
  margin-left: .5rem;
}

table.parcelles,
table.parcelles :is(td, th) {
  border: 1px solid #ccc;
  padding: .5em;
  text-align: left;
}

.culture-type,
.culture-group {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  display: inline-block;
  max-width: 350px;
}

.map {
  background: #ccc;
  height: calc(100vh - 3rem);
  position: sticky;
  top: calc((var(--spacing) * 3) + var(--spacing));
  width: max(50vw, 450px);
}

hr {
  border: 1px solid var(--brand-color);
  margin: 1rem 0;
  max-width: 50%;
}
</style>
