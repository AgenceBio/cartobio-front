<template>
  <div>
    <h1>À qui nous destinons CartoBio</h1>
    <v-flex xs12>
      <v-container grid-list-xl>
        <v-layout row wrap justify-center>
          <v-flex xs12 md4>
            <v-card class="elevation-3">
              <v-card-text class="text-xs-center primary-green">
                <v-icon x-large>how_to_reg</v-icon>
              </v-card-text>
              <v-card-title primary-title class="layout justify-center">
                <div class="title">Vous contrôlez des parcelles en bio&nbsp;?</div>
              </v-card-title>
              <v-card-text>
                <p>
                  Consultez les parcelles dont votre organisme
                  assure la certification.
                  Aidez-nous à compléter les parcelles manquantes et
                  intégrez-les à votre système d'information géographique.
                </p>
              </v-card-text>
              <v-card-actions class="justify-center">
                <v-btn
                  round
                  to="/map"
                  title="Accès à l'application"
                  color="primary-green"
                  class="mt-3"
                  dark
                >Accéder à l'application</v-btn>
              </v-card-actions>
            </v-card>
          </v-flex>
          <v-flex xs12 md4>
            <v-card class="elevation-3">
              <v-card-text class="text-xs-center primary-green">
                <v-icon x-large>emoji_nature</v-icon>
              </v-card-text>
              <v-card-title primary-title class="layout justify-center">
                <div class="title">Vous cultivez en bio ?</div>
              </v-card-title>
              <v-card-text>
                <p>
                  Visualisez les parcelles et leur historique de cultures
                  autour de votre exploitation en agriculture biologique.
                </p>
              </v-card-text>

              <v-card-actions class="justify-center">
                <v-btn
                  round
                  to="/map"
                  title="Accès à l'application"
                  color="primary-green"
                  class="mt-3"
                  dark
                >Accéder à l'application</v-btn>
              </v-card-actions>
            </v-card>
          </v-flex>
          <v-flex xs12 md4>
            <v-card class="elevation-3">
              <v-card-text class="text-xs-center primary-green">
                <v-icon x-large>public</v-icon>
              </v-card-text>
              <v-card-title primary-title class="layout justify-center">
                <div class="title">Vous recherchez les données des parcelles bio&nbsp;?</div>
              </v-card-title>
              <v-card-text>
                <p>Les données ne sont pas publiées en open data pour le moment.
                  Si vous êtes une administration publique, contactez-nous pour en obtenir un extrait géolocalisé.
                </p>
              </v-card-text>

              <v-card-actions class="justify-center">
                <v-btn
                  round
                  href="mailto:cartobio@beta.gouv.fr"
                  color="primary-green"
                  class="mt-3"
                  dark
                >Contactez-nous</v-btn>
              </v-card-actions>
            </v-card>
          </v-flex>
        </v-layout>
      </v-container>
    </v-flex>
  </div>
</template>
<style lang="scss" scoped>
</style>
