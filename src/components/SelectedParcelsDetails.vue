<template>
  <v-card>
    <v-card-title>
      <div>
        <div>
          Détails de la sélection:
          <v-icon class="icon-expand" @click="showList=!showList" v-if="!showList">expand_more</v-icon>
          <v-icon class="icon-expand" @click="showList=!showList" v-if="showList">expand_less</v-icon>
        </div>

        <span class="grey--text">Nb Parcelles : {{selectedParcels.length}}</span>
      </div>
    </v-card-title>
    <v-list v-show="showList">
      <v-list-tile v-for="(surface, culture) in culturList" :key="culture">
        <v-list-tile-title>{{culture}} : {{surface}} ha</v-list-tile-title>
      </v-list-tile>
    </v-list>
    <v-card-actions>
      <v-btn flat color="blue" @click="downloadCSV">
        <v-icon>save_alt</v-icon>
        <span>Télécharger La Sélection - csv</span>
      </v-btn>
    </v-card-actions>
  </v-card>
</template>

<script>
import getObjectValue from 'lodash/get';
export default {
  name: "SelectedParcelsDetails",
  props: {
    selectedParcels: {}
  },
  data() {
    return {
      showList: true,
      cultures: this.culturList
    };
  },
  created: function() {
    // console.log(this.culturList);
  },
  computed: {
    culturList() {
      let list = {};
      this.selectedParcels.forEach(function(parcel) {
        let surf = parcel.properties.surfadm
          ? parcel.properties.surfadm
          : parcel.properties.surfgeo / 10000;
        list[parcel.properties.codecultu]
          ? (list[parcel.properties.codecultu] += parseFloat(surf))
          : (list[parcel.properties.codecultu] = parseFloat(surf));
      });
      return list;
      //   this.cultures = list;
      //   return list;
    }
  },
  methods: {
    downloadCSV() {
      // since map and foreach doesn't guarantee order, we need to guaranty it ourselves:
      let rows = this.selectedParcels.map(this.createParcelArray);
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
      this.convertToCsvAndDownload(
        this.$store.getters.getOperator.title + ".csv",
        rows
      );
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
  }
};
</script>
<style lang="scss" scoped>
.icon-expand {
  position: absolute;
  right: 10px;
}
</style>
