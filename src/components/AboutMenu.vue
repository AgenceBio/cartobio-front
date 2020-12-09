<template>
  <v-menu offset-y v-model="menu">
    <template v-slot:activator="{ on }">
      <v-btn flat v-on="on">
        <v-icon class="mr-2">help_outline</v-icon>
        À propos
        <v-icon v-if="!menu">arrow_drop_down</v-icon>
        <v-icon v-if="menu">arrow_drop_up</v-icon>
      </v-btn>
    </template>
    <v-list>
      <v-list-tile to="/changelog">
        <v-list-tile-action><v-icon>star</v-icon></v-list-tile-action>
        <v-list-tile-title>Nouveautés</v-list-tile-title>
      </v-list-tile>
      <v-list-tile to="/stats">
        <v-list-tile-action><v-icon>bar_chart</v-icon></v-list-tile-action>
        <v-list-tile-title>Stats</v-list-tile-title>
      </v-list-tile>
      <v-list-tile href="https://github.com/entrepreneur-interet-general/CartoBio-Presentation">
        <v-list-tile-action><v-icon>code</v-icon></v-list-tile-action>
        <v-list-tile-title>Code source ouvert</v-list-tile-title>
      </v-list-tile>
      <v-list-tile @click="trackEvent(['mailto', 'about:problem'])" href="mailto:cartobio@beta.gouv.fr?subject=Je%20rencontre%20un%20problème">
        <v-list-tile-action><v-icon>mail</v-icon></v-list-tile-action>
        <v-list-tile-title>Vous rencontrez un problème ?</v-list-tile-title>
      </v-list-tile>
      <v-list-tile @click="trackEvent(['mailto', 'about:email'])" href="mailto:cartobio@beta.gouv.fr">
        <v-list-tile-action><v-icon>mail</v-icon></v-list-tile-action>
        <v-list-tile-title>Contactez-nous</v-list-tile-title>
      </v-list-tile>
    </v-list>
  </v-menu>
</template>

<script>
import {mapActions} from 'vuex'
export default {
  name: "AboutMenu",

  data: () => {
    return {
      menu: false
    }
  },

  methods: {
    ...mapActions("user", ["trackEvent"]),
  }
};
</script>
