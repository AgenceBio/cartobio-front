<template>
  <v-navigation-drawer app clipped stateless hide-overlay v-model="drawer">
    <v-container fluid fill-height pa-0>
      <v-layout column>
        <v-toolbar dark flat prominent color="#457382">
          <v-toolbar-side-icon @click="$emit('close-drawer')">
            <v-icon>navigate_before</v-icon>
          </v-toolbar-side-icon>
          <v-toolbar-title class="ml-0">
            {{ operator.title }}
          </v-toolbar-title>

          <v-spacer/>

          <v-btn v-if="parcels.length" flat icon small @click.native.stop @click="$emit('zoom-on', parcels)">
            <v-tooltip top left dark open-delay=200>
              <template v-slot:activator="{ on }">
                <v-icon v-on="on" small>my_location</v-icon>
              </template>

              Centrer la carte sur l'exploitation
            </v-tooltip>
          </v-btn>
        </v-toolbar>

        <v-flex shrink>
          <p class="update-info pa-2 ma-0 caption">
            <v-icon small color="#457382">info</v-icon>
            Dernière mise à jour le <b>{{ baseDate | formatDate }}</b>.
          </p>
        </v-flex>

        <parcels-list v-if="hasParcels" :parcels="parcels" :operator="operator" />
        <pacage-flow v-else :operator="operator" />

      </v-layout>
    </v-container>
  </v-navigation-drawer>
</template>
<script>

import PacageFlow from './OperatorSidebarPacage.vue'
import ParcelsList from './OperatorSidebarParcelsList.vue'

export default {
  name: "OperatorSidebar",

  components: {
    PacageFlow,
    ParcelsList
  },

  filters: {
    formatDate (dateString) {
      return new Date(dateString).toLocaleDateString('fr-FR', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      })
    }
  },

  props: {
    // parcels is a FeatureCollection
    parcels: Object,
    operator: Object,
    drawer: Boolean
  },

  computed: {
    hasParcels () {
      const {baseDate} = this

      return this.operator.numeroPacage && (
        this.operator.dateEngagement > baseDate ||
        this.operator.dateMaj > baseDate
      )
    }
  },

  data() {
    return {
      baseDate: '2019-05-15',
      dialog: false,
    };
  },

  watch: {
    drawer: function(newVal) {
      if (newVal)
        this.$emit("open-drawer");
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
