<template>
  <v-toolbar app clipped-left color="#b9d065">
    <a href="https://www.agencebio.org/" target="_blank">
      <img alt="Agence Bio logo" :src="require('../../src/assets/agence-bio.png')" class="logo" />
    </a>
    <v-toolbar-title>{{title}}</v-toolbar-title>
    <v-spacer></v-spacer>
    <v-spacer></v-spacer>
    <v-toolbar-items class="hidden-sm-and-down">
      <router-link to="/" class="navbar-button">
        <v-btn flat>Accueil</v-btn>
      </router-link>
      <router-link
        v-if="$store.getters.getUserCategory === $store.getters.getCategories.oc && currentRoute !== '/notifications'"
        to="/notifications"
        class="navbar-button"
      >
        <v-btn flat class="navbar-button">Notifications</v-btn>
      </router-link>
      <router-link v-if="currentRoute !== '/map'" to="/map" class="navbar-button">
        <v-btn flat class="navbar-button">Carte</v-btn>
      </router-link>
      <Login v-if="!getProfile.nom" class="navbar-button"></Login>
      <Profile v-if="getProfile.nom" class="navbar-button"></Profile>
    </v-toolbar-items>
  </v-toolbar>
</template>
<script>
import Login from "@/components/Login";
import Profile from "@/components/Profile";
const axios = require("axios");

export default {
  name: "Navbar",
  components: {
    Login,
    Profile
  },
  props: ["bus"],
  data: () => ({
    user: {},
    login: false
  }),
  computed: {
    getProfile() {
      return this.$store.getters.getProfile;
    },
    getOperator() {
      return this.$store.getters.getOperator;
    },
    currentRoute() {
      return this.$route.path;
    },
    title() {
      return this.getOperator.title ? this.getOperator.title : "CartoBIO";
    }
  }
};
</script>

<style lang="scss" scoped>
.navbar-button {
  height: 100%;
}
</style>
