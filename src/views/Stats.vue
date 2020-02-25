<template>
  <div>
    <HomeNavbar></HomeNavbar>

    <v-content v-bind:class="{errored, loading}">
      <v-container>

        <h1>Statistiques</h1>

        <v-flex xs12 sm4>
          <v-card v-if="stats">
            <v-card-title class="d-block text-xs-center">
                <h2 class="headline mb-0">
                  <span class="digits huge">{{ bioSurface | million | round }}</span>
                  millions d'hectares
                </h2>
                <p><b>Surfaces en bio</b> connues à ce jour.</p>
            </v-card-title>

            <v-card-text class="text-xs-center">
              <p class="text-xs-center">
                <small>Soit {{ bioSurfaceRatio }}% de la surface agricole
                  subventionnée par la
                  <abbr title="Politique Agricole Commune">PAC</abbr>.
                </small>
              </p>
            </v-card-text>
          </v-card>
        </v-flex>
      </v-container>
    </v-content>
  </div>
</template>

<style lang="scss" scoped>
.digits {
  font-size: 3em;
  line-height: 1;
  display: block;
}
</style>

<script>
import HomeNavbar from "@/components/HomeNavbar";
import {get} from "axios";

function million(value) {
  return value / 1000000
}

function round (value) {
  return value.toFixed(2)
}

export default {
  name: "Stats",
  components: {
    HomeNavbar,
  },

  filters: {
    round,
    million,
  },

  computed: {
    bioSurfaceRatio () {
      return (this.bioSurface / (this.bioSurface + this.nonBioSurface) * 100).toFixed(1)
    },
    bioSurface () {
      return this.stats.aggregates.reduce((total, aggregate) => {
        return total + aggregate.bio.surface
      }, 0)
    },
    nonBioSurface () {
      return this.stats.aggregates.reduce((total, aggregate) => {
        return total + aggregate.nonBio.surface
      }, 0)
    },
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
