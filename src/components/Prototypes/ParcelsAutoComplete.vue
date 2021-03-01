<template>
  <v-form v-model="valid">
    <h1>Notification du parcellaire opérateur en Agriculture Biologique</h1>
    <p class="chip">
      <v-avatar><v-icon>info_outline</v-icon></v-avatar>
      Cette section est actuellement en phase de test.
    </p>
    <p>
      En renseignant votre parcellaire vous participez à faciliter votre contrôle AB et l’instruction de vos aides PAC si vous les demandez.<br/>
Les données renseignées seront uniquement communiquées à votre Organisme Certificateur en l’état. Vos données anonymisées permettront également d’améliorer
 la connaissance des parcelles bio en France.

    </p>
    <h2>
      Saisie du parcellaire

      <v-btn outline round color="success" @click="telepacXmlPrompt" small>
        <input type="file" ref="telepac_upload_field" @input="uploadXML" accept=".xml,text/xml" hidden>
        <v-icon small class="mr-2">cloud_upload</v-icon>
        importer dossier complet TéléPAC (XML)
      </v-btn>
    </h2>

    <div class="grid">
      <Fragment>
        <span class="header">Commune</span>
        <span class="header">Parcelles cadastrales</span>
        <span class="header">Type de culture</span>
        <span class="header">Statut de conversion</span>
        <span class="header">Date d'engagement<br>de&nbsp;la&nbsp;parcelle</span>
        <span class="header">Commentaire</span>
        <span class="header"></span>
      </Fragment>
      <Fragment class="row xs12 d-flex" v-for="(plot, index) in plots" :key="index">
        <v-autocomplete single-line outline v-model="plot.com" :item-text="itemText" item-value="COM" :items="_communes" :hide-details="index !== plots.length - 1" />
        <v-text-field single-line hint="Sous la forme AZ01, AN5, 011K0038 etc." persistent-hint clearable outline v-model="plot.cadastre_suffixes" :hide-details="index !== plots.length - 1" />
        <v-autocomplete single-line outline :items="knownCultures" item-text="Libellé Culture" item-value="Code Culture" multiple v-model="plot.culture_type" :hide-details="index !== plots.length - 1" />
        <v-select single-line outline v-model="plot.niveau_conversion" :items="conversion_levels" :hide-details="index !== plots.length - 1" />
        <v-text-field single-line clearable outline mask="##/##/####" hint="Format Jour/Mois/Année. Si inconnue, donner la date de conversion prévue" persistent-hint :disabled="!plot.niveau_conversion || plot.niveau_conversion === 'CONV'" v-model="plot.engagement_date"  :hide-details="index !== plots.length - 1" />
        <v-text-field single-line hint="Nom de la parcelle, précisions, autres infos ..." persistent-hint clearable outline v-model="plot.comment" :hide-details="index !== plots.length - 1" />
        <v-btn flat icon large @click="$delete(plots, index)"><v-icon medium>delete</v-icon></v-btn>
      </Fragment>
    </div>

    <v-btn color="info" @click="addPlot() || fetchCadastreSheets()">
      <v-icon class="mr-2">add_circle_outline</v-icon>
      Ajouter une parcelle
    </v-btn>

    <hr class="my-4" />

    <v-btn color="info" @click.stop="fetchCadastreSheets" :loading="loading">
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
            <td>Réf cadastrale</td>
            <td>Classement</td>
            <td>Surface graphique</td>
          </tr>
        </thead>
        <tbody>
          <tr v-for="plot in structuredPlots" :key="plot.plot_id + plot.cadastre_id">
            <td>{{ plot.plot_id }}</td>
            <td>{{ plot.culture_type }}</td>
            <td>{{ plot.engagement_date }}</td>
            <td>{{ plot.cadastre_id }}</td>
            <td>{{ plot.niveau_conversion }}</td>
            <td>{{ plot.surface === null ? '?' : `${plot.surface}ha`}}</td>
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
import {Fragment} from 'vue-fragment'
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

  const [day, month, year] = engagement_date.split('/')
  const formatted_engagement_date = `${year}-${month}-${day}`

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
    engagement_date: formatted_engagement_date,
    cadastre_id,
    plot_id,
    niveau_conversion,
    surface
  }
}

export default {
  components: {
    MglMap,
    MglGeojsonLayer,
    MglVectorLayer,
    Fragment
  },

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

  data () {
    return {
      valid: false,
      loading: false,
      isMapVisible: false,

      conversion_levels: [
        { value: "Cx", text: "En attente du 1er contrôle AB" },
        { value: "C1", text: "C1" },
        { value: "C2", text: "C2" },
        { value: "C3", text: "C3" },
        { value: "BIO", text: "Bio" },
        { value: "CONV", text: "Conventionnel" },
        { value: "HVE3", text: "Haute Valeur Environnementale (niveau 3)" },
        { value: "HVEx", text: "Haute Valeur Environnementale (niveau 1 ou 2)" },
        { value: "DMTR", text: "Demeter" },
        { value: "N&P", text: "Nature & Progrès" },
        { value: "", text: "Inconnu" }
      ],

      knownCultures: codes.sort((a, b) => a['Libellé Culture'].localeCompare(b['Libellé Culture'])),

      plots: [
        {
          "com": "26108",
          "cadastre_suffixes": 'ZI631, ZI637',
          "culture_type": ['AIL'],
          "niveau_conversion": 'BIO',
          "engagement_date": "03/02/2017"
        },
        {
          "com": "26108",
          "cadastre_suffixes": 'AM17',
          "culture_type": ['SOJ'],
          "niveau_conversion": 'C2',
          "engagement_date": "03/02/2017"
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
      const { com, engagement_date, niveau_conversion } = lastLine

      this.plots.push({ com, engagement_date, niveau_conversion })
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

      Promise.all(callsP).finally(() => {
        this.loading = false
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

    itemText ({ LIBELLE, DEP }) {
      return `${LIBELLE} (${DEP})`
    },

    onMapLoaded({ map }) {
        this.map = map;
    },

    telepacXmlPrompt () {
      this.$refs.telepac_upload_field.click()
    },

    async uploadXML () {
      const text = await this.$refs.telepac_upload_field.files[0].text()
      const xml = new DOMParser().parseFromString(text, 'text/xml')

      const pacage = xml.querySelector('producteur').getAttribute('numero-pacage')

      this.plots = Array
        .from(xml.querySelectorAll('parcelle'))
        .map(plot => {
          const ilot = plot.parentElement.parentElement
          const com = ilot.querySelector('commune')?.textContent.trim()

          const id = [
            ilot.getAttribute('numero-ilot'),
            plot.querySelector('[numero-parcelle]').getAttribute('numero-parcelle')
          ].join('.')

          const culture_type = Array.from(plot.querySelectorAll('code-culture'))
            .map(node => node.textContent)
            .filter(culture => culture && culture !== '___')

          return {
            id,
            com,
            pacage,
            culture_type,
            niveau_conversion: ''
          }
        })
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
    grid-template-columns: repeat(7, 1fr);
    grid-column-gap: 5px;
    grid-row-gap: 1em;
    margin: 1em 0;

    span.header {
      font-weight: bold;
      align-self: flex-end;
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
  }

</style>
