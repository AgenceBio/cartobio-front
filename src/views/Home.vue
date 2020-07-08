<template>
  <v-content>
    <section id="title" class="blue-grey lighten-5">
      <Title />
    </section>
    <section id="objectifs" class="blue-grey lighten-5">
      <v-layout column wrap class="py-5" align-center>
        <Problem />
      </v-layout>
    </section>
    <section id="a-propos" class="blue-grey lighten-5">
      <v-layout column wrap class="py-5" align-center>
        <About />
      </v-layout>
    </section>
    <section id="nous-suivre" class="blue-grey lighten-5">
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
                      <svg class="logo mx-auto">
                        <use xlink:href="@/assets/logos-sprite.svg#betagouvfr"></use>
                      </svg>
                    </v-layout>
                  </v-flex>
                </v-card-text>
                <v-card-title primary-title class="layout justify-center">
                  <div class="title">
                    Le projet est incubé par
                    <a
                      href="https://beta.gouv.fr/"
                      title="Site des Start Up d'Etat et de Territoires"
                      target="_blank"
                    >l'incubateur des services numériques</a> de l'État (DINUM)
                  </div>
                </v-card-title>
                <v-card-text>
                  A l'issue du programme Entrepreneurs d'Intérêt Général, nous nous sommes tournés vers l'Incubateur afin de nous accompagner sur le déploiement du projet, et le pérenniser.
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
                  <a
                    href="https://github.com/entrepreneur-interet-general/CartoBio-Presentation/blob/master/LICENSE"
                    target="_blank"
                  >GitHub</a> sous MIT, dans un but de transparence et de maintenabilité.
                  <br />
                  <div class="font-weight-bold subheading">Argent Public = Code Public</div>
                  <br />
                  <v-btn
                    round
                    title="Lien GitHub"
                    color="primary-green"
                    class="mt-3"
                    dark
                    target="_blank"
                    href="https://github.com/entrepreneur-interet-general/CartoBio-Presentation"
                  >Voir le code</v-btn>
                </v-card-text>
              </v-card>
            </v-flex>
          </v-layout>
        </v-container>
      </v-layout>
    </section>
  </v-content>
</template>

<script>
// @ is an alias to /src
import Title from "@/views/Title";
import About from "@/views/About";
import Problem from "@/views/Problem";

export default {
  name: "Home",
  components: {
    Title,
    Problem,
    About,
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

.section-container {
  height: calc(100% - 70px);
}

.centered {
  display: flex;
  justify-content: center;
  flex-direction: column;
  align-items: center;
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

<style type="scss" scoped>
.logo {
  max-height: 40px;
}
</style>
