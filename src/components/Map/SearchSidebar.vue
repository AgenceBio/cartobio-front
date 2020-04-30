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
              <p class="caption" v-if="organismeCertificateur">
                Saisir une ville, un code postal
                ou un nom d'exploitation certifiée par <i>{{ organismeCertificateur.nom }}</i>.
              </p>
              <p class="caption" v-else>
                Saisir une ville ou un code postal.
              </p>

              <Geosearch  @towns-received="towns = $event"
                          @operators-received="operators = $event"
                          :ocId="organismeCertificateur.id">
              </Geosearch>
            </v-list-tile-content>
          </v-list-tile>
        </v-list>

        <v-expansion-panel expand v-model="panels" class="search-results elevation-0">
          <v-expansion-panel-content v-if="operators.length" key="operators">
            <template v-slot:header>
              <div>Exploitations</div>
            </template>

            <v-list two-line>
              <template v-for="(operator, i) in operators">
                <v-divider v-if="i" :key="i"></v-divider>
                <v-list-tile :key="operator.id" @click="$emit('setOperator', operator)">
                  <v-list-tile-content>
                    <v-list-tile-title>{{ operator.title }}</v-list-tile-title>

                    <v-list-tile-sub-title v-if="!operator.active" class="caption">
                      <v-icon small>warning</v-icon>
                      Exploitation considérée inactive par l'Agence Bio.
                    </v-list-tile-sub-title>
                    <v-list-tile-sub-title v-else-if="!operator.numeroPacage" class="caption">
                      <v-icon small>warning</v-icon>
                      Numéro PACAGE inconnu —
                      <a :href="'https://notification.agencebio.org/fiche/' + operator.id" rel="noopener">le renseigner ?</a>
                    </v-list-tile-sub-title>
                    <v-list-tile-sub-title v-else-if="operator.dateEngagement <= '2019-05-15'" class="caption">
                      <v-icon small>warning</v-icon>
                      Données parcellaires inconnues.
                    </v-list-tile-sub-title>
                    <v-list-tile-sub-title v-else-if="operator.dateEngagement > '2019-05-15' && operator.dateEngagement <= '2020-05-15' && dateNow < '2020-07-15'" class="caption">
                      <v-icon small>info</v-icon>
                      Les parcelles seront visibles le 15 juillet 2020.
                    </v-list-tile-sub-title>
                    <v-list-tile-sub-title v-else-if="operator.dateEngagement > '2020-05-15' && dateNow < '2020-07-15'" class="caption">
                      <v-icon small>info</v-icon>
                      Les parcelles seront visibles le 15 juillet 2021.
                    </v-list-tile-sub-title>
                    <v-list-tile-sub-title v-else class="caption">
                      {{ operator.numeroPacage }}
                    </v-list-tile-sub-title>
                  </v-list-tile-content>
                </v-list-tile>
              </template>
            </v-list>
          </v-expansion-panel-content>

          <v-expansion-panel-content v-if="towns.length" key="cities">
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
import Geosearch from "@/components/Geosearch";

export default {
  name: "SearchSidebar",
  props: {
    drawer: Boolean,
    organismeCertificateur: Object
  },
  components: {
    Geosearch,
  },

  data() {
    return {
      dateNow: new Date().toISOString().split('T')[0],
      panels: [true, true],
      operators: [],
      towns: [],
    };
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

.v-list {
  padding: 0;
}

.v-icon {
  color: #457382;
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
