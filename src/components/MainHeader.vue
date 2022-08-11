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
                  CartoBio <span class="fr-badge fr-badge--green-emeraude">beta</span>
                </p>
              </router-link>

              <p class="fr-header__service-tagline">Parcellaire cultivé en Agriculture Biologique</p>
            </div>
          </div>

          <div class="fr-header__tools">
            <div class="fr-header__tools-links">
              <ul class="fr-links-group" v-if="currentUser.id">
                <li>
                  <router-link to="/exploitation/certification-ab" class="fr-link fr-icon-medal-fill">
                    Ma certification&nbsp;<abbr title="Agriculture Biologique">AB</abbr>
                  </router-link>
                </li>
                <li>
                  <router-link to="/exploitation/parcellaire" class="fr-link fr-icon-map-pin-user-fill">
                    Mon parcellaire
                  </router-link>
                </li>
                <li>
                  <router-link to="/logout" custom v-slot="{ href }">
                    <a :href="href" class="fr-link fr-icon-logout-box-r-line" @click.prevent="logout">
                      Déconnexion
                    </a>
                  </router-link>
                </li>
              </ul>
              <ul class="fr-links-group" v-else>
                <li>
                  <router-link to="/exploitation/login" class="fr-icon-account-circle-fill">
                    Connexion
                  </router-link>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  </header>
</template>

<script setup>
import { toRef } from 'vue'
import { useRouter } from 'vue-router'
import store from '../store.js'

const router = useRouter()

const currentUser = toRef(store.state, 'currentUser')
function logout() {
  store.logoutUser()
  router.replace('/exploitation')
}
</script>

<style scoped>
.logo {
  width: 3.5rem;
}
</style>
