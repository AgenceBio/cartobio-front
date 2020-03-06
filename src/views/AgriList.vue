<template>
  <v-layout class="agriList" column>
    <FilterToolbar :filters="filters" v-on:update-filters="updateAgriList($event)"></FilterToolbar>
    <v-divider></v-divider>
    <h1 class="mx-5">Liste des opérateurs</h1>
    <v-container fluid>
      <v-data-table :headers="headers" :items="notificationList">
        <template v-slot:items="props">
          <AgriItem :agriData.sync="props.item" :selectedOperator.sync="selectedOperatorData"></AgriItem>
        </template>
      </v-data-table>

      <v-card>
        <v-card-text>
          L'opérateur recherché n'est pas dans la liste ?
          Essayez avec un numéro de Pacage:
        </v-card-text>
        <v-card-actions>
          <v-text-field v-model="numPacage" label="numéro pacage" single-line counter></v-text-field>
          <v-btn flat color="blue" @click="searchPacage">Rechercher</v-btn>
        </v-card-actions>
      </v-card>
      <v-dialog v-model="loadingData" hide-overlay persistent width="300">
        <v-card color="#b9d065">
          <v-card-text>
            Chargement des données...
            <v-progress-linear indeterminate color="white" class="mb-0"></v-progress-linear>
          </v-card-text>
        </v-card>
      </v-dialog>
      <v-dialog v-model="showConfirmPopup" persistent width="300">
        <v-card>
          <v-card-text>Aller au parcellaire de {{selectedOperatorData.title}} ?</v-card-text>

          <v-card-actions>
            <v-btn @click="cancelSelectOperator()">Annuler</v-btn>
            <v-btn @click="selectOperator()">Confirmer</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
      <v-dialog v-model="showConfirmPacage" persistent width="300">
        <v-card>
          <v-card-text v-if="!errorPacage">
            {{selectedOperatorData.nbParcelles}} parcelles trouvées.
            Aller au parcellaire correspondant à {{selectedOperatorData.pacage}} ?
          </v-card-text>
          <v-card-text v-else-if="errorPacage">
            Une erreur est survenue
            <br />Veuillez vérifier le numéro de Pacage et réessayer svp.
          </v-card-text>
          <v-card-actions>
            <v-btn @click="showConfirmPacage = false">Annuler</v-btn>
            <v-btn @click="selectOperator()" v-if="!errorPacage">Confirmer</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
    </v-container>
  </v-layout>
</template>
<script>
const axios = require("axios");
const CancelToken = axios.CancelToken;
let cancel;

import AgriItem from "@/components/AgriItem";
import FilterToolbar from "@/components/FilterToolbar";
import _ from 'lodash';    

