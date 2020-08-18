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
            <v-img contain src="@/assets/screenshot-oc-overview.jpg" aspect-ratio="1.87" width="630"></v-img>
          </v-carousel-item>
          <v-carousel-item>
            <v-img contain src="@/assets/screenshot-operateur.jpg" aspect-ratio="1.87" width="630"></v-img>
          </v-carousel-item>
          <v-carousel-item>
            <v-img contain src="@/assets/screenshot-download.jpg" aspect-ratio="1.87" width="630"></v-img>
          </v-carousel-item>
        </v-carousel>
      </v-card>
    </v-layout>

    <section class="blue lighten-4 py-5">
      <v-card flat to="/features/organismes-certification-bio" color="transparent" max-width="840" class="mx-auto">
        <v-layout row wrap justify-space-between align-center>
          <v-flex xs6>
            <v-card-title>
              <h2 class="headline">Support à la certification Bio</h2>
            </v-card-title>

            <v-card-text>
              <p>Fiabilisez vos contrôles terrain via une approche graphique
                grâce à un outil prêt-à-l'emploi, que ce soit pour les auditeur·ices ou les responsables de certification.
              </p>

              <p>Nous vous proposons une aide pour l'analyse des risques environnants,
                ainsi qu'une couche de données et une API qui s'intègrent à votre outil métier.
              </p>
            </v-card-text>

            <v-card-actions>
              <v-btn to="/features/organismes-certification-bio" round outline>
                <v-icon class="mr-1">chevron_right</v-icon>
                En savoir plus
              </v-btn>
              <v-btn v-if="isAuthenticated" to="map" round outline>
                <v-icon class="mr-2">public</v-icon>
                Accès à la carte
              </v-btn>
              <v-btn v-else @click.prevent="startLogin" round outline>
                <v-icon class="mr-2">lock_open</v-icon>
                Je me connecte
              </v-btn>
            </v-card-actions>
          </v-flex>

          <v-flex xs5 offset1>
            <v-img min-height="160" src="@/assets/screenshot-operateur.jpg" alt="" class="elevation-4" />
          </v-flex>
        </v-layout>
      </v-card>
    </section>

    <section class="green lighten-4 py-5">
      <v-card flat to="/features/territoires" color="transparent" max-width="840" class="mx-auto">
        <v-layout row wrap justify-space-between align-center>
          <v-flex xs6 order-xs2>
            <v-card-title>
              <h2 class="headline">Les données de mon territoire</h2>
            </v-card-title>

            <v-card-text>
              <p>Nous simplifions l'accès à la donnée géographique agricole&nbsp;bio.</p>
              <p>Nous vous transmettons des données uitles pour pour mener une
                politique publique de qualité, sur des enjeux critiques
                (dont la biodiversité et l'alimentation).</p>
            </v-card-text>

            <v-card-actions>
              <v-btn to="/features/territoires" round outline>
                <v-icon class="mr-1">chevron_right</v-icon>
                En savoir plus
              </v-btn>
              <!-- <v-btn to="/features/territoires#choose" round outline>
                <v-icon class="mr-2">playlist_add</v-icon>
                Choisir mes données
              </v-btn> -->
            </v-card-actions>
          </v-flex>

          <v-flex xs5 order-xs1>
            <v-img min-height="160" alt="" src="@/assets/landing/Screenshot 2020-03-23 at 09.50.06.png" class="elevation-4" />
          </v-flex>
        </v-layout>
      </v-card>
    </section>

    <section class="py-5">
      <v-card flat to="stats" color="transparent" max-width="840" class="mx-auto">
        <v-layout row wrap justify-space-between align-center>
          <v-flex xs6>
            <v-card-title>
              <h2 class="headline">La démarche projet</h2>
            </v-card-title>

            <v-card-text>
              <p>
                Nous sommes une équipe pluridisciplinaire intégrée à l'Incubateur des Services Numériques de l'État (<abbr title="Direction du Numérique">DINUM</abbr>).
                On se rend sur le terrain pour observer les interactions entre agriculteur·ices, organismes de certification et la <abbr title="Politique Agricole Commune">PAC</abbr>.
              </p>

              <p>
                Nous visons à proposer un parcours administratif simplifié, en faisant dialoguer tous les acteurs ensemble.
                On essaie, on rate, et on ajuste nos objectifs en expérimentant.
              </p>
            </v-card-text>

            <v-card-actions>
              <v-btn to="stats" round outline>
                <v-icon class="mr-1">bar_chart</v-icon>
                Nos métriques de réussite
              </v-btn>
              <v-btn @click.stop href="https://beta.gouv.fr/approche/manifeste" target="_blank" round outline>
                <v-icon small class="mr-2">open_in_new</v-icon>
                Le manifeste beta.gouv.fr
              </v-btn>
            </v-card-actions>
          </v-flex>

          <v-flex xs4>
            <v-img min-height="160" max-height="240" alt=""
              src="@/assets/landing/cartobio-world-cafe.jpg" class="elevation-4" />
          </v-flex>
        </v-layout>
      </v-card>
    </section>

  </v-content>
</template>

<script>
import { mapGetters, mapMutations } from 'vuex';

export default {
  name: "Home",

  computed: {
    ...mapGetters('user', ['isAuthenticated']),
  },

  methods: {
    ...mapMutations({
      startLogin: 'user/LOGIN'
    })
  }
};
</script>

<style lang="scss" scoped>
.v-content {
  flex: 1 0 100% !important;
}

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
