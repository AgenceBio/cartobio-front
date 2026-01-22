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
                <router-link
                  class="fr-btn fr-mr-1w fr-icon--sm fr-icon-arrow-left-line"
                  :to="'/exploitations/' + (operator ? operator.numeroBio : '')"
                >
                  Retour vers {{ operator ? operator.nom : "" }}</router-link
                >
                <div class="dropdown-menu-container">
                  <button
                    class="fr-btn fr-btn--secondary fr-btn--icon-left fr-icon-menu-2-fill"
                    @click="toggleDropdown"
                    :aria-expanded="dropdownIsOpen"
                    aria-haspopup="true"
                    aria-controls="dropdown-menu"
                  >
                    Menu
                  </button>
                  <div
                    class="fr-collapse fr-menu"
                    v-show="dropdownIsOpen"
                    id="dropdown-menu"
                    :class="{ 'fr-collapse--expanded': dropdownIsOpen }"
                  >
                    <ul class="fr-menu__list">
                      <li class="fr-menu__item">
                        <router-link :to="accueilPage" class="fr-nav__link" @click="closeMonEspace">
                          Accueil
                        </router-link>
                      </li>
                      <li class="fr-menu__item">
                        <router-link to="/certification/exploitations" class="fr-nav__link" @click="closeDropdown">
                          {{ exploitationsMenuLabel }}
                        </router-link>
                      </li>
                      <li class="fr-menu__item">
                        <a
                          :href="documentationPage"
                          target="_blank"
                          rel="noopener"
                          class="fr-nav__link"
                          @click="closeDropdown"
                        >
                          Aide
                        </a>
                      </li>
                      <li class="fr-menu__item">
                        <strong class="header-top">Mon compte</strong>
                      </li>
                      <li class="fr-menu__item">
                        <router-link :to="urlAccountNotifications" class="fr-nav__link" @click="closeMonEspace">
                          Paramètres du compte
                        </router-link>
                      </li>
                      <li class="fr-menu__item">
                        <router-link to="/logout" class="fr-nav__link" @click="closeDropdown">
                          <span class="fr-icon-logout-box-r-line fr-icon--sm" aria-hidden="true"></span>
                          Déconnexion
                        </router-link>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>

              <!-- Header hors page exploitations -->
              <div class="fr-header__tools-links" v-else>
                <ul class="fr-btns-group" id="header-navigation" role="navigation">
                  <li class="tool-grandpublic" v-if="isLogged">
                    <router-link
                      class="fr-btn fr-mr-1w fr-icon--sm fr-icon-arrow-left-line"
                      to="/"
                      v-if="
                        isLogged &&
                        (isActive('/certification/*') || isActive('/exploitations/*') || isActive('/exploitations'))
                      "
                      >Retour au site grand public
                    </router-link>
                    <router-link class="fr-btn fr-mr-1w fr-icon--sm fr-icon-arrow-left-line" :to="accueilPage" v-else
                      >Retour vers mon espace
                    </router-link>
                  </li>
                  <li class="tool-grandpublic">
                    <a
                      href="https://www.agencebio.org/cartobio/"
                      v-if="(isAgri && isActive('/exploitations/*')) || isActive('/exploitations')"
                      class="fr-btn fr-icon--sm fr-icon-road-map-line"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Carte grand public
                    </a>
                  </li>
                  <li class="tool-username" aria-hidden="true" v-if="isLogged">
                    <button
                      @click="toggleMonEspace"
                      :class="['fr-btn', 'fr-mr-1w', 'fr-btn--tertiary', roleIcon, 'fr-mb-0']"
                      aria-controls="navigation-espace"
                      :aria-expanded="isMonEspaceOpen"
                    >
                      <span>{{ getName() }}</span>
                      <span
                        :class="{
                          'fr-icon-arrow-down-s-line': !isMonEspaceOpen,
                          'fr-icon-arrow-up-s-line': isMonEspaceOpen,
                        }"
                        aria-hidden="true"
                      />
                    </button>

                    <div
                      v-show="isMonEspaceOpen"
                      class="fr-collapse fr-menu fr-mt-n3v"
                      ref="collapseUserMenu"
                      :class="{ 'fr-collapse--expanded': isMonEspaceOpen }"
                      id="navigation-espace"
                    >
                      <ul class="fr-menu__list">
                        <li class="fr-menu__item">
                          <a :href="urlAccountNotifications" class="fr-nav__link" @click="closeMonEspace">
                            Paramètres du compte
                          </a>
                        </li>
                        <li class="fr-menu__item">
                          <router-link to="/logout" class="fr-nav__link" @click="closeMonEspace">
                            <span class="fr-icon-logout-box-r-line fr-icon--sm" aria-hidden="true"></span>
                            Déconnexion
                          </router-link>
                        </li>
                      </ul>
                    </div>
                  </li>
                  <li v-if="!isLogged">
                    <router-link
                      to="/login"
                      class="fr-btn fr-icon-account-circle-fill fr-btn--icon-left"
                      aria-role="button"
                    >
                      Me connecter
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
                  Me connecter
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

      <!-- Header Grand public -->
      <div
        class="fr-header__menu"
        v-if="
          !isLogged ||
          (!isActive('/certification/*') &&
            !isActive('/exploitations/*') &&
            !isActive('/exploitations') &&
            !isOnExploitationsPage)
        "
      >
        <div class="fr-container">
          <nav class="fr-nav" role="navigation" aria-label="Menu principal">
            <ul class="fr-nav__list">
              <li class="fr-nav__item">
                <router-link to="/" class="fr-nav__link"> Accueil </router-link>
              </li>
              <li class="fr-nav__item">
                <button
                  id="navigation-01"
                  :aria-expanded="isOpenCartoBio"
                  aria-controls="navigation-01"
                  type="button"
                  class="fr-nav__btn"
                  @click="toggleCartoBio"
                  :aria-current="isActive('/projet') || isActive('/stats') ? 'page' : undefined"
                >
                  Qu'est ce que CartoBio ?
                </button>
                <div
                  class="fr-collapse fr-menu"
                  id="navigation-01"
                  :class="{ 'fr-collapse--expanded': isOpenCartoBio }"
                >
                  <ul class="fr-menu__list">
                    <li>
                      <router-link id="navigation-item-01-1" to="/projet" class="fr-nav__link" @click="closeAllMenus"
                        >A propos
                      </router-link>
                    </li>
                    <li>
                      <router-link id="navigation-item-01-2" to="/stats" class="fr-nav__link" @click="closeAllMenus"
                        >Les chiffres</router-link
                      >
                    </li>
                  </ul>
                </div>
              </li>
              <li class="fr-nav__item">
                <router-link to="/pro" class="fr-nav__link"> Professionnels </router-link>
              </li>
              <li class="fr-nav__item">
                <button
                  id="navigation-02"
                  :aria-expanded="isOpenHelp"
                  aria-controls="navigation-02"
                  type="button"
                  class="fr-nav__btn"
                  @click="toggleHelp"
                  :aria-current="isActive('/faq') ? 'page' : undefined"
                >
                  Aide
                </button>
                <div class="fr-collapse fr-menu" id="navigation-02" :class="{ 'fr-collapse--expanded': isOpenHelp }">
                  <ul class="fr-menu__list">
                    <li>
                      <router-link id="navigation-item-02-1" to="/faq" class="fr-nav__link" @click="closeAllMenus"
                        >Foire aux questions</router-link
                      >
                    </li>
                    <li>
                      <a
                        :href="documentationPage"
                        target="_blank"
                        rel="noopener"
                        id="navigation-item-02-2"
                        class="fr-nav__link fr-btn--icon-left fr-icon-questionnaire-fill aide-button"
                        @click="closeAllMenus"
                      >
                        Aide<lien-externe />
                      </a>
                    </li>
                  </ul>
                </div>
              </li>
            </ul>
          </nav>
        </div>
      </div>

      <!-- Header Organisme certificateur -->
      <div
        class="fr-container"
        v-if="isOc && !isMobile && (isActive('/certification/*') || isActive('/exploitations/*'))"
      >
        <nav class="fr-nav" id="header-navigation" role="navigation" aria-label="Menu principal">
          <ul class="fr-nav__list">
            <li class="fr-nav__item">
              <router-link to="/certification/tableau-de-bord" class="fr-nav__link">Accueil</router-link>
            </li>
            <li class="fr-nav__item">
              <router-link
                to="/certification/exploitations"
                class="fr-nav__link"
                :aria-current="
                  isActive('/exploitations/*') || isActive('/certification/exploitations') ? 'page' : undefined
                "
                >Liste des exploitations</router-link
              >
            </li>
            <li class="fr-nav__item">
              <button
                id="navigation-oc-help"
                :aria-expanded="isOpenHelpOc"
                aria-controls="navigation-oc-help"
                type="button"
                class="fr-nav__btn"
                @click="toggleHelpOc"
                :aria-current="isActive('/faq') ? 'page' : undefined"
              >
                Aide
              </button>
              <div
                class="fr-collapse fr-menu"
                id="navigation-oc-help"
                :class="{ 'fr-collapse--expanded': isOpenHelpOc }"
              >
                <ul class="fr-menu__list">
                  <li>
                    <router-link id="navigation-oc-item-01" to="/faq" class="fr-nav__link" @click="closeAllMenus"
                      >Foire aux questions</router-link
                    >
                  </li>
                  <li>
                    <a
                      :href="documentationPage"
                      target="_blank"
                      rel="noopener"
                      class="fr-nav__link fr-btn--icon-left fr-icon-questionnaire-fill aide-button"
                      @click="closeAllMenus"
                    >
                      Aide<lien-externe />
                    </a>
                  </li>
                </ul>
              </div>
            </li>
          </ul>
        </nav>
      </div>

      <!-- Header Agri -->
      <div
        class="fr-container"
        v-if="isAgri && !isMobile && (isActive('/exploitations/*') || isActive('/exploitations'))"
      >
        <nav class="fr-nav" id="header-navigation" role="navigation" aria-label="Menu principal">
          <ul class="fr-nav__list">
            <li class="fr-nav__item">
              <router-link to="/exploitations" class="fr-nav__link">Accueil</router-link>
            </li>
            <li class="fr-nav__item">
              <router-link
                to="/exploitations/liste"
                class="fr-nav__link"
                :aria-current="isActive('/exploitations/*') ? 'page' : undefined"
                >Mes exploitations</router-link
              >
            </li>
            <li class="fr-nav__item">
              <button
                id="navigation-agri-help"
                :aria-expanded="isOpenHelpAgri"
                aria-controls="navigation-agri-help"
                type="button"
                class="fr-nav__btn"
                @click="toggleHelpAgri"
                :aria-current="isActive('/faq') ? 'page' : undefined"
              >
                Aide
              </button>
              <div
                class="fr-collapse fr-menu"
                id="navigation-agri-help"
                :class="{ 'fr-collapse--expanded': isOpenHelpAgri }"
              >
                <ul class="fr-menu__list">
                  <li>
                    <router-link id="navigation-agri-item-01" to="/faq" class="fr-nav__link" @click="closeAllMenus"
                      >Foire aux questions</router-link
                    >
                  </li>
                  <li>
                    <a
                      :href="documentationPage"
                      target="_blank"
                      rel="noopener"
                      class="fr-nav__link fr-btn--icon-left fr-icon-questionnaire-fill aide-button"
                      @click="closeAllMenus"
                    >
                      Aide<lien-externe />
                    </a>
                  </li>
                </ul>
              </div>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, Ref, watch } from "vue";
