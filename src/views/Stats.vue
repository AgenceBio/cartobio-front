<template>
  <div>
    <HomeNavbar></HomeNavbar>

    <v-content v-bind:class="{errored, loading}">
      <v-container>

        <h1>Statistiques</h1>
        <v-layout flex>
          <v-flex xs12 sm4 ma-3>
            <v-card v-if="stats" >
              <v-card-title class="d-block text-xs-center">
                  <h2 class="headline mb-0">
                    <span class="digits huge">{{ bioSurface | million | round }}</span>
                    millions d'hectares
                  </h2>
                  <p><b>Surfaces en bio</b> connues à ce jour.</p>
              </v-card-title>

              <v-card-text class="text-xs-center">
                <p class="text-xs-center">
                  <small>Soit <em>environ</em> {{ bioSurfaceRatioSAU }}% de la
                    <abbr title="Surface Agricole Utile">SAU</abbr> totale
                    en {{ getCurrentYear }}.
                  </small>
                </p>
              </v-card-text>
            </v-card>
          </v-flex>
          <v-flex xs12 sm4 ma-3>
            <v-card v-if="stats">
              <v-card-title class="d-block text-xs-center">
                  <h2 class="headline mb-0">
                    <span class="digits huge">{{monthlyVisits}}</span>
                    connexions <abbr title="Organisme de Certification">OC</abbr>
                  </h2>
                  <p><b>depuis le début du mois</b></p>
              </v-card-title>

              <v-card-text class="text-xs-center">
                <p class="text-xs-center">
                  <small>Soit <em>environ</em> {{averageDailyConnection}} connexions par jour
                  </small>
                </p>
              </v-card-text>
            </v-card>
          </v-flex>
        </v-layout>
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
import { mapGetters } from 'vuex'
import HomeNavbar from "@/components/HomeNavbar";
import {get} from "axios";

// SAU en 2019
const SAU_TOTALE = 29000000;

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
    bioSurfaceRatioSAU () {
      return (this.bioSurface / SAU_TOTALE * 100).toFixed(1)
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
    // @see https://vuex.vuejs.org/guide/getters.html#the-mapgetters-helper
    ...mapGetters([
      'getCurrentYear'
    ])
  },

  data() {
    return {
      stats: null,
      loading: true,
      errored: false,
      SAU_TOTALE,
      monthlyVisits: null,
      averageDailyConnection: null,
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

    // get Matomo stats for connexion events
    let matomoURL = "https://stats.data.gouv.fr/index.php"
    let params = {
      module : "API",
      method : "Events.getAction",
      idSite: "116",
      period: "month",
      date: "today",
      format: "JSON",
      expanded: "1"
    }
    get(matomoURL, {params})
      .then(({data}) => {
        let success = data.find(function(item){
          return item.label === "Success";
        });
        this.monthlyVisits = success.nb_visits;
        let day = new Date().getDate();
        this.averageDailyConnection = (this.monthlyVisits / day).toFixed(2);
      })

  }
};
</script>
