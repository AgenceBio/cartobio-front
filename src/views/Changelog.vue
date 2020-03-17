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
          <v-flex xs12>
            <markdown />
          </v-flex>
        </v-layout>
      </v-container>
    </v-content>
  </div>
</template>

<style lang="scss" scoped>

</style>

<script>
import HomeNavbar from "@/components/HomeNavbar";
import {vue, attributes} from "../../CHANGELOG.md";

export default {
  name: "Changelog",
  components: {
    HomeNavbar,
    markdown: vue.component,
  },

  data () {
    return attributes
  },

  metaInfo: {
    title: attributes.title,
  }
};
</script>
