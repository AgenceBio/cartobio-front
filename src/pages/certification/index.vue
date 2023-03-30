<route lang="yaml">
meta:
  seo:
    title: Passer moins de temps à recopier de l'information pendant ma certification bio
</route>

<template>
  <div class="fr-container--fluid fr-background-alt--blue-france fr-py-5w">
    <div class="fr-container">
      <div class="fr-grid-row fr-grid-row--gutters">
        <div class="fr-col-lg-12">
          <h1>Visualisez le parcellaire opérateur</h1>

          <p>
            <strong>Récupérez le parcellaire en amont du contrôle</strong><br />
            Vous gagnez en temps et en fiabilité.
          </p>

          <p>
            <strong>Explorez, modifiez et validez le parcellaire</strong><br />
            Pendant le contrôle avec l’opérateur.
          </p>

          <p v-if="currentUser.id">
            <router-link class="fr-btn" to="/exploitation/parcellaire">
              Accéder à mon opérateur
            </router-link>
          </p>
          <p v-else>
            <router-link class="fr-btn" to="/certification/exploitations">
              Chercher un opérateur
            </router-link>
          </p>
        </div>
      </div>
    </div>
  </div>

  <div class="fr-container fr-py-5w">
    <div class="fr-grid-row fr-grid-row--gutters fr-grid-row--center">
      <div class="fr-col-md-4 fr-col--center">
        <span class="fr-icon-time-fill fr-icon--lg" aria-hidden="true"></span>

        <h3 class="fr-h4">Gain de temps</h3>

        <p>
          Passez moins de temps à recopier ou actualiser le parcellaire pendant l’audit.
        </p>
      </div>

      <div class="fr-col-md-4 fr-col--center">
        <span class="fr-icon-france-fill fr-icon--lg" aria-hidden="true"></span>

        <h3 class="fr-h4">Dimension géographique</h3>

        <p>
          Ajoutez la dimension géographique à votre contrôle :
          visualisation du parcellaire, analyse des cultures voisines…
        </p>
      </div>

      <div class="fr-col-md-4 fr-col--center">
        <span class="fr-icon-money-euro-circle-fill fr-icon--lg" aria-hidden="true"></span>

        <h3 class="fr-h4">Intégré à vos outils</h3>

        <p>
          CartoBio communique avec votre outil métier<br/>
          pour une gestion faciloitée des dossiers opérateurs
        </p>
      </div>

      <p class="fr-col-md-12">
        <router-link to="/certication/avantages" class="fr-btn fr-btn--secondary">
          En savoir plus sur les avantages
        </router-link>
      </p>
    </div>
  </div>

  <ProductflowSection class="fr-background-alt--blue-france" expanded>
    <template #step-1>Import du parcellaire par l’agriculteur·ice en amont du contrôle</template>
    <template #step-1b>Création du parcellaire en ligne par l’agriculteur·ice</template>
    <template #step-2>Le parcellaire de l’année est validé par le contrôleur·se pendant l'audit Bio</template>
    <template #step-2b>Le parcellaire peut être mis à jour si besoin</template>
  </ProductflowSection>

  <div class="fr-container fr-py-5w">
    <div class="fr-grid-row fr-grid-row--gutters">
      <div class="fr-col-md-6">
        <h3 class="fr-h4">Les fonctionnalités</h3>

        <ul class="fr-list fr-mb-3w">
          <li>Import et modification du parcellaire des opérateurs</li>
          <li>Visualisation du parcellaire alentour (contour des parcelles et culture) pour l’analyse du risque</li>
          <li>Historique des couverts de l’exploitation sur plusieurs années</li>
          <li>Génération en envoi de l’attestation de production végétale à la DDT</li>
          <li>Interface d’administration pour suivre les différentes exploitations de votre portefeuille </li>
        </ul>

        <p>
          <a class="fr-btn fr-btn--secondary" href="mailto:support-cartobio@agencebio.org?subject=Demande%20de%20démo">
            Demandez une démo de CartoBio
          </a>
        </p>
      </div>

      <div class="fr-col-md-6 fr-m-md-auto">
        <img src="@/assets/screenshots/screenshot-exploitation-parcellaire.png" class="fr-responsive-img" alt="">
      </div>
    </div>
  </div>

  <PartnersSection class="fr-background-alt--blue-france" section-oc section-administrations />
  <TestimoniesSection v-if="false" />
  <ContributeSection />
</template>

<script setup>
import { toRef } from 'vue'
import store from '../../store.js'

import PartnersSection from '@/components/Partners/section.vue'
import ContributeSection from '@/components/Partners/contribute-section.vue'
import TestimoniesSection from '@/components/Partners/testimonies-section.vue';
import ProductflowSection from '@/components/Features/productflow-section.vue';

const currentUser = toRef(store.state, 'currentUser')
</script>

<style scoped>
.cta-img {
  display: block;
  background: #fff;
  border-radius: 1em;
  padding: 1em 0;
  margin: 0 auto;
  max-height: 6em;
  max-width: 200px;
}

@media screen and (max-width: 62em) {
  .fr-list {
    padding-left: 1.5rem;
  }
}
</style>
