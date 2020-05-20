<template>
  <v-navigation-drawer app clipped stateless hide-overlay v-model="drawer">
    <v-container fluid fill-height pa-0>
      <v-layout column>
        <!-- Header -->
        <v-toolbar dark flat prominent color="#457382">
          <v-toolbar-side-icon @click="$emit('close-drawer')">
            <v-icon>navigate_before</v-icon>
          </v-toolbar-side-icon>
          <v-toolbar-title class="ml-0">
            {{operator.title}}
          </v-toolbar-title>
          <v-spacer/>

          <v-btn flat icon small @click.native.stop @click="$emit('zoom-on', parcels)">
            <v-tooltip top left dark open-delay=200>
              <template v-slot:activator="{ on }">
                <v-icon v-on="on" small>my_location</v-icon>
              </template>

              Centrer la carte sur l'exploitation
            </v-tooltip>
          </v-btn>
        </v-toolbar>

        <v-flex shrink>
          <p class="update-info pa-2 ma-0 caption">
            <v-icon small color="#457382">info</v-icon>
            Dernière mise à jour le <b>15 juillet 2019</b>.
          </p>
        </v-flex>

        <v-flex class="grow align-self-center my-5" v-if="isLoading">
          <v-progress-circular indeterminate size=64 color="#457382" />
        </v-flex>

        <v-expansion-panel
          v-model="panel"
          elevation-0
          class="overflow no-box-shadow"
          expand
          focusable
          readonly
        >
          <v-expansion-panel-content v-for="({ numIlot, featureCollection }) in ilots" :key="numIlot">
            <template v-slot:header>
              <v-flex align-center row fill-height class="parcel-summary"
                @mouseover="$emit('hover-ilot', { numIlot, featureCollection })"
                @mouseleave="$emit('stop-hovering-ilot', { featureCollection })">
                <span class="text-cyan text-uppercase font-weight-medium">Ilot {{numIlot}}</span>
              </v-flex>
            </template>

            <template v-slot:actions>
              <v-tooltip top>
                <template v-slot:activator="{ on }">
                  <v-btn icon small v-on="on" @click.native.stop @click="$emit('zoom-on', featureCollection)">
                    <v-icon small color="#457382">my_location</v-icon>
                  </v-btn>
                </template>
                Centrer la carte sur cet ilot
              </v-tooltip>
              
            </template>

            <v-data-table class="parcels" :items="featureCollection.features" item-key="id" :custom-sort="sortIlots" hide-actions hide-headers>
              <template v-slot:items="{item: feature}">
                <tr @mouseover="$emit('hover-parcel', feature)" @mouseleave="$emit('stop-hovering', feature)" @click="$emit('zoom-on', feature)">
                  <td class="status"><v-avatar size="24px" :color="feature.properties.bioboolean ? '#b9d065' : '#D32F2F'"></v-avatar></td>
                  <td class="numparcel">Parcelle {{feature.properties.numparcel}}</td>
                  <td class="text-cyan cultural-label">
                    <v-tooltip top left dark open-delay=200>
                      <template v-slot:activator="{ on }">
                        <span v-on="on" class="text-truncate d-block">{{feature.properties.culture.label}}</span>
                      </template>
                      <span>{{feature.properties.culture.label}}</span>
                    </v-tooltip>
                  </td>
                </tr>
              </template>
            </v-data-table>
          </v-expansion-panel-content>
        </v-expansion-panel>
        <v-spacer></v-spacer>
        <v-flex shrink class="download elevation-1">
          <v-layout column align-center justify-center py-3>
            <h3 class="subheading">Export des données parcellaires</h3>

            <v-dialog v-model="dialog" max-width=800>
              <template v-slot:activator="{ on }">
                <div class="mt-3">
                  <v-btn :disabled="isLoading" round outline v-on="on" >Prévisualiser</v-btn>

                  <v-btn :disabled="isLoading" round color="#b9d065" @click="downloadCSV">Télécharger</v-btn>
                </div>
              </template>

              <Preview v-on:download-csv="downloadCSV()" v-on:close-dialog="dialog = false" :features="features"></Preview>
            </v-dialog>
          </v-layout>
        </v-flex>
      </v-layout>
    </v-container>
  </v-navigation-drawer>
</template>
<script>
// import getObjectValue from "lodash/get";
import {fromCode} from "@/modules/codes-cultures/pac.js"
import Preview from "@/components/ParcelsListPreview";

/**
let bboxIlot = this.getBboxIlot(ilot);

    getBboxIlot(ilot) {
      const features = ilot.parcels.map((parcel) => {
        return this.parcelsOperator[this.currentYear].features.find(({ id }) => id === parcel.id)
      })

      return bbox({
        features,
        type : 'FeatureCollection'
      });
    },
*/

