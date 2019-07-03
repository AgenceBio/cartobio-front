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
        <v-list-tile @click>
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
  props: [""],
  data: () => ({ login: "", password: "", dialog: false, user: {} }),
  methods: {
    // logout to do with api when it will exist
    logout: function() {
      this.$store.commit("setUser", {});
      this.$ls.remove("token");
    }
  },
  computed: {
    getProfile() {
      return this.$store.getters.getProfile;
    }
  }
};
</script>