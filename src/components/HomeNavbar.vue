<template>
  <v-toolbar app color="#b9d065">
    <a href="https://www.agencebio.org/" target="_blank">
      <img alt="Agence Bio logo" :src="require('../../src/assets/agence-bio.png')" class="logo" />
    </a>
    <v-toolbar-title>CartoBIO</v-toolbar-title>
    <v-spacer></v-spacer>
    <v-toolbar-items class="hidden-sm-and-down">
      <v-btn flat href="#/title" @click="$vuetify.goTo('#title')">Accueil</v-btn>
      <v-btn flat primary href="#/map">Carte</v-btn>
      <v-btn flat href="#/objectives" @click="$vuetify.goTo('#objectives')">Objectifs</v-btn>
      <v-btn flat href="#/about" @click="$vuetify.goTo('#about')">L'équipe</v-btn>
      <v-btn flat href="#/partners" @click="$vuetify.goTo('#partners')">Partenaires</v-btn>
    </v-toolbar-items>
  </v-toolbar>
</template>
<script>
export default {
  name: "HomeNavbar"
};
</script>