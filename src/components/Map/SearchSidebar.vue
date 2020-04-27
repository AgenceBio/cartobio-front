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
              <p class="caption">
                Saisir une ville, ou un nom d'exploitant.
              </p>
              <Geosearch @searchCompleted="handleSearchResult"></Geosearch>
            </v-list-tile-content>
          </v-list-tile>
        </v-list>

        <v-expansion-panel expand expandable v-model="panels" class="search-results elevation-0">
          <v-expansion-panel-content key="operators">
            <template v-slot:header>
              <div>Exploitants</div>
            </template>

            <v-list two-line>
              <v-list-tile>
                <v-list-tile-content>
                  <v-list-tile-title>Legrand Etienne</v-list-tile-title>
                  <v-list-tile-sub-title class="caption">00715216</v-list-tile-sub-title>
                </v-list-tile-content>
              </v-list-tile>
              <v-divider />
              <v-list-tile>
                <v-list-tile-content>
                  <v-list-tile-title>EARL Etienne Pochon</v-list-tile-title>
                  <v-list-tile-sub-title class="caption">
                    <v-icon small>info</v-icon>
                    Pas de déclaration PAC connue au 15 juillet 2019.
                  </v-list-tile-sub-title>
                </v-list-tile-content>
              </v-list-tile>
            </v-list>
          </v-expansion-panel-content>

          <v-expansion-panel-content key="cities">
            <template v-slot:header>
              <div>Communes</div>
            </template>

            <v-list one-line>
              <v-list-tile>
                <v-list-tile-content>
                  <v-list-tile-title>50360, Etienville</v-list-tile-title>
                </v-list-tile-content>
              </v-list-tile>
              <v-divider />
              <v-list-tile>
                <v-list-tile-content>
                  <v-list-tile-title>42000, Saint-Etienne</v-list-tile-title>
                </v-list-tile-content>
              </v-list-tile>
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
  },
  components: {
    Geosearch,
  },
  data() {
    return {
      panels: [true, true]
    };
  },
  methods: {
  },
  computed: {
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
