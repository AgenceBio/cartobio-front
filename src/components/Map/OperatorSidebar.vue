<template>
  <v-container fluid fill-height pa-0>
    <v-layout column>
      <v-toolbar dark flat prominent color="#457382">
        <v-toolbar-side-icon :to="{ name: parentRoute }">
          <v-icon>navigate_before</v-icon>
        </v-toolbar-side-icon>
        <v-toolbar-title class="ml-0">
          {{ operator.title }}
        </v-toolbar-title>

        <v-spacer/>

        <v-btn v-if="hasData" flat icon small @click.native.stop @click="zoomOn(parcels)">
          <v-tooltip top left dark open-delay=200>
            <template v-slot:activator="{ on }">
              <v-icon v-on="on" small>my_location</v-icon>
            </template>

            Centrer la carte sur l'exploitation
          </v-tooltip>
        </v-btn>
      </v-toolbar>

      <v-flex shrink>
        <div class="update-info pa-2 ma-0 caption">
          <p v-if="operator.numeroPacage === null">
            <v-icon small>help_outline</v-icon>
            Statut PAC inconnu,
            engagé bio en {{ operator.dateEngagement | dateYear }}.
          </p>
          <p v-else-if="operator.numeroPacage === ''">
            <v-icon small color="green">check_circle_outline</v-icon>
            Hors PAC,
            engagé bio en {{ operator.dateEngagement | dateYear }}.
          </p>
          <p v-else>
            <v-icon small color="green">check_circle_outline</v-icon>
            PACAGE <b>{{ operator.numeroPacage }}</b>,
            engagé bio en {{ operator.dateEngagement | dateYear }}.
          </p>

          <v-icon small>info_outline</v-icon>
          Dernière mise à jour le <b>{{ baseDate | formatDate }}</b>.
        </div>
      </v-flex>

      <div v-if="!isLoading" class="text-md-center">
        <v-btn v-if="$route.name !== 'new-parcel'" :to="{ name: 'new-parcel', params: { numeroBio: operator.numeroBio } }" class="mh-auto mt-3 mb-4" small round color="#b9d065">
          <v-icon dark>add</v-icon>
          Ajouter une parcelle
        </v-btn>
      </div>

      <v-flex v-if="isLoading" class="grow text-sm-center my-5">
        <v-progress-circular indeterminate size=64 color="#457382" />

        <p class="my-3">Chargement des parcelles.</p>
      </v-flex>

      <router-view v-else :isLoaded="isLoaded" :parcels="parcels" :operator="operator" />
    </v-layout>
  </v-container>
</template>
<script>
import {mapActions, mapMutations, mapState} from 'vuex';

export default {
  name: "OperatorSidebar",

  props: {
    numeroBio: Number,
    // parcels is a FeatureCollection
    parcels: Object,
    operator: Object,
  },

  metaInfo () {
    return {
      title: `${this.operator.title} (numéro bio #${this.numeroBio})`
    }
  },

  data() {
    return {
      dialog: false,
      isLoaded: true,
    };
  },

  filters: {
    formatDate (dateString) {
      return new Date(dateString).toLocaleDateString('fr-FR', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      })
    },

    dateYear: (dateString) => new Date(dateString).getFullYear(),
  },

  computed: {
    ...mapState({
      isLoading: state => state.operators.areSingleOperatorParcelsLoading,
      baseDate: state => state.lastDataUpdate,
    }),

    parentRoute () {
      // Both are same level routes, so we can't use history.matched property
      let parentName;
      if (this.$route.name === 'parcels-list') {
        parentName = 'map';
      }
      else {
        parentName = 'parcels-list'
      }
      return parentName;
    },

    hasData () {
      return Boolean(!this.isLoading && Array.isArray(this.parcels.features) && this.parcels.features.length)
    },
  },

  methods: {
    ...mapMutations({
      clearOperator: 'operators/CLEAR_CURRENT'
    }),

    ...mapActions('map', ['zoomOn']),
  },

  created () {
    this.$store.commit("operators/SET_CURRENT", Number(this.numeroBio))
  },

  beforeDestroy () {
    this.clearOperator();
  },

  watch: {
    isLoading (newValue, oldValue) {
      if (newValue === false && oldValue === true) {
        this.isLoaded = true
      }
    },
  }
};
</script>

<style lang="scss" scoped>
.v-toolbar ::v-deep .v-toolbar__content {
  padding-left: 12px; /* half of what it is supposed to be */
}

.v-toolbar ::v-deep .v-toolbar__title {
  line-height: 1.1;
  overflow: auto;
  white-space: unset;
 }

.v-snack {
  color: #333;
  margin: 6px 6px 0;
}

.justify-self-start {
  margin-bottom: auto;
  padding-bottom: 10px;
}

.justify-self-end {
  margin-top: auto;
}

.no-box-shadow {
  box-shadow: unset;
}

.overflow {
  overflow-y: scroll;
  scrollbar-width: thin;
  scrollbar-color: #b0bec5;
}

.overflow::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}
.overflow::-webkit-scrollbar-track {
  background-color: #eceff1;
  border-radius: 10px;
}
.overflow::-webkit-scrollbar-thumb {
  background-color: #b0bec5;
  border-radius: 10px;
}

.text-cyan {
  color : #457382;
}

.v-expansion-panel ::v-deep .v-expansion-panel__header {
  cursor: default;
  padding: 0 12px;
}


.update-info {
  background: #F6F7E2;
  vertical-align: middle;
}

.full-width {
  width: 100%;
}

</style>
