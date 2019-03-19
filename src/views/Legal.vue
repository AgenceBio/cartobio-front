<template>
  <v-card>
    <v-card-title class="headline grey lighten-2" primary-title>Mentions Légales</v-card-title>
    <v-divider></v-divider>
    <v-expansion-panel expand class="elevation-0">
      <div v-for="(item, i) in legalInfos" :key="i" class="full-width">
        <LegalItem :item="item"></LegalItem>
      </div>
    </v-expansion-panel>
    <v-divider></v-divider>
    <v-card-actions>
      <v-spacer></v-spacer>
      <v-btn color="primary" flat @click="dialog.activated = false">Fermer</v-btn>
    </v-card-actions>
  </v-card>
</template>

<script>
// @ is an alias to /src
import LegalItem from "@/views/LegalItem";
export default {
  name: "Legal",
  components: { LegalItem },
  props: {
    dialog: { activated: Boolean }
  },
  data() {
    return {
      legalInfos: [
        {
          category: "Conception",
          subcategories: [
            {
              label: "Conception & Design",
              text: "Lucas Bchini -- inspiré par le thème parallax de vuetify"
            },
            {
              label: "Développement & Intégration",
              text: "Lucas Bchini"
            },
            {
              label: "Hébergement",
              text: "OVH"
            }
          ]
        },
        {
          category: "Crédits et utilisation du site",
          subcategories: [
            {
              label: "Textes",
              text: "Agence Bio"
            },
            {
              label: "Photos",
              text:
                "Concours Photos 2013 de l'Agence Bio - Bazoches ferme bio - Crédit : Patricia SPANIOL"
            },
            {
              label: "Utilisation du site",
              text:
                "Ce site est temporaire et a une vocation purement informative autour du projet CartoBIO."
            }
          ]
        },
        {
          category: "Politique de confidentialité",
          subcategories: [
            {
              label: "Données",
              text: "Ce site n'enregistre aucune donnée."
            }
          ]
        }
      ]
    };
  }
};
</script>
<style lang="scss" scoped>
.full-width {
  width: 100%;
}
</style>
