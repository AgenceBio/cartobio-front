<template>
  <v-layout class="agriList">
    <v-flex>
      <v-card>
        <v-container v-bind="{ [`grid-list-xl`]: true }" fluid>
          <v-layout row wrap>
            <v-flex v-for="item in notificationList" :key="item.id" xs4 pa-4>
              <AgriItem :agriData="item"></AgriItem>
            </v-flex>
          </v-layout>
        </v-container>
      </v-card>
    </v-flex>
    <v-dialog v-model="loadingData" hide-overlay persistent width="300">
      <v-card color="#b9d065">
        <v-card-text>
          Chargement des données...
          <br>Cela peut prendre plusieurs minutes.
          <br>Ce sera amélioré dans les futures versions de l'outil.
          <v-progress-linear indeterminate color="white" class="mb-0"></v-progress-linear>
        </v-card-text>
      </v-card>
    </v-dialog>
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
      notificationList: [],
      loadingData: false
    };
  },
  computed: {
    getProfile() {
      return this.$store.getters.getProfile;
    }
  },
  created: function() {
    this.loadingData = true;
    this.getNotificationsList(
      _.get(this.getProfile, "organismeCertificateurId")
    )
      .then(
        data =>
          (this.notificationList = _.take(data.data, 50).filter(
            this.isProducteur
          ))
      )
      .then(() => (this.loadingData = false));
  },
  methods: {
    getNotificationsList: function(ocId) {
      return axios.get(
        "https://preprod-notification.agencebio.org:444/portail/notifications/filterParOrganismeCertificateur/" +
          ocId,
        {
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
