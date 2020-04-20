<template>
  <v-layout row justify-center>
    <v-menu bottom offset-y>
      <template v-slot:activator="{ on }">
        <v-btn flat v-on="on">
          <v-icon>person</v-icon>
          {{getProfile.nom}}
        </v-btn>
      </template>
      <v-list>
        <v-list-tile @click="logout">
          <v-list-tile-title>Se Déconnecter</v-list-tile-title>
        </v-list-tile>
      </v-list>
    </v-menu>
  </v-layout>
</template>

<script>
import { post } from "axios";
import { mapGetters } from 'vuex';

export default {
  name: "Profile",
  props: [],
  data: () => ({ login: "", password: "", dialog: false, user: {} }),
  methods: {
    logout: function() {
      post(
        process.env.VUE_APP_NOTIFICATIONS_ENDPOINT + "/portail/token",
        { token: this.$ls.get("token") }
      )
      .then(() => this.$store.commit("setUser", {}))
      .then(() => this.$ls.remove("token"))
      .then(() => this.$router.go(0)); // reload the page. There mush be better way to reinitiate the map
    }
  },
  computed: {
    ...mapGetters(['getProfile'])
  }
};
</script>
