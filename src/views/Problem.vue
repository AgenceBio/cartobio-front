<template>
  <div>
    <h1>Objectifs :</h1>
    <div
      class="subheading text-xs-center mx-5 my-3"
    >CartoBIO répond à plusieurs objectifs et problématiques observées lors de rencontres avec différents acteurs de l'Agriculture Biologique en France</div>
    <v-flex xs12>
      <v-container grid-list-xl>
        <v-layout row wrap align-center>
          <v-flex xs12 md4>
            <v-card class="elevation-0 transparent">
              <v-card-text class="text-xs-center">
                <v-icon x-large class="blue--text text--lighten-2">map</v-icon>
              </v-card-text>
              <v-card-title primary-title class="layout justify-center">
                <div class="headline">Cartographie des parcelles en agriculture biologique</div>
              </v-card-title>
              <v-card-text>Cartographier les parcelles conduites en agriculture biologique pour constituer et diffuser une base de données fiable et à jour de l'agriculture biologique en France.</v-card-text>
            </v-card>
          </v-flex>
          <v-flex xs12 md4>
            <v-card class="elevation-0 transparent">
              <v-card-text class="text-xs-center">
                <v-icon x-large class="blue--text text--lighten-2">swap_vert</v-icon>
              </v-card-text>
              <v-card-title primary-title class="layout justify-center">
                <div class="headline text-xs-center">Échange de données</div>
              </v-card-title>
              <v-card-text>Permettre aux différentes organisations d'échanger les données nécessaire à la réalisation de leurs missions sans les redemander aux agriculteurs.</v-card-text>
            </v-card>
          </v-flex>
          <v-flex xs12 md4>
            <v-card class="elevation-0 transparent">
              <v-card-text class="text-xs-center">
                <v-icon x-large class="blue--text text--lighten-2">code</v-icon>
              </v-card-text>
              <v-card-title primary-title class="layout justify-center">
                <div class="headline text-xs-center">Open Source</div>
              </v-card-title>
              <v-card-text>Le code de l'application sera déposé sur GitHub. Les données publiques de l'Agence Bio et des différents organismes seront publiées de manière anonyme, dans le respect du RGPD et de la loi pour une république numérique.</v-card-text>
            </v-card>
          </v-flex>
        </v-layout>
      </v-container>
    </v-flex>
  </div>
</template>
<style scoped>
</style>


<script>
export default {
  name: "Problem"
};
</script>
