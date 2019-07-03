<template>
  <v-toolbar app color="#b9d065">
    <a href="https://www.agencebio.org/" target="_blank">
      <img alt="Agence Bio logo" :src="require('../../src/assets/agence-bio.png')" class="logo">
    </a>
    <v-toolbar-title>CartoBIO</v-toolbar-title>
    <v-spacer></v-spacer>
    <Geosearch @searchCompleted="searchCompleted"></Geosearch>
    <v-spacer></v-spacer>
    <v-toolbar-items class="hidden-sm-and-down">
      <router-link to="/" class="navbar-button">
        <v-btn flat>Accueil</v-btn>
      </router-link>
      <router-link
        v-if="getProfile.nom && currentRoute !== '/notifications'"
        to="/notifications"
        class="navbar-button"
      >
        <v-btn flat class="navbar-button">Notifications</v-btn>
      </router-link>
      <router-link v-if="currentRoute !== '/map'" to="/map" class="navbar-button">
        <v-btn flat class="navbar-button">Map</v-btn>
      </router-link>
      <Login v-if="!getProfile.nom" class="navbar-button"></Login>
      <Profile v-if="getProfile.nom" class="navbar-button"></Profile>
    </v-toolbar-items>
  </v-toolbar>
</template>
<script>
import Geosearch from "@/components/Geosearch";
import Login from "@/components/Login";
import Profile from "@/components/Profile";
const axios = require("axios");

export default {
  name: "Navbar",
  components: {
    Geosearch,
    Login,
    Profile
  },
  props: ["bus"],
  data: () => ({
    user: {},
    login: false
  }),
  methods: {
    searchCompleted: function(value) {
      this.bus.$emit("searchCompleted", value);
    }
  },
  computed: {
    getProfile() {
      return this.$store.getters.getProfile;
    },
    currentRoute() {
      return this.$route.path;
    }
  },
  created: function() {
    let testOc = {
      email: "oc@gmail.com",
      motDePasse: "OcTest12345"
    };

    let testOp = {
      email: "lucas.bchini@agencebio.org",
      motDePasse: "6Lavoisier"
    };

    let testSuperOc = {
      email: "superoc@gmail.com",
      motDePasse: "AsmaBA12345"
    };

    let testAdmin = {
      email: "admin@gmail.com",
      motDePasse: "Admin12345"
    };
    let params = testOc;
  }
};
</script>

<style lang="scss" scoped>
.navbar-button {
  height: 100%;
}
</style>
