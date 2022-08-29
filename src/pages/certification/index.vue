<route lang="yaml">
# redirect:
#   path: /exploitation/certification-ab
# meta:
#   requiresAuth: true
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
            <router-link class="fr-btn" to="/exploitation/certification-ab">
              Accéder à mon opérateur
            </router-link>
          </p>
          <p v-else>
            <router-link class="fr-btn" to="/exploitation/login">
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

  <section class="fr-container--fluid fr-background-alt--blue-france fr-py-5w">
    <div class="fr-container">
      <div class="fr-grid-row fr-grid-row--gutters">
        <div class="fr-col-md-12">
          <h3 class="fr-h4">Comment ça fonctionne ?</h3>
        </div>

        <div class="fr-col-md-12">

          <ol class="fr-list steps">
            <li>
              <img src="@/assets/illustrations/undraw_prioritise_ready.svg" class="fr-responsive-img fr-hidden fr-unhidden-lg fr-my-3w cta-img" alt="" />

              Import du parcellaire en amont du contrôle
            </li>
            <li>
              <img src="@/assets/illustrations/undraw_building_blocks.svg" class="fr-responsive-img fr-hidden fr-unhidden-lg fr-my-3w cta-img" alt="" />


              Créez votre parcellaire en ligne
            </li>
            <li>
              <img src="@/assets/illustrations/undraw_job_hunt.svg" class="fr-responsive-img fr-hidden fr-unhidden-lg fr-my-3w cta-img" alt="" />

              Le parcellaire de l’année est validé pendant le controle Bio
            </li>
            <li>
              <img src="@/assets/illustrations/undraw_content.svg" class="fr-responsive-img fr-hidden fr-unhidden-lg fr-my-3w cta-img" alt="" />

              Mettez à jour le parcellaire si besoin
            </li>
            <li>
              <img src="@/assets/illustrations/undraw_online_transactions.svg" class="fr-responsive-img fr-hidden fr-unhidden-lg fr-my-3w cta-img" alt="" />
              Transmission du parcellaire à la DDT pour une instruction simplifiée des aides PAC
            </li>
            <li>
              <img src="@/assets/illustrations/undraw_open_source.svg" class="fr-responsive-img fr-hidden fr-unhidden-lg fr-my-3w cta-img" alt="" />

              Le parcellaire anonymisé est publié
            </li>
          </ol>
        </div>

      </div>
    </div>
  </section>

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
          <a class="fr-btn fr-btn--secondary" href="mailto:cartobio@beta.gouv.fr?subject=Demande%20de%20démo">
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

  <div class="fr-container fr-py-5w">
    <div class="fr-grid-row fr-grid-row--gutters">
      <div class="fr-col-md-12">
        <h3 class="fr-h4">Témoignages</h3>

        <figure class="fr-quote fr-quote--column">
          <blockquote>
            <p>« Lorem ipsum dolor sit amet, consectetur adipiscing elit. Dignissim cursus at ullamcorper mauris non. Integer aliquam, scelerisque. »</p>
          </blockquote>
          <figcaption>
              <p class="fr-quote__author">Auteur</p>
              <div class="fr-quote__image">
                <img src="@/assets/placeholder.1x1.png" class="fr-responsive-img" alt="" />
              </div>
          </figcaption>
        </figure>
      </div>
    </div>
  </div>

  <ContributeSection class="fr-background-alt--blue-france" />
</template>

<script setup>
import { toRef } from 'vue'
import store from '../../store.js'

import PartnersSection from '@/components/Partners/section.vue'
import ContributeSection from '@/components/Partners/contribute-section.vue'

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

@media (min-width: 62em) {
  .steps {
    height: 400px;
    position: relative;
  }

  .steps > li {
    max-width: 16em;
    position: absolute;
    text-align: center;
  }
  .steps > li::marker {
    content: "";
  }
  .steps > li:nth-child(1) {
    left: 0%;
    top: 0%;
  }
    .steps > li::after {
      position: absolute;
      z-index: 10;
    }
    .steps > li:nth-child(1)::after {
      content: url(@/assets/illustrations/arrow-1.svg);
      top: 0;
      left: 85%;
    }
  .steps > li:nth-child(2) {
    left: 15%;
    top: 50%;
  }
    .steps > li:nth-child(2)::after {
      content: url(@/assets/illustrations/arrow-2.svg);
      top: 0%;
      left: 85%;
    }
  .steps > li:nth-child(3) {
    left: 30%;
    top: 0%;
  }
  .steps > li:nth-child(4) {
    left: 45%;
    top: 50%;
  }
    .steps > li:nth-child(3)::after {
      content: url(@/assets/illustrations/arrow-3.svg);
      top: 50%;
      left: 85%;
    }
  .steps > li:nth-child(5) {
    left: 60%;
    top: 0%;
  }
    .steps > li:nth-child(5)::after {
      content: url(@/assets/illustrations/arrow-5.svg);
      top: 50%;
      left: 85%;
    }
  .steps > li:nth-child(6) {
    left: 75%;
    top: 50%;
  }
}
</style>
