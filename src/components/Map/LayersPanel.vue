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
          <v-expansion-panel :value="expansionValue">
            <v-expansion-panel-content @click="changeViewMode('environment')" >
              <template v-slot:header>
                <div>Cultures environnantes</div>
              </template>
              <v-card>
                <v-card-text>parcelles bio
                <br/>
                parcelles conventionnelles</v-card-text>
              </v-card>
            </v-expansion-panel-content>
            <v-expansion-panel-content @click="changeViewMode('historique')">
              <template v-slot:header>
                <div>Historique de conversion</div>
              </template>
              <v-card>
                <v-card-text>Récent - depuis plusieurs années</v-card-text>
              </v-card>
            </v-expansion-panel-content>
          </v-expansion-panel>
      </v-expansion-panel-content>
    </v-expansion-panel>
  </v-flex>
</template>

<script>
import { mapActions, mapGetters } from "vuex";

export default {
  name: "LayersPanel",
  props: {
    operator: Object
  },
  data() {
    return {
      expansionValue: 0
    };
  },
  methods: {
    ...mapActions("exploitationView", ["setExploitationView"]),
    changeViewMode(mode) {
      console.log("hey hey");
      if (mode !== this.exploitationView) {
        this.setExploitationView(mode);
      } else {
        this.setExploitationView(this.viewsList.EXPLOITATION);
      }
    }
  },
  computed: {
    ...mapGetters("exploitationView", ["viewsList"]),
    ...mapGetters("exploitationView", ["exploitationView"])
  },
  watch: {
    expansionValue: function(newVal) {
      console.log(newVal);
    }
  }
};
</script>

<style lang="scss" scoped>
// prevent side effect of default style
ul, li {
  margin: 0;
}
</style>