<template>
  <Fragment>
    <v-expansion-panel
      v-model="panel"
      class="overflow-x-hidden no-box-shadow elevation-0"
      expand
      focusable
      readonly
    >
      <v-expansion-panel-content v-for="({ numIlot, featureCollection }) in ilots" :key="numIlot">
        <template v-slot:header>
          <v-flex align-center row fill-height class="parcel-summary"
            @mouseover="setActiveIlot({ numIlot, featureCollection })"
            @mouseleave="clearActiveParcel">
            <span class="text-cyan text-uppercase font-weight-medium">Ilot {{numIlot}}</span>
          </v-flex>
        </template>

        <template v-slot:actions>
          <v-tooltip top>
            <template v-slot:activator="{ on }">
              <v-btn icon small v-on="on"
                @mouseover="setActiveIlot({ numIlot, featureCollection })"
                @mouseleave="clearActiveParcel"
                @click.native.stop
                @click="zoomOn(featureCollection)">
                <v-icon small color="#457382">my_location</v-icon>
              </v-btn>
            </template>
            Centrer la carte sur cet ilot
          </v-tooltip>

        </template>

        <v-data-table class="parcels" :items="featureCollection.features" item-key="id" :custom-sort="sortIlots" hide-actions hide-headers>
          <template v-slot:items="{item: feature}">
            <tr @mouseover="setActiveParcel({ feature, centroid: true })" @mouseleave="clearActiveParcel" @click="zoomOn(feature)">
              <td class="status"><v-avatar size="24px" :color="feature.properties.bioboolean ? '#B9D065' : '#47718A'"></v-avatar></td>
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

    <v-spacer />

    <v-flex class="download elevation-1">
      <v-layout column align-center justify-center py-3>
        <h3 class="subheading">Export des données (Excel)</h3>

        <v-dialog v-model="dialog" max-width=800>
          <template v-slot:activator="{ on }">
            <div class="mt-3">
              <v-btn round outline v-on="on" >Prévisualiser</v-btn>

              <v-btn round color="#b9d065" @click="downloadCSV">Télécharger</v-btn>
            </div>
          </template>

          <Preview @download-csv="downloadCSV" @close-dialog="dialog = false" :features="features"></Preview>
        </v-dialog>
      </v-layout>

      <v-snackbar auto-height color="#b9d065" v-model="snackbar" :bottom="true" :left="true">
        <v-progress-circular indeterminate class="mr-4" color="black"></v-progress-circular>

        Le téléchargement des parcelles a démarré…
      </v-snackbar>
    </v-flex>
  </Fragment>
</template>
<script>
import {mapActions, mapMutations} from "vuex"
import {Fragment} from 'vue-fragment'
import {fromCode} from "@/modules/codes-cultures/pac.js"
import Preview from "@/components/ParcelsListPreview"

export default {
  name: "OperatorSidebarParcelsList",
  props: {
    // parcels is a FeatureCollection
    parcels: Object,
    operator: Object
  },

  components: {
    Fragment,
    Preview
  },

  data() {
    return {
      dialog: false,
      snackbar: false,
    };
  },

  methods: {
    ...mapMutations({
      clearActiveParcel: 'map/CLEAR_HOVERED_FEATURE',
      setActiveParcel: 'map/HOVERED_FEATURE',
      setActiveIlot: 'map/HOVERED_FEATURE_COLLECTION'
    }),

    ...mapActions('map', ['zoomOn']),

    sortIlots (features) {
      return features.sort((featureA, featureB) => {
        const ilotDiff = featureA.properties.numilot - featureB.properties.numilot
        const parcelDiff = featureA.properties.numparcel - featureB.properties.numparcel
        return ilotDiff ? ilotDiff : parcelDiff
      })
    },

    downloadCSV() {
      this.snackbar = true;

      const rows = [ [
        "id",
        "numeroBio",
        "numeroPacage",
        "agroforest",
        "statut",
        "codeCulture",
        "libelleCulture",
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
        properties.biolabel,
        properties.codecultu,
        properties.culture.label,
        properties.engagement,
        properties.maraichage,
        properties.numilot,
        properties.numparcel,
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
          biolabel: parseInt(feature.properties.bio, 10) ? 'BIO' : 'CONVENTIONNEL',
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
section {
  flex-direction: column;
  height: 100%;
}

.v-toolbar /deep/ .v-toolbar__content {
  padding-left: 12px; /* half of what it is supposed to be */
}

.v-toolbar /deep/ .v-toolbar__title {
  line-height: 1.1;
  overflow: auto;
  white-space: unset;
 }

.v-snack {
  color: #333;
  margin: 6px 6px 0;
}

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

.v-expansion-panel /deep/ {
  align-content: flex-start;
}

.v-expansion-panel /deep/ .v-expansion-panel__header {
  cursor: default;
  padding: 0 12px;
}

.v-expansion-panel /deep/ .v-expansion-panel__header:hover,
.parcels .v-table td:hover {
  background: #F6F7E2;
}

.parcels .v-table {
  border-collapse: unset;

  tbody {
    tr:hover {
      background: #F6F7E2;
      cursor: pointer;
    }

    td, th {
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
  flex: 0 0 auto !important;

  h3 {
    font-weight: bold;
  }
}
</style>
