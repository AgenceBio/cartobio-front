<template>
  <v-content class="blue-grey lighten-5">
    <v-layout id="title" column align-center justify-space-between my-4 py-5>
      <h1 class="display-2 mb-3 text-xs-center">
        Une vision géographique de la certification Bio
      </h1>

      <p class="headline mb-3">
        Suivez et enrichissez les données des parcelles de vos exploitants.
      <p>

      <p>
        <v-btn v-if="isAuthenticated" to="/map" large outline round color="primary" class="mb-5 mt-4">
          <v-icon class="mr-2">public</v-icon>
          J'accède à l'outil en ligne CartoBio
        </v-btn>
        <v-btn v-else @click="startLogin" large outline round color="primary" class="mb-5 mt-4">
          <v-icon class="mr-2">lock_open</v-icon>
          Je me connecte avec mon compte Agence Bio
        </v-btn>
      </p>
    </v-layout>

    <v-container fluid>
      <v-layout row justify-space-around class="features">
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

    <v-layout column align-center justify-space-between my-4>
      <p>
        <v-btn to="/features/territoires" large outline round color="primary" class="mb-5 mt-4">
          <v-icon class="mr-2">email</v-icon>
          Contactez-nous
        </v-btn>
      </p>
    </v-layout>

  </v-content>
</template>

<script>
import { mapGetters, mapMutations } from 'vuex';

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
          title: `Concentrez-vous sur votre métier d'organisme de certification`,
          text: `Suivez l'évolution d'une parcelle dans le temps — y compris la rotation des assolements et les risques environnants, même en cas de reprise d'exploitation.`
        },
        {
          title: 'Identifiez rapidement les parcelles à risque',
          text: `Visualisez les parcelles alentours d'une exploitation, ainsi que leur nature (caractère bio, type de culture).`
        },
        {
          title: 'Une démarche de co-construction avec 10 organismes de certification',
          text: `Nous utilisons une approche itérative avec les organismes de certification, l'Agence Bio, l'INAO et le Ministère de l'Agriculture pour les enrichir, et les mettre en commun.`
        },
        {
          title: 'Un outil en ligne, ou à intégrer à votre outil métier',
          text: `Accédez à CartoBio via un simple navigateur. Le/la développeuse ou le SI de votre organisation peut se brancher aux données via une API (en lecture, et en écriture).`
        },
        {
          title: 'Accompagnement technique',
          text: `Demandez-nous une clé d'API personnalisée et on se fera un plaisir de vous aider à tout moment.`
        },
      ]
    }
  },

  computed: {
    ...mapGetters('user', ['isAuthenticated']),
  },

  methods: {
    ...mapMutations({
      startLogin: 'user/LOGIN'
    })
  }
};
</script>


<style lang="scss" scoped>
.v-card h2 {
  margin: 0;
}

.features .v-card {
  display: flex;
  flex-direction: column;
  height: 100%;
  justify-content: space-between;
}
</style>
