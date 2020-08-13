<template>
  <v-navigation-drawer app clipped stateless hide-overlay v-model="drawer">
    <v-container fluid fill-height pa-0>
      <v-layout column>
        <v-toolbar dark flat prominent color="#457382">
          <v-toolbar-side-icon @click="clearOperator">
            <v-icon>navigate_before</v-icon>
          </v-toolbar-side-icon>
          <v-toolbar-title class="ml-0">
            {{ operator.title }}
          </v-toolbar-title>

          <v-spacer/>

          <v-btn v-if="hasData" flat icon small @click.native.stop @click="$emit('zoom-on', parcels)">
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


        <pacage-flow v-if="operator.numeroPacage === null" :operator="operator" />
        <v-flex class="grow text-sm-center my-5" v-else-if="isLoading">
          <v-progress-circular indeterminate size=64 color="#457382" />

          <p class="my-3">Chargement des parcelles.</p>
        </v-flex>
        <parcels-list v-else-if="isLoaded && hasData" :parcels="parcels" :operator="operator" />
        <parcels-submit v-else-if="isLoaded && !hasData" :operator="operator" />

      </v-layout>
    </v-container>
  </v-navigation-drawer>
</template>
<script>
import {mapState, mapMutations} from 'vuex';

import PacageFlow from './OperatorSidebarPacage.vue'
import ParcelsList from './OperatorSidebarParcelsList.vue'
import ParcelsSubmit from './OperatorSidebarParcelsSubmit.vue'

export default {
  name: "OperatorSidebar",

  components: {
    PacageFlow,
    ParcelsList,
    ParcelsSubmit
  },

  props: {
    // parcels is a FeatureCollection
    parcels: Object,
    operator: Object,
    drawer: Boolean
  },

  data() {
    return {
      dialog: false,
      isLoaded: true
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

    hasData () {
      return Boolean(!this.isLoading && Array.isArray(this.parcels.features) && this.parcels.features.length)
    },
  },

  methods: {
    ...mapMutations({
      clearOperator: 'operators/CLEAR_CURRENT'
    })
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
.v-toolbar /deep/ .v-toolbar__content {
  padding-left: 12px; /* half of what it is supposed to be */
}

.v-toolbar /deep/ .v-toolbar__title {
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

.v-expansion-panel /deep/ .v-expansion-panel__header {
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
