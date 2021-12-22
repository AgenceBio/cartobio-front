<template>
  <v-toolbar color="#b9d065" clipped-left app>
    <v-btn flat to="/" title="Retour à l'accueil" active-class="none">
      <svg class="logo">
        <use xlink:href="@/assets/logos-sprite.svg#cartobio"></use>
      </svg>
      <v-toolbar-title>CartoBIO</v-toolbar-title>
    </v-btn>

    <v-spacer></v-spacer>

    <v-toolbar-items class="hidden-sm-and-down">
      <v-btn v-if="isAuthenticated" active-class="active" to="/map" flat>
        <v-icon class="mr-2">public</v-icon>
        Carte des exploitations
      </v-btn>
      <Profile v-if="isAuthenticated" class="navbar-button" />
      <v-btn v-else flat @click="startLogin">
        <v-icon class="mr-2">lock_open</v-icon>
        Connexion
      </v-btn>
      <AboutMenu />
    </v-toolbar-items>


    <Login class="navbar-button" />
  </v-toolbar>
</template>
<script>
import { mapGetters, mapMutations } from 'vuex';

import AboutMenu from "@/components/AboutMenu";
import Login from "@/components/Login";
import Profile from "@/components/Profile";

export default {
  name: "Navbar",
  components: {
    AboutMenu,
    Login,
    Profile,
  },

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

.active::after {
  border-bottom: 4px solid #24449C;
  bottom: 0;
  content: "";
  display: block;
  position: absolute;
  width: 100%;
}

.logo {
  width: 50px;
}
</style>
