<template>
  <div class="full-width">
    <section>
      <h2>
        {{ currentUser.nom }}
      </h2>

      <div class="field is-grouped">
        <div class="control">
          <button disabled><vue-feather type="mail" /> Transmettre cette version du parcellaire à mon Organisme de Certification</button>
        </div>
      </div>

      <hr />

      <label>
        Grouper les parcelles par
        <select @change="handleUserGroupingChoice">
          <option :value="value" v-for="(label, value) in groupingChoices" :key="value" :selected="value === userGroupingChoice">{{ label }}</option>
        </select>
      </label>

      <table class="parcelles" v-for="({ features, label, surface, key }) in featureGroups" :key="key" @mouseout="hoveredFeatureId = null">
        <caption v-if="label">{{ label }} ({{ surface }}&nbsp;ha)</caption>

        <thead>
          <tr>
            <td colspan="4">
              <vue-feather type="corner-left-down" size="16" />
              <button v-if="!massGroupEditFormState[key]" type="button" class="link" @click="setMassGroupEditFormState(key, 'open')">modifier ces {{ features.length }} parcelles</button>
              <button v-else type="button" class="link" @click="clearMassGroupEditForm(key)">annuler cette modification</button>

              <form v-if="massGroupEditFormState[key]" @submit.prevent="handleMassGroupEditSubmit(key)">
                <div class="field">
                  <label>Date d'engagement</label>
                  <div class="control">
                    <input type="date" name="engagement_date" @change="handleMassGroupEditChange(key, $event)" />

                    <!-- <button class="link" type="button">utiliser la date de notification ({{ currentUser.dateEngagement }})</button>
                    <button class="link" type="button">utiliser la date de 1<sup>er</sup> engagement ({{ currentUser.datePremierEngagement }})</button> -->
                  </div>
                </div>

                <div class="field">
                  <label>Niveau de conversion</label>
                  <div class="control">
                    <select name="conversion_niveau" @change="handleMassGroupEditChange(key, $event)">
                      <option v-for="niveau in conversionLevels" :key="niveau.value" :value="niveau.value">{{ niveau.label }}</option>
                    </select>
                  </div>
                </div>

                <div class="field is-grouped">
                  <div class="control">
                    <button class="button is-link">Appliquer</button>
                  </div>
                </div>
              </form>
            </td>
          </tr>
        </thead>

        <tr v-for="({ properties: props, id }) in features" @mouseover="hoveredFeatureId = id" @click="handleFeatureSelectionFromTable(id)" :key="props.NUMERO_I + props.NUMERO_P" :aria-current="id === selectedFeatureId" :class="{hovered: id === hoveredFeatureId}">
          <th scope="row" class="rowIdCell">
            <span>{{ props.NOM || `${props.NUMERO_I}.${props.NUMERO_P}` }}</span>
            <small v-if="props.NOM">({{ props.NUMERO_I }}.{{ props.NUMERO_P }})</small>
          </th>
          <td>{{ props.SURF }}&nbsp;ha</td>
          <td>
            <span class="culture-type">{{ libelléFromCode(props.TYPE) }}</span><br>
            <small :title="props.TYPE_LIBELLE ?? groupLibelléFromCode(props.TYPE)" class="culture-group">{{ props.TYPE_LIBELLE ?? groupLibelléFromCode(props.TYPE) }}</small>
          </td>
          <td>
            <span v-if="props.conversion_niveau">{{ props.conversion_niveau }} ({{ props.engagement_date }})</span>
            <span v-else>Statut de conversion inconnu</span>
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

    <div class="popup-template" ref="mapPopupRef" hidden>
      <form v-if="selectedFeatureId">
        <div class="field">
          <label>Type de culture</label>
          <div class="control">
            <select v-model="selectedFeature.properties.TYPE">
              <option v-for="([code, libellé]) in codesPac" :key="code" :value="code">{{ libellé }}</option>
            </select>
          </div>
        </div>

        <div class="field">
          <label>Date d'engagement</label>
          <div class="control">
            <input type="date" v-model="selectedFeature.properties.engagement_date" />

            <!-- <button class="link" type="button">utiliser la date de notification ({{ currentUser.dateEngagement }})</button>
            <button class="link" type="button">utiliser la date de 1<sup>er</sup> engagement ({{ currentUser.datePremierEngagement }})</button> -->
          </div>
        </div>

        <div class="field">
          <label>Niveau de conversion</label>
          <div class="control">
            <select  v-model="selectedFeature.properties.conversion_niveau">
              <option v-for="niveau in conversionLevels" :key="niveau.value" :value="niveau.value">{{ niveau.label }}</option>
            </select>
          </div>
        </div>

        <div class="field">
          <label>Commentaire</label>
          <div class="control"><textarea v-model="selectedFeature.properties.commentaire" /></div>
        </div>
      </form>
    </div>

    <aside class="map" ref="mapContainer" />
  </div>
