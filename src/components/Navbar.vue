<template>
  <v-toolbar app color="#b9d065">
    <a href="https://www.agencebio.org/" target="_blank">
      <img alt="Agence Bio logo" :src="require('../../src/assets/agence-bio.png')" class="logo">
    </a>
    <v-toolbar-title>CartoBIO</v-toolbar-title>
    <v-spacer></v-spacer>
    <v-toolbar-items class="hidden-sm-and-down">
      <router-link to="/">
        <v-btn flat>Accueil</v-btn>
      </router-link>
    </v-toolbar-items>
  </v-toolbar>
</template>
<script>
export default {
  name: "Navbar"
};
</script>

<style lang="scss" scoped>
a.router-link-active {
  height: 100%;
}
</style>
