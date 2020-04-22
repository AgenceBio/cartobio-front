<template>
  <div>
    <HomeNavbar></HomeNavbar>

    <v-content v-bind:class="{errored, loading}">
      <v-container grid-list-xl>
        <v-layout flex row wrap justify-center  align-content-space-between>
          <v-flex xs12 mt-4 mb-1>
            <h1>Statistiques</h1>
          </v-flex>

          <v-flex xs12 sm4 my-2>
            <v-card v-if="stats" >
              <v-card-title class="d-block text-xs-center">
                  <h2 class="headline mb-0 mt-2">
                    <span class="digits huge">{{ bioSurfaceConnueRatio }}%</span>
                    des surfaces
                  </h2>
                  <p><b>cultivées en bio</b> sont cartographiées à ce jour.</p>
              </v-card-title>
            </v-card>
          </v-flex>

          <v-flex xs12 sm4 my-2>
            <v-card v-if="stats">
              <v-card-title class="d-block text-xs-center">
                  <h2 class="headline mb-0 mt-2">
                    <span class="digits huge">{{monthlyVisits || '-' }}</span>
                    connexions <abbr title="Organisme de Certification">OC</abbr>
                  </h2>
                  <p>depuis le début du mois</p>
              </v-card-title>
            </v-card>
          </v-flex>

          <v-flex xs12 sm4 my-2>
            <v-card v-if="stats">
              <v-card-title class="d-block text-xs-center">
                  <h2 class="headline mb-0 mt-2">
                    <span class="digits huge">{{dataAccessCount}}</span>
                    demandes de données
                  </h2>
                  <p>par des collectivités et acteurs publics</p>
              </v-card-title>
            </v-card>
          </v-flex>

          <v-flex xs12 sm4 my-2>
            <v-card v-if="stats">
              <v-card-title class="d-block text-xs-center">
                  <h2 class="headline mb-0 mt-2">
                    <span class="digits huge">{{ apiAccessCount || '-' }}</span>
                    <abbr title="Organisme de Certification">OC</abbr> utilise{{ apiAccessCount > 1 ? 'nt' : '' }} l'API CartoBio
                  </h2>

                  <p>{{ apiAccessCallsCount }} requêtes depuis le début du mois</p>
              </v-card-title>
            </v-card>
          </v-flex>
        </v-layout>
      </v-container>
    </v-content>

    <Partners />
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
import {get} from "axios";

import HomeNavbar from "@/components/HomeNavbar";
import Partners from "@/components/Partners";

// SAU en 2019
const SAU_TOTALE = 29000000;

// SAU BIO Totale estimée en 2019 (en attente consolidation du chiffre par l'observatoire de l'agriculture biologique)
const SAU_TOTALE_BIO = 2400000;

function million(value) {
  return value / 1000000
}

function round (value) {
  return value.toFixed(2)
}

export default {
  name: "Stats",

  metaInfo: {
    title: 'Statistiques et mesures d\'impact',
  },

  data() {
    return {
      stats: null,
      apiAccessCount: null,
      apiAccessCallsCount: null,
      dataAccessCount: 10,
      loading: true,
      errored: false,
      SAU_TOTALE,
      monthlyVisits: null,
    };
  },

  components: {
    HomeNavbar,
    Partners,
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
    bioSurfaceConnueRatio() {
      return (this.bioSurface/SAU_TOTALE_BIO * 100).toFixed(1)
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

    const requestP = get(matomoURL, {params})

    // we fetch Event Actions which names is associated with a successful login
    requestP.then(({data}) => {
      const {nb_visits} = data.find(({label}) => label === "Success")
      this.monthlyVisits = nb_visits;
    })

    // we fetch userIds of `/api/v1/parcels` Event Action
    // oc:0 is the test token
    requestP.then(({data}) => {
      const {subtable} = data.find(({label}) => label === "/api/v1/parcels")

      const subtables = subtable.filter(({label}) => label.match(/^oc:/) && label !== 'oc:0');

      this.apiAccessCount = subtables.length
      this.apiAccessCallsCount = subtables.reduce((total, {nb_events}) => total + nb_events, 0)
    })

  }
};
</script>
