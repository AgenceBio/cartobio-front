<template>
  <v-flex class="layers-panel">
    <v-expansion-panel popout expand v-bind:value="expandLayers">
      <v-expansion-panel-content>
        <template v-slot:header>
          <div class="expansion-title">
            <v-icon class="mr-2">layers</v-icon>Calques
          </div>
        </template>
        <v-card>
          <!-- <v-list dense class="pt-0" v-if="operator.title">
            <v-list-tile subheader>
              <v-subheader>{{ operator.title }}</v-subheader>
            </v-list-tile>
             List of years with parcels from the operator -->
            <!--<v-list-tile
              v-for="(year, index) in sortedYears"
              :key="index"
              @click="toggleLayerOperator(year)"
            >
              <v-list-tile-action>
                <v-switch
                  :color="layersVisible[year].colorBio"
                  v-model="layersVisible[year].visibility"
                  @click="toggleLayerOperator(year)"
                />
              </v-list-tile-action>
              <v-list-tile-content>{{year}}</v-list-tile-content>
            </v-list-tile>
          </v-list> -->

          <v-divider></v-divider>

          <!-- <v-list-tile>
            <v-subheader>Registre Parcellaire Graphique Bio</v-subheader>
          </v-list-tile> -->

          <!-- <v-list class="pt-0" dense>
            List of years with parcels from the operator
            <v-list-tile
              v-for="(year, index) in sortedYears"
              :key="index"
              @click="toggleLayerAnon(year)"
            >
              <v-list-tile-action>
                <v-switch
                  :color="layersVisible['anon' + year].color"
                  v-model="layersVisible['anon' + year].visibility"
                  @click="toggleLayerAnon(year)"
                ></v-switch>
              </v-list-tile-action>
              <v-list-tile-content>{{year}}</v-list-tile-content>
            </v-list-tile>
          </v-list> -->
        </v-card>
      </v-expansion-panel-content>
    </v-expansion-panel>
  </v-flex>
</template>

<script>
export default {
  name: "LayersPanel",
  props: {
      operator: Object
  },
  data() {
    return {
        expandNearbyLayers: true
    }
  },
  components: {}
};
</script>

<style lang="scss" scoped>
</style>