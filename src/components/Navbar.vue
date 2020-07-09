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
      <Login v-if="!getProfile.nom" class="navbar-button"></Login>
      <Profile v-if="getProfile.nom" class="navbar-button"></Profile>
      <v-btn to="about" flat>À propos</v-btn>
      <v-btn to="contact" flat>Contact</v-btn>
    </v-toolbar-items>
  </v-toolbar>
</template>
<script>
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
    getProfile() {
      return this.$store.getters.getProfile;
    },
    currentRoute() {
      return this.$route.path;
    }
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
