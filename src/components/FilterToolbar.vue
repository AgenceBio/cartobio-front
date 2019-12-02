<template>
  <div>
    <v-toolbar flat>
      <v-toolbar-title>Filtres:</v-toolbar-title>
      <span class="ml-3">{{activeFiltersText}}</span>
      <v-spacer></v-spacer>
      <v-btn @click="displayFiltersDialog=true">
        <v-icon>filter_list</v-icon>
        {{textAddEditButton}}
      </v-btn>
    </v-toolbar>
    <v-dialog v-model="displayFiltersDialog">
      <v-card>
        <v-card-title>
          <div>
            <h3>Filtrer les opérateurs</h3>
          </div>
        </v-card-title>
        <v-card-text>
          <v-container>
            <v-layout
              row
              wrap
              class="filters-list"
              v-on:keyup.enter="applyFilters()"
              v-on:keyup.esc="displayFiltersDialog=false"
            >
              <v-flex xs12 sm6 md3>
                <v-text-field label="Nom" v-model="tempFilters.lastName" class="mx-2"></v-text-field>
              </v-flex>
              <v-flex xs12 sm6 md3>
                <v-text-field label="Prénom" v-model="tempFilters.firstName" class="mx-2"></v-text-field>
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
                <v-text-field label="Département" v-model="tempFilters.department" class="mx-2"></v-text-field>
              </v-flex>
              <v-flex xs12 sm6 md3>
                <v-text-field label="Ville" v-model="tempFilters.city" class="mx-2"></v-text-field>
              </v-flex>
            </v-layout>
          </v-container>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="error" @click="removeFilters()">
            <v-icon>delete</v-icon>Supprimer les filtres
          </v-btn>
          <v-btn color="primary" type="submit" @click="applyFilters()">
            <v-icon>add_box</v-icon>Appliquer les filtres
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
export default {
  name: "FilterToolbar",
  props: ["filters"],
  data: function() {
    return {
      displayFiltersDialog: false,
      tempFilters: JSON.parse(JSON.stringify(this.filters)), // not a circular object
      haveFilter: false
    };
  },
  computed: {
    activeFiltersText() {
      let text = "";
      this.haveFilter = false;
      if (this.filters.lastName.length) {
        text += " Nom : " + this.filters.lastName;
        this.haveFilter = true;
      }
      if (this.filters.firstName.length) {
        this.haveFilter ? (text += " -") : null;
        text += " Prénom : " + this.filters.firstName;
        this.haveFilter = true;
      }
      if (this.filters.pacage.length) {
        this.haveFilter ? (text += " -") : null;
        text += " Pacage : " + this.filters.pacage;
        this.haveFilter = true;
      }
      if (this.filters.numeroBio.length) {
        this.haveFilter ? (text += " -") : null;
        text += " Numéro Bio : " + this.filters.numeroBio;
        this.haveFilter = true;
      }
      if (this.filters.numeroClient.length) {
        this.haveFilter ? (text += " -") : null;
        text += " Numéro Client : " + this.filters.numeroClient;
        this.haveFilter = true;
      }
      if (this.filters.department.length) {
        this.haveFilter ? (text += " -") : null;
        text += " Département : " + this.filters.department;
        this.haveFilter = true;
      }
      if (this.filters.city.length) {
        this.haveFilter ? (text += " -") : null;
        text += " Ville : " + this.filters.city;
        this.haveFilter = true;
      }
      return text;
    },
    textAddEditButton() {
      if (!this.haveFilter) {
        return "Ajouter des filtres";
      } else {
        return "Modifier les filtres";
      }
    }
  },
  methods: {
    applyFilters() {
      this.$emit("update-filters", this.tempFilters);
      this.displayFiltersDialog = false;
    },
    removeFilters() {
      this.tempFilters = {
        firstName: "",
        lastName: "",
        pacage: "",
        numeroBio: "",
        numeroClient: "",
        department: "26",
        city: ""
      };
      this.$emit("update-filters", this.tempFilters);
      this.displayFiltersDialog = false;
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