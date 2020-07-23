<template>
  <v-navigation-drawer app clipped stateless hide-overlay v-model="drawer">
    <v-container fluid fill-height pa-0>
      <v-layout column>

        <v-list two-line class="mb-4">
          <v-subheader>
            Recherche
          </v-subheader>

          <v-list-tile class="search grow">
            <v-list-tile-content>
              <p class="caption" v-if="organismeCertificateurId">
                Saisir une ville, un code postal
                ou un nom d'exploitation certifiée par <i>{{ organismeCertificateur.nom }}</i>.
              </p>
              <p class="caption" v-else>
                Saisir une ville ou un code postal.
              </p>

              <Geosearch  :operators="_certificationBodyOperators"
                          @towns-received="towns = $event"
                          @operators-received="operators = $event" />

            </v-list-tile-content>
          </v-list-tile>
        </v-list>

        <v-expansion-panel expand v-model="panels" class="search-results elevation-0">
          <v-expansion-panel-content :hidden="operators.length === 0" key="operators">
            <template v-slot:header>
              <div>Exploitations</div>
            </template>

            <v-list two-line>
              <template v-for="(operator, i) in foundOperators">
                <v-divider v-if="i" :key="i"></v-divider>
                <v-list-tile :key="operator.numerobio" @click="$emit('select-operator', operator.numerobio)">
                  <v-list-tile-content>
                    <v-list-tile-title>{{ operator.nom }}</v-list-tile-title>

                    <v-list-tile-sub-title v-if="!operator.active" class="caption">
                      <v-icon small>warning</v-icon>
                      Exploitation considérée inactive par l'Agence Bio.
                    </v-list-tile-sub-title>
                    <v-list-tile-sub-title v-else-if="operator.pacage === null" class="caption">
                      <v-icon small>help_outline</v-icon>
                      Parcellaire inconnu.
                    </v-list-tile-sub-title>
                    <v-list-tile-sub-title v-else-if="operator.pacage === ''" class="caption">
                      <v-icon small color="green">check_circle_outline</v-icon>
                      Hors PAC,
                      engagé bio en {{ operator.date_engagement | dateYear }}.
                    </v-list-tile-sub-title>

                    <v-list-tile-sub-title v-else-if="operator.dateCheck > '2019-05-15' && operator.dateCheck <= '2020-05-15' && dateNow < '2020-07-15'" class="caption">
                      <v-icon small>info_outline</v-icon>
                      Les parcelles seront visibles le <b>15 juillet 2020</b>.
                    </v-list-tile-sub-title>
                    <v-list-tile-sub-title v-else-if="operator.dateCheck > '2020-05-15' && dateNow < '2020-07-15'" class="caption">
                      <v-icon small>info</v-icon>
                      Les parcelles seront visibles le <b>15 juillet 2021</b>.
                    </v-list-tile-sub-title>
                    <v-list-tile-sub-title v-else class="caption">
                      <v-icon small color="green">check_circle_outline</v-icon>
                      PACAGE <b>{{ operator.pacage }}</b>,
                      engagé bio en {{ operator.date_engagement | dateYear }}.
                    </v-list-tile-sub-title>
                  </v-list-tile-content>
                </v-list-tile>
              </template>
            </v-list>
          </v-expansion-panel-content>

          <v-expansion-panel-content :hidden="towns.length === 0" key="cities">
            <template v-slot:header>
              <div>Communes</div>
            </template>

            <v-list one-line>
              <template v-for="({lat, lon, label, postcode, key}, i) in towns">
                <v-divider v-if="i" :key="i"></v-divider>
                <v-list-tile :key="key" @click="$emit('flyto', {lat, lon, zoom: 12})">
                  <v-list-tile-content>
                    <v-list-tile-title>{{ postcode }}, {{ label }}</v-list-tile-title>
                  </v-list-tile-content>
                </v-list-tile>
              </template>
            </v-list>
          </v-expansion-panel-content>
        </v-expansion-panel>
      </v-layout>
    </v-container>
  </v-navigation-drawer>
</template>
<script>
import {mapState} from 'vuex';
import Geosearch from "@/components/Geosearch";

export default {
  name: "SearchSidebar",
  props: {
    drawer: Boolean,
    organismeCertificateur: Object,
    organismeCertificateurId: Number
  },

  components: {
    Geosearch,
  },

  filters: {
    dateYear: (dateString) => new Date(dateString).getFullYear(),
  },

  data() {
    return {
      dateNow: new Date().toISOString().split('T')[0],
      panels: [true, true],
      operators: [],
      towns: [],
    };
  },

  computed: {
    ...mapState({
      _certificationBodyOperators: state => state.operators.certificationBodyOperators,
    }),

    foundOperators () {
      return this.operators.map(numerobio => {
        return this._certificationBodyOperators.features.find(feature => {
          return feature.properties.numerobio === numerobio
        }).properties
      })
    }
  },

  watch: {
    towns (newList) {
      if (newList.length === 0) {
        this.panels = [true, true];
      }
    },

    operators (newList) {
      if (newList.length === 0) {
        this.panels = [true, true];
      }
    }
  }
};
</script>

<style lang="scss" scoped>
.search .v-list__tile__content {
  height: auto;
}

[role="listitem"]:not(.no-click) /deep/ .v-list__tile--link:hover,
[role="listitem"]:not(.no-click):hover + .v-divider {
  border-color: #1976d2;
  color: #1976d2;
}

[role="listitem"].no-click /deep/ .v-list__tile--link {
  cursor: default;

  &:hover {
    background: transparent;
  }
}

.v-list {
  padding: 0;
}

/deep/ .v-expansion-panel__header {
  padding: 0 16px; // same as .v-list-tile-content
}

/deep/ .v-expansion-panel__header,
.theme--light.v-subheader {
  color: #457382;
  font-weight: bold;
  text-transform: uppercase;
}
</style>
