<template>
  <v-footer id="partenaires" class="grow" height="auto" color="#b9d065">
    <v-card flat tile class="text-xs-center transparent" width="100%">
      <v-card-text class="text-xs-center">
        <a class="mx-2" href="https://www.agencebio.org/" target="_blank">
          <svg class="logo">
            <use xlink:href="@/assets/logos-sprite.svg#agence-bio"></use>
          </svg>
        </a>
        <a class="mx-2" href="https://www.inao.gouv.fr/" target="_blank">
          <svg class="logo">
            <use xlink:href="@/assets/logos-sprite.svg#inao"></use>
          </svg>
        </a>
      </v-card-text>

      <v-divider />

      <v-card-text>
        <v-layout row wrap justify-center>
          <v-dialog v-model="dialog.activated" width="500">
            <template v-slot:activator="{ on }">
              <a v-on="on" class="legal">Mentions Légales</a>
            </template>
            <Legal :dialog="dialog"></Legal>
          </v-dialog>
          <v-divider vertical class="mx-3"></v-divider>
          &copy; 2020 — Agence BIO
        </v-layout>
      </v-card-text>
    </v-card>
  </v-footer>
</template>

<script>
import Legal from "@/views/Legal";
export default {
  name: "partners",
  components: {
    Legal
  },
  data() {
    return {
      dialog: {
        activated: false
      }
    };
  }
};
</script>

<style type="scss" scoped>
.v-footer {
  flex: 1 0 auto !important;
}
.logo {
  height: 70px;
  max-width: 100px;
}

.legal {
  color: black;
  text-decoration: underline;
}
</style>
