<template>
  <v-flex class="layers-panel">
    <v-expansion-panel expand>
      <v-expansion-panel-content>
        <template v-slot:header>
          <div class="expansion-title">
            <v-icon class="mr-2">layers</v-icon>Exploitation
          </div>
        </template>

        <v-divider></v-divider>
        <v-expansion-panel v-model="expansionValue">
          <v-layout column>
            <v-flex grow>
              <v-expansion-panel-content>
                <template v-slot:header>
                  <div>Cultures environnantes</div>
                </template>
                <v-card>
                  <v-card-text>
                    parcelles bio
                    <br />parcelles conventionnelles
                  </v-card-text>
                </v-card>
              </v-expansion-panel-content>
            </v-flex>
            <v-flex grow>
              <v-expansion-panel-content>
                <template v-slot:header>
                  <div>Historique de conversion</div>
                </template>
                <v-card>
                  <v-card-text>Récent - depuis plusieurs années</v-card-text>
                </v-card>
              </v-expansion-panel-content>
            </v-flex>
          </v-layout>
        </v-expansion-panel>
      </v-expansion-panel-content>
    </v-expansion-panel>
  </v-flex>
</template>

<script>
import { mapMutations } from "vuex";

export default {
  name: "LayersPanel",
  props: {
    operator: Object,
  },
  data() {
    return {
      expansionValue: null,
    };
  },
  methods: {
    ...mapMutations("exploitationView", ["changeViewMode"]),
  },
  watch : {
    expansionValue(newVal) {
      this.changeViewMode(newVal);
    }
  }
};
</script>

<style lang="scss" scoped>
// prevent side effect of default style
ul,
li {
  margin: 0;
}
</style>