<template>
  <v-content class="blue-grey lighten-5">
    <v-layout id="title" column align-center justify-space-between my-4 py-5>
      <h1 class="display-2 mb-3">
        Les données de l'Agriculture Biologique en France
      </h1>

      <span>
        <v-btn to="/features/organismes-certification-bio" large outline round color="primary" class="mb-5 mt-4">
          Pour mon organisme de certification
        </v-btn>

        <v-btn to="/features/territoires" large outline round color="primary" class="mb-5 mt-4">
          Sur mon territoire
        </v-btn>
      </span>

      <v-card>
        <v-carousel height="auto" cycle>
          <v-carousel-item>
            <v-img contain src="@/assets/screenshot-oc-overview.jpg?lazy" aspect-ratio="1.87" width="630"></v-img>
          </v-carousel-item>
          <v-carousel-item>
            <v-img contain src="@/assets/screenshot-operateur.jpg" aspect-ratio="1.87" width="630"></v-img>
          </v-carousel-item>
          <v-carousel-item>
            <v-img contain src="@/assets/screenshot-download.jpg?lazy" aspect-ratio="1.87" width="630"></v-img>
          </v-carousel-item>
        </v-carousel>
      </v-card>
    </v-layout>

    <section class="green py-5">
      <v-card flat to="/features/organismes-certification-bio" color="transparent" max-width="840" class="mx-auto">
        <v-layout row wrap justify-space-between align-center>
          <v-flex xs6>
            <v-card-title>
              <h2>Support à la certification Bio</h2>
            </v-card-title>

            <v-card-text>
              <p>
                En 2018, la restauration hors foyer a acheté pour 550 millions
                d’euros de produits bio hors taxe. La restauration collective
                à caractère social enregistre une croissance record de +28 %
                vs 2017 qui fait écho aux annonces de la loi EGalim et aux
                attentes des consommateurs.
              </p>
            </v-card-text>

            <v-card-actions>
              <v-btn to="/features/territoires" round outline>
                <v-icon class="mr-1">chevron_right</v-icon>
                En savoir plus
              </v-btn>
              <v-btn to="/features/territoires#choose" round outline>
                <v-icon class="mr-2">lock_open</v-icon>
                Je me connecte
              </v-btn>
            </v-card-actions>
          </v-flex>

          <v-flex xs4>
            <v-img min-height="160" max-height="240" alt=""
              src="https://www.agencebio.org/wp-content/uploads/2019/06/Lancement-Printemps-BIO-28-mai-2014-Paris-La-Villette-Cr%C3%A9dit-Anthony-Voisin-9.jpg" />
          </v-flex>
        </v-layout>
      </v-card>
    </section>

    <section class="blue py-5">
      <v-card flat to="/features/territoires" color="transparent" max-width="840" class="mx-auto">
        <v-layout row wrap justify-space-between align-center>
          <v-flex xs6 order-xs2>
            <v-card-title>
              <h2>Les données de mon territoire</h2>
            </v-card-title>

            <v-card-text>
              <p>
                En 2018, la restauration hors foyer a acheté pour 550 millions
                d’euros de produits bio hors taxe. La restauration collective
                à caractère social enregistre une croissance record de +28 %
                vs 2017 qui fait écho aux annonces de la loi EGalim et aux
                attentes des consommateurs.
              </p>
            </v-card-text>

            <v-card-actions>
              <v-btn to="/features/territoires" round outline>
                <v-icon class="mr-1">chevron_right</v-icon>
                En savoir plus
              </v-btn>
              <v-btn to="/features/territoires#choose" round outline>
                <v-icon class="mr-2">playlist_add</v-icon>
                Choisir mes données
              </v-btn>
            </v-card-actions>
          </v-flex>

          <v-flex xs4 order-xs1>
            <v-img min-height="160" max-height="240" alt=""
              src="https://www.agencebio.org/wp-content/uploads/2019/06/Lancement-Printemps-BIO-28-mai-2014-Paris-La-Villette-Cr%C3%A9dit-Anthony-Voisin-9.jpg" />
          </v-flex>
        </v-layout>
      </v-card>
    </section>

    <section class="py-5">
      <v-card flat color="transparent" max-width="840" class="mx-auto">
        <v-layout row wrap justify-space-between align-center>
          <v-flex xs6>
            <v-card-title>
              <h2>La démarche projet</h2>
            </v-card-title>

            <v-card-text>
              <p>
                En 2018, la restauration hors foyer a acheté pour 550 millions
                d’euros de produits bio hors taxe. La restauration collective
                à caractère social enregistre une croissance record de +28 %
                vs 2017 qui fait écho aux annonces de la loi EGalim et aux
                attentes des consommateurs.
              </p>
            </v-card-text>

            <v-card-actions>
              <v-btn to="/about" round outline>
                <v-icon class="mr-1">chevron_right</v-icon>
                En savoir plus
              </v-btn>
              <v-btn href="https://beta.gouv.fr/approche/manifeste" target="_blank" round outline>
                <v-icon small class="mr-2">open_in_new</v-icon>
                Le manifeste beta.gouv.fr
              </v-btn>
            </v-card-actions>
          </v-flex>

          <v-flex xs4>
            <v-img min-height="160" max-height="240" alt=""
              src="https://www.agencebio.org/wp-content/uploads/2019/06/Lancement-Printemps-BIO-28-mai-2014-Paris-La-Villette-Cr%C3%A9dit-Anthony-Voisin-9.jpg" />
          </v-flex>
        </v-layout>
      </v-card>
    </section>

  </v-content>
</template>

<script>
export default {
  name: "Home",
};
</script>

<style lang="scss" scoped>
html {
  overflow-y: auto;
}

a {
  color: white;
  text-decoration: none;
}

.v-card {
  h2 {
    margin: 0;
  }
}
</style>
