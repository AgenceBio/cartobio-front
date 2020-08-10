<template>
  <v-toolbar app clipped-left color="#b9d065">
    <v-btn flat :to="{name:'home'}" title="Retour à l'accueil" active-class="none">
      <v-icon flat large>home</v-icon>
      <v-toolbar-title>CartoBio</v-toolbar-title>
    </v-btn>
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

      <Profile v-if="isAuthenticated" class="navbar-button" />
      <v-btn v-else flat @click="startLogin">Connexion</v-btn>

      <AboutMenu></AboutMenu>
    </v-toolbar-items>

    <Login :show="isAuthenticating" class="navbar-button" />
  </v-toolbar>
</template>
<script>
import { mapGetters, mapMutations } from 'vuex';

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

  data: () => ({
    user: {},
    login: false
  }),

  computed: {
    ...mapGetters('user', ['isAuthenticated', 'isAuthenticating']),

    getProfile() {
      return this.$store.getters.getProfile;
    },
    currentRoute() {
      return this.$route.path;
    }
  },

  methods: {
    ...mapMutations({
      startLogin: 'user/LOGIN'
    })
  }
};
</script>

<style lang="scss" scoped>
.navbar-button {
  height: 100%;
}
</style>
