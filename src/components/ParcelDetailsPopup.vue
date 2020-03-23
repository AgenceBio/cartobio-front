<template>
  <MglPopup :showed="!show" :close-button="false" :close-on-click="false" @added="onPopupCreated">
    <div class="parcel-details">
      <h3 v-if="parcel.numilot">Ilot {{parcel.numilot}} Parcelle {{parcel.numparcel}}</h3>

      <ul v-if="parcel.codecultu" class="metadata">
        <li data-surface>
          <b>Surface</b> {{ surface }}<abbr title="hecta">ha</abbr>
        </li>
        <li data-cadastre v-if="cadastre">
          <b>Parcelle</b> {{cadastre.properties.section}} {{cadastre.properties.numero}}
        </li>
      </ul>


      <table class="parcel-yearly-details">
        <thead>
          <tr>
            <th>Année</th>
            <th>Culture</th>
            <th data-bio>Bio</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(feature, year) in history" :key="year" :class="{'bio': Boolean(feature.bio) === true, 'non-bio': Boolean(feature.bio) === false}">
            <th data-year>{{year}}</th>
            <td v-if="feature.culture.groupCode" data-culture>
              {{feature.culture.groupLabel}}<br>
              <small>{{feature.culture.label}}</small>
            </td>
            <td v-if="!feature.culture.groupCode" data-culture>{{feature.culture}}</td>
            <td data-bio>
              <i aria-hidden="true" class="v-icon material-icons theme--light">
                {{Boolean(feature.bio) ? 'check_circle_outline' : 'close'}}
              </i></td>
          </tr>
        </tbody>
      </table>
    </div>
  </MglPopup>
</template>

<script>
import {MglPopup} from "vue-mapbox"
import {fromCode} from "@/modules/codes-cultures/pac.js"
import {geometry as area} from '@mapbox/geojson-area'

const IN_HECTARES = 10000

export default {
  name: "ParcelDetailsPopup",
  props: ['features'],

  components: {
    MglPopup
  },
  data() {
    return {
    }
  },

  methods: {
    onPopupCreated ({ popup }) {
      popup.trackPointer()
      popup.setMaxWidth('340px')
    }
  },

  computed: {
    show () {
      return Object.keys(this.features.operator).length > 0 || this.features.anon.length > 0
    },

    cadastre () {
      return this.features.cadastre
    },

    parcel () {
      const mostRecentYear = Object.keys(this.history).sort((a, b) => b-a).pop()

      return this.history[mostRecentYear] || {}
    },

    surface () {
      const {parcel} = this

      return (area(parcel.geometry) / IN_HECTARES).toFixed(2)
    },

    history () {
      const {operator, anon} = this.features
      const YEAR_PATTERN = /-(\d+)$/
      let hoveredData = {}

      if (Object.keys(operator).length) {
        Object.entries(operator).forEach(([year, {properties, geometry}]) => {
          hoveredData[ year ] = {
            ...properties,
            culture: fromCode(properties.codecultu),
            geometry,
          }
        })
      }

      // we only replace the data if there is no operator data for the year
      if (anon) {
        anon
          .filter(({source}) => YEAR_PATTERN.test(source))
          .forEach(({properties, source, geometry}) => {
            const [, year] = YEAR_PATTERN.exec(source)

            if (!hoveredData[year]) {
              hoveredData[year] = {
                ...properties,
                culture: fromCode(properties.codecultu),
                geometry
              }
            }
          })
      }

      return hoveredData
    }
  }
};
</script>

<style lang="scss" scoped>
.parcel-details {
  $cell-padding: 5px;
  width: 320px;

  h3 {
      padding-left: $cell-padding;
      padding-right: $cell-padding;
  }

  .metadata {
    list-style: none;
    margin: .5em $cell-padding;
    padding: 0;

    &:empty {
      display: none;
    }
  }

  .parcel-yearly-details {
    border-collapse: collapse;
    width: 100%;

    .bio .v-icon {
      color: #388E3C; /* green darken-2 */
    }
    .non-bio .v-icon {
      color: #F57C00; /* orange darken-2 */
    }

    thead th {
      border-bottom: 1px solid #78909C; /* blue-grey */
      padding: $cell-padding;
      vertical-align: bottom;
    }

    tbody tr:nth-child(2n) {
      background-color: #ECEFF1;        /* blue-grey lighten-5 */
    }

    tbody td,
    tbody th {
      padding-left: $cell-padding;
      padding-right: $cell-padding;
      vertical-align: top;
    }

    [data-surface] abbr {
      margin-left: $cell-padding;
    }

    [data-year] {
      width: 5em;
    }

    [data-bio] {
      text-align: center;
    }

    [data-culture] {
      line-height: 1.25;
    }
  }
}
</style>
