<template>
  <div>
    <h1>Vous...</h1>
    <v-flex xs12>
      <v-container grid-list-xl>
        <v-layout row wrap justify-center>
          <v-flex xs12 md4>
            <v-card class="elevation-3">
              <v-card-text class="text-xs-center primary-green">
                <v-icon x-large>how_to_reg</v-icon>
              </v-card-text>
              <v-card-title primary-title class="layout justify-center">
                <div class="title">Contrôlez des parcelles en bio&nbsp;?</div>
              </v-card-title>
              <v-card-text>
                Cette application vous est dédiée pour le moment. Connectez-vous avec vos identifiants du
                <a
                  href="notification@agencebio.org"
                  target="_blank"
                >portail Notifications de l'Agence Bio</a>
                En cas de soucis,
                <a
                  href="mailto:cartobio@beta.gouv.fr"
                >contactez-nous</a>. Nous sommes à l'écoute pour en faire un outil qui vous soit utile.
                <br />
                <router-link to="/map">
                  <v-btn
                    round
                    title="Accès à l'application"
                    color="primary-green"
                    class="mt-3"
                    dark
                  >Accéder à l'application</v-btn>
                </router-link>
              </v-card-text>
            </v-card>
          </v-flex>
          <v-flex xs12 md4>
            <v-card class="elevation-3">
              <v-card-text class="text-xs-center primary-green">
                <v-icon x-large>emoji_nature</v-icon>
              </v-card-text>
              <v-card-title primary-title class="layout justify-center">
                <div class="title">Cultivez en bio ?</div>
              </v-card-title>
              <v-card-text>
                Afin de mieux connaître les surfaces cultivées en agriculture biologique pour mesurer l'impact et mener des politiques publiques plus efficaces,
                de fiabiliser le contrôle et de le rendre plus simple et plus rapide, CartoBio permet aux OC d'avoir accès en amont d'un contrôle aux données de votre déclaration PAC.
                <br />Pour un agriculteur bio qui ne ferait pas de demande à la PAC, nous souhaitons également connaître la localisation de ses parcelles, afin d'avoir une meilleure connaissance du territoire.
                Si vous avez des questions, des remarques, n'hésitez pas à nous contacter !
              </v-card-text>
            </v-card>
          </v-flex>
          <v-flex xs12 md4>
            <v-card class="elevation-3">
              <v-card-text class="text-xs-center primary-green">
                <v-icon x-large>public</v-icon>
              </v-card-text>
              <v-card-title primary-title class="layout justify-center">
                <div class="title">Recherchez les données des parcelles Bio?</div>
              </v-card-title>
              <v-card-text>
                Les données ne sont pas publiées en open data pour le moment. Si vous êtes une administration et que vous pouvez prétendre à l'obtention de celles-ci, nous vous invitons à nous contacter.
                <br />Sinon, un peu de patience ! :)
              </v-card-text>
            </v-card>
          </v-flex>
        </v-layout>
      </v-container>
    </v-flex>
  </div>
</template>
<style lang="scss" scoped>
</style>