export default {
  name: "AgriList",
  components: {
    AgriItem,
    FilterToolbar
  },
  props: ["bus"],
  data: function() {
    return {
      // itemsPerPageOptions: [6, 12, 18],
      // itemsPerPage: 6,
      notificationList: [],
      loadingData: false,
      displayedNotifications: [],
      headers: [
        {
          text: "Nom de l'exploitation",
          align: "left",
          sortable: true,
          value: "title"
        },
        {
          text: "Date d'engagement",
          align: "right",
          sortable: true,
          value: "dateEngagement"
        },
        {
          text: "Numéro Pacage",
          align: "right",
          sortable: true,
          value: "numeroPacage"
        },
        {
          text: "Numéro Bio",
          align: "right",
          sortable: true,
          value: "numeroBio"
        },
        { text: "Gérant", align: "right", sortable: true, value: "gerant" }
      ],
      // numDisplayed: 51,
      // rowsPerPageItems: [6, 12, 18],
      // pagination: {
      //   rowsPerPage: 6
      // },
      filters: {
        name: "",
        pacage: "",
        numeroBio: "",
        numeroClient: "",
        department: "",
        city: ""
      },
      numPacage: "",
      selectedOperatorData: {},
      showConfirmPacage: false,
      errorPacage: false
    };
  },
  computed: {
    getProfile() {
      return this.$store.getters.getProfile;
    },
    showConfirmPopup() {
      return !!this.selectedOperatorData.title;
    }
  },
  created: function() {
    this.loadingData = true;
    this.$store.commit("setOperator", {}); // clear selected operator

    this.filters.department = _.get(
      this.getProfile,
      ["profile", "departements", "0"],
      26
    );
    this.getAgriList();
  },
  methods: {
    updateAgriList(newFilters) {
      this.filters = newFilters;
      if (this.filters.department === 1) {
        this.filters.department = undefined;
      }
      this.getAgriList();
    },
    getAgriList() {
      this.loadingData = true;
      this.getNotificationsList()
        .then(
          function(data) {
            this.notificationList = data.data;
            this.displayedNotifications = _.take(
              this.notificationList,
              this.numDisplayed
            );
            _.remove(this.notificationList, function(notif) {
              return !notif.numeroBio;
            });
          }.bind(this)
        )
        .then(() => (this.loadingData = false));
    },
    getNotificationsList: function() {
      let ocId = _.get(this.getProfile, "organismeCertificateurId");
      let filters = this.filters;
      let params = {
        oc: ocId,
        activites: 1,
        departementId: filters.department,
        nom: filters.name,
        pacage: filters.pacage,
        ville: filters.city,
        numeroClient: filters.numeroClient,
        numeroBio: filters.numeroBio
      };

      return axios.get(
        process.env.VUE_APP_NOTIFICATIONS_ENDPOINT + "/api/getOperatorsByOc",
        {
          params: params,
          cancelToken: new CancelToken(function executor(c) {
            // An executor function receives a cancel function as a parameter
            cancel = c;
          })
        }
      );
    },
    isProducteur: function(agriData) {
      // console.log(agriData);
      return _.find(agriData.activites, function(activite) {
        // console.log(activite.nom);
        return activite.nom === "Producteur";
      });
    },
    displayMore: function() {
      this.numDisplayed += 51;
      this.displayedNotifications = _.take(
        this.notificationList,
        this.numDisplayed
      );
    },
    selectOperator: function() {
      this.$store.commit("setOperator", this.selectedOperatorData);
      this.$router.push("map");
    },
    cancelSelectOperator: function() {
      this.selectedOperatorData = {};
      this.$store.commit("setOperator", this.selectedOperatorData);
    },
    searchPacage: function() {
      let params = {
        service: "WFS",
        version: "1.1.0",
        request: "GetFeature",
        outputFormat: "GeoJSON",
        typeName: "rpgbio2019v4",
        srsname: "4326",
        filter: '{"pacage":"' + this.numPacage + '"}'
      };
      this.selectedOperatorData = { pacage: this.numPacage, nbParcelles: "" };
      let tokenCollab = btoa(
        process.env.VUE_APP_ESPACE_COLLAB_LOGIN +
          ":" +
          process.env.VUE_APP_ESPACE_COLLAB_PASSWORD
      );
      this.loadingData = true;
      // get 2019 parcels from the operator
      axios
        .get(process.env.VUE_APP_COLLABORATIF_ENDPOINT + "/gcms/wfs/cartobio", {
          params: params,
          headers: {
            Authorization: "Basic " + tokenCollab
          }
        })
        .then(data => this.displayResultSearchPacage(data.data))
        .catch(() => (this.errorPacage = true));
    },
    displayResultSearchPacage: function(data) {
      this.loadingData = false;
      if (data.features.length === 1000) {
        this.errorPacage = true;
      } else {
        this.selectedOperatorData.nbParcelles = data.features.length;
      }
      this.showConfirmPacage = true;
    }
  },
  beforeDestroy: function() {
    cancel("Operation canceled by the user.");
  }
};
</script>
<style lang="scss">
.agriList {
  top: 64px;
  position: relative;
  height: calc(100% - 64px);
}
</style>
