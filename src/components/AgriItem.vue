<template>
  <!-- <v-card tile @click="selectOperator()" class="clickable-card">
    <v-card-title
      v-bind:class="{'green lighten-3': newAgriData.numeroPacage, 'red lighten-3': !newAgriData.numeroPacage}"
    >{{newAgriData.title}}</v-card-title>
    <v-card-text>
      <v-list>
        <v-list-tile>Date d'engagement : {{newAgriData.dateEngagement}}</v-list-tile>
        <v-list-tile>Numéro Pacage : {{newAgriData.numeroPacage}}</v-list-tile>
        <v-list-tile>Numéro Bio : {{newAgriData.numeroBio}}</v-list-tile>
        <v-list-tile>Gérant : {{newAgriData.gerant}}</v-list-tile>
      </v-list>
    </v-card-text>
  </v-card>-->
  <tr @click="selectOperator()">
    <td>{{newAgriData.title}}</td>
    <td class="text-xs-right">{{newAgriData.dateEngagement}}</td>
    <td class="text-xs-right">{{newAgriData.numeroPacage}}</td>
    <td class="text-xs-right">{{newAgriData.numeroBio}}</td>
    <td class="text-xs-right">{{newAgriData.gerant}}</td>
  </tr>
</template>
<script>

import _ from 'lodash';    

export default {
  name: "AgriItem",
  props: ["agriData", "selectedOperator"],
  methods: {
    selectOperator: function() {
      this.$emit("update:selectedOperator", this.newAgriData);
      // this.selectedOperator = this.agriData;
      // this.$store.commit("setOperator", this.agriData);
    },
    getOperatorName: agriData => {
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
    },
    newAgriData() {
      let data = this.agriData;
      data.title = this.title;
      return data;
    }
  }
};
</script>
<style lang="scss" scoped>
tr {
  cursor: pointer;
}
</style>
