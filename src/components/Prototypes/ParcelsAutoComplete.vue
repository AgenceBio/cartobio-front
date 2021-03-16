<template>
  <v-form v-model="valid">
    <h1 class="display-1">Notification du parcellaire opérateur en Agriculture Biologique</h1>
    <p class="chip">
      <v-avatar><v-icon>info_outline</v-icon></v-avatar>
      Cette section est actuellement en phase de test.
    </p>
    <p>
      En renseignant votre parcellaire vous participez à faciliter votre contrôle AB et l’instruction de vos aides PAC si vous les demandez.<br/>
Les données renseignées seront uniquement communiquées à votre Organisme Certificateur en l’état. Vos données anonymisées permettront également d’améliorer
 la connaissance des parcelles bio en France.
    </p>

    <h2 class="headline">
      Saisie du parcellaire
    </h2>

    <div>
      <v-btn outline round color="success" :disabled="isLoading" @click="telepacXmlPrompt" small>
        <input type="file" ref="telepac_upload_field" @input="uploadXML" accept=".xml,text/xml" hidden>
        <v-progress-circular v-if="isLoading" size="18" width="2" class="mr-2" indeterminate />
        <v-icon v-else small class="mr-2">cloud_upload</v-icon>
        importer dossier TéléPAC (XML)
      </v-btn>

      <v-btn outline round disabled small>
        <v-icon small class="mr-2">cloud_upload</v-icon>
        importer depuis MesParcelles
      </v-btn>

      <v-btn outline round disabled small>
        <v-icon small class="mr-2">cloud_upload</v-icon>
        importer depuis Geofolia
      </v-btn>

      <v-btn outline round disabled small>
        <v-icon small class="mr-2">cloud_upload</v-icon>
        importer depuis Smug Farmer
      </v-btn>
    </div>

    <div v-if="pacage" class="my-3">
      <v-chip class="pacage">
        <b class="mr-2">Campagne PAC</b>
        {{campagne}}
      </v-chip>
      <v-chip class="pacage">
        <b class="mr-2">N°&nbsp;PACAGE</b>
        {{pacage}}
      </v-chip>
    </div>

    <div :class="{ grid: true, 'no-cadastre': pacage }">
      <span class="header">Commune</span>
      <span v-if="!pacage" class="header">Références<br>cadastrales</span>
      <span class="header">Type de culture</span>
      <span class="header">Statut de conversion</span>
      <span class="header">Date d'engagement<br>de&nbsp;la&nbsp;parcelle</span>
      <span class="header">Commentaire</span>
      <span class="header"></span>

      <plot-row v-for="(feature, index) in plots.features" :feature="feature" :pacage="pacage" :is-last-line="index === plots.features.length - 1" class="row" :key="feature.id" @delete="deleteFeatureId" />
    </div>

    <div class="my-4">
      <v-btn color="info" @click="addPlot() || fetchCadastreSheets()">
        <v-icon class="mr-2">add_circle_outline</v-icon>
        Ajouter une parcelle
      </v-btn>

      <v-btn disabled color="info">
        <v-icon class="mr-2">add_circle_outline</v-icon>
        Ajouter une zone de rucher
      </v-btn>
    </div>

    <hr class="my-4" />

    <v-btn color="info" @click.stop="fetchCadastreSheets" :loading="isLoading">
      <v-icon class="mr-2">map</v-icon>
      {{isMapVisible ? 'actualiser la carte' : 'afficher sur une carte'}}
    </v-btn>

    <section v-if="isMapVisible">
      <h2 class="headline my-3">Parcellaire tabulaire </h2>

      <table class="summary">
        <thead>
          <tr>
            <td>Parcelle</td>
            <td>Production végétale</td>
            <td>Date engagement</td>
            <td v-if="!pacage">Réf cadastrale</td>
            <td>Classement</td>
            <td>Surface graphique</td>
          </tr>
        </thead>
        <tbody>
          <tr v-for="({ properties, id }) in structuredPlots.features" :key="id">
            <td>{{ id }}</td>
            <td>{{ properties.culture_type.join(', ') }}</td>
            <td>{{ properties.engagement_date }}</td>
            <td v-if="!pacage">{{ properties.cadastre_references.join(', ') }}</td>
            <td>{{ properties.niveau_conversion }}</td>
            <td>{{ properties.surface ? `${properties.surface}ha` : '?'}}</td>
          </tr>
        </tbody>
      </table>

      <h2 class="headline my-3">Parcellaire graphique</h2>

      <div class="map">
        <MglMap
        :mapStyle="mapStyle"
        :bounds.sync="mapBounds"
        @load="onMapLoaded"
        ref="mapboxDiv"
        >
        <MglGeojsonLayer
          sourceId="plots"
          :layer="layerStyle('operator-parcels')"
          layerId="operator-parcels"/>
        <MglVectorLayer
            before="place-continent"
            sourceId="cadastre"
            :layer="layerStyle('selectable-cadastral-parcels')"
            layerId="parcelles"/>
        </MglMap>
      </div>
    </section>
  </v-form>
