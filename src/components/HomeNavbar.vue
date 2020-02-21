<template>
  <v-toolbar app color="#b9d065">
    <a href="#/title" @click="$vuetify.goTo('#title')" title="Retour à l'accueil">
      <v-icon flat large>home</v-icon>
    </a>
    <v-toolbar-title>CartoBIO</v-toolbar-title>
    <v-spacer></v-spacer>
    <v-toolbar-items class="hidden-sm-and-down">
      <v-btn flat primary href="#/map" title="Accéder à la carte">Carte</v-btn>
      <v-btn
        flat
        href="#/objectifs"
        @click="$vuetify.goTo('#objectives')"
        title="Aller aux objectifs"
      >Objectifs</v-btn>
      <v-btn
        flat
        href="#/a-propos"
        @click="$vuetify.goTo('#about')"
        title="Aller à la section 'a propos'"
      >A propos</v-btn>
      <v-btn
        flat
        href="#/nous-suivre"
        @click="$vuetify.goTo('#follow')"
        title="Aller à la section 'Nous suivre'"
      >Nous Suivre</v-btn>
      <v-btn
        flat
        href="#/partenaires"
        @click="$vuetify.goTo('#partners')"
        title="Aller à la section 'Partenaires'"
      >Partenaires</v-btn>
      <v-btn
        flat
        href="#/stats"
        @click="$vuetify.goTo('#stats')"
        title="Aller à la page de Statistiques"
      >Stats</v-btn>
    </v-toolbar-items>
    <v-divider vertical inset class="mx-3"></v-divider>
    <a href="https://www.agencebio.org/" target="_blank" d-flex>
      <v-layout d-flex>
        <img alt="Agence Bio logo" :src="require('../../src/assets/agence-bio.png')" class="logo" />
        <v-icon flat>open_in_new</v-icon>
      </v-layout>
    </a>
  </v-toolbar>
</template>
<script>
export default {
  name: "HomeNavbar"
};
</script>