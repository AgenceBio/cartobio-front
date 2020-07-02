<template>
  <v-flex class="layers-panel">
    <v-expansion-panel popout expand>
      <v-expansion-panel-content>
        <template v-slot:header>
          <div class="expansion-title">
            <v-icon class="mr-2">layers</v-icon>Calques
          </div>
        </template>
        <v-card>
          <v-divider></v-divider>
          <v-list-tile>
            <v-subheader>Modes de vues</v-subheader>
          </v-list-tile>

          <v-list class="pt-0" dense>
            <v-list-tile
              v-for="(view, index) in viewsList"
              :key="index"
              @click="changeViewMode(view)"
            >
              
              <v-list-tile-content>{{view}}</v-list-tile-content>
            </v-list-tile>
          </v-list>
        </v-card>
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
      // ...mapGetters("mapView", ["viewsList"])
    };
  },
  methods: {
    ...mapActions("exploitationView", ["setExploitationView"]),
    changeViewMode(mode) {
      this.setExploitationView(mode);
    }
  },
  computed: {
      ...mapGetters("exploitationView", ["viewsList"])
  }
};
</script>

<style lang="scss" scoped>
</style>