import { useRouter, useRoute } from "vue-router";
import { useUserStore, ROLES } from "@/stores/user.js";
import { storeToRefs } from "pinia";
import { useOnline } from "@vueuse/core";
import { useIsMobile } from "@/composables/useIsMobile";
import { useOperatorStore } from "@/stores/operator.js";

const operatorStore = useOperatorStore();
const userStore = useUserStore();
const router = useRouter();
const route = useRoute();
const online = useOnline();
const isMobile = useIsMobile();

const isOpenCartoBio: Ref<boolean> = ref<boolean>(false);
const isOpenHelp: Ref<boolean> = ref<boolean>(false);
const isOpenHelpOc: Ref<boolean> = ref<boolean>(false);
const isOpenHelpAgri: Ref<boolean> = ref<boolean>(false);
const isMonEspaceOpen: Ref<boolean> = ref<boolean>(false);
const dropdownIsOpen: Ref<boolean> = ref<boolean>(false);
const collapseUserMenu = ref<HTMLElement | null>(null);

const operator = ref(null);

watch(
  () => route.fullPath,
  async () => {
    operator.value = operatorStore.operator;
  },
  { immediate: true },
);

const maintenance: Ref<boolean> = ref(false);
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

const isActive = (path: string): boolean => {
  const currentPath = route.fullPath.split("?")[0];

  if (path.endsWith("/*")) {
    const basePath = path.replace("/*", "");
    const regex = new RegExp(`^${basePath}/[^/]+$`);
    return regex.test(currentPath);
  }

  return currentPath === path;
};

