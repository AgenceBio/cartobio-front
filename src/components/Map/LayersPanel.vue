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
          <v-expansion-panel elevation-0>
            <v-expansion-panel-content>
              <template @click="changeViewMode('environment')" v-slot:header>
                <div>Cultures environnantes</div>
              </template>
              <v-card>
                parcelles bio
                <br/>
                parcelles conventionnelles
              </v-card>
            </v-expansion-panel-content>
            <v-expansion-panel-content>
              <template @click="changeViewMode('historique')" v-slot:header>
                <div>Historique de conversion</div>
              </template>
              <v-card>
                Récent - depuis plusieurs années
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
    return {};
  },
  methods: {
    ...mapActions("exploitationView", ["setExploitationView"]),
    changeViewMode(mode) {
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
  }
};
</script>

<style lang="scss" scoped>
</style>