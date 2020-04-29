<template>
  <v-navigation-drawer app clipped stateless hide-overlay v-model="drawer" @transitionend="drawer === false && $emit('close-drawer')">
    <v-container fluid fill-height pa-0>
      <v-layout column>
        <!-- Header -->
        <v-toolbar dark flat prominent color="#457382">
          <v-toolbar-side-icon @click="drawer=false">
            <v-icon>navigate_before</v-icon>
          </v-toolbar-side-icon>
          <v-toolbar-title class="ml-0">
            {{operator.title}}
          </v-toolbar-title>
          <v-spacer/><v-btn flat icon small @click.native.stop @click="$emit('zoom-on-operator')"><v-icon>my_location</v-icon></v-btn>
        </v-toolbar>

        <v-flex shrink>
          <p class="update-info pa-2 ma-0 caption">
            <v-icon small color="#457382">info</v-icon>
            Dernière mise à jour le <b>15 juillet 2019</b>.
          </p>
        </v-flex>

        <v-flex class="grow align-self-center my-5" v-if="ilots.length === 0">
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
              <v-btn flat icon small @click.native.stop @click="$emit('zoom-on-ilot', ilot)"><v-icon color="#457382">my_location</v-icon></v-btn>
            </template>
            <template v-slot:actions>
              <!-- <v-icon color="#457382" @click="console.log('click')">gps_not_fixed</v-icon> -->
              <v-icon color="#457382">arrow_drop_up</v-icon>
            </template>

            <v-data-table class="parcels" :items="ilot.parcels" item-key="id" :custom-sort="sortIlots" hide-actions hide-headers>
              <template v-slot:items="{item:parcel}">
                <tr @mouseover="$emit('hover-parcel', parcel)" @mouseleave="$emit('stop-hovering', parcel)">
                  <td class="status"><v-avatar size="24px" :color="parcel.properties.bioboolean ? '#b9d065' : '#D32F2F'"></v-avatar></td>
                  <td class="numparcel">Parcelle {{parcel.properties.numparcel}}</td>
                  <td class="text-cyan cultural-label">
                    <v-tooltip top left dark open-delay=200>
                      <template v-slot:activator="{ on }">
                        <span v-on="on" class="text-truncate d-block">{{parcel.properties.culture.label}}</span>
                      </template>
                      <span>{{parcel.properties.culture.label}}</span>
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
            <span class="grey--text text--darken-2">Export des données parcellaires</span>
            <v-btn round color="#b9d065" class="mb-0" @click="downloadCSV">
              Télécharger
            </v-btn>

            <v-dialog v-model="dialog" max-width=800>
              <template v-slot:activator="{ on }">
                <v-btn flat small v-on="on" color="grey darken-1" class="mt-0" >Prévisualiser</v-btn>
              </template>

              <Preview v-on:download-csv="downloadCSV()" v-on:close-dialog="dialog = false" :features="parcels.features"></Preview>
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
    drawer: Boolean,
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
      return items.sort((a, b) => {
        return Number(a.properties.numparcel) - Number(b.properties.numparcel)
      })
    },

    downloadCSV() {
      // since map and foreach doesn't guarantee order, we need to guaranty it ourselves:
      let rows = this.parcels.features.map(this.createParcelArray)
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
        const {numeroBio} = this.$store.getters.getOperator;
        window._paq.push(['trackEvent', 'parcels', 'download', numeroBio]);

        this.convertToCsvAndDownload(
          this.$store.getters.getOperator.title + ".csv",
          rows
        );
      }
      catch (error) {
        window._paq.push(['trackEvent', 'parcels', 'error:download', error]);
      }
    },
    createParcelArray(parcel) {
      let prop = parcel.properties;
      // csv properties order:
      // [id, numerobio, pacage, agroforest, bio, codecultu, engagement, maraichage, numilot, numparcel, surfadm, surfgeo]
      let parcelArray = [
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
        getObjectValue(prop, "surfadm", ""),
        prop.surfgeo
      ];
      return parcelArray;
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
  watch: {
    "parcels.features": {
      handler: function() {
        // console.log(newVal);
      },
      deep: true
    }
  },
  computed: {
    ilots() {
      // format parcels to retrieve culture name:
      this.parcels.features.forEach(function(parcel) {
        parcel.properties = {
        ...parcel.properties,
        bioboolean: Boolean(parseInt(parcel.properties.bio, 10)),
        culture: fromCode(parcel.properties.codecultu)}
      })

      // group parcels by ilots
      let reduced = reduce(
        this.parcels.features,
        function(result, parcel) {
          let numIlot = getObjectValue(parcel, ["properties", "numilot"]);
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
