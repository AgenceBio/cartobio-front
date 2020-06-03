<template>
  <MglPopup :showed="!show" :close-button="false" @open="onPopupOpened">
    <article class="parcel-details">
      <header v-if="parcel" class="d-flex">
        <span :class="{ status: true, badge: true, 'status--bio': this.currentStatus === true, 'status--nonbio': this.currentStatus === false }"></span>

        <h2 class="code-culture shrink" v-if="parcel.culture && parcel.culture.groupCode">
          <span class="group-label">{{parcel.culture.groupLabel}}</span>
          <span class="culture-label" v-if="parcel.culture.label !== parcel.culture.groupLabel">{{parcel.culture.label}}</span>
        </h2>
        <h2 class="code-culture group-label" v-if="parcel.culture && !parcel.culture.groupCode">{{parcel.culture}}</h2>

        <ul v-if="parcel.codecultu" class="metadata">
          <li data-surface class="font-weight-bold">
            {{ surface }} HA
          </li>
          <li v-if="parcel.numilot" data-ilot class="font-weight-bold grey--text text--darken-3">
            Ilot {{parcel.numilot}} Parcelle {{parcel.numparcel}}
          </li>
          <li data-cadastre v-if="cadastre" class="grey--text text--darken-3">
            {{cadastre.properties.section}} {{cadastre.properties.numero}}
          </li>
        </ul>
      </header>

      <article class="history">
        <h3 class="grey--text text--darken-1">Historique</h3>

        <table class="parcel-yearly-details">
          <colgroup>
            <col width="5%">
            <col width="13%">
            <col width="82%">
          </colgroup>
          <thead hidden>
            <tr>
              <th data-bio>Statut</th>
              <th>Année</th>
              <th>Culture</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="{year, feature} in history" :key="year" :class="{'bio': feature.bio === true, 'non-bio': feature.bio === false}">
              <td data-bio>
                <v-icon small>lens</v-icon>
              </td>
              <th data-year class="grey--text text--darken-2">{{year}}</th>
              <td v-if="feature.culture.groupCode" data-culture class="blue-grey--text text--darken-2">
                <span class="group-label">{{feature.culture.groupLabel}}</span>
                <span class="culture-label" v-if="feature.culture.label !== feature.culture.groupLabel">{{feature.culture.label}}</span>
              </td>
              <td v-if="!feature.culture.groupCode" data-culture class="blue-grey--text text--darken-2 group-label">{{feature.culture}}</td>
            </tr>
          </tbody>
        </table>
      </article>
    </article>
  </MglPopup>
</template>

<script>
import {MglPopup} from "vue-mapbox"
import {fromCode} from "@/modules/codes-cultures/pac.js"
import {geometry as area} from '@mapbox/geojson-area'

const IN_HECTARES = 10000

export default {
  name: "ParcelDetailsPopup",
  props: ['features', 'coordinates'],

  components: {
    MglPopup
  },

  methods: {
    onPopupOpened ({ popup }) {
      popup.setMaxWidth('380px')

      // each time we manually set the coordinates (programmatically),
      // it disables pointer tracking
      // so we have to explicitely enable it whenever the popup is opened via mouse/touch interactions
      this.coordinates === undefined
        ? popup.trackPointer()
        : popup.setLngLat(this.coordinates)
    }
  },

  computed: {
    show () {
      return Object.keys(this.features.operator).length > 0 || this.features.anon.length > 0
    },

    cadastre () {
      return this.features.cadastre
    },

    currentStatus () {
      return this.parcel && this.parcel.bio
    },

    parcel () {
      if (this.history.length === 0) {
        return null
      }

      const {year, feature} = this.history[0]
      return {...feature, year}
    },

    surface () {
      const {parcel} = this

      return (area(parcel.geometry) / IN_HECTARES).toFixed(2)
    },

    /**
     * @return {Array<year, featureProperties>} [description]
     */
    history () {
      const {operator, anon} = this.features
      const YEAR_PATTERN = /_(\d+)$/
      let hoveredData = {}

      if (Object.keys(operator).length) {
        Object.entries(operator).forEach(([year, {properties, geometry}]) => {
          hoveredData[ year ] = {
            ...properties,
            bio: Boolean(parseInt(properties.bio, 10)),
            culture: fromCode(properties.codecultu),
            geometry,
          }
        })
      }

      // we only replace the data if there is no operator data for the year
      if (anon) {
        anon
          .filter(({sourceLayer}) => YEAR_PATTERN.test(sourceLayer))
          .forEach(({properties, sourceLayer, geometry}) => {
            const [, year] = YEAR_PATTERN.exec(sourceLayer)

            if (!hoveredData[year]) {
              hoveredData[year] = {
                ...properties,
                bio: Boolean(parseInt(properties.bio, 10)),
                culture: fromCode(properties.codecultu),
                geometry
              }
            }
          })
      }

      return Object.entries(hoveredData)
        .sort(([yearA], [yearB]) => yearB - yearA)
        .map(([year, feature]) => ({ year, feature }))
    }
  }
};
</script>

<style lang="scss" scoped>
$cell-padding: 10px;

.parcel-details {
  width: 360px;

  header {
    background: #F6F7E2;
    border-top-left-radius: 10px;
    border-top-right-radius: 10px;
    margin: -10px -10px 0;

    & > * {
      margin: $cell-padding;
    }

    h2 {
      font-size: 1.2rem;

      .culture-label {
        font-size: .9rem;
      }
    }
  }

  .culture-label {
    display: block;
    font-weight: normal;
    line-height: 1.25;
  }

  .metadata {
    list-style: none;
    padding: 0;
    text-align: right;
    white-space: nowrap;

    li {
      margin: 0;
    }

    &:empty {
      display: none;
    }
  }

  .status {
    $size: 14px;

    background-color: #ccc;
    border-radius: 50%;
    display: inline-block;
    text-align: center;
    width: $size;
    height: $size;

    &:after {
      content: "";
      line-height: $size;
    }

    &.status--bio {
      background-color: #B9D065;
      color: #242C37;
    }

    &.status--nonbio {
      background-color: #CC4C3C;
      color: #fff;
    }

    &.badge {
      $size: 40px;

      flex: 0 0 $size !important;
      width: $size;
      height: $size;

      &:after {
        line-height: $size;
      }

      &.status--bio:after {
        // font-size: 1.25em;
        content: "Bio";
      }

      &.status--nonbio:after {
        content: "Conv.";
      }
    }
  }

  .history tr:not(:last-child) .v-icon:before {
    content: "";
    border: 1px solid #ccc;
    border-left: none;
    border-top: none;
    border-bottom: none;
    margin-top: 17px;
    position: absolute;
    height: 100%;
    top: 0;
    z-index: 0;
  }

  .history {
    h3 {
      margin: $cell-padding 0;
      text-transform: uppercase;
    }
  }

  .parcel-yearly-details {
    table-layout: fixed;
    border-collapse: collapse;
    width: 100%;

    .bio .v-icon {
      color: #B9D065;
    }
    .non-bio .v-icon {
      color: #CC4C3C;
    }

    tbody td,
    tbody th {
      padding-left: $cell-padding;
      padding-right: 0;
      position: relative;
      vertical-align: baseline;
    }

    tbody td[data-bio] {
      padding: 0;
    }

    tbody th[data-year] {
      font-size: 1.1em;
    }

    tbody td[data-culture] {
      line-height: 1.25;
      padding-bottom: $cell-padding * 1.5;
    }

    .group-label {
      font-weight: bold;
    }

    .culture-label {
      font-size: .9em;
    }
  }
}
</style>