</template>

<script setup>
import { computed, onMounted, ref, toRefs, unref, readonly, watch, nextTick } from 'vue'
import { Map as MapLibre, Popup } from 'maplibre-gl'
import groupBy from 'array.prototype.groupby'
import bbox from '@turf/bbox'
import area from '@turf/area'
import centroid from '@turf/centroid'
import { featureCollection } from '@turf/helpers'
import { all as mergeAll } from 'deepmerge'
import { liste as codesPac, libelléFromCode, groupLibelléFromCode } from '../../referentiels/pac.js'

import baseStyle from '../../map-styles/base.json'
import cadastreStyle from '../../map-styles/cadastre.json'
import infrastructureStyle from '../../map-styles/infrastructure.json'

import store from '../../store.js'

const mapContainer = ref(null)
const mapPopupRef = ref(null)
const { currentUser, parcellaire, parcellaireSource } = toRefs(store.state)
const hoveredFeatureId = ref(null)
const selectedFeatureId = ref(null)
const selectedFeature = ref(null)
let map = null

// terrible hack because I understood too late that setDOMContent _moves_ the dom node, and Vue losts track of its content
const popup = new Popup({ offset: [0, -15 ], maxWidth: '450px', closeButton: false, closeOnClick: false })

const inHa = (value) => parseFloat((value / 10000).toFixed(2))

const groupingChoices = readonly({
  '': '…',
  'COMMUNE': 'Commune',
  'TYPE': 'Culture',
})

const conversionLevels = readonly([
  { value: '', label: 'Niveau de conversion inconnu' },
  { value: 'C1', label: 'C1 — Première année de conversion' },
  { value: 'C2', label: 'C2 — Deuxième année de conversion' },
  { value: 'C3', label: 'C3 — Troisième année de conversion' },
  { value: 'AB', label: 'AB — Agriculture biologique' },
])

const massGroupEditFormState = ref({})
const massGroupEditFormValues = ref({})

const userGroupingChoice = ref('')
const handleUserGroupingChoice = ($event) => userGroupingChoice.value = $event.target.value

const featureGroups = computed(() => {
  if (userGroupingChoice.value === '') {
    return [{
      label: '',
      key: 'none',
      features: parcellaire.value.features,
      surface: inHa(area(featureCollection(parcellaire.value.features)))
    }]
  }

  const groups = groupBy(parcellaire.value.features, (feature) => feature.properties[ userGroupingChoice.value ])

  return Object.entries(groups).map(([key, features]) => ({
    label: key,
    key,
    features,
    surface: inHa(area(featureCollection(features)).toFixed(2)),
  })).sort((a, b) => b.surface - a.surface)
})

const setMassGroupEditFormState = (groupKey, state) => {
  massGroupEditFormState.value[groupKey] = state
}

const handleMassGroupEditSubmit = (groupKey) => {
  const { features } = featureGroups.value.find(({ key }) => key === groupKey)
  features.forEach(({ properties }) => {
    Object.entries(massGroupEditFormValues.value[groupKey]).forEach(([key, value]) => {
      properties[key] = value
    })
  })

  clearMassGroupEditForm(groupKey)
}

const clearMassGroupEditForm = (groupKey) => {
  massGroupEditFormState.value[groupKey] = null
  massGroupEditFormValues.value[groupKey] = null
}

const handleMassGroupEditChange = (groupKey, $event) => {
  const { name, value } = $event.target

  if (!massGroupEditFormValues.value[groupKey]) (
    massGroupEditFormValues.value[groupKey] = {}
  )

  massGroupEditFormValues.value[groupKey][name] = value
}