</template>

<script>
import {get} from 'axios'
import {geometry as area} from '@mapbox/geojson-area'
import { all as mergeAll } from "deepmerge";
import geometryBbox  from "@turf/bbox";
import bboxPolygon from "@turf/bbox-polygon";
import { featureCollection, feature as Feature } from "@turf/helpers";
import PlotRow from './PlotRow'
import { convertXmlDossierToGeoJSON } from '@/modules/codes-cultures/xml-dossier.js'
import { parseReferences } from '@/cadastre.js'

import {
  baseStyle,
  cadastreStyle,
  cartobioStyle
} from "@/assets/styles/index.js";

import {
  MglMap,
  MglGeojsonLayer,
  MglVectorLayer
} from "vue-mapbox";

const IN_HECTARES = 10000

function emptyPolygon () {
  return {
    type: "Polygon",
    coordinates: []
  }
}

function prepareFeature ({ feature }) {
  const { com, cadastre_suffixes = '' } = feature.properties
  const { id, geometry } = feature

  let surface = 0

  // 26108000AN0100
  const cadastre_references = parseReferences(cadastre_suffixes, { com })

  if (geometry.coordinates.length) {
    surface = parseFloat(area(geometry) / IN_HECTARES).toFixed(2)
  }

  const properties = {
    ...feature.properties,
    cadastre_references,
    surface
  }

  return Feature(geometry, properties, { id })
}

