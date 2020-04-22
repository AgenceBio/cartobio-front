<template>
  <div>
    <HomeNavbar></HomeNavbar>

    <v-content>
      <v-container>
        <h1>{{ title }}</h1>
        <p class="subheading">
          Nous mettons en ligne des modifications, améliorations et corrections
          plusieurs fois par mois.
          <br>Vous rencontrez un problème ?
          <a href="mailto:cartobio@beta.gouv.fr">Contactez-nous</a>.
        </p>

        <v-layout flex>
          <v-flex xs12 md8>
            <markdown />
          </v-flex>
        </v-layout>
      </v-container>
    </v-content>

    <Partners />
  </div>
</template>

<style lang="scss">
h2 {
  margin-top: 1.5em;
}

ul {
  font-size: 1.1em;
  list-style: none;
  margin: .5em 0;
  padding-left: 0;

  .v-chip:first-child {
    margin-left: 0;
  }

  li {
    margin-bottom: .5em;
  }
}
</style>

<script>
import HomeNavbar from "@/components/HomeNavbar";
import Partners from "@/components/Partners";
import {VChip} from "vuetify/lib";
import {vue, attributes} from "../../CHANGELOG.md";

export default {
  name: "Changelog",
  components: {
    HomeNavbar,
    Partners,
    markdown: {
      extends: vue.component,
      components: { VChip }
    },
  },

  data () {
    return attributes
  },

  metaInfo: {
    title: attributes.title,
  }
};
</script>
