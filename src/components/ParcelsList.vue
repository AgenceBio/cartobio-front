<template>
  <div>
    <!-- download parcels button -->
    <v-divider></v-divider>
    <v-btn color="info" block @click="downloadCSV">
      <v-icon>save_alt</v-icon>
      <span>Télécharger Parcelles - csv</span>
    </v-btn>
    <v-divider></v-divider>
    
    <v-btn color="info" @click="$emit('start-parcel-creation')">
      <v-icon>add</v-icon>
      <span>Créer Nouvelle Parcelle</span>
    </v-btn>

    <v-list class="pt-0" dense>
      <v-divider></v-divider>
      <v-list-tile>
        <v-list-tile-action>
          <v-flex>
            <v-checkbox v-model="allSelected" label="Sélectionner tout"></v-checkbox>
            <!-- <v-btn flat>
            <v-icon>delete</v-icon>Abandonner sélection
            </v-btn>-->
          </v-flex>
        </v-list-tile-action>
      </v-list-tile>
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
    </v-list>
  </div>
</template>
<script>
import _ from 'lodash';    
export default {
  name: "ParcelsList",
  props: {
    parcels: Object
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
      let rows = _.map(this.parcels.features, this.createParcelArray);
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
        _.get(prop, "id", ""),
        prop.numerobio,
        _.get(prop, "pacage", ""),
        _.get(prop, "maraichage", ""),
        prop.bio,
        prop.codecultu,
        prop.engagement,
        _.get(prop, "maraichage", ""),
        prop.numilot,
        prop.numparcel,
        _.get(prop, "surfadm", ""),
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
    // checkbox() {
    //   return _.every(this.parcels.features, function(parcel) {
    //     return parcel.properties.selected;
    //   });
    // },
    ilots() {
      // first reduce to group parcels by ilots
      let reduced = _.reduce(
        this.parcels.features,
        function(result, parcel) {
          let numIlot = _.get(parcel, ["properties", "numilot"]);
          result[numIlot]
            ? result[numIlot].push(parcel)
            : (result[numIlot] = [parcel]);
          return result;
        },
        {}
      );
      // then put them into an array with easily accessible ilot number
      let ilots = _.reduce(
        reduced,
        function(result, value, key) {
          result.push({ numIlot: key, parcels: value });
          return result;
        },
        []
      );
      return ilots;
    }
  }
};
</script>
<style lang="scss" scoped>
</style>

