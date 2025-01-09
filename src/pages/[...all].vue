<route lang="yaml">
meta:
  seo:
    title: Page introuvable
</route>

<template>
  <div class="fr-container fr-my-5w">
    <h2>Page introuvable</h2>

    <p>Vous tentez d’accéder à une page qui a été supprimée ou qui n’a jamais existée.</p>
    <router-link :to="store.startPage" class="fr-btn fr-btn--secondary">Revenir à l'accueil</router-link>
  </div>
</template>

<script setup>
import { useUserStore } from "@/stores/user";

const store = useUserStore();
</script>
