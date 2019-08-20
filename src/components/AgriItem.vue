<template>
  <v-card tile>
    <v-card-title
      v-bind:class="{'green lighten-3': agriData.numeroPacage, 'red lighten-3': !agriData.numeroPacage}"
    >{{title}}</v-card-title>
    <v-card-text>
      <v-list>
        <v-list-tile>Date d'engagement : {{agriData.dateEngagement}}</v-list-tile>
        <v-list-tile>Numéro Pacage : {{agriData.numeroPacage}}</v-list-tile>
        <!-- <v-list-tile>
          Activités :
          <v-list>
            <v-list-tile
              v-for="activite in agriData.activites"
              v-bind:key="activite.id"
            >{{activite.nom}}</v-list-tile>
          </v-list>
        </v-list-tile>-->
        <v-list-tile>Gérant : {{agriData.gerant}}</v-list-tile>
        <!-- <v-list-tile>{{}}</v-list-tile> -->
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
    console.log("hi ? ");
    console.log(this.agriData);
  },
  methods: {
    getOperatorName: agriData => {
      console.log(agriData);
      let user = _.find(agriData.utilisateurs, function(u) {
        return u.nom;
      });
      return user.nom + " " + user.prenom;
    }
  },
  computed: {
    title() {
      return this.agriData.denominationCourante
        ? this.agriData.denominationCourante
        : this.agriData.nom
        ? this.agriData.nom
        : this.agriData.gerant
        ? this.agriData.gerant
        : this.getOperatorName(this.agriData);
    }
  }
};
</script>
