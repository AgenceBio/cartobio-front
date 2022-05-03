<route lang="yaml">
meta:
  requiresAuth: true
  requiresGeodata: true
</route>

<template>
  <div class="full-width">
    <section>
      <h2>
        {{ currentUser.nom }}
        <small class="tag">Cet outil est actuellement en phase de test</small>
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
          <option :value="key" v-for="({ label }, key) in groupingChoices" :key="key" :selected="value === userGroupingChoice">{{ label }}</option>
        </select>
      </label>

      <form v-if="selectedFeatureIds.size" @submit.prevent="handleMassGroupEditSubmit()" class="mass-edit-form">
        <p v-if="selectedFeatureIds.size === 1">Pour cette parcelle, effectuer les changements suivants :</p>
        <p v-else>Pour ces {{ selectedFeatureIds.size }} parcelles, effectuer les changements suivants :</p>

        <div class="field">
          <label>Déclarer leur date d'engagement au</label>
          <div class="control">
            <input type="date" name="engagement_date" @change="handleMassGroupEditChange($event)" />

            <!-- <button class="link" type="button">utiliser la date de notification ({{ currentUser.dateEngagement }})</button>
            <button class="link" type="button">utiliser la date de 1<sup>er</sup> engagement ({{ currentUser.datePremierEngagement }})</button> -->
          </div>
        </div>

        <div class="field">
          <label>Changer leur niveau de conversion en</label>
          <div class="control">
            <select name="conversion_niveau" @change="handleMassGroupEditChange($event)">
              <option v-for="niveau in conversionLevels" :key="niveau.value" :value="niveau.value">{{ niveau.label }}</option>
            </select>
          </div>
        </div>

        <div class="field is-grouped">
          <div class="control">
            <button class="button is-link">Appliquer</button>
          </div>
          <div class="control">
            <button type="cancel" @click="closeMassEditForm()" class="button link">Annuler les modifications</button>
          </div>
        </div>
      </form>

      <table class="parcelles" v-for="({ features, label, surface, key }) in featureGroups" :key="key" @mouseout="hoveredFeatureId = null">
        <caption v-if="label">{{ label }} ({{ surface }}&nbsp;ha)</caption>

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

        <tr v-for="({ properties: props, id }) in features" @mouseover="hoveredFeatureId = id" @click="toggleFeatureSelection({ id })" :key="props.NUMERO_I + props.NUMERO_P" :aria-current="id === selectedFeatureId" :class="{hovered: id === hoveredFeatureId, selected: selectedFeatureIds.has(id)}">
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

    <MapContainer class="map" @load="loadSourceAndLayers" :style="mapStyles" :bounds="mapBounds">
      <Popup :lnglat="popupLngLat" maxWidth="450px" v-if="selectedFeatureId" @popup:closed="selectedFeatureId = null">
        <form>
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
      </Popup>
    </MapContainer>
  </div>
</template>

<script setup>
import { computed, ref, toRefs, unref, readonly, shallowRef, watch, nextTick, toRaw, reactive } from 'vue'
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
import MapContainer from '../../components/Map/MapContainer.vue'
import Popup from '../../components/Map/Popup.vue'

const { currentUser, parcellaire, parcellaireSource } = toRefs(store.state)
const hoveredFeatureId = ref(null)

// user single selected/feature focus
const selectedFeatureId = ref(null)
const selectedFeature = ref(null)

// user selected/checked features
const selectedFeatureIds = ref(new Set())

const map = shallowRef(null)
const mapStyles = mergeAll([ baseStyle, cadastreStyle, infrastructureStyle ])
const mapBounds = bbox(parcellaire.value)
const popupLngLat = ref([0, 0])

const inHa = (value) => parseFloat((value / 10000).toFixed(2))

const groupingChoices = {
  '': { label: '…' },
  'COMMUNE': {
    label: 'commune',
    datapoint: () => 'COMMUNE',
    groupLabelFn: (d) => d.properties.COMMUNE
  },
  'CULTURE': {
    label: 'culture',
    datapoint: () => 'TYPE',
    groupLabelFn: (d) => libelléFromCode(d.properties.TYPE)
  },
  'ANNEE_ENGAGEMENT': {
    label: 'année d\'engagement',
    datapoint: (d) => d.properties.engagement_date ? new Date(d.properties.engagement_date).getFullYear() : '',
    groupLabelFn: (d, groupingKey) => groupingKey || 'Année d\'engagement inconnue'
  },
}

const conversionLevels = [
  { value: '', label: 'Niveau de conversion inconnu' },
  { value: 'CONV', label: 'Conventionnel' },
  { value: 'C1', label: 'C1 — Première année de conversion' },
  { value: 'C2', label: 'C2 — Deuxième année de conversion' },
  { value: 'C3', label: 'C3 — Troisième année de conversion' },
  { value: 'AB', label: 'AB — Agriculture biologique' },
]

const massGroupEditFormState = ref({})
const massGroupEditFormValues = ref({})

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
      features: parcellaire.value.features,
      surface: inHa(area(featureCollection(parcellaire.value.features)))
    }]
  }

  const groups = groupBy(parcellaire.value.features, (feature) => {
    return groupingChoices[userGroupingChoice.value].datapoint(feature)
  })

  return Object.entries(groups).map(([key, features]) => ({
    label: groupingChoices[userGroupingChoice.value].groupLabelFn(features[0], key),
    key,
    features,
    surface: inHa(area(featureCollection(features)).toFixed(2)),
  })).sort((a, b) => b.surface - a.surface)
})

const setMassGroupEditFormState = (groupKey, state) => {
  massGroupEditFormState.value[groupKey] = state
}

const handleMassGroupEditSubmit = () => {
  parcellaire.value.features
    .filter(({ id }) => selectedFeatureIds.value.has(id))
    .forEach(({ properties }) => {
      Object.entries(massGroupEditFormValues.value).forEach(([key, value]) => {
        properties[key] = value
      })
    })

  clearMassGroupEditForm()
}

function closeMassEditForm () {
  clearMassGroupEditForm()
  selectedFeatureIds.value = new Set()
}

const clearMassGroupEditForm = () => {
  massGroupEditFormState.value = {}
  massGroupEditFormValues.value = {}
}

const handleMassGroupEditChange = ($event) => {
  const { name, value } = $event.target

  massGroupEditFormValues.value[name] = value
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

function loadSourceAndLayers (maplibreMap) {
  map.value = maplibreMap

  maplibreMap.addSource('parcellaire-operateur', {
    type: 'geojson',
    data: unref(parcellaire)
  })

  maplibreMap.addLayer({
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

      selectedFeature.value = getFeatureById(id)
      popupLngLat.value = centroid(selectedFeature.value).geometry.coordinates
    }
    else {
      selectedFeature.value = null
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
