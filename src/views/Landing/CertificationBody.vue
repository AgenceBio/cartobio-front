<template>
  <v-content class="blue-grey lighten-5">
    <v-layout id="title" column align-center justify-space-between my-4 py-5>
      <h1 class="display-2 mb-3">
        Une vision géographique de la certification Bio
      </h1>

      <p class="headline mb-3">
        Suivez et enrichissez les données des parcelles de vos exploitants.
      <p>

      <p>
        <v-btn to="/features/territoires" large outline round color="primary" class="mb-5 mt-4">
          <v-icon>lock_open</v-icon>
          Je me connecte avec mon compte Agence Bio
        </v-btn>
      </p>
    </v-layout>

    <v-container fluid>
      <v-layout row justify-space-around>
        <v-flex xs3>
          <v-card>
            <v-card-title>
              <h2>Accédez à l'historique de conversion des parcelles</h2>
            </v-card-title>

            <v-img class="ma-3" max-height="240" src="@/assets/landing/undraw_dropdown_menu_vv9j.svg" />
          </v-card>
        </v-flex>

        <v-flex xs3>
          <v-card>
            <v-card-title>
              <h2>Identifiez les risques pour les parcelles, et les zones de butinage autour des ruchers</h2>
            </v-card-title>

            <v-img class="ma-3" max-height="240" src="@/assets/landing/undraw_rising_8svm.svg" />
          </v-card>
        </v-flex>

        <v-flex xs3>
          <v-card>
            <v-card-title>
              <h2>Ajoutez des informations manquantes en quelques clics</h2>
            </v-card-title>

            <v-img class="ma-3" max-height="240" src="@/assets/landing/undraw_uploading_go67.svg" />
          </v-card>
        </v-flex>
      </v-layout>
    </v-container>

    <v-container grid-list-xl>
      <v-layout row wrap>
        <v-flex v-for="({title, text}, i) in elements" v-bind:key="title" xs7 v-bind:offset-xs4="i%2">
          <v-card flat :class="{orange: i%2, white: !(i%2), 'lighten-5': i%2}">
            <v-card-title>
              <h2 class="title">{{ title }}</h2>
            </v-card-title>
            <v-card-text>
              <p>{{ text }}</p>
            </v-card-text>
          </v-card>
        </v-flex>
      </v-layout>
    </v-container>

  </v-content>
</template>

<script>

export default {
  name: "LandingCertificationBody",
  components: {
  },

  metaInfo: {
    title: 'Une vision géographique de la certification Bio',
  },

  data () {
    return {
      elements: [
        {
          title: 'Montez sur la fiabilité du contrôle AB',
          text: `Blah blah`
        },
        {
          title: 'Un outil en ligne, et à intégrer',
          text: `Accessible avec un navigateur, ou une API pour créer une carte dans votre outil métier`
        },
        {
          title: 'Co-construit avec 10 organismes de certification français',
          text: `Blah blah`
        },
        {
          title: 'Accompagement technique',
          text: `On vous aide à intégrer notre API dans votre application métier`
        },
        {
          title: 'Identifiez rapidement les parcelles à risque',
          text: `Blah blah`
        },

      ]
    }
  }
};
</script>


<style lang="scss">
.v-card h2 {
  margin: 0;
}
</style>