export default {
  name: "ParcelsList",
  props: {
    // parcels is a FeatureCollection
    parcels: Object,
    operator: Object,
    drawer: Boolean
  },
  components: {
    Preview
  },
  data() {
    return {
      dialog: false,
    };
  },
  watch: {

    drawer: function(newVal) {
      if (newVal)
        this.$emit("open-drawer");
    },
  },
  methods: {
    // expandIlot(ilotKey) {
    //   this.expandedArr[ilotKey] = !this.expandedArr[ilotKey];
    //   this.panel = this.expandedArr;
    // },
    sortIlots (features) {
      return features.sort((featureA, featureB) => {
        const ilotDiff = featureA.properties.numilot - featureB.properties.numilot
        const parcelDiff = featureA.properties.numparcel - featureB.properties.numparcel
        return ilotDiff ? ilotDiff : parcelDiff
      })
    },

    downloadCSV() {
      const rows = [ [
        "id",
        "numeroBio",
        "numeroPacage",
        "agroforest",
        "estBio",
        "codeCulture",
        "engagement",
        "maraichage",
        "numeroIlot",
        "numeroParcelle",
        "surfaceAdmissible",
        "surfaceGeometrique"
      ] ]

      this.features.forEach(({ properties }) => rows.push([
        properties.id,
        this.operator.numeroBio,
        properties.pacage,
        properties.agroforest,
        properties.bioboolean,
        properties.codecultu,
        properties.engagement,
        properties.maraichage,
        properties.numilot,
        properties.numparcelle,
        properties.surfadm,
        properties.surfgeo
      ]))


      try {
        const {numeroBio, title='cartobio-export'} = this.operator;
        window._paq.push(['trackEvent', 'parcels', 'download', numeroBio]);

        this.convertToCsvAndDownload(`${title}.csv`, rows);
      }
      catch (error) {
        console.error(error)
        window._paq.push(['trackEvent', 'parcels', 'error:download', error]);
      }
    },

    // from https://stackoverflow.com/a/49950777
    convertToCsvAndDownload(fName, rows) {
      var csv = "";
      for (let i = 0; i < rows.length; i++) {
        let row = rows[i];
        for (let j = 0; j < row.length; j++) {
          let val = row[j] === null ? "" : row[j].toString();
          val = val.replace(/\t/gi, " ");
          if (j > 0) csv += "\t";
          csv += val;
        }
        csv += "\n";
      }

      // for UTF-16
      let cCode,
        bArr = [];
      bArr.push(255, 254);
      for (let i = 0; i < csv.length; ++i) {
        cCode = csv.charCodeAt(i);
        bArr.push(cCode & 0xff);
        bArr.push((cCode / 256) >>> 0);
      }

      let blob = new Blob([new Uint8Array(bArr)], {
        type: "text/csv;charset=UTF-16LE;"
      });
      if (navigator.msSaveBlob) {
        navigator.msSaveBlob(blob, fName);
      } else {
        let link = document.createElement("a");
        if (link.download !== undefined) {
          let url = window.URL.createObjectURL(blob);
          link.setAttribute("href", url);
          link.setAttribute("download", fName);
          link.style.visibility = "hidden";
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          window.URL.revokeObjectURL(url);
        }
      }
    }
  },
  computed: {
    isLoading () {
      return this.ilots.length === 0
    },

    /**
     * Clears out types and properties for incoming parcels

     * @return {Array.<Feature>}
     */
    features () {
      return this.parcels.features.map((feature) => ({
        ...feature,
        properties: {
          ...feature.properties,
          id: feature.id,
          // to enforce proper sort order
          numilot: parseInt(feature.properties.numilot, 10),
          numparcel: parseInt(feature.properties.numparcel, 10),
          // convert to hectares
          surfgeo: (feature.properties.surfgeo / 10000).toFixed(2),
          bioboolean: Boolean(parseInt(feature.properties.bio, 10)),
          culture: fromCode(feature.properties.codecultu),
        }
      }))
    },

    /**
     * Returns a list of FeatureCollection
     */
    ilots() {
      // group parcels by ilots
      let reduced = this.features.reduce(function(result, feature) {
        const {numilot: numIlot} = feature.properties;

        result[numIlot]
          ? result[numIlot].push(feature)
          : (result[numIlot] = [feature]);
        return result;
      }, {});

      let ilots = Object.entries(reduced).reduce(function(result, [numIlot, features]) {
        result.push({ numIlot, featureCollection: { type: 'FeatureCollection', features } });
        return result;
      }, []);

      return ilots;
    },
    panel : {
      get () {
        return this.ilots.map(() => true)
      },
      // setter prevent error message in console when expanding/collapsing a parcel list
      set : function() {
      }
    }
  }
};
</script>
<style lang="scss" scoped>
.justify-self-start {
  margin-bottom: auto;
  padding-bottom: 10px;
}

.justify-self-end {
  margin-top: auto;
}

.no-box-shadow {
  box-shadow: unset;
}

.overflow {
  overflow-y: scroll;
  scrollbar-width: thin;
  scrollbar-color: #b0bec5;
}

.overflow::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}
.overflow::-webkit-scrollbar-track {
  background-color: #eceff1;
  border-radius: 10px;
}
.overflow::-webkit-scrollbar-thumb {
  background-color: #b0bec5;
  border-radius: 10px;
}

.text-cyan {
  color : #457382;
}

.v-expansion-panel /deep/ .v-expansion-panel__header {
  cursor: default;
  padding: 0 12px;
}

.parcels .v-table {
  border-collapse: unset;

  tbody {
    tr:hover {
      background: #F6F7E2;
    }

    td, th {
      cursor: pointer;
      height: 38px;
      padding: 0 12px;
    }

    .numparcel {
      font-weight: bold;
      white-space: nowrap;
    }

    .cultural-label {
      // force pushes this column so as it looks similar in all groups
      // even on small label columns
      width: 50%;

      .text-truncate.d-block {
       max-width: 120px;
     }
    }
  }
}

.update-info {
  background: #F6F7E2;
  vertical-align: middle;
}

.full-width {
  width: 100%;
}

// .parcel-summary:hover {
//   background-color: #719DA8;
// }

.download {
  background-color: #F6F7E2;
}
</style>
