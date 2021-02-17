<template>
  <v-form v-model="valid">
    <h2>Saisie du parcellaire</h2>

    <v-flex class="row xs12 d-flex" v-for="(plot, index) in plots" :key="index">
      <v-autocomplete label="Commune" hint="Nom de la commune (Code INSEE)" persistent-hint clearable outline v-model="plot.com" :item-text="itemText" item-value="com" :items="_communes" />
      <v-text-field label="Numéro cadastral" hint="Sous la forme AZ01, AN5, 011K0038 etc." persistent-hint clearable outline v-model="plot.cadastre_suffixes" />
      <v-autocomplete label="Type de culture" outline :items="knownCultures" item-text="Libellé Culture" item-value="Code Culture" v-model="plot.culture_type" />
      <v-select label="Statut conversion" outline v-model="plot.niveau_conversion" :items="conversion_levels" />
      <v-menu v-model="plot.conversionDateMenu" lazy transition="scale-transition" offset-y full-width max-width="320px">
        <template v-slot:activator="{ on }">
          <v-text-field outline label="Date de conversion" v-on="on" hint="Si inconnue, donner la date de conversion prévue" persistent-hint readonly :disabled="!plot.niveau_conversion || plot.niveau_conversion === 'CONV'" v-model="plot.engagement_date" />
        </template>

        <v-date-picker outline @input="plot.conversionDateMenu = false" type="month" v-model="plot.engagement_date" show-current locale="fr-FR" />
      </v-menu>
      <v-text-field label="Commentaire" hint="Nom de la parcelle, précisions, autres infos ..." persistent-hint clearable outline v-model="plot.comment" />
      <v-btn flat icon large @click="$delete(plots, index)"><v-icon large>delete</v-icon></v-btn> 
    </v-flex>

    <v-btn color="info" @click="addPlot">Ajouter une parcelle</v-btn>

    <hr class="my-4" />
    <v-expansion-panel expand>
      <v-expansion-panel-content>
        <template v-slot:header>
          <h2>Vue tabulaire <v-btn color="info" @click.stop="fetchCadastreSheets" :loading="loading" small>calculer les surfaces</v-btn></h2>
        </template>

        <table class="summary">
          <thead>
            <tr>
              <td>Parcelle</td>
              <td>Production végétale</td>
              <td>Date engagement</td>
              <td>Réf cadastrale</td>
              <td>Classement</td>
              <td>Surface</td>
            </tr>
          </thead>
          <tbody>
            <tr v-for="plot in structuredPlots" :key="plot.plot_id + plot.cadastre_id">
              <td>{{ plot.plot_id }}</td>
              <td>{{ plot.culture_type }}</td>
              <td>{{ plot.engagement_date }}</td>
              <td><a :href="'https://cadastre.data.gouv.fr/map?style=ortho&amp;parcelleId=' + plot.cadastre_id" target="cadastre">{{ plot.cadastre_id }}</a></td>
              <td>{{ plot.niveau_conversion }}</td>
              <td>{{ plot.surface === null ? '?' : `${plot.surface}ha`}}</td>
            </tr>
          </tbody>
        </table>
      </v-expansion-panel-content>
      
      <v-expansion-panel-content>
      <template v-slot:header>
          <h2>Vue Map <v-btn color="info" @click.stop="fetchCadastreSheets" :loading="loading" small>calculer les surfaces</v-btn></h2>
        </template>
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
      </v-expansion-panel-content>
    </v-expansion-panel>
  </v-form>
</template>

<script>
import {get} from 'axios'
import communes from '@/api/insee/communes.json'
import {codes} from '@/modules/codes-cultures/pac.js'
import {geometry as area} from '@mapbox/geojson-area'
import { all as mergeAll } from "deepmerge";
import bbox from "@turf/bbox";
import bboxPolygon from "@turf/bbox-polygon";
import { featureCollection } from "@turf/helpers";

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

