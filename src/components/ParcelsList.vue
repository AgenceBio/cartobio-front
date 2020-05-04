<template>
  <v-navigation-drawer app clipped stateless hide-overlay v-model="show">
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
        >
          <v-expansion-panel-content v-for="ilot in ilots" :key="ilot.numIlot">
            <template v-slot:header>
              <v-flex align-center justify-space-between row fill-height
                @mouseover="$emit('hover-ilot', ilot)"
                @mouseleave="$emit('stop-hovering-ilot', ilot)">
                <span class="text-cyan text-uppercase font-weight-medium">Ilot {{ilot.numIlot}}</span>
              </v-flex>
              <!-- <v-btn flat icon small @click.native.stop @click="zoomOnIlot(ilot)"><v-icon color="#457382">my_location</v-icon></v-btn> -->
            </template>
            <template v-slot:actions>
              <!-- <v-icon color="#457382" @click="console.log('click')">gps_not_fixed</v-icon> -->
              <v-icon color="#457382">arrow_drop_up</v-icon>
            </template>

            <v-data-table class="parcels" :items="ilot.parcels" item-key="id" :custom-sort="sortIlots" hide-actions hide-headers>
              <template v-slot:items="{item:props}">
                <tr @mouseover="$emit('hover-parcel', props)" @mouseleave="$emit('stop-hovering', props)">
                  <td class="status"><v-avatar size="24px" :color="props.bioboolean ? '#b9d065' : '#D32F2F'"></v-avatar></td>
                  <td class="numparcel">Parcelle {{props.numparcel}}</td>
                  <td class="text-cyan cultural-label">
                    <v-tooltip top left dark open-delay=200>
                      <template v-slot:activator="{ on }">
                        <span v-on="on" class="text-truncate d-block">{{props.culture.label}}</span>
                      </template>
                      <span>{{props.culture.label}}</span>
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
import getObjectValue from "lodash/get";
import reduce from "lodash/reduce";
import {fromCode} from "@/modules/codes-cultures/pac.js"
import Preview from "@/components/ParcelsListPreview";

export default {
  name: "ParcelsList",
  props: {
    parcels: Object,
    operator: Object
  },
  components: {
    Preview
  },
  data() {
    return {
      dialog: false,
    };
  },
  methods: {
    // expandIlot(ilotKey) {
    //   this.expandedArr[ilotKey] = !this.expandedArr[ilotKey];
    //   this.panel = this.expandedArr;
    // },
    sortIlots (items) {
      return items.sort((propsA, propsB) => {
        const ilotDiff = propsA.numilot - propsB.numilot
        const parcelDiff = propsA.numparcel - propsB.numparcel
        return ilotDiff ? ilotDiff : parcelDiff
      })
    },

    downloadCSV() {
      let rows = this.parcelsArray

      rows.unshift([
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
      ]);

      try {
        const {numeroBio, title='cartobio-export'} = this.operator;
        window._paq.push(['trackEvent', 'parcels', 'download', numeroBio]);

        this.convertToCsvAndDownload(`${title}.csv`, rows);
      }
      catch (error) {
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
    show: {
      get () {
        return Boolean(this.operator && this.operator.id)
      },
      set () {
        // this is intended to avoid Vue.js warning
      }
    },
    isLoading () {
      return this.ilots.length === 0
    },

    parcelsArray () {
      return this.features.map(prop => {
        // csv properties order:
        // [id, numerobio, pacage, agroforest, bio, codecultu, engagement, maraichage, numilot, numparcel, surfadm, surfgeo]
        return [
          getObjectValue(prop, "id", ""),
          prop.numerobio,
          getObjectValue(prop, "pacage", ""),
          getObjectValue(prop, "maraichage", ""),
          prop.bio,
          prop.codecultu,
          prop.engagement,
          getObjectValue(prop, "maraichage", ""),
          prop.numilot,
          prop.numparcel,
          getObjectValue(prop, "surfadm", 0),
          prop.surfgeo
        ];
      })
    },

    /**
     * Clears out types and properties for incoming parcels
     * @return {Array.<ParcelProperties>}
     */
    features () {
      return this.parcels.features.map(({ id, properties }) => ({
        id,
        ...properties,
        // to enforce proper sort order
        numilot: parseInt(properties.numilot, 10),
        numparcel: parseInt(properties.numparcel, 10),
        // convert to hectares
        surfgeo: (properties.surfgeo / 10000).toFixed(2),
        bioboolean: Boolean(parseInt(properties.bio, 10)),
        culture: fromCode(properties.codecultu),
      }))
    },

    ilots() {
      // group parcels by ilots
      let reduced = reduce(
        this.features,
        function(result, parcel) {
          let numIlot = getObjectValue(parcel, ["numilot"]);
          result[numIlot]
            ? result[numIlot].push(parcel)
            : (result[numIlot] = [parcel]);
          return result;
        },
        {}
      );

      let ilots = reduce(
        reduced,
        function(result, parcels, numIlot) {
          result.push({ numIlot, parcels });
          return result;
        },
        []
      );

      return ilots;
    },
    panel : {
      get : function () {
        let expandedArr = [];
        this.ilots.forEach(() => {
          expandedArr.push(true);
        });
        return expandedArr;
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

.parcels .v-table {
  border-collapse: unset;

  tbody {
    tr:hover {
      background: #F6F7E2;
    }

    td, th {
      cursor: default;
      height: 38px;
      padding-right: 0;
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

.download {
  background-color: #F6F7E2;
}
</style>
