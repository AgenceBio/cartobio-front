<template>
  <v-layout class="agriList" column>
    <FilterToolbar :filters="filters" v-on:update-filters="updateAgriList($event)"></FilterToolbar>
    <v-divider></v-divider>
    <h1 class="mx-5">Liste des opérateurs</h1>
    <v-container fluid>
      <v-data-table :headers="headers" :items="notificationList" :rows-per-page-items=rowsPerPageItems>
        <template v-slot:items="props">
          <AgriItem :agriData.sync="props.item" :selectedOperator.sync="selectedOperatorData"></AgriItem>
        </template>
      </v-data-table>
    </v-container>

    <h1 class="mx-5">Recherche par numéro Pacage</h1>

    <v-container fluid>
      <v-card>
        <form @submit="searchPacage">
        <v-card-text>
          L'opérateur recherché n'est pas dans la liste ?
          Essayez avec un numéro de Pacage:
        </v-card-text>
        <v-card-actions>
          <v-text-field v-model="numPacage" label="numéro pacage" single-line counter></v-text-field>
          <v-btn flat type="submit" color="blue" @click="searchPacage">Rechercher</v-btn>
        </v-card-actions>
      </form>
      </v-card>
      <v-dialog v-model="loadingData" hide-overlay persistent width="300">
        <v-card color="#b9d065">
          <v-card-text>
            Chargement des données...
            <v-progress-linear indeterminate color="white" class="mb-0"></v-progress-linear>
          </v-card-text>
        </v-card>
      </v-dialog>
      <v-dialog v-model="showConfirmPacage" persistent width="300">
        <v-card>
          <v-card-text v-if="!errorPacage">
            {{selectedOperatorData.nbParcelles}} parcelles trouvées.
            Aller au parcellaire correspondant à {{selectedOperatorData.numeroPacage}} ?
          </v-card-text>
          <v-card-text v-else-if="errorPacage">
            Une erreur est survenue
            <br />Veuillez vérifier le numéro de Pacage et réessayer svp.
          </v-card-text>
          <v-card-actions>
            <v-btn flat @click="showConfirmPacage = false">Annuler</v-btn>
            <v-spacer></v-spacer>
            <v-btn class="primary" @click="selectOperator()" v-if="!errorPacage">Confirmer</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
    </v-container>
  </v-layout>
</template>
<script>
import { get, CancelToken } from "axios";
let cancel;

import AgriItem from "@/components/AgriItem";
import FilterToolbar from "@/components/FilterToolbar";
import getObjectValue from 'lodash/get';
import remove from 'lodash/remove';
import take from 'lodash/take';

export default {
  name: "AgriList",
  components: {
    AgriItem,
    FilterToolbar
  },
  props: ["bus"],
  data: function() {
    return {
      rowsPerPageItems: [20, 50, 100, {text: "Tout", value: -1}],
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
        {
          text: "Gérant·e",
          align: "right",
          sortable: false,
          value: "gerant"
        },
        {
          text: "Actions",
          align: "right",
          sortable: false,
        }
      ],
      filters: {
        name: "",
        pacage: "",
        numeroBio: "",
        numeroClient: "",
        department: 1,
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
  },
  created: function() {
    this.loadingData = true;
    this.$store.commit("operator/CLEAR_CURRENT");
    this.filters.department = getObjectValue(
      this.getProfile,
      ["profile", "departements", "0"],
      this.filters.department
    );
    this.getAgriList();
  },
  methods: {
    updateAgriList(newFilters) {
      this.filters = newFilters;

      this.getAgriList().then(() => {
        window._paq.push(['trackSiteSearch', JSON.stringify(newFilters), 'operators', this.notificationList.length])
      })
    },
    getAgriList() {
      this.loadingData = true;

      return this.getNotificationsList()
        .then((data) => {
          this.notificationList = data.data;
          this.displayedNotifications = take(
            this.notificationList,
            this.numDisplayed
          );
          remove(this.notificationList, function(notif) {
            return !notif.numeroBio;
          });
        })
      .then(() => (this.loadingData = false));
    },
    getNotificationsList: function() {
      let ocId = getObjectValue(this.getProfile, "organismeCertificateurId");
      let filters = this.filters;
      let params = {
        oc: ocId,
        activites: 1,
        departementId: filters.department === 1 ? null : filters.department,
        nom: filters.name,
        pacage: filters.pacage,
        ville: filters.city,
        numeroClient: filters.numeroClient,
        numeroBio: filters.numeroBio
      };

      return get(
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
      return agriData.activites.find(function(activite) {
        // console.log(activite.nom);
        return activite.nom === "Producteur";
      });
    },
    selectOperator: function() {
      // event: category, action, value
      const {numeroBio, numeroPacage:pacageId} = this.selectedOperatorData;
      window._paq.push(['trackEvent', 'parcels', 'display-on-map', numeroBio]);

      this.$store.commit("operators/SET_CURRENT", numeroBio);
      this.$router.push({
        name: pacageId ? 'mapWithOperator' : 'map',
        params: {pacageId, numeroBio}
      });
    },
    cancelSelectOperator: function() {
      // event: category, action, value
      window._paq.push(['trackEvent', 'parcels', 'cancel:display-on-map']);
      this.selectedOperatorData = {};
      this.$store.commit("operators/CLEAR_CURRENT");
    },
    searchPacage: function() {
      let params = {
        service: "WFS",
        version: "1.1.0",
        request: "GetFeature",
        outputFormat: "GeoJSON",
        typeName: "rpgbio2020v1",
        srsname: "4326",
        filter: '{"pacage":"' + this.numPacage + '"}'
      };
      this.selectedOperatorData = { numeroPacage: this.numPacage, nbParcelles: "" };
      this.loadingData = true;
      // get 2020 parcels from the operator
      get(process.env.VUE_APP_COLLABORATIF_ENDPOINT + "/gcms/wfs/cartobio", { params })
      .then(data => {
        window._paq.push(['trackEvent', 'pacage', 'search', this.numPacage]);
        window._paq.push(['trackSiteSearch', this.numPacage, 'pacage', data.data.features.length]);
        this.displayResultSearchPacage(data.data);
      })
      .catch((error) => {
        window._paq.push(['trackEvent', 'pacage', 'error:search', error]);
        this.errorPacage = true;
      });
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
  },

  watch: {
    selectedOperatorData (newData, oldData) {
      if (newData.title && newData.title !== oldData.title) {
        this.selectOperator()
      }
    }
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
