<template>
  <tr>
    <th class="text-xs-left">{{newAgriData.title}}</th>
    <td class="text-xs-right">{{newAgriData.dateEngagement}}</td>
    <td class="text-xs-right">{{newAgriData.numeroPacage}}</td>
    <td class="text-xs-right">{{newAgriData.numeroBio}}</td>
    <td class="text-xs-right">{{newAgriData.gerant}}</td>
    <td class="text-xs-right">
      <v-btn v-if="newAgriData.numeroPacage && viewable" @click="selectOperator()" class="primary">
        <v-icon left>map</v-icon>
        Aller au parcellaire
      </v-btn>

      <span v-if="newAgriData.numeroPacage && !viewable" class="blue-grey--text lighten-3--text">
        <v-icon small color="green darken-1">info</v-icon>
        Parcellaire disponible au <b>15 juillet</b>.
      </span>
    </td>
  </tr>
</template>
<script>
import getObjectValue from 'lodash/get';

export default {
  name: "AgriItem",
  props: ["agriData", "selectedOperator"],
  methods: {
    selectOperator: function() {
      this.$emit("update:selectedOperator", this.newAgriData);
    },
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
    getOperatorName: agriData => {
      let user = getObjectValue(agriData, "utilisateurs", []).find(function(u) {
        return u.nom;
      });
      return getObjectValue(user, "nom", "") + " " + getObjectValue(user, "prenom", "");
    },

    viewable () {
      const engagement = new Date(this.agriData.dateEngagement)
      const now = new Date()
      const currentYear = now.getFullYear()
      const previousYear = currentYear - 1

      const previousYearPacLimit = new Date(`${previousYear}-05-15`)
      const previousYearPacData = new Date(`${previousYear}-07-01`)
      const currentYearPacData = new Date(`${currentYear}-07-01`)

      const hasPacDataAvailable = (
        // engagé l'an dernier, et qu'on est après la date de publication des données
        (engagement < previousYearPacLimit && now > previousYearPacData) ||
        // engagé après l'an dernier, et qu'on est après la date de publication de cette année
        (engagement > previousYearPacLimit && now > currentYearPacData) ||
        false
      )

      return this.agriData.numeroPacage && hasPacDataAvailable
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
.help {
  cursor: help;
}
</style>
