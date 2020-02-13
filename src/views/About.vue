<template>
  <v-container grid-list-xl>
    <h1>Qui sommes nous ?</h1>
    <div
      class="subheading text-xs-center mx-5 my-3"
    >Nous sommes deux Entrepreneurs d'Intérêt Général, présents à l'Agence BIO pour 10 mois</div>
    <v-layout row wrap justify-center>
      <v-flex xs12 md4>
        <v-card class="elevation-0 transparent">
          <v-avatar :size="100">
            <img :src="require('../assets/wojtek-sitarz.png')" />
          </v-avatar>
          <v-card-title primary-title class="layout justify-center">
            <div>
              <div class="headline">Wojtek Sitarz</div>
              <span class="grey--text">Géomaticien</span>
            </div>
          </v-card-title>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn flat icon href="mailto:wojtek.sitarz@agencebio.org">
              <v-icon class="bio-green">email</v-icon>
            </v-btn>
            <v-btn flat icon href="https://www.linkedin.com/in/wojtek-sitarz/" target="_blank">
              <v-icon class="bio-green">fab fa-linkedin</v-icon>
            </v-btn>
            <v-btn flat icon href="https://github.com/wojteksitarz" target="_blank">
              <v-icon class="bio-green">fab fa-github</v-icon>
            </v-btn>
            <v-btn
              flat
              icon
              href="https://entrepreneur-interet-general.etalab.gouv.fr/communaute/2019/wojtek-sitarz.html"
              target="_blank"
            >
              <v-icon class="icon-eig">eig</v-icon>
            </v-btn>
            <v-spacer></v-spacer>
          </v-card-actions>
        </v-card>
      </v-flex>
      <v-flex xs12 md4 offset-md1>
        <v-card class="elevation-0 transparent">
          <v-avatar :size="100">
            <img :src="require('../assets/lucas-bchini.png')" />
          </v-avatar>
          <v-card-title primary-title class="layout justify-center">
            <div>
              <div class="headline">Lucas Bchini</div>
              <span class="grey--text">Développeur</span>
            </div>
          </v-card-title>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn flat icon href="mailto:lucas.bchini@agencebio.org">
              <v-icon class="bio-green">email</v-icon>
            </v-btn>
            <v-btn
              flat
              icon
              href="https://www.linkedin.com/in/lucas-bchini-9b1a09a8/"
              target="_blank"
            >
              <v-icon class="bio-green">fab fa-linkedin</v-icon>
            </v-btn>
            <v-btn flat icon href="https://github.com/Hold7" target="_blank">
              <v-icon class="bio-green">fab fa-github</v-icon>
            </v-btn>
            <v-btn
              flat
              icon
              href="https://entrepreneur-interet-general.etalab.gouv.fr/communaute/2019/lucas-bchini.html"
              target="_blank"
            >
              <v-icon class="icon-eig">eig</v-icon>
            </v-btn>
            <v-spacer></v-spacer>
          </v-card-actions>
        </v-card>
      </v-flex>
      <v-flex xs12 md4 class="subheading text-xs-center my-3">
        Nous sommes également accompagnés par nos mentors:
        <v-card class="elevation-0 transparent">
          <v-card-title primary-title class="layout justify-center">
            <div>
              <div class="headline">Samir Kebli</div>
              <span class="grey--text">Responsable SI à l'Agence BIO</span>
            </div>
          </v-card-title>
        </v-card>
        <v-card class="elevation-0 transparent">
          <v-card-title primary-title class="layout justify-center">
            <div>
              <div class="headline">Dorian Fléchet</div>
              <span class="grey--text">Chargé de l'observatoire national de l'agriculture biologique</span>
            </div>
          </v-card-title>
        </v-card>
      </v-flex>
      <v-flex xs12 md4 offset-md1 align-content-space-around class="mt-3">
        <v-btn
          outline
          href="https://entrepreneur-interet-general.etalab.gouv.fr/"
          target="_blank"
        >En savoir plus sur le programme EIG</v-btn>

        <v-card class="elevation-0 transparent mt-4">
          <v-card-title primary-title class="layout justify-center">
            <div>
              <div>10 mois, c'est (déjà) fini ! Mais ne vous inquiêtez pas, si Wojtek quitte l'aventure, le projet continue ! Vous pouvez toujours nous contacter pour discuter du projet.</div>
              <v-btn
                round
                color="primary-green"
                class="mt-3"
                dark
                href="mailto:cartobio@beta.gouv.fr"
              >Contactez nous!</v-btn>
            </div>
          </v-card-title>
        </v-card>
      </v-flex>
    </v-layout>
  </v-container>
</template>
<style lang="scss" scoped>
</style>
