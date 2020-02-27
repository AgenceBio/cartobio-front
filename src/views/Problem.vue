<template>
  <div>
    <h1>Nos objectifs</h1>
    <v-flex xs12>
      <v-container grid-list-xl>
        <v-layout row wrap align-center justify-center>
          <v-flex xs12 md4>
            <v-card class="elevation-3">
              <v-card-text class="text-xs-center primary-green">
                <v-icon x-large>map</v-icon>
              </v-card-text>
              <v-card-title primary-title class="layout justify-center">
                <div class="title">Cartographier les parcelles en agriculture biologique</div>
              </v-card-title>
              <v-card-text>Créer une base de donnés exhaustive et à jour permettant le suivi des parcelles cultivées en agriculture biologique en France, et diffuser une version anonymisée, en accord avec le RGPD et la loi pour une République Numérique, pour sa réutilisation à des buts informatifs ou statistiques.</v-card-text>
            </v-card>
          </v-flex>
          <v-flex xs12 md4>
            <v-card class="elevation-3">
              <v-card-text class="text-xs-center primary-green">
                <v-icon x-large>swap_vert</v-icon>
              </v-card-text>
              <v-card-title primary-title class="layout justify-center">
                <div class="title text-xs-center">Simplifier l’échange des données parcellaires</div>
              </v-card-title>
              <v-card-text>Faciliter le travail des administrations et des organismes certificateurs en réduisant la charge de l’agriculteur via une plateforme d’échange de données. Cette plateforme repond ainsi au besoin transmi par les professionnels de l’agriculture biologique.</v-card-text>
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