function getName(): string {
  if (!user?.value.prenom || !user?.value.nom) return "Mon profil";
  return `${user.value.prenom} ${user.value.nom}`;
}

const closeAllMenus = () => {
  isOpenCartoBio.value = false;
  isOpenHelp.value = false;
  isOpenHelpOc.value = false;
  isOpenHelpAgri.value = false;
  isMonEspaceOpen.value = false;
  dropdownIsOpen.value = false;
};

const toggleCartoBio = () => {
  const wasOpen = isOpenCartoBio.value;
  closeAllMenus();
  isOpenCartoBio.value = !wasOpen;
};

const toggleHelp = () => {
  const wasOpen = isOpenHelp.value;
  closeAllMenus();
  isOpenHelp.value = !wasOpen;
};

const toggleHelpOc = () => {
  const wasOpen = isOpenHelpOc.value;
  closeAllMenus();
  isOpenHelpOc.value = !wasOpen;
};

const toggleHelpAgri = () => {
  const wasOpen = isOpenHelpAgri.value;
  closeAllMenus();
  isOpenHelpAgri.value = !wasOpen;
};

const toggleMonEspace = () => {
  const wasOpen = isMonEspaceOpen.value;
  closeAllMenus();
  isMonEspaceOpen.value = !wasOpen;
};

