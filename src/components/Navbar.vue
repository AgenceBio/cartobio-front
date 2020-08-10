<template>
  <v-toolbar color="#b9d065" app>
    <v-btn flat :to="{name:'home'}" title="Retour à l'accueil" active-class="none">
      <svg class="logo">
        <use xlink:href="@/assets/logos-sprite.svg#cartobio"></use>
      </svg>
      <v-toolbar-title>CartoBIO</v-toolbar-title>
    </v-btn>

    <v-spacer></v-spacer>

    <v-toolbar-items class="hidden-sm-and-down">
      <v-btn v-if="isAuthenticated" to="map" flat>Carte</v-btn>
      <Profile v-if="isAuthenticated" class="navbar-button" />
      <v-btn v-else flat @click="startLogin">Connexion</v-btn>
      <v-btn to="about" flat>À propos</v-btn>
      <v-btn to="contact" flat>Contact</v-btn>
    </v-toolbar-items>


    <Login :show="isAuthenticating" class="navbar-button" />
  </v-toolbar>
</template>
<script>
import { mapGetters, mapMutations } from 'vuex';

import Login from "@/components/Login";
import Profile from "@/components/Profile";

export default {
  name: "Navbar",
  components: {
    Login,
    Profile,
  },
  data: () => ({
    user: {},
    login: false
  }),

  computed: {
    ...mapGetters('user', ['isAuthenticated', 'isAuthenticating'])
  },

  methods: {
    ...mapMutations({
      startLogin: 'user/LOGIN'
    })
  }
};
</script>

<style lang="scss" scoped>
.v-toolbar__title a {
  color: inherit;
}

.logo {
  width: 50px;
}
</style>
