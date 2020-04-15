<template>
  <div>
    <v-navigation-drawer
      app
      clipped
      stateless
      hide-overlay
      v-model="drawer"
      
    >
    <v-layout column fill-height justify-space-between align-space-between>
      <!-- Header -->
      <v-toolbar flat color="#00838F" class="sticky sticky-top">
        <v-toolbar-title>{{operator.title}}</v-toolbar-title>
      </v-toolbar>

      <!-- <v-list class="pt-0" dense>
        <v-divider></v-divider>
        <v-list-group v-for="(ilot, i) in ilots" :key="i">
          <template v-slot:activator>
            <v-list-tile>
              <v-list-tile-content
                @mouseover="$emit('hover-ilot', ilot)"
                @mouseleave="$emit('stop-hovering-ilot', ilot)"
              >
                <v-list-tile-title>Ilot {{ilot.numIlot}}</v-list-tile-title>
              </v-list-tile-content>
            </v-list-tile>
          </template>
          <v-list-tile v-for="(parcel, j) in ilot.parcels" :key="j">
            <v-list-tile-action
              @mouseover="$emit('hover-parcel', parcel)"
              @mouseleave="$emit('stop-hovering', parcel)"
            >
              <v-icon @click="selectParcel(parcel)" v-if="!parcel.properties.selected">star_border</v-icon>
              <v-icon
                color="blue"
                @click="selectParcel(parcel)"
                v-if="parcel.properties.selected"
              >star</v-icon>
            </v-list-tile-action>
            <v-list-tile-content
              @mouseover="$emit('hover-parcel', parcel)"
              @mouseleave="$emit('stop-hovering', parcel)"
            >
              <v-list-tile-title>Parcelle {{parcel.properties.numparcel}}</v-list-tile-title>
            </v-list-tile-content>
          </v-list-tile>
        </v-list-group>
      </v-list> -->

      <v-expansion-panel v-model="panel" class="justify-self-start overflow"
        expand>
        
      <v-divider></v-divider>
        <v-expansion-panel-content
          v-for="(ilot, i) in ilots"
          :key="i"
        >
        <template v-slot:header>
            <div>Ilot {{ilot.numIlot}}</div>
          </template>
          <v-list class="pt-0" dense>
            <v-list-tile v-for="(parcel, j) in ilot.parcels" :key="j">
            <v-list-tile-action
              @mouseover="$emit('hover-parcel', parcel)"
              @mouseleave="$emit('stop-hovering', parcel)"
            >
              <v-icon @click="selectParcel(parcel)" v-if="!parcel.properties.selected">star_border</v-icon>
              <v-icon
                color="blue"
                @click="selectParcel(parcel)"
                v-if="parcel.properties.selected"
              >star</v-icon>
            </v-list-tile-action>
            <v-list-tile-content
              @mouseover="$emit('hover-parcel', parcel)"
              @mouseleave="$emit('stop-hovering', parcel)"
            >
              <v-list-tile-title>Parcelle {{parcel.properties.numparcel}}</v-list-tile-title>
            </v-list-tile-content>
          </v-list-tile>
          </v-list>
        </v-expansion-panel-content>
      </v-expansion-panel>
      <!-- download parcels button -->
      <div class="justify-self-end">
        <v-card>
        <v-divider></v-divider>
        <v-card-subtitle>
          Export des données parcellaires
        </v-card-subtitle>
        <v-btn color="#b9d065" @click="downloadCSV">
          <span>Télécharger parcellaire</span>
        </v-btn></v-card>
      </div>
    </v-layout>
    
    </v-navigation-drawer>
  </div>
</template>
<script>
import getObjectValue from 'lodash/get';
import reduce from 'lodash/reduce';

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
      // first reduce to group parcels by ilots
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
      // then put them into an array with easily accessible ilot number
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
    panel() {
      let expandedArr = [];
      this.ilots.forEach(() => {
        expandedArr.push(true);
      });
      console.log(expandedArr);
      return expandedArr;
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
.overflow {
  overflow-y: auto;
}
</style>
