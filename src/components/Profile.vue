<template>
  <v-layout row justify-center>
    <v-menu bottom offset-y>
      <template v-slot:activator="{ on }">
        <v-btn flat v-on="on">
          <v-icon>person</v-icon>
          {{getProfile.nom}}
        </v-btn>
      </template>
      <v-list>
        <v-list-tile @click="logout">
          <v-list-tile-title>Se Déconnecter</v-list-tile-title>
        </v-list-tile>
        <v-list-tile>
          <v-list-tile-title>Mon Profil</v-list-tile-title>
          <!-- Renvoyer vers profil agence bio ? -->
        </v-list-tile>
      </v-list>
    </v-menu>
  </v-layout>
</template>

<script>
const axios = require("axios");
export default {
  name: "Profile",
  props: [],
  data: () => ({ login: "", password: "", dialog: false, user: {} }),
  methods: {
    logout: function() {
      let params = { token: this.$ls.get("token") };
      axios
        .post(
          "https://preprod-notification.agencebio.org:444/portail/token",
          params
        )
        .then(() => this.$store.commit("setUser", {}))
        .then(() => this.$ls.remove("token"))
        .then(() => this.$router.go(0)); // reload the page. There mush be better way to reinitiate the map
    }
  },
  computed: {
    getProfile() {
      return this.$store.getters.getProfile;
    }
  }
};
</script>