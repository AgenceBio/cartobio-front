<template>
  <v-card>
      <v-card-title primary-title class="color-title"><div class="headline">Tableau récapitulatif des parcelles</div></v-card-title>
      <v-card-text><v-data-table flat :headers="headers" :items="parcelsArray">
    <template v-slot:items="props">
      <td>{{props.item.id}}</td>
      <td>{{props.item.properties.numerobio}}</td>
      <td>{{props.item.properties.numeroPacage}}</td>
      <td>{{props.item.properties.agroforest}}</td>
      <td>{{props.item.properties.bioboolean}}</td>
      <td>{{props.item.properties.codecultu}}</td>
      <td>{{props.item.properties.engagement}}</td>
      <td>{{props.item.properties.maraichage}}</td>
      <td>{{props.item.properties.numilot}}</td>
      <td>{{props.item.properties.numparcel}}</td>
      <td>{{props.item.properties.surfadm}}</td>
      <td>{{props.item.properties.surfgeo}}</td>
    </template>
  </v-data-table></v-card-text>
  <v-card-actions>
      <v-spacer></v-spacer>
            <v-btn round color="" class="mb-0" @click="$emit('close-dialog')">
              Fermer
            </v-btn>
            <v-btn round color="#b9d065" class="mb-0" @click="$emit('download-csv')">
              Télécharger
            </v-btn><v-spacer></v-spacer></v-card-actions></v-card>
</template>

<script>
export default {
  name: "ParcelsArray",
  props: { parcelsArray: Array },
  data() {
    return {
      headers: [
        {
          text: "id",
          value: "id"
        },
        {
          text: "numeroBio",
          value: "numeroBio"
        },
        {
          text: "numeroPacage",
          value: "numeroPacage"
        },
        {
          text: "agroforest",
          value: "agroforest"
        },

        {
          text: "estBio",
          value: "estBio"
        },

        {
          text: "codeCulture",
          value: "codeCulture"
        },

        {
          text: "engagement",
          value: "engagement"
        },

        {
          text: "maraichage",
          value: "maraichage"
        },

        {
          text: "numeroIlot",
          value: "numeroIlot"
        },
        {
          text: "numeroParcelle",
          value: "numeroParcelle"
        },

        {
          text: "surfaceAdmissible",
          value: "surfaceAdmissible"
        },
        {
          text: "surfaceGeometrique",
          value: "surfaceGeometrique"
        }
      ]
    };
  },
  watch: {
      parcelsArray: function(newVal) {
          console.log(newVal);
      }
  }
};
</script>
<style scoped>
    .color-title {
        background-color: #457382;
        color: white;
    }
</style>