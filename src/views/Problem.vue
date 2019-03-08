<template>
  <div>
    <h1>Objectif :</h1>
    <div class="subheading text-xs-center mx-5 my-3">
      Faciliter l’échange de données entre les différents acteurs administratifs ou délégataires d’un service public
      dans le domaine de l’agriculture biologique
    </div>
    <v-flex xs12>
      <v-container grid-list-xl>
        <v-layout row wrap align-center>
          <v-flex xs12 md4>
            <v-card class="elevation-0 transparent">
              <v-card-text class="text-xs-center">
                <v-icon x-large class="blue--text text--lighten-2">swap_vert</v-icon>
              </v-card-text>
              <v-card-title primary-title class="layout justify-center">
                <div class="headline text-xs-center">Échange de données</div>
              </v-card-title>
              <v-card-text>Permettre aux différentes administrations d'échanger des données nécessaire à la réalisation de leurs missions sans les redemander aux agriculteurs.</v-card-text>
            </v-card>
          </v-flex>
          <v-flex xs12 md4>
            <v-card class="elevation-0 transparent">
              <v-card-text class="text-xs-center">
                <v-icon x-large class="blue--text text--lighten-2">flash_on</v-icon>
              </v-card-text>
              <v-card-title primary-title class="layout justify-center">
                <div class="headline">Développement rapide</div>
              </v-card-title>
              <v-card-text>Notre but est de co-construire avec les différents acteurs une plateforme adaptée à leurs besoins au cours de l'année, et de réfléchir à des solution de pérénnisation du projet.</v-card-text>
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
              <v-card-text>Le code de l'application sera déposé sur GitHub. Les données publiques de l'agence Bio et des différents organismes seront publiées de manière anonyme dans le cadre de la loi Lemaire sur une République Numérique.</v-card-text>
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
