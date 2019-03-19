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
                <v-icon x-large class="bio-green">map</v-icon>
              </v-card-text>
              <v-card-title primary-title class="layout justify-center">
                <div class="headline">Cartographie de l'AB</div>
              </v-card-title>
              <v-card-text>
                Créer une base de donnés exhaustive et à jour permettant le suivi des parcelles cultivées
                en agriculture biologique en France, et diffuser une version anonymisée, en accord avec le
                RGPD, pour sa réutilisation à des buts informatifs ou statistiques.
              </v-card-text>
            </v-card>
          </v-flex>
          <v-flex xs12 md4>
            <v-card class="elevation-0 transparent">
              <v-card-text class="text-xs-center">
                <v-icon x-large class="bio-green">swap_vert</v-icon>
              </v-card-text>
              <v-card-title primary-title class="layout justify-center">
                <div class="headline text-xs-center">Échange de données</div>
              </v-card-title>
              <v-card-text>
                Faciliter le travail des administrations et des organismes certificateurs en réduisant la charge
                de l'agriculteur via une plateforme d'échange de données. Celà répond à un besoin observé sur
                le terrain, mais également à la loi pour une République numérique.
              </v-card-text>
            </v-card>
          </v-flex>
          <v-flex xs12 md4>
            <v-card class="elevation-0 transparent">
              <v-card-text class="text-xs-center">
                <v-icon x-large class="bio-green">code</v-icon>
              </v-card-text>
              <v-card-title primary-title class="layout justify-center">
                <div class="headline text-xs-center">Open Source</div>
              </v-card-title>
              <v-card-text>
                Publier le code de l'application sur GitHub sous licence libre (encore à définir), dans un but
                de transparence et de maintenabilité.
                <br>Argent Public = Code Public
              </v-card-text>
            </v-card>
          </v-flex>
        </v-layout>
      </v-container>
    </v-flex>
    <!-- <v-divider></v-divider>
    <v-container>
      <h1>Bénéfices</h1>
    </v-container>-->
  </div>
</template>
<style scoped>
</style>


<script>
export default {
  name: "Problem"
};
</script>
