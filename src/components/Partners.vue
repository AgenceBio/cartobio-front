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
        <a href="https://www.agencebio.org/" target="_blank">
          <svg class="logo">
            <use xlink:href="@/assets/logos-sprite.svg#ab"></use>
          </svg>
        </a>
        <a href="https://www.geoportail.gouv.fr/" target="_blank">
          <svg class="logo">
            <use xlink:href="@/assets/logos-sprite.svg#ign"></use>
          </svg>
        </a>
        <a class="mx-2"
          href="https://entrepreneur-interet-general.etalab.gouv.fr/defis/2019/cartobio.html"
          target="_blank"
        >
          <svg class="logo">
            <use xlink:href="@/assets/logos-sprite.svg#eig"></use>
          </svg>
        </a>
        <a
          href="https://www.gouvernement.fr/secretariat-general-pour-l-investissement-sgpi"
          target="_blank"
        >
          <svg class="logo">
            <use xlink:href="@/assets/logos-sprite.svg#investir-avenir"></use>
          </svg>
        </a>
        <a href="https://beta.gouv.fr/startups/cartobio.html" target="_blank">
          <svg class="logo">
            <use xlink:href="@/assets/logos-sprite.svg#betagouvfr"></use>
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

<style scoped>
.logo {
  height: 70px;
  max-width: 100px;
}
.madewith {
  height: 100%;
  margin-top: calc(20px - 0.5em);
  margin-bottom: 0;
}
.legal {
  color: black;
  text-decoration: underline;
}
</style>
