<template>
  <v-card tile>
    <v-card-title
      v-bind:class="{'green lighten-3': numeroPacage, 'red lighten-3': !numeroPacage}"
    >{{agriData.operateur.nom}}</v-card-title>
    <v-card-text>
      <v-list>
        <v-list-tile>Numéro Client : {{agriData.numeroClient}}</v-list-tile>
        <v-list-tile>Numéro Pacage : {{numeroPacage}}</v-list-tile>
        <v-list-tile>
          Activités :
          <v-list>
            <v-list-tile
              v-for="activite in agriData.activites"
              v-bind:key="activite.id"
            >{{activite.nom}}</v-list-tile>
          </v-list>
        </v-list-tile>
        <!-- <v-list-tile>{{}}</v-list-tile>
        <v-list-tile>{{}}</v-list-tile>-->
      </v-list>
    </v-card-text>
  </v-card>
</template>
<script>
const axios = require("axios");
export default {
  name: "AgriItem",
  components: {},
  props: ["agriData"],
  created: function() {
    console.log(this.agriData);
  },
  computed: {
    numeroPacage() {
      return this.agriData.operateur.numeroPacage;
    }
  }
};
</script>
