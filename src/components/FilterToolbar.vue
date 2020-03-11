<template>
  <div d-inline-flex>
    <form @submit="applyFilters()">
      <v-layout>
        <h3 class="mx-2 my-auto">Filtres:</h3>
        <v-flex xs12 sm6 md3>
          <v-text-field body-1 label="Nom" v-model="tempFilters.name" class="mx-2"></v-text-field>
        </v-flex>
        <v-flex xs12 sm6 md3>
          <v-text-field label="PACAGE" v-model="tempFilters.pacage" class="mx-2"></v-text-field>
        </v-flex>
        <v-flex xs12 sm6 md3>
          <v-text-field label="Numéro Bio" v-model="tempFilters.numeroBio" class="mx-2"></v-text-field>
        </v-flex>
        <v-flex xs12 sm6 md3>
          <v-text-field label="Numéro Client" v-model="tempFilters.numeroClient" class="mx-2"></v-text-field>
        </v-flex>
        <v-flex xs12 sm6 md3>
          <v-autocomplete
            v-model="tempFilters.department"
            label="Département"
            :items="departmentList"
            item-text="label"
            item-value="id"
            class="mx-2"
          ></v-autocomplete>
        </v-flex>
        <v-flex xs12 sm6 md3>
          <v-text-field label="Ville" v-model="tempFilters.city" class="mx-2"></v-text-field>
        </v-flex>
        <v-btn class="mx-2 my-auto" type="submit" color="primary" @click="applyFilters()">
          <v-icon>search</v-icon> Appliquer les filtres
        </v-btn>
        <v-btn
          class="mx-2 my-auto"
          color="error"
          @click="removeFilters()"
          tooltip="Réinitialiser les filtres"
        >
          <v-icon>highlight_off</v-icon>
        </v-btn>
    </v-layout>
  </form>
  </div>
</template>

<script>
const axios = require("axios");
import _ from 'lodash';    
export default {
  name: "FilterToolbar",
  props: ["filters"],
  data: function() {
    return {
      displayFiltersDialog: false,
      tempFilters: JSON.parse(JSON.stringify(this.filters)), // not a circular object
      haveFilter: false,
      departmentList: []
    };
  },
  computed: {
    textAddEditButton() {
      if (!this.haveFilter) {
        return "Ajouter des filtres";
      } else {
        return "Modifier les filtres";
      }
    }
  },
  created() {
    this.getDepartements();
  },
  methods: {
    applyFilters() {
      // event: category, action, value
      window._paq.push(['trackEvent', 'operators', 'search', JSON.stringify(this.tempFilters)]);
      this.$emit("update-filters", this.tempFilters);
      this.displayFiltersDialog = false;
    },
    removeFilters() {
      this.tempFilters = {
        name: "",
        pacage: "",
        numeroBio: "",
        numeroClient: "",
        department: 26,
        city: ""
      };
      this.$emit("update-filters", this.tempFilters);
      this.displayFiltersDialog = false;
    },
    getDepartements: function() {
      return axios
        .get(
          process.env.VUE_APP_NOTIFICATIONS_ENDPOINT + "/portail/departements"
        )
        .then(
          function(data) {
            let departements = data.data;
            _.forEach(departements, function(item) {
              item.label =
                item.nom + (item.codePostal ? " - " + item.codePostal : "");
            });
            this.departmentList = _.sortBy(departements, "codePostal");
          }.bind(this),
          function(error) {
            console.error(error);
          }
        );
    }
  }
};
</script>
<style lang="scss" scoped>
// .filters-list {
//   .v-input {
//     margin: 0 10px;
//   }
// }
// span {
//   margin: 0 30px;
// }
</style>