const getFeatureById = (id) => {
  return parcellaire.value.features.find(feature => feature.id === id)
}

const handleFeatureSelectionFromTable = (id) => {
  selectedFeatureId.value = id

  zoomInto(getFeatureById(id), { maxZoom: 15 })
}

function zoomInto (featureOrFeatureCollection, { maxZoom }) {
  const bounds = bbox(featureOrFeatureCollection)
  const { center, zoom, bearing } = map.cameraForBounds(bounds, { padding: 50, maxZoom }) ?? {}
  if (center && zoom) {
    map.flyTo({ center, zoom, bearing })
  }
}

onMounted(() => {
  map = new MapLibre({
    container: mapContainer.value,
    hash: true,
    style: mergeAll([ baseStyle, cadastreStyle, infrastructureStyle ]),
    bounds: bbox(parcellaire.value),
    padding: 20,
  })

  map.on('load', () => {
    map.addSource('parcellaire-operateur', {
      type: 'geojson',
      data: unref(parcellaire)
    })

    map.addLayer({
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
          "#00ff80"
        ],
        "fill-opacity": 0.9,
      },
      layout: {}
    })

    zoomInto(parcellaire.value, { maxZoom: 13 })

    watch(hoveredFeatureId, (id, previousId) => {
      if (id) {
        map.setFeatureState({ source: 'parcellaire-operateur', id }, { hover: true })
      }

      if (previousId){
        map.setFeatureState({ source: 'parcellaire-operateur', id: previousId }, { hover: false })
      }
    })

    watch(selectedFeatureId, (id, previousId) => {
      if (id) {
        map.setFeatureState({ source: 'parcellaire-operateur', id }, { selected: true })

        selectedFeature.value = getFeatureById(id)
        const [lat, lon] = centroid(selectedFeature.value).geometry.coordinates
        nextTick(() => {
          popup.setLngLat([lat, lon])

          if (!popup.getElement()) {
            popup.setDOMContent(mapPopupRef.value.firstChild)
          }

          if (!popup.isOpen()) {
            popup.addTo(map)
          }
        })
      }
      else {
        selectedFeature.value = null
        popup.remove()
      }

      if (previousId){
        map.setFeatureState({ source: 'parcellaire-operateur', id: previousId }, { selected: false })
      }
    })
  })

  map.on('mousemove', 'parcellaire-operateur-geometry', ({ features }) => {
    if (features.length) {
      hoveredFeatureId.value = features[0].id
      map.getCanvas().style.cursor = "pointer"
    }
  })

  map.on('mouseleave', 'parcellaire-operateur-geometry', () => {
    if (hoveredFeatureId.value) {
      hoveredFeatureId.value = null
      map.getCanvas().style.cursor = ""
    }
  })

  map.on('click', 'parcellaire-operateur-geometry', ({ lngLat }) => {
    const point = map.project(lngLat)
    const features = map.queryRenderedFeatures(point, { layers: ['parcellaire-operateur-geometry'] })

    if (features.length) {
      selectedFeatureId.value = features[0].id
      nextTick(() => document.querySelector('tr[aria-current="true"]')?.scrollIntoView({ behavior: 'smooth', block: 'center' }))
    }
  })
})

</script>


<style lang="postcss" scoped>
.full-width {
  display: flex;
  position: relative;
}

.full-width ul {
  list-style: none;
  padding: 0;
}

.full-width > section {
  flex-grow: 1;
  padding: 0 var(--spacing);
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

:deep(.maplibregl-control-container) {
  display: none;
}

:deep(.maplibregl-popup) {
  position: absolute;
  left: 0;
  top: 0;
}
:deep(.maplibregl-popup-content) {
  background: #fff;
  border: 1px solid var(--brand-color);
  border-radius: 3px;
  padding: 2rem 1rem 1rem;
  position: relative;
}
:deep(.maplibregl-popup-close-button) {
  position: absolute;
  right: .5rem;
  top: .5rem;
}

hr {
  border: 1px solid var(--brand-color);
  margin: 1rem 0;
  max-width: 50%;
}
</style>
