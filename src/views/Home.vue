<template>
  <div>
    <HomeNavbar></HomeNavbar>
    <v-content>
      <section id="title">
        <v-parallax :src="require('../../src/assets/coquelicots.jpg')" height="400">
          <Title
            msg="Ouvrir, enrichir et partager les données
parcellaires de l’agriculture biologique
"
          />
        </v-parallax>
      </section>
      <section id="objectives" class="blue-grey lighten-5">
        <v-layout column wrap class="py-5" align-center>
          <Problem />
        </v-layout>
      </section>
      <section id="about" class="grey lighten-5">
        <v-layout column wrap class="py-5" align-center>
          <About />
        </v-layout>
      </section>
      <section id="follow" class="blue-grey lighten-5">
        <v-layout column wrap class="py-5" align-center>
          <v-container grid-list-xl>
            <h1>Suivre le projet</h1>
            <v-layout row wrap justify-center>
              <v-flex xs12 md4>
                <v-card class="elevation-3">
                  <v-card-text class="text-xs-center primary-green">
                    <v-icon x-large>file_copy</v-icon>
                  </v-card-text>
                  <v-card-title primary-title class="layout justify-center">
                    <div class="title">Suivre l'avancement du projet</div>
                  </v-card-title>
                  <v-card-text>
                    Nous mettons régulièrement à jour ce document avec le déroulement et les avancées du projet
                    <v-btn
                      round
                      title="Découvrir notre démarche projet"
                      color="primary-green"
                      class="mt-3"
                      dark
                      href="https://hackmd.io/@lucasbio/cartobio"
                      target="_blank"
                    >Découvrir notre démarche projet</v-btn>
                  </v-card-text>
                </v-card>
              </v-flex>
              <v-flex xs12 md4>
                <v-card class="elevation-3">
                  <v-card-text class="text-xs-center primary-green" flex column>
                    <v-flex xs-12>
                      <v-layout>
                        <v-img
                          contain
                          aspect-ratio="1"
                          max-height="40px"
                          :src="require('../assets/eig.png')"
                        ></v-img>

                        <v-icon xs-4 x-large>arrow_forward</v-icon>

                        <v-img
                          contain
                          max-height="40px"
                          :src="require('../assets/logo-betagouvfr.svg')"
                        ></v-img>
                      </v-layout>
                    </v-flex>
                  </v-card-text>
                  <v-card-title primary-title class="layout justify-center">
                    <div class="title">
                      Un projet
                      <a
                        href="https://entrepreneur-interet-general.etalab.gouv.fr/"
                        title="Site des Entrepreneurs d'Intérêt Général"
                        target="_blank"
                      >EIG</a>...
                      <br />Devenu
                      <a
                        href="https://beta.gouv.fr/"
                        title="Site des Start Up d'Etat et de Territoires"
                        target="_blank"
                      >Start Up D'Etat</a> !
                    </div>
                  </v-card-title>
                  <v-card-text>
                    A l'issue du programme Entrepreneurs d'Intérêt Général, nous nous sommes tournés vers beta.gouv afin de nous accompagner sur le déploiment du projet, et en assurer sa pérénnisation.
                    Plus d'information
                    <a
                      href="https://beta.gouv.fr/startups/cartobio.html"
                      title="Page de descriptif de CartoBio sur le site de beta.gouv"
                      target="_blank"
                    >ici</a>
                    <br />
                    <v-btn
                      round
                      title="Contactez nous"
                      color="primary-green"
                      class="mt-3"
                      dark
                      href="mailto:cartobio@beta.gouv.fr"
                    >Contactez nous!</v-btn>
                  </v-card-text>
                </v-card>
              </v-flex>

              <v-flex xs12 md4>
                <v-card class="elevation-3">
                  <v-card-text class="text-xs-center primary-green">
                    <v-icon x-large>code</v-icon>
                  </v-card-text>
                  <v-card-title primary-title class="layout justify-center">
                    <div class="title text-xs-center">Ouvrir son code</div>
                  </v-card-title>
                  <v-card-text>
                    Publier le code de l’application sur
                    <a href target="_blank">GitHub</a> sous MIT, dans un but de transparence et de maintenabilité.
                    <br />Argent Public = Code Public
                  </v-card-text>
                </v-card>
              </v-flex>
            </v-layout>
          </v-container>
        </v-layout>
      </section>
    </v-content>
    <v-footer id="partners" height="auto" color="#b9d065">
      <Partners />
    </v-footer>
  </div>
</template>

<script>
// @ is an alias to /src
import HomeNavbar from "@/components/HomeNavbar";
import Title from "@/views/Title";
import About from "@/views/About";
import Problem from "@/views/Problem";
import Partners from "@/components/Partners";

export default {
  name: "Home",
  components: {
    HomeNavbar,
    Title,
    Problem,
    About,
    Partners
  },
  data() {
    return {};
  }
};
</script>

<style lang="scss">
* {
  margin: 0;
  padding: 0;
}

html {
  overflow-y: auto;
}

a {
  color: white;
  text-decoration: none;
}

section {
  text-align: center;
}

.logo {
  height: 40px;
}

.section-container {
  height: calc(100% - 70px);
}

.centered {
  display: flex;
  justify-content: center;
  flex-direction: column;
  align-items: center;
}

.icon-eig {
  background-image: url("../../src/assets/eig.png");
  background-position: center;
  background-size: 24px;
}

.v-icon.bio-green.theme--light {
  color: #b9d065;
}

.primary-green {
  background-color: #b9d065 !important;
  border-color: #b9d065 !important;
}
.primary-green--text {
  color: #b9d065 !important;
}
</style>
