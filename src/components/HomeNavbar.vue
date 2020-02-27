<template>
  <v-toolbar app color="#b9d065">
    <v-btn flat :to="{name:'home'}" title="Retour à l'accueil" active-class="none">
      <v-icon flat large>home</v-icon>
      <v-toolbar-title>CartoBIO</v-toolbar-title>
    </v-btn>
    <v-spacer></v-spacer>
    <v-toolbar-items class="hidden-sm-and-down">
      <v-btn flat primary to="/map" title="Accéder à la carte">Carte</v-btn>
      <v-btn flat :to="{name:'home', hash:'#objectifs'}" title="Aller aux objectifs">Objectifs</v-btn>
      <v-btn
        flat
        :to="{name:'home', hash:'#a-propos'}"
        title="Aller à la section 'a propos'"
      >A propos</v-btn>
      <v-btn
        flat
        :to="{name:'home', hash:'#nous-suivre'}"
        title="Aller à la section 'Nous suivre'"
      >Nous Suivre</v-btn>
      <v-btn
        flat
        :to="{name:'home', hash:'#partenaires'}"
        title="Aller à la section 'Partenaires'"
      >Partenaires</v-btn>
      <v-btn flat to="/stats" title="Aller à la page de Statistiques">Stats</v-btn>
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