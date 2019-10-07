<template>
  <v-layout class="agriList">
    <v-container fluid>
      <v-data-iterator
        content-tag="v-layout"
        row
        wrap
        :items="notificationList"
        :rows-per-page-items="rowsPerPageItems"
        :pagination.sync="pagination"
        no-data-text="Please select a product from the left hand menu to compare."
      >
        <v-flex slot="item" slot-scope="props" xs4 pa-4>
          <!-- <v-flex>
          <v-card>
            <v-container v-bind="{ [`grid-list-xl`]: true }" fluid>
          <v-layout row wrap>-->
          <!-- <v-flex v-for="item in displayedNotifications" :key="item.id" xs4 pa-4> -->
          <AgriItem :agriData.sync="props.item" :selectedOperator.sync="selectedOperatorData"></AgriItem>
          <!-- </v-flex> -->
          <!-- </v-layout> -->
          <!-- <v-layout row wrap centered>
                <v-btn
                  color="primary"
                  @click="displayMore()"
                  v-if="displayedNotifications.length !== notificationList.length"
                >Voir plus</v-btn>
              </v-layout>
          </v-container>-->
          <!-- </v-card>
          </v-flex>-->
        </v-flex>
      </v-data-iterator>
      <v-dialog v-model="loadingData" hide-overlay persistent width="300">
        <v-card color="#b9d065">
          <v-card-text>
            Chargement des données...
            <br />Cela peut prendre plusieurs minutes.
            <br />Ce sera amélioré dans les futures versions de l'outil.
            <v-progress-linear indeterminate color="white" class="mb-0"></v-progress-linear>
          </v-card-text>
        </v-card>
      </v-dialog>
      <v-dialog v-model="showConfirmPopup" hide-overlay persistent width="300">
        <v-card>
          <v-card-text>
            Aller au parcellaire de {{selectedOperatorData.title}}
            <br />Ce sera amélioré dans les futures versions de l'outil.
          </v-card-text>
          <v-card-actions>
            <v-btn @click="cancelSelectOperator()">Annuler</v-btn>
            <v-btn @click="selectOperator()">Confirmer</v-btn>
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

export default {
  name: "AgriList",
  components: {
    AgriItem
  },
  props: ["bus"],
  methods: {},
  data: function() {
    return {
      itemsPerPageOptions: [6, 12, 18],
      itemsPerPage: 6,
      notificationList: [],
      loadingData: false,
      displayedNotifications: [],
      numDisplayed: 51,
      rowsPerPageItems: [6, 12, 18],
      pagination: {
        rowsPerPage: 6
      },
      selectedOperatorData: {}
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

    this.getNotificationsList(
      _.get(this.getProfile, "organismeCertificateurId")
    )
      .then(
        function(data) {
          console.log("hello ?");
          this.notificationList = data.data;
          this.displayedNotifications = _.take(
            this.notificationList,
            this.numDisplayed
          );
          console.log(this.notificationList);
          _.remove(this.notificationList, function(notif) {
            return !notif.numeroBio;
          });
        }.bind(this)
        // .filter(
        //   this.isProducteur
        // )
      )
      .then(() => (this.loadingData = false));
  },
  methods: {
    getNotificationsList: function(ocId) {
      let params = {
        oc: ocId,
        activites: 1,
        departementId: 26
      };

      return axios.get(
        "https://preprod-notifications.agencebio.org:444/api/getOperatorsByOc",
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
      console.log(this.selectedOperatorData);
      this.$store.commit("setOperator", this.selectedOperatorData);
      this.$router.push("map");
    },
    cancelSelectOperator: function() {
      this.selectedOperatorData = {};
      this.$store.commit("setOperator", this.selectedOperatorData);
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
