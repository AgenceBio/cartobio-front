<template>
  <div>
    <v-navigation-drawer app clipped stateless hide-overlay v-model="drawer">
      <v-layout column fill-height justify-space-between align-space-between>
        <!-- Header -->
        <v-toolbar flat color="#00838F" class="sticky sticky-top">
          <v-toolbar-title>{{operator.title}}</v-toolbar-title>
        </v-toolbar>

        <v-expansion-panel
          v-model="panel"
          elevation-0
          class="justify-self-start overflow no-box-shadow"
          expand
        >
          <v-divider></v-divider>
          <v-expansion-panel-content v-for="(ilot, i) in ilots" :key="i">
            <template v-slot:header>
              <div>Ilot {{ilot.numIlot}}</div>
            </template>
            <v-list class="pt-0" dense>
              <v-list-tile v-for="(parcel, j) in ilot.parcels" :key="j">
                <v-list-tile-content
                  @mouseover="$emit('hover-parcel', parcel)"
                  @mouseleave="$emit('stop-hovering', parcel)"
                >
                  <v-layout align-center row class="full-width">
                    <v-flex>
                      <v-avatar size="24px" :color="parcel.properties.bio ? '#b9d065' : '#D32F2F'" class="mx-2"></v-avatar>
                    </v-flex>
                    <v-flex xs4>
                      <v-list-tile-title>
                        <b>Parcelle {{parcel.properties.numparcel}}</b>
                      </v-list-tile-title>
                    </v-flex>
                    <v-flex xs6>
                      <v-list-tile-sub-title>
                        <b>{{parcel.properties.culture.label}}</b>
                      </v-list-tile-sub-title>
                    </v-flex>
                  </v-layout>
                </v-list-tile-content>
              </v-list-tile>
            </v-list>
          </v-expansion-panel-content>
        </v-expansion-panel>
        <!-- download parcels button -->
        <div class="justify-self-end">
          <v-layout column align-center justify-center py-3>
            <span class="grey--text">Export des données parcellaires</span>
            <v-btn round color="#b9d065" class="mb-0" @click="downloadCSV">
              <span>Télécharger</span>
            </v-btn>
            <v-tooltip top>
              <template v-slot:activator="{ on }">
                <v-btn flat small v-on="on" color="grey lighten-1" class="mt-0">Prévisualiser</v-btn>
              </template>
              <span>Bientôt disponible</span>
            </v-tooltip>
          </v-layout>
        </div>
      </v-layout>
    </v-navigation-drawer>
  </div>
</template>
<script>
import getObjectValue from "lodash/get";
import reduce from "lodash/reduce";
import {fromCode} from "@/modules/codes-cultures/pac.js"

export default {
  name: "ParcelsList",
  props: {
    parcels: Object,
    drawer: Boolean,
    operator: Object
  },
  data() {
    return {
      allSelected: this.checkbox
    };
  },
  methods: {
    selectParcel(parcel) {
      this.$emit("select-parcel", parcel);
      // for some reason, the icon doesn't change so we have to re-render the component
      this.$forceUpdate();
    },
    selectAll(bool) {
      this.$emit("select-all-parcels", bool);
      this.$forceUpdate();
    },
    downloadCSV() {
      // since map and foreach doesn't guarantee order, we need to guaranty it ourselves:
      let rows = this.parcels.features.map(this.createParcelArray);
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
    },
    allSelected: {
      handler: function(newVal) {
        this.selectAll(newVal);
      }
    }
  },
  computed: {
    ilots() {
      // format parcels to retrieve culture name:
      this.parcels.features.forEach(function(parcel) {    
        parcel.properties = {
        ...parcel.properties,
        bio: Boolean(parseInt(parcel.properties.bio, 10)),
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
        function(result, value, key) {
          result.push({ numIlot: key, parcels: value });
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
  overflow-y: auto;
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

.full-width {
  width: 100%;
}
</style>
