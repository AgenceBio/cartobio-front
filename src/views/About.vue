<template>
  <v-container grid-list-xl>
    <h1>Vous êtes :</h1>
    <v-layout row wrap justify-center>
      <v-flex xs12 md4>
        <v-card class="elevation-0 transparent">
          <v-card-title primary-title class="layout justify-center">
            <div>
              <div class="headline">Controleur Bio ?</div>
            </div>
          </v-card-title>
          <v-card-text>
            Cette application vous est dédiée pour le moment. Vous pouvez vous connecter en utilisant vos identifiants de
            <a
              href="notification@agencebio.org"
              target="_blank"
            >notification@agencebio.org</a>
            En cas de soucis, n'hésitez pas à nous contacter. Nous sommes toujours preneurs de retours et il est possible que nous vous contactions dans cet objectif.
          </v-card-text>
        </v-card>
      </v-flex>
      <v-flex xs12 md4>
        <v-card class="elevation-0 transparent">
          <v-card-title primary-title class="layout justify-center">
            <div>
              <div class="headline">Agriculteur Bio ?</div>
            </div>
          </v-card-title>
          <v-card-text>
            Afin de mieux connaître les surfaces cultivées en agriculture biologique pour mesurer l'impact et mener des politiques publiques plus efficaces,
            de fiabiliser le contrôle et de le rendre plus simple et plus rapide, CartoBio permet aux OC d'avoir accès en amont d'un contrôle aux données de votre déclaration PAC.
            <br />Pour un agriculteur bio qui ne ferait pas de demande à la PAC, nous souhaitons également connaître la localisation de ses parcelles, afin d'avoir une meilleure connaissance du territoire.
            Si vous avez des questions, des remarques, n'hésitez pas à nous contacter !
          </v-card-text>
        </v-card>
      </v-flex>
      <v-flex xs12 md4>
        <v-card class="elevation-0 transparent">
          <v-card-title primary-title class="layout justify-center">
            <div>
              <div class="headline">Vous recherchez les données des parcelles Bio?</div>
            </div>
          </v-card-title>
          <v-card-text>
            Les données ne sont pas publiées en open data pour le moment. Si vous êtes une administration et que vous pouvez prétendre à l'obtention de celles-ci, nous vous invitons à nous contacter.
            <br />Sinon, un peu de patience ! :)
          </v-card-text>
        </v-card>
      </v-flex>

      <v-flex xs12 md4 align-content-space-around class="mt-3">
        <v-card class="elevation-0 transparent mt-4">
          <v-card-title primary-title class="layout justify-center">
            <div>
              <div class="headline">
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
    </v-layout>
  </v-container>
</template>
<style lang="scss" scoped>
</style>
