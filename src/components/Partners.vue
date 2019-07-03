<template>
  <v-layout justify-center row wrap>
    <v-card flat tile class="text-xs-center transparent">
      <v-card-text>
        <v-layout row wrap justify-center>
          <a href="https://www.agencebio.org/" target="_blank">
            <img
              alt="Logo Agriculture Biologique"
              src="../assets/logo_agri_bio.jpg"
              class="logo mx-2"
            >
          </a>
          <a href="https://www.geoportail.gouv.fr/" target="_blank">
            <img alt="IGN logo" src="../assets/ign.png" class="logo mx-2">
          </a>
          <a
            href="https://entrepreneur-interet-general.etalab.gouv.fr/defis/2019/cartobio.html"
            target="_blank"
          >
            <img alt="EIG logo" src="../assets/logo-eig2.png" class="logo mx-2">
          </a>
          <a
            href="https://www.gouvernement.fr/secretariat-general-pour-l-investissement-sgpi"
            target="_blank"
          >
            <img
              alt="Logo investir l'avenir"
              src="../assets/logo_investirlavenir.png"
              class="logo mx-2"
            >
          </a>
          <v-divider vertical class="mx-3"></v-divider>
          <p class="madewith">Fait avec</p>
          <a href="https://vuetifyjs.com/en/" target="_blank">
            <img alt="vuetify logo" src="../assets/logo.svg" class="logo mx-2">
          </a>
        </v-layout>
      </v-card-text>
      <v-divider></v-divider>
      <v-card-text>
        <v-layout row wrap justify-center>
          <v-dialog v-model="dialog.activated" width="500">
            <template v-slot:activator="{ on }">
              <a v-on="on" class="legal">Mentions Légales</a>
            </template>
            <Legal :dialog="dialog"></Legal>
          </v-dialog>
          <v-divider vertical class="mx-3"></v-divider>&copy;2019 —
          <strong>Agence BIO</strong>
        </v-layout>
      </v-card-text>
    </v-card>
  </v-layout>
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
  },
  methods: {
    displayProfile: function() {
      console.log(this.getProfile);
    }
  }
};
</script>

<style scoped>
.logo {
  max-height: 100px;
  width: auto;
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
