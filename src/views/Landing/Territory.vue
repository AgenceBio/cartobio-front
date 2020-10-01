<template>
  <v-content class="blue-grey lighten-5">
    <v-layout id="title" column align-center justify-space-between my-4 py-5>
      <h1 class="display-2 mb-3 text-xs-center">
        Accédez aux données de l'Agriculture Biologique<br>de votre territoire
      </h1>

      <p class="headline mb-3">
        Au service {{ services[serviceIndex] }}.
      <p>

      <p>
        <!-- <v-btn large outline round color="primary" class="mb-5 mt-4">
          <v-icon>arrow_drop_down</v-icon>
          Choisissez vos données
        </v-btn> -->
        <v-btn :href="signupUrl" large outline round color="primary" class="mb-5 mt-4">
          <v-icon class="mr-2">contact_mail</v-icon>
          Demandez les données de votre territoire
        </v-btn>
      </p>
    </v-layout>

    <v-container fluid>
      <v-layout row justify-space-around class="features">
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
              <h2 class="title" v-html="title"></h2>
            </v-card-title>
            <v-card-text>
              <p v-html="text"></p>
            </v-card-text>
          </v-card>
        </v-flex>
      </v-layout>
    </v-container>

    <v-layout column align-center justify-space-between my-4>
      <p>
        <v-btn :href="signupUrl" large outline round color="primary" class="mb-5 mt-4">
          <v-icon class="mr-2">contact_mail</v-icon>
          Remplir une demande de données
        </v-btn>

        <v-btn :href="mailto" large outline round color="primary" class="mb-5 mt-4">
          <v-icon class="mr-2">email</v-icon>
          Un doute, une question ?
        </v-btn>
      </p>
    </v-layout>

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
      mailto: 'mailto:cartobio@beta.gouv.fr?subject=J\'ai%20une%20question%20%C3%A0%20propos%20des%20donn%C3%A9es%20de%20mon%20territoire',
      signupUrl: 'https://signup.api.gouv.fr/cartobio',
      services: [
        'de la reconquête de l\'eau',
        'des Plans Alimentaires Territoriaux (PAT)',
        'des thèses et des projets de recherche',
      ],
      elements: [
        {
          title: `Ce qu'il y a dans les données CartoBio`,
          text: `Vous accédez — pour chaque parcelle connue — à son code culture, à son contour géographique et à son caractère bio. Nous vous les transmettons au format Shapefile, GeoPackage ou GeoJSON.`
        },
        {
          title: 'Données initialisées avec le <a href="https://geoservices.ign.fr/blog/2020/02/21/Nouvelles_ressources_RPG.html" target="_blank">RPG Bio</a>',
          text: `Accédez aux données du Registre Parcellaire Graphique — il comprend le caractère bio, et est complété par les organismes de certification sur le terrain.`
        },
        {
          title: 'Des partenaires de confiance',
          text: `Nous utilisons une approche itérative avec les organismes de certification, l'Agence Bio, l'INAO et le Ministère de l'Agriculture pour les enrichir, et les mettre en commun.`
        },
        {
          title: 'Respect du RPGD',
          text: `Vous récupérez des couches géographiques anonymisées, pour une réutilisation facilitée.`
        },
        {
          title: 'Accompagement technique',
          text: `Contactez-nous si vous rencontrez un problème, ou si avez un doute sur un élément de la convention de partage de données.`
        },
        {
          title: 'C\'est gratuit',
          text: `Signez la convention de partage de données pour nous autoriser leur distribution. Nous avons aussi pour objectif de les distribuer sous <a href="https://www.data.gouv.fr/fr/licences" target="_blank">licence open data (ODbl-1.0)</a>, à un horizon 2021/2022.`
        },

      ]
    }
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
