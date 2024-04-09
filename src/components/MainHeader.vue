<template>
  <header role="banner" class="fr-header">
    <div class="fr-header__body">
      <div class="fr-container">
        <div class="fr-header__body-row">
          <div class="fr-header__brand fr-enlarge-link">
            <div class="fr-header__brand-top">
              <div class="fr-header__logo">
                <p class="fr-logo">
                  Agence Bio
                </p>
              </div>

              <div class="fr-header__operator">
                <img src="@/assets/logo-agence-bio.svg" class="fr-responsive-img fr-hidden fr-unhidden-lg logo" alt="L'Agence Bio" />
              </div>
            </div>

            <div class="fr-header__service">
              <router-link :to="startPage" rel="home">
                <p class="fr-header__service-title">
                  CartoBio <span class="fr-badge fr-badge--sm fr-badge--green-emeraude">beta</span>
                </p>
              </router-link>

              <p class="fr-header__service-tagline fr-hidden fr-unhidden-sm">Parcellaire cultivé en Agriculture Biologique</p>
            </div>

            <div class="fr-header__navbar">
              <button
                  title="Menu"
                  class="fr-btn--menu fr-btn"
                  id="mobile-menu-button"
                  :data-fr-opened="menuIsOpen"
                  aria-controls="mobile-menu"
                  aria-haspopup="menu"
                  @click="menuIsOpen = !menuIsOpen"
              >
                Menu
              </button>
            </div>
          </div>

          <div class="fr-header__tools">
            <div class="fr-header__tools-links">
              <ul class="fr-btns-group">
                <li>
                  <router-link to="/projet" class="fr-btn">
                    À propos
                  </router-link>
                </li>
                <li>
                  <a :href="documentationPage" class="fr-btn fr-btn--icon-left fr-icon-questionnaire-fill">
                    Aide
                  </a>
                </li>
              </ul>
              <ul class="fr-btns-group" v-if="isLogged">
                <li class="tool-username" aria-hidden="true">
                  <router-link :to="startPage" :class="['fr-btn', 'fr-mr-1w', roleIcon]">
                    {{ user.nom }}
                  </router-link>
                </li>
                <li class="tool-logout">
                  <router-link to="/logout" custom v-slot="{ href }">
                    <a :href="href" class="fr-btn fr-icon--sm fr-icon-logout-box-r-line" @click.prevent="logout">
                      Déconnexion
                    </a>
                  </router-link>
                </li>
              </ul>
              <ul class="fr-btns-group" v-else>
                <li>
                  <router-link to="/login" class="fr-btn fr-icon-account-circle-fill fr-btn--icon-left" aria-role="button">
                    Connexion
                  </router-link>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <div
          class="fr-header__menu fr-modal fr-hidden-lg"
          id="mobile-menu"
          :class="{ 'fr-modal--opened': menuIsOpen }"
          aria-labelledby="mobile-menu-button"
      >
        <div class="fr-container">
          <button class="fr-btn--close fr-btn" aria-controls="mobile-menu" title="Fermer" @click="menuIsOpen = false">
            Fermer
          </button>
          <div class="fr-header__menu-links" />
          <nav class="fr-nav" role="navigation" aria-label="Menu principal">
            <ul class="fr-nav__list">
              <li class="fr-nav__item" v-if="isLogged">
                <router-link :to="startPage" class="fr-nav__link fr-btn--icon-left" :class="roleIcon" aria-current="false">
                  {{ user.nom }}
                </router-link>
              </li>
              <li class="fr-nav__item">
                <a :href="documentationPage" target="_blank" rel="noopener" class="fr-nav__link fr-btn--icon-left fr-icon-questionnaire-fill">
                  Aide
                </a>
              </li>
              <li class="fr-nav__item">
                <router-link to="/projet" class="fr-nav__link">
                  À propos de CartoBio
                </router-link>
              </li>
              <li class="fr-nav__item fr-hidden-lg">
                <router-link  v-if="isLogged" to="/logout" custom v-slot="{ href }">
                  <a :href="href" @click.prevent="logout" class="fr-nav__link fr-btn--icon-left fr-icon-logout-box-r-line">
                    Déconnexion
                  </a>
                </router-link>
                <router-link v-else to="/login" aria-role="button" class="fr-nav__link  fr-btn--icon-left fr-icon-account-circle-fill">
                  Connexion
                </router-link>
              </li>
            </ul>
          </nav>
        </div>
      </div>
    </div>

    <div class="fr-header__menu" v-if="!isLogged">
      <div class="fr-container">
        <nav class="fr-nav" role="navigation" aria-label="Menu principal">
          <ul class="fr-nav__list">
            <li class="fr-nav__item">
              <router-link to="/" class="fr-nav__link">
                Grand public
              </router-link>
            </li>
            <li class="fr-nav__item">
              <router-link to="/pro" class="fr-nav__link">
                Agriculteur·ice
              </router-link>
            </li>
          </ul>
        </nav>
      </div>
    </div>

    <div class="fr-notice fr-notice--info" v-if="isStaging">
      <div class="fr-container">
        <div class="fr-notice__body">
          <p class="fr-notice__title">
            <mark>Vous êtes sur un environnement de test</mark>.

            <a href="https://cartobio.agencebio.org" rel="noreferrer noopener">
              Cliquez ici pour accéder à l'environnement avec données réelles.
            </a>
          </p>
        </div>
      </div>
    </div>
  </header>
</template>

<script setup>
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router';
import { useUserStore, ROLES } from '@/stores/user.js'
import { storeToRefs } from 'pinia'

const userStore = useUserStore()
const router = useRouter()

router.afterEach(() => {
  menuIsOpen.value = false
})

const ROLE_ICONS = new Map([
  [ROLES.OC_AUDIT, 'fr-icon-medal-fill'],
  [ROLES.OC_CERTIF, 'fr-icon-medal-fill'],
  [ROLES.OPERATEUR, 'fr-icon-plant-fill'],
  [ROLES.ADMIN, 'fr-icon-shield-fill'],
  [ROLES.UNKNOWN, 'fr-icon-warning-fill']
])

const isStaging = computed(() => !import.meta.env.VUE_APP_PRODUCTION)
const { user, isLogged, roles, startPage, documentationPage } = storeToRefs(userStore)
const roleIcon = computed(() => {
  for (const role of roles.value) {
    if (ROLE_ICONS.has(role)) return ROLE_ICONS.get(role)
  }

  return 'fr-icon-account-circle-fill'
})

const menuIsOpen = ref(false)

async function logout() {
  const redirectUrl = (userStore.isOc || userStore.isAgri) ? '/pro' : '/'

  await userStore.logout()
  await router.push(redirectUrl)
}
</script>

<style scoped>
.logo {
  width: 3.5rem;
}

.fr-header__brand {
  flex-shrink: 0;
}

.fr-header__brand-top {
  width: auto;
}

.fr-header__service {
  width: auto;
  box-shadow: none;
}

.tool-username {
  flex-shrink: 1;
  max-width: 30vw !important;
}

.tool-username span {
  display: inline-block;
  overflow: hidden !important;
  text-overflow: ellipsis;
  max-width: 100% !important;
}
.tool-username span::before {
  display: inline-block;
}
</style>
