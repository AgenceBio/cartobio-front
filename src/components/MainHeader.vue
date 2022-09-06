<template>
  <header role="banner" class="fr-header">
    <div class="fr-header__body">
      <div class="fr-container">
        <div class="fr-header__body-row">
          <div class="fr-header__brand fr-enlarge-link">
            <div class="fr-header__brand-top">
              <div class="fr-header__logo">
                <p class="fr-logo">
                  République<br />française
                </p>
              </div>

              <div class="fr-header__operator">
                <img src="../assets/logo-agence-bio.svg" class="fr-responsive-img logo" alt="L'Agence Bio" />
              </div>
            </div>

            <div class="fr-header__service">
              <router-link to="/" rel="home">
                <p class="fr-header__service-title">
                  CartoBio <span class="fr-badge fr-badge--sm fr-badge--green-emeraude">beta</span>
                </p>
              </router-link>

              <p class="fr-header__service-tagline">Parcellaire cultivé en Agriculture Biologique</p>
            </div>
          </div>

          <div class="fr-hidden fr-unhidden-lg fr-header__tools" :data-numero-bio="currentUser.id" v-if="currentUser.id">
            <span class="fr-icon fr-icon--sm fr-icon-account-circle-fill fr-mr-1w" aria-hidden>{{ currentUser.nom }}</span><br />
            <router-link to="/logout" custom v-slot="{ href }">
              <a :href="href" class="fr-icon fr-icon--sm fr-icon-logout-box-r-line" @click.prevent="logout" aria-role="button">
                Déconnexion
              </a>
            </router-link>
          </div>
          <div class="fr-hidden fr-unhidden-lg fr-header__tools" v-else>
            <router-link to="/exploitation/login" class="fr-icon-account-circle-fill" aria-role="button">
              Connexion
            </router-link>
          </div>
        </div>
      </div>

      <div class="fr-header__menu" v-if="currentUser.id">
        <div class="fr-container">
          <nav class="fr-nav" role="navigation" aria-label="Menu principal">
            <ul class="fr-nav__list">
              <li class="fr-nav__item">
                <router-link to="/exploitation/parcellaire" class="fr-nav__link">
                  Mon parcellaire
                </router-link>
              </li>
              <li class="fr-nav__item">
                <router-link to="/exploitation/environs" class="fr-nav__link">
                  Parcelles environnantes
                </router-link>
              </li>
              <li class="fr-nav__item">
                <router-link to="/projet" class="fr-nav__link">À propos de CartoBio</router-link>
              </li>
              <li class="fr-nav__item fr-hidden-lg">
                <router-link to="/logout" custom v-slot="{ href }" v-if="currentUser.id">
                  <a :href="href" @click.prevent="logout" class="fr-nav__link" aria-role="button">
                    Déconnexion
                  </a>
                </router-link>
                <router-link to="/exploitation/login" class="fr-nav__link" aria-role="button" v-else>
                  Connexion
                </router-link>
              </li>
            </ul>
          </nav>
        </div>
      </div>
    </div>
  </header>
</template>

<script setup>
import { reactive, toRef } from 'vue'
import { useRouter } from 'vue-router'
import store from '../store.js'

const router = useRouter()

const currentUser = toRef(store.state, 'currentUser')
function logout() {
  store.logoutUser()
  router.replace('/exploitation')
}

const menus = reactive({
  about: false
})

function toggle (menuId) {
  menus[menuId] = !menus[menuId]
}
</script>

<style scoped>
.logo {
  width: 3.5rem;
}
</style>