const toggleDropdown = () => {
  const wasOpen = dropdownIsOpen.value;
  closeAllMenus();
  dropdownIsOpen.value = !wasOpen;
};

const closeMonEspace = () => {
  isMonEspaceOpen.value = false;
};

const closeDropdown = () => {
  dropdownIsOpen.value = false;
};

router.afterEach((): void => {
  menuIsOpen.value = false;
  closeAllMenus();
});

const ROLE_ICONS = new Map([
  [ROLES.OC_AUDIT, "fr-icon-medal-fill"],
  [ROLES.OC_CERTIF, "fr-icon-medal-fill"],
  [ROLES.OPERATEUR, "fr-icon-plant-fill"],
  [ROLES.ADMIN, "fr-icon-shield-fill"],
  [ROLES.UNKNOWN, "fr-icon-warning-fill"],
]);

const isStaging = computed(() => !import.meta.env.VUE_APP_PRODUCTION);

const { user, isLogged, roles, startPage, accueilPage, documentationPage } = storeToRefs(userStore);
const roleIcon = computed(() => {
  for (const role of roles.value) {
    if (ROLE_ICONS.has(role)) return ROLE_ICONS.get(role);
  }

  return "fr-icon-account-circle-fill";
});

const menuIsOpen = ref(false);

const isOc = computed(() => userStore.isOc);
const isAgri = computed(() => userStore.isAgri);

const isOnExploitationsPage = computed(() => {
  return /^\/exploitations\/[^/]+\/[^/]+$/.test(route.path);
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
  position: relative;
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

.tool-grandpublic {
  flex-shrink: 1;
  max-width: 30vw !important;
}

#mobile-menu .fr-nav__link {
  justify-content: flex-start;
}

.dropdown-menu-container {
  position: relative;
}

.dropdown-menu-container .fr-collapse {
  position: absolute;
  top: 100%;
  right: 0;
  min-width: 250px;
  z-index: 1000;
}

.dropdown-menu-container .fr-menu__list .fr-menu__item .fr-nav__link {
  justify-content: start;
  gap: 10px;
  padding: 0.75rem 1rem;
  box-shadow: none;
}

.dropdown-menu-container .fr-menu__list .fr-menu__item .header-top {
  -webkit-box-shadow: 0 calc(-1rem - 1px) 0 -1rem #ddd;
  box-shadow: 0 calc(-1rem - 1px) 0 -1rem #ddd;
  -webkit-box-shadow: 0 calc(-1rem - 1px) 0 -1rem var(--border-default-grey);
  box-shadow: 0 calc(-1rem - 1px) 0 -1rem var(--border-default-grey);
  display: flex;
  padding: 0.75rem 1rem;
  justify-content: start;
}

.tool-grandpublic a[target="_blank"]::after {
  display: none !important;
}

.user-info {
  padding: 1rem;
  background-color: var(--background-alt-blue-france);
  text-align: start;
}

fr .user-info strong {
  display: block;
  margin-bottom: 0.25rem;
}

.user-email {
  font-size: 0.875rem;
  color: var(--text-mention-grey);
}

.aide-button {
  justify-content: normal;
}

#navigation-espace {
  right: 0;
}

#navigation-espace > .fr-menu__list .fr-menu__item .fr-nav__link {
  justify-content: start;
  gap: 10px;
  box-shadow: none !important;
}

.fr-collapse {
  transition: visibility 0.3s;
}

.fr-collapse::before {
  transition: margin-top 0.3s;
  margin-top: 0;
}

.fr-nav__list > *:first-child:nth-last-child(2) ~ *,
.fr-nav__list > *:first-child:nth-last-child(3) ~ *,
.fr-nav__list > *:first-child:nth-last-child(4) ~ * {
  margin-left: 0;
}
</style>
