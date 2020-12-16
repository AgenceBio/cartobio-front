<template>
  <v-content class="mb-auto full-width">
    <v-container>
      <v-card>
        <v-card-title>
          <h3 class="headline mb-0">Page introuvable</h3>
        </v-card-title>

        <v-card-text>
          <p>
            Désolé, le lien que vous avez suivi vous mène vers une page inconnue.<br>
            On va réparer ça si c'est de notre ressort.
          </p>
        </v-card-text>

        <v-card-actions>
          <v-btn color="primary" to="/">Retour à la page d'accueil</v-btn>
        </v-card-actions>
      </v-card>
    </v-container>
  </v-content>
</template>

<style lang="scss" scoped>
.full-width {
  width: 100%;
}
</style>

<script>
export default {
  name: "PageNotFound",

  metaInfo: {
    title: 'Page introuvable',
  },

};
</script>
