<template>
  <v-toolbar app clipped-left color="#b9d065">
    <v-btn flat :to="{name:'home'}" title="Retour à l'accueil" active-class="none">
      <v-icon flat large>home</v-icon>
      <v-toolbar-title>CartoBIO</v-toolbar-title>
    </v-btn>
    <v-toolbar-title>{{title}}</v-toolbar-title>
    <v-spacer></v-spacer>
    <v-spacer></v-spacer>
    <v-toolbar-items class="hidden-sm-and-down">

      <router-link
        v-if="$store.getters.getUserCategory === $store.getters.getCategories.oc && currentRoute !== '/notifications'"
        to="/notifications"
        class="navbar-button"
      >
        <v-btn flat class="navbar-button" title="Aller à la liste des exploitations">Exploitations</v-btn>
      </router-link>
      <router-link v-if="!currentRoute.match(/\/map/)" to="/map" class="navbar-button">
        <v-btn flat class="navbar-button" title="Aller à la carte">Carte</v-btn>
      </router-link>
      <Login v-if="!getProfile.nom" class="navbar-button"></Login>
      <Profile v-if="getProfile.nom" class="navbar-button"></Profile>

      <AboutMenu></AboutMenu>
    </v-toolbar-items>
  </v-toolbar>
</template>
<script>
import Login from "@/components/Login";
import Profile from "@/components/Profile";
import AboutMenu from '@/components/AboutMenu.vue'

export default {
  name: "Navbar",
  components: {
    Login,
    Profile,
    AboutMenu,
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
      return this.getOperator.title ? this.getOperator.title : "";
    }
  }
};
</script>

<style lang="scss" scoped>
.navbar-button {
  height: 100%;
}
</style>
