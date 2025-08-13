<template>
  <div>
    <div class="fr-skiplinks">
      <nav role="navigation" aria-label="Accès rapide" class="fr-container">
        <ul class="fr-skiplinks__list">
          <li>
            <a class="fr-link" href="#header">En-tête</a>
          </li>
          <li>
            <a class="fr-link" href="#content">Contenu</a>
          </li>
          <li v-for="(href, text) of $route.meta.skipLinks" :key="href">
            <a class="fr-link" :href>{{ text }}</a>
          </li>
          <li>
            <a class="fr-link" href="#header-navigation">Menu</a>
          </li>
          <li>
            <a class="fr-link" href="#footer">Pied de page</a>
          </li>
        </ul>
      </nav>
    </div>
    <header role="banner" class="fr-header" id="header">
      <div class="fr-header__body">
        <div class="fr-container">
          <div class="fr-header__body-row">
            <div class="fr-header__brand fr-enlarge-link">
              <div class="fr-header__brand-top">
                <div class="fr-header__logo">
                  <p class="fr-logo">République<br role="presentation" />française</p>
                </div>

                <div class="fr-header__operator">
                  <img
                    src="@/assets/logo-agence-bio.svg"
                    class="fr-responsive-img fr-hidden fr-unhidden-lg logo"
                    alt="Logo de l'Agence Bio"
                  />

                  <router-link :to="startPage" rel="home" class="fr-hidden-lg">
                    <p class="fr-header__service-title">CartoBio</p>
                  </router-link>
                </div>

                <div class="fr-header__navbar">
                  <button
                    title="Ouvrir le menu"
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

              <div class="fr-header__service">
                <router-link :to="startPage" rel="home">
                  <p class="fr-header__service-title">CartoBio</p>
                </router-link>

                <p class="fr-header__service-tagline">Parcellaire cultivé en Agriculture Biologique</p>
              </div>
            </div>

            <div class="fr-header__tools">
              <div class="fr-header__tools-links" v-if="isOnExploitationsPage && isLogged">
                <div class="dropdown-menu-container">
                  <button
                    class="fr-btn fr-btn--secondary fr-btn--icon-left fr-icon-menu-2-fill"
                    @click="dropdownIsOpen = !dropdownIsOpen"
                    :aria-expanded="dropdownIsOpen"
                    aria-haspopup="true"
                  >
                    Menu
                  </button>
                  <div class="dropdown-menu" v-if="dropdownIsOpen" @click="dropdownIsOpen = false">
                    <ul class="dropdown-menu__list">
                      <li v-if="isOc">
                        <router-link to="/certification/tableau-de-bord" class="dropdown-menu__link">
                          Tableau de bord
                        </router-link>
                      </li>
                      <li>
                        <router-link to="/certification/exploitations" class="dropdown-menu__link">
                          {{ exploitationsMenuLabel }}
                        </router-link>
                      </li>
                      <li>
                        <a :href="documentationPage" target="_blank" rel="noopener" class="dropdown-menu__link">
                          Aide
                        </a>
                      </li>
                      <li>
                        <router-link to="/logout" class="dropdown-menu__link"> Déconnexion </router-link>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>

              <div class="fr-header__tools-links" v-else>
                <ul class="fr-btns-group" id="header-navigation" role="navigation">
                  <li>
                    <router-link to="/projet" class="fr-btn"> À propos </router-link>
                  </li>
                  <li>
                    <a
                      :href="documentationPage"
                      target="_blank"
                      class="fr-btn fr-btn--icon-left fr-icon-questionnaire-fill"
                    >
                      Aide<lien-externe />
                    </a>
                  </li>
                  <li class="tool-username" aria-hidden="true" v-if="isLogged">
                    <router-link :to="startPage" :class="['fr-btn', 'fr-mr-1w', roleIcon]">
                      {{ user.nom }}
                    </router-link>
                  </li>
                  <li class="tool-logout" v-if="isLogged">
                    <router-link to="/logout" class="fr-btn fr-icon--sm fr-icon-logout-box-r-line" aria-role="button">
                      Déconnexion
                    </router-link>
                  </li>
                  <li v-else>
                    <router-link
                      to="/login"
                      class="fr-btn fr-icon-account-circle-fill fr-btn--icon-left"
                      aria-role="button"
                    >
                      Connexion
                    </router-link>
                  </li>
                </ul>
              </div>
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
          <button
            class="fr-btn--close fr-btn"
            aria-controls="mobile-menu"
            title="Fermer le menu"
            @click="menuIsOpen = false"
          >
            Fermer
          </button>
          <nav class="fr-nav" role="navigation" aria-label="Menu principal">
            <ul class="fr-nav__list">
              <li class="fr-nav__item" v-if="isLogged">
                <router-link
                  :to="startPage"
                  class="fr-nav__link fr-btn--icon-left"
                  :class="roleIcon"
                  aria-current="false"
                >
                  {{ user.nom }}
                </router-link>
              </li>
              <li class="fr-nav__item" v-if="isOnExploitationsPage && isLogged">
                <router-link to="/certification/tableau-de-bord" class="fr-nav__link">Tableau de bord</router-link>
              </li>
              <li class="fr-nav__item" v-if="isOnExploitationsPage && isLogged">
                <router-link to="/certification/exploitations" class="fr-nav__link">
                  {{ exploitationsMenuLabel }}
                </router-link>
              </li>
              <li class="fr-nav__item" v-if="isMobile && !isOnExploitationsPage">
                <router-link to="/certification/tableau-de-bord" class="fr-nav__link">Tableau de bord</router-link>
              </li>
              <li class="fr-nav__item" v-if="isMobile && !isOnExploitationsPage">
                <router-link to="/certification/exploitations" class="fr-nav__link"
                  >Liste des exploitations</router-link
                >
              </li>
              <li class="fr-nav__item">
                <a
                  :href="documentationPage"
                  target="_blank"
                  rel="noopener"
                  class="fr-nav__link fr-btn--icon-left fr-icon-questionnaire-fill"
                >
                  Aide<lien-externe />
                </a>
              </li>

              <li class="fr-nav__item">
                <router-link to="/projet" class="fr-nav__link"> À propos de CartoBio </router-link>
              </li>
              <li class="fr-nav__item fr-hidden-lg">
                <router-link
                  v-if="isLogged"
                  to="/logout"
                  class="fr-nav__link fr-btn--icon-left fr-icon-logout-box-r-line"
                >
                  Déconnexion
                </router-link>
                <router-link
                  v-else
                  to="/login"
                  aria-role="button"
                  class="fr-nav__link fr-btn--icon-left fr-icon-account-circle-fill"
                >
                  Connexion
                </router-link>
              </li>
            </ul>
          </nav>
        </div>
      </div>

      <div class="fr-header__menu" v-if="!isLogged">
        <div class="fr-container">
          <nav class="fr-nav" role="navigation" aria-label="Menu principal">
            <ul class="fr-nav__list">
              <li class="fr-nav__item">
                <router-link to="/" class="fr-nav__link"> Grand public </router-link>
              </li>
              <li class="fr-nav__item">
                <router-link to="/pro" class="fr-nav__link"> Agriculteur·ice </router-link>
              </li>
              <li class="fr-nav__item">
                <router-link to="/stats" class="fr-nav__link"> Les chiffres </router-link>
              </li>
            </ul>
          </nav>
        </div>
      </div>

      <div class="fr-notice fr-notice--info" v-if="!online">
        <div class="fr-container">
          <div class="fr-notice__body">
            <p class="fr-notice__title">
              <b>Vous êtes actuellement hors ligne.</b> Seules les exploitations dont le parcellaire a été téléchargé en
              amont sont visibles. Certaines fonctionnalités sont indisponibles.
            </p>
          </div>
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
      <div class="fr-notice fr-notice--info" v-if="maintenance">
        <div class="fr-container">
          <div class="fr-notice__body">
            <p class="fr-notice__title">
              CartoBio rencontre actuellement des problèmes techniques.
              <a href="https://docs-cartobio.agencebio.org/statut" rel="noreferrer noopener" target="_blank">
                Visitez la page de statut pour en savoir plus.<lien-externe />
              </a>
            </p>
          </div>
        </div>
      </div>
      <!-- Bandeau de navigation masqué sur la page /exploitations/ -->
      <div class="fr-container" v-if="isOc && !isMobile && !isOnExploitationsPage">
        <nav class="fr-nav" id="header-navigation" role="navigation" aria-label="Menu principal">
          <ul class="fr-nav__list">
            <li class="fr-nav__item">
              <router-link to="/certification/tableau-de-bord" class="fr-nav__link">Tableau de bord</router-link>
            </li>
            <li class="fr-nav__item">
              <router-link to="/certification/exploitations" class="fr-nav__link">Liste des exploitations</router-link>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  </div>