export default {
  components: {
    MglMap,
    MglGeojsonLayer,
    MglVectorLayer,
    PlotRow,
  },

  data () {
    return {
      valid: false,
      isLoading: false,
      isMapVisible: false,

      pacage: null,
      campagne: null,
      plots: featureCollection([
        Feature(emptyPolygon(), {
          "com": "26108",
          "cadastre_suffixes": 'ZI631, ZI637',
          "culture_type": ['AIL', 'OIG'],
          "niveau_conversion": 'BIO',
          "engagement_date": "2017-03-02"
        }, { "id": "@1.1" }),
        Feature(emptyPolygon(), {
          "com": "26108",
          "cadastre_suffixes": 'AM17',
          "culture_type": ['SOJ'],
          "niveau_conversion": 'C2',
          "engagement_date": "2017-03-02"
        }, { "id": "@1.2" }),
      ]),

      mapStyle: mergeAll([
        baseStyle,
        cadastreStyle,
        cartobioStyle
      ])
    };
  },

  computed: {
    hasAtLeastOneGeometry () {
      return this.structuredPlots.features.some(feature => feature.geometry.coordinates.length > 0)
    },

    mapBounds () {
      const geometry = this.hasAtLeastOneGeometry ? geometryBbox(this.plots) : [-9.86, 41.15, 10.38, 51.56]
      return bboxPolygon(geometry).bbox
    },

    structuredPlots () {
      return featureCollection(
        this.plots.features.map(feature => prepareFeature({ feature }))
      )
    }
  },

  methods: {
    addPlot () {
      const lastLine = this.plots.features[ this.plots.length - 1 ] ?? {}
      const { com, engagement_date, niveau_conversion } = lastLine

      this.plots.features.push(Feature({}, {
        com,
        engagement_date,
        niveau_conversion,
        culture_type: []
      }, { id: Math.random() }))
    },

    deleteFeatureId (id) {
      const index = this.plots.features.findIndex(({ id: featureId }) => featureId === id)

      this.$delete(this.plots.features, index)
    },

    fetchCadastreSheets () {
      this.isLoading = true

      const sheets = this.structuredPlots.features.reduce((acc, feature) => {
        const { com } = feature.properties
        const { id: featureId } = feature

        feature.properties.cadastre_references.forEach(reference => {
          acc.push({ com, reference, featureId })
        })

        return acc
      }, [])

      const calls = sheets.reduce((map, { featureId, com, reference }) => {
        if (Array.isArray(map[ com ]) === false) {
          map[ com ] = []
        }

        map[ com ].push({ reference, featureId })

        return map
      }, {})

      const callsP = Object.entries(calls).map(([com, references]) => {
        return get(`https://cadastre.data.gouv.fr/bundler/cadastre-etalab/communes/${com}/geojson/parcelles`)
          .then(response => response.data.features.filter(feature => references.map(({ reference }) => reference).includes(feature.id)))
          .then(features => features.forEach(cadastreFeature => {
            // we retrieve the feature id associated to this cadastral reference
            const { featureId } = references.find(({ reference }) => cadastreFeature.id === reference)

            // we
            const index = this.plots.features.findIndex(({ id }) => id === featureId)
            const parcelle = this.plots.features[index]

            // we add the geometry as a Polygon
            if (parcelle.geometry.coordinates.length === 0) {
              parcelle.geometry = { ...cadastreFeature.geometry }
            }
            // we morph a Polygon with geometry into a MultiPolygon (stack of polygons)
            else if (parcelle.geometry.coordinates.length === 1) {
              parcelle.geometry.type = 'MultiPolygon'
              parcelle.geometry.coordinates = [
                parcelle.geometry.coordinates,
                cadastreFeature.geometry.coordinates
              ]
            }
            // we add another Polygon coordinates to a MultiPolygon
            else {
              parcelle.geometry.coordinates.push([ ...cadastreFeature.geometry.coordinates ])
            }

            this.$set(this.plots.features, index, parcelle)
          }))
      })

      Promise.all(callsP).finally(() => {
        this.isLoading = false
        this.isMapVisible = true
      })
    },

    /**
     * @param  {String} styleId [description]
     * @return {Object<Mapbox.Layer>}
     */
    layerStyle(styleId) {
      return cartobioStyle.layers.find(({ id }) => id === styleId);
    },

    onMapLoaded({ map }) {
      this.map = map;

      this.updateMap()
    },

    updateMap () {
      this.map.getSource("plots").setData(this.plots)
      this.map.fitBounds(this.mapBounds)
      this.map.resize();
    },

    telepacXmlPrompt () {
      this.$refs.telepac_upload_field.click()
    },

    async uploadXML () {
      const text = await this.$refs.telepac_upload_field.files[0].text()
      this.isLoading = true

      setTimeout(() => this.$nextTick(() => {
        const { pacage, campagne, featureCollection } = convertXmlDossierToGeoJSON(text)
        this.pacage = pacage
        this.campagne = campagne
        this.plots = featureCollection

        this.isLoading = false
      }), 200)
    },

  },
};
</script>

<style lang="scss" scoped>
  .d-flex {
    justify-content: space-between;
  }

  .d-flex > * {
    gap: .5em;
  }

  summary {
    cursor: pointer;
  }

  table {
    border-collapse: collapse;
    margin-left: 10px;

    thead {
      background: #dfdfdf;
      font-weight: bold;
      vertical-align: bottom;
    }

    tbody {
      font-family: monospace;
    }

    td {
      border: 1px solid #ccc;
      padding: 0.5rem;
    }
  }

  h2 {
    margin-top : 0;
  }
  .map {
    position: relative;
    width: 100%;
    height: 500px;
  }

  .grid {
    display: grid;
    grid-row-gap: 1em;
    grid-column-gap: 0;
    grid-template-columns: repeat(7, auto);
    margin: 1em 0;

    &.no-cadastre {
      grid-template-columns: repeat(6, auto);
    }

    span.header {
      font-weight: bold;
      align-self: end;
    }

    /deep/ > * {
      padding: 0 .5rem;
    }
  }

  .chip {
    background: #ffc;
    border: 1px solid currentColor;
    border-radius: 2em;
    display: inline-block;
    padding-left: 1em;
    padding-right: 1em;

    .v-avatar {
      margin-left: -1em;
    }

    &:first-child {
      margin-left: 0;
    }
  }

</style>
