<template>
  <v-content class="blue-grey lighten-5">
    <v-layout id="title" column align-center justify-space-between my-4 py-5>
      <h1 class="display-2 mb-3">
        Accédez aux données de l'Agriculture Biologique de votre territoire
      </h1>

      <p class="headline mb-3">
        Au service {{ services[serviceIndex] }}.
      <p>

      <p>
        <v-btn large outline round color="primary" class="mb-5 mt-4">
          <v-icon>arrow_drop_down</v-icon>
          Choisissez vos données
        </v-btn>
      </p>
    </v-layout>

    <v-container fluid>
      <v-layout row justify-space-around>
        <v-flex xs3>
          <v-card>
            <v-card-title>
              <h2>Un accès simplifié à la donnée</h2>
            </v-card-title>

            <v-img class="ma-3" max-height="240" src="@/assets/landing/undraw_Birthday_cake_2wxy.svg" />
          </v-card>
        </v-flex>

        <v-flex xs3>
          <v-card>
            <v-card-title>
              <h2>Une photographie des cultures bio et conventionnelles sur votre territoire</h2>
            </v-card-title>

            <v-img class="ma-3" max-height="240" src="@/assets/landing/undraw_map_1r69.svg" />
          </v-card>
        </v-flex>

        <v-flex xs3>
          <v-card>
            <v-card-title>
              <h2>Interopérable avec vos outils géographiques</h2>
            </v-card-title>

            <v-img class="ma-3" max-height="240" src="@/assets/landing/undraw_programmer_imem.svg" />
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
    title: 'Accédez aux données de l\'agriculture biologique de votre territoire',
  },

  created () {
    this.timerId = setInterval(() => {
      const size = this.services.length
      this.serviceIndex = this.serviceIndex+1 === size ? 0 : this.serviceIndex+1
    }, 3000)
  },

  destroyed () {
    clearInterval(this.timerId)
  },

  data () {
    return {
      timerId: null,
      serviceIndex: 0,
      services: [
        'de la reconquête de l\'eau',
        'des plans d\'action territoriaux (PAT)'
      ],
      elements: [
        {
          title: 'Des partenaires de confiance',
          text: `Blah blah`
        },
        {
          title: 'Respect du RPGD',
          text: `Blah blah`
        },
        {
          title: 'Données initialisées avec le RPG Bio',
          text: `Blah blah`
        },
        {
          title: 'Accompagement technique',
          text: `Des données et de leur intégration dans vos outils.`
        },
        {
          title: 'Code culture et contour géographique',
          text: `Données Shapefile, GeoPackage et GeoJSON qui contiennent le code culture, le caractère bio et le contour géographique des parcelles.`
        },
        {
          title: 'C\'est gratuit',
          text: `Considéré comme échange de données entre administrations, sur signature de convention.`
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