</template>

<script setup>
import { computed, ref } from "vue";
import { useRouter, useRoute } from "vue-router";
import { useUserStore, ROLES } from "@/stores/user.js";
import { storeToRefs } from "pinia";
import { useOnline } from "@vueuse/core";
import { useIsMobile } from "@/composables/useIsMobile";

const userStore = useUserStore();
const router = useRouter();
const route = useRoute();
const online = useOnline();
const isMobile = useIsMobile();

const maintenance = ref(false);
const checkStatus = async () => {
  try {
    const response = await fetch("/status.txt");
    maintenance.value = !(await response.text()).startsWith("OK");
  } catch (error) {
    maintenance.value = false;
  }
};
checkStatus();
setInterval(checkStatus, 30000);

router.afterEach(() => {
  menuIsOpen.value = false;
});

const ROLE_ICONS = new Map([
  [ROLES.OC_AUDIT, "fr-icon-medal-fill"],
  [ROLES.OC_CERTIF, "fr-icon-medal-fill"],
  [ROLES.OPERATEUR, "fr-icon-plant-fill"],
  [ROLES.ADMIN, "fr-icon-shield-fill"],
  [ROLES.UNKNOWN, "fr-icon-warning-fill"],
]);

const isStaging = computed(() => !import.meta.env.VUE_APP_PRODUCTION);
const { user, isLogged, roles, startPage, documentationPage } = storeToRefs(userStore);
const roleIcon = computed(() => {
  for (const role of roles.value) {
    if (ROLE_ICONS.has(role)) return ROLE_ICONS.get(role);
  }

  return "fr-icon-account-circle-fill";
});

