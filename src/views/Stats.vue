<template>
  <div>
    <HomeNavbar></HomeNavbar>

    <v-content>
      <v-container>

        <h1>Statistiques</h1>

        <v-flex xs12 sm4>
          <v-card>
            <v-card-title class="d-block">
                <h2 class="headline mb-0 text-xs-center">xxha</h2>
                <p class="subheading text-xs-center">xx%</p>
            </v-card-title>

            <v-card-text class="text-xs-center">
              <p>Surfaces en bio connues à ce jour.</p>
            </v-card-text>
          </v-card>
        </v-flex>
      </v-container>
    </v-content>
  </div>
</template>

<style lang="scss" scoped>
</style>

<script>
import HomeNavbar from "@/components/HomeNavbar";

export default {
  name: "Stats",
  components: {
    HomeNavbar,
  },
  data() {
    return {};
  }
};
</script>