function prepareRow (row, cadastre_plots = {}) {
  const {culture_type, com, engagement_date, niveau_conversion} = row
  


  // 26108000AN0100
  const [, prefixe, section, parcelle] = row.cadastre_suffix.trim().match(/^(\d{0,3})([a-zA-Z]{1,2})(\d+)$/) ?? []
  const cadastre_id = section ? `${row.com}${prefixe || '000'}${section}${parcelle.padStart(4, 0)}` : ''
  const plot_id = cadastre_id;

  let surface = null

  if (cadastre_id && cadastre_plots[cadastre_id]) {
    const {geometry} = cadastre_plots[cadastre_id]
    surface = parseFloat(area(geometry) / IN_HECTARES).toFixed(2)
  }


  return {
    com,
    culture_type,
    engagement_date,
    cadastre_id,
    plot_id,
    niveau_conversion,
    surface
  }
}

export default {
  computed: {
    structuredPlots () {
      const plots = []

      this.plots.forEach(row => {
        const suffixes = (row.cadastre_suffixes ?? '').split(',')
        plots.push(...suffixes.map(suffix => prepareRow({ ...row, cadastre_suffix: suffix}, this.cadastre_plots)))
      })
      if(this.map)
        this.map.resize();
      return plots
    },
    plotsGeoJson () {
      let fc = featureCollection(Object.entries(this.cadastre_plots).map(([, value]) => value));
      if(this.map)
        this.map.getSource("plots").setData(fc);
      return fc;
    },
    mapBounds() {
      let bounds = bboxPolygon(bbox(this.plotsGeoJson)).bbox;
      if (this.map)
        this.map.fitBounds(bounds);
      return bounds;
    }
  },

  components: {
    MglMap,
    MglGeojsonLayer,
    MglVectorLayer
  },

  data () {
    return {
      valid: false,
      loading: false,

      conversion_levels: [
        { value: "C1", text: "C1" },
        { value: "C2", text: "C2" },
        { value: "C3", text: "C3" },
        { value: "BIO", text: "Bio" },
        { value: "CONV", text: "Conventionnel" },
        { value: "Inconnu", text: "Inconnu" }
      ],

      knownCultures: codes.sort((a, b) => a['Libellé Culture'].localeCompare(b['Libellé Culture'])),

      plots: [
        {
          "com": "26108",
          "cadastre_suffixes": 'ZI631, ZI637',
          "culture_type": 'AIL',
          "niveau_conversion": 'BIO',
          "engagement_date": "2017-02-03"
        },
        {
          "com": "26108",
          "cadastre_suffixes": 'AM17',
          "culture_type": 'SOJ',
          "niveau_conversion": 'C2',
          "engagement_date": "2017-02-03"
        }
      ],

      cadastre_plots: {},
      mapStyle: mergeAll([
        baseStyle,
        cadastreStyle,
        cartobioStyle])
    };
  },

  created () {
    this._communes = communes
  },

  watch: {
    commune_search (val) {
      if (!val && val.length < 3) {
        this.communes = []
        return
      }

      const search = val.toLocaleLowerCase()
      this.communes = communes.filter(({ libelle }) => {
        return libelle.toLocaleLowerCase().includes(search)
      })
    }
  },

  methods: {
    addPlot () {
      const lastLine = this.plots[ this.plots.length - 1 ] ?? {}
      const { com, engagement_date } = lastLine

      this.plots.push({ com, engagement_date })
    },

    fetchCadastreSheets () {
      this.loading = true

      const sheets = this.structuredPlots.map(({ com, cadastre_id }) => ({ com, cadastre_id }))
      const calls = sheets.reduce((map, sheet) => {
        if (Array.isArray(map[ sheet.com ]) === false) {
          map[ sheet.com ] = []
        }

        map[ sheet.com ].push(sheet.cadastre_id)

        return map
      }, {})

      const callsP = Object.entries(calls).map(([com, ids]) => {
        return get(`https://cadastre.data.gouv.fr/bundler/cadastre-etalab/communes/${com}/geojson/parcelles`)
          .then(response => response.data.features.filter(feature => ids.includes(feature.id)))
          .then(features => features.forEach(feature => {
            this.$set(this.cadastre_plots, feature.id, feature)
          }))
      })

      Promise.all(callsP).finally(() => this.loading = false)
    },

    /**
     * @param  {String} styleId [description]
     * @return {Object<Mapbox.Layer>}
     */
    layerStyle(styleId) {
      return cartobioStyle.layers.find(({ id }) => id === styleId);
    },

    itemText ({ com, libelle }) {
      return `${libelle} (${com})`
    },

    onMapLoaded({ map }) {
        this.map = map;
    }
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
  
</style>