const menuIsOpen = ref(false);
const dropdownIsOpen = ref(false);

const isOc = computed(() => userStore.isOc);

const isOnExploitationsPage = computed(() => {
  return route.path.includes("/exploitations/");
});

const exploitationsMenuLabel = computed(() => {
  return isOc.value ? "Liste des exploitations" : "Mes exploitations";
});
</script>

<style scoped>
@media (width < 36em) {
  .fr-header__service {
    display: none;
  }

  .fr-logo:after {
    display: none;
  }
}

.logo {
  width: 3.5rem;
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

#mobile-menu .fr-nav__link {
  justify-content: flex-start;
}

.dropdown-menu-container {
  position: relative;
}

.dropdown-menu {
  position: absolute;
  top: 100%;
  right: 0;
  min-width: 200px;
  background: white;
  border: 1px solid #ddd;
  border-radius: 4px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  z-index: 1000;
}

.dropdown-menu__list {
  list-style: none;
  margin: 0;
  padding: 0.5rem 0;
}

.dropdown-menu__list li {
  border-bottom: 1px solid #f0f0f0;
}

.dropdown-menu__list li:last-child {
  border-bottom: none;
}

.dropdown-menu__link {
  display: block;
  padding: 0.75rem 1rem;
  text-decoration: none;
  color: #333;
  transition: background-color 0.2s;
}

.dropdown-menu__link:hover {
  background-color: #f5f5f5;
  text-decoration: none;
}
</style>
