<template>
  <v-container grid-list-xl>
    <h1>Vous êtes</h1>
    <v-layout row wrap justify-center>
      <v-flex xs12 md4>
        <v-card class="elevation-3">
          <v-card-text class="text-xs-center primary-green">
            <v-icon x-large>how_to_reg</v-icon>
          </v-card-text>
          <v-card-title primary-title class="layout justify-center">
            <div class="title">Controleur Bio ?</div>
          </v-card-title>
          <v-card-text>
            Cette application vous est dédiée pour le moment. Vous pouvez vous connecter en utilisant vos identifiants de
            <a
              href="notification@agencebio.org"
              target="_blank"
            >notification@agencebio.org</a>
            En cas de soucis, n'hésitez pas à nous contacter. Nous sommes toujours preneurs de retours et il est possible que nous vous contactions dans cet objectif.
          </v-card-text>
        </v-card>
      </v-flex>
      <v-flex xs12 md4>
        <v-card class="elevation-3">
          <v-card-text class="text-xs-center primary-green">
            <v-icon x-large>emoji_nature</v-icon>
          </v-card-text>
          <v-card-title primary-title class="layout justify-center">
            <div class="title">Agriculteur Bio ?</div>
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
            <div class="title">Vous recherchez les données des parcelles Bio?</div>
          </v-card-title>
          <v-card-text>
            Les données ne sont pas publiées en open data pour le moment. Si vous êtes une administration et que vous pouvez prétendre à l'obtention de celles-ci, nous vous invitons à nous contacter.
            <br />Sinon, un peu de patience ! :)
          </v-card-text>
        </v-card>
      </v-flex>
    </v-layout>
  </v-container>
</template>
<style lang="scss" scoped>
</style>
