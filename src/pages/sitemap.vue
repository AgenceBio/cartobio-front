<route lang="yaml">
meta:
  generalAudience: true
  seo:
    title: Plan du site
</route>

<template>
  <div class="fr-container fr-py-16v">
    <div class="fr-grid-row">
      <div class="fr-col-12 fr-col-md-8">
        <h1>Plan du site</h1>

        <section class="fr-py-6v">
          <h2>Site grand public</h2>
          <ul>
            <li><router-link to="/">Accueil (grand public)</router-link></li>
            <li><router-link to="/pro">Professionnels</router-link></li>
          </ul>
          <div class="subsection">
            <h3>Qu'est ce que Cartobio ?</h3>
            <ul>
              <li><router-link to="/projet">À propos</router-link></li>
              <li><router-link to="/stats">Les chiffres</router-link></li>
            </ul>
          </div>
          <ul>
            <li>
              <router-link to="/login" aria-label="Se connecter au service CartoBio">Connexion</router-link>
              ou
              <router-link to="/logout" aria-label="Se déconnecter du service CartoBio">Déconnexion</router-link>
            </li>
          </ul>
        </section>

        <section class="fr-py-6v" v-if="userStore.isLogged">
          <h2>Espace personnel</h2>
          <ul>
            <li><router-link to="/certification/tableau-de-bord">Accueil</router-link></li>
            <li>
              <router-link to="/certification/exploitations">{{
                userStore.isOc ? "Listes des exploitations" : "Mes exploitations"
              }}</router-link>
            </li>
          </ul>
        </section>

        <section class="fr-py-6v">
          <h2>Aide</h2>
          <ul>
            <li><router-link to="/faq">Foire aux questions</router-link></li>
            <li>
              <a
                href="https://docs-cartobio.agencebio.org/organisme-certification"
                aria-label="Centre de support pour organisme de certification"
                target="_blank"
                rel="noopener"
              >
                Organisme de certification<lien-externe />
              </a>
            </li>
            <li>
              <a
                href="https://docs-cartobio.agencebio.org/agriculteurs.trices/"
                aria-label="Centre de support pour agriculteur·ice"
                target="_blank"
                rel="noopener"
              >
                Agriculteur·ice<lien-externe />
              </a>
            </li>
            <li>
              <a target="_blank" rel="noopener" :href="'mailto:support-cartobio@agencebio.org?subject=' + mailtoSubject"
                >Nous contacter</a
              >
            </li>
          </ul>
        </section>

        <section class="fr-py-6v">
          <h2>Pages annexes</h2>
          <ul>
            <li><router-link to="/accessibilite">Accessibilité</router-link></li>
            <li><router-link to="/mentions-legales">Mentions légales</router-link></li>
          </ul>
        </section>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useUserStore } from "@/stores/user.js";

const userStore = useUserStore();
</script>

<style scoped>
.subsection {
  margin-left: 2rem;
}
</style>
