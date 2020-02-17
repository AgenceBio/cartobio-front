<template>
  <div>
    <HomeNavbar></HomeNavbar>

    <v-content v-bind:class="{errored, loading}">
      <v-container>

        <h1>Statistiques</h1>

        <v-flex xs12 sm4>
          <v-card v-if="stats">
            <v-card-title class="d-block">
                <h2 class="headline mb-0 text-xs-center">{{ Math.ceil(stats.surface.bio) }}ha</h2>
            </v-card-title>

            <v-card-text class="text-xs-center">
              <p>Surfaces en bio connues à ce jour.</p>
            </v-card-text>
          </v-card>
        </v-flex>
      </v-container>
    </v-content>
  </div>
</template>

<style lang="scss" scoped>
</style>

<script>
import HomeNavbar from "@/components/HomeNavbar";
import {get} from "axios";

export default {
  name: "Stats",
  components: {
    HomeNavbar,
  },

  methods: {
  },

  data() {
    return {
      stats: null,
      loading: true,
      errored: false,
    };
  },

  mounted() {
    get('stats.json')
      .then(response => {
        this.stats = response.data.stats
      })
      .catch(error => {
        console.error(error)
        this.errored = true
      })
      .finally(() => this.loading = false)
  }
};
</script>
