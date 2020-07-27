<template>
  <v-content class="blue-grey lighten-5">
    <v-layout id="title" column align-center justify-space-between my-4 py-5>
      <h1 class="display-2 mb-3 text-xs-center">
        Les données géographiques<br>de l'Agriculture Biologique en France
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

    <section class="blue lighten-4 py-5">
      <v-card flat to="/features/organismes-certification-bio" color="transparent" max-width="840" class="mx-auto">
        <v-layout row wrap justify-space-between align-center>
          <v-flex xs6>
            <v-card-title>
              <h2>Support à la certification Bio</h2>
            </v-card-title>

            <v-card-text>
              <ul>
                <li>fiabiliser les contrôles via une approche graphique</li>
                <li>un outil prêt-à-l'emploi pour les auditeurs et les responsables de certification</li>
                <li>une aide pour l'analyse des risques environnants</li>
                <li>ajouter la fonction carto et nos données géographiques à votre outil métier en quelques lignes de code</li>
              </ul>
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

          <v-flex xs5 offset1>
            <v-img min-height="160" src="@/assets/screenshot-operateur.jpg" alt="" />
          </v-flex>
        </v-layout>
      </v-card>
    </section>

    <section class="green lighten-4 py-5">
      <v-card flat to="/features/territoires" color="transparent" max-width="840" class="mx-auto">
        <v-layout row wrap justify-space-between align-center>
          <v-flex xs6 order-xs2>
            <v-card-title>
              <h2>Les données de mon territoire</h2>
            </v-card-title>

            <v-card-text>
              <ul>
                <li>simplification de l'accès à ces données</li>
                <li>des données utiles pour mener une politique publique de qualité, sur des enjeux importants (biodiversité, alimentation)</li>
              </ul>
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

          <v-flex xs5 order-xs1>
            <v-img min-height="160" alt="" src="@/assets/landing/Screenshot 2020-03-23 at 09.50.06.png" />
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
              <ul>
                <li>on va sur le terrain pour observer le fonctionnement et les relations entre agriculteurs et organismes de certification</li>
                <li>on fait dialoguer les acteurs de la bio ensemble</li>
                <li>on répond à chacune des demandes</li>
                <li>parce qu'on voit l'ensemble, on est à même de proposer un parcours administratif plus simple pour tout le monde</li>
                <li>approche expérimentale (on essaie, on rate, on tente autre chose)</li>
                <li>bénéficie de l'infrastructure et des méthodes telles que proposées par l'incubateur des services numériques</li>
              </ul>
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
