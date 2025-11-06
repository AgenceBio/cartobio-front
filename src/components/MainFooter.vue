<template>
  <button
    class="fr-btn fr-btn--tertiary-no-outline"
    :class="{
      'fr-icon-arrow-up-s-line fr-footer-toggle-label-expanded fr-btn--sm fr-mt-1w fr-btn--icon-right': isExpanded,
      'fr-icon-arrow-down-s-line fr-footer-toggle-label-not-expanded': !isExpanded,
    }"
    @click="isExpanded = !isExpanded"
    v-if="isOnExploitationsPage"
  >
    <template v-if="isExpanded">Fermer</template>
  </button>
  <footer
    class="fr-footer"
    :class="{
      'footer-not-expanded': !isExpanded && isOnExploitationsPage,
      'footer-expanded': isExpanded && isOnExploitationsPage,
    }"
    role="contentinfo"
    id="footer"
  >
    <div class="fr-container">
      <div class="fr-footer__body" v-if="isExpanded || !isOnExploitationsPage">
        <div class="fr-footer__brand fr-enlarge-link">
          <a
            href="https://agencebio.org"
            title="Accéder au site de l'Agence Bio - République française"
            tabindex="-1"
            class="fr-footer__brand-link"
          >
            <p class="fr-logo" title="République française">
              République<br />
              française
            </p>
          </a>

          <a
            class="fr-footer__brand-link fr-ml-3w"
            href="https://agencebio.org"
            title="Accéder au site de l'Agence Bio"
          >
            <img
              src="../assets/logo-agence-bio.svg"
              class="fr-footer__logo fr-responsive-img logo"
              alt="Logo de l'Agence Bio"
            />
          </a>
        </div>

        <div class="fr-footer__content">
          <p class="fr-footer__content-desc">Ce site est géré par l'Agence Bio</p>
          <ul class="fr-footer__content-list">
            <li class="fr-footer__content-item">
              <a
                class="fr-footer__content-link"
                target="_blank"
                href="https://agencebio.org"
                title="Accéder au site de l'Agence Bio"
                >agencebio.org<lien-externe
              /></a>
            </li>
            <li class="fr-footer__content-item">
              <a
                class="fr-footer__content-link"
                target="_blank"
                href="https://www.data.gouv.fr/fr/dataset/616d6531c2951bbe8bd97771/"
                title="Accéder au site de donnée du gouvernement français"
                >data.gouv.fr<lien-externe
              /></a>
            </li>
          </ul>
        </div>
      </div>
      <div class="fr-footer__bottom">
        <ul class="fr-footer__bottom-list">
          <li class="fr-footer__bottom-item" v-if="isOnExploitationsPage">
            <router-link class="fr-footer__bottom-link" to="/certification/tableau-de-bord">Accueil</router-link>
          </li>
          <li class="fr-footer__bottom-item" v-if="isOnExploitationsPage">
            <router-link class="fr-footer__bottom-link" to="/certification/exploitations">
              {{ isOc ? "Liste des exploitations" : "Mes exploitations" }}</router-link
            >
          </li>
          <li class="fr-footer__bottom-item">
            <a class="fr-footer__bottom-link" :href="'mailto:support-cartobio@agencebio.org?subject=' + mailtoSubject"
              >Nous contacter</a
            >
          </li>
          <li class="fr-footer__bottom-item" v-if="isOc">
            <router-link class="fr-footer__bottom-link" to="/faq">FAQ</router-link>
          </li>
          <li class="fr-footer__bottom-item">
            <a class="fr-footer__bottom-link" :href="'/testcartobio'" target="_blank">Aide</a>
          </li>
          <li class="fr-footer__bottom-item">
            <router-link class="fr-footer__bottom-link" to="/sitemap">Plan du site</router-link>
          </li>

          <li class="fr-footer__bottom-item">
            <router-link
              class="fr-footer__bottom-link"
              to="/accessibilite"
              title="Accessibilité :  partiellement conforme, accéder aux détails"
              >Accessibilité : partiellement conforme</router-link
            >
          </li>
          <li class="fr-footer__bottom-item">
            <router-link class="fr-footer__bottom-link" to="/mentions-legales">Mentions légales</router-link>
          </li>
          <li class="fr-footer__bottom-item fr-footer__bottom-link">
            Code source :
            <a
              target="_blank"
              class="fr-footer__bottom-link"
              href="https://github.com/AgenceBio/cartobio-front"
              title="Accéder au code source de l'interface Cartobio"
              >interface<lien-externe
            /></a>
            {{ versions.front }}
            et
            <a
              target="_blank"
              class="fr-footer__bottom-link"
              href="https://github.com/AgenceBio/cartobio-api"
              title="Accéder au code source de l'API Cartobio"
              ><abbr title="Application Programmable Interface" lang="en">API</abbr><lien-externe
            /></a>
            {{ versions.api }}
          </li>
        </ul>
        <div class="fr-footer__bottom-copy" v-if="isExpanded">
          <p>
            Sauf mention contraire, tous les contenus de ce site sont sous
            <a
              href="https://github.com/etalab/licence-ouverte/blob/master/LO.md"
              target="_blank"
              title="Accéder aux informations sur la license etalab-2.0"
              >licence etalab-2.0<lien-externe
            /></a>
          </p>
        </div>
      </div>
    </div>
  </footer>
</template>

<script setup lang="ts">
import { onMounted, computed, reactive, ref, Ref } from "vue";
import { useRoute } from "vue-router";
import { getVersion } from "@/cartobio-api.js";
import { useUserStore } from "@/stores/user";

const userStore = useUserStore();

const versions = reactive({
  front: __APP_VERSION__,
  api: "",
});

const isOc = computed((): boolean => userStore.isOc);

const isExpanded: Ref<Boolean> = ref(false);

onMounted(async () => {
  versions.api = await getVersion();
});

const route = useRoute();
const mailtoSubject = computed(() => encodeURIComponent(`À propos de la page ${route.path}`));

const isOnExploitationsPage = computed((): boolean => {
  return /^\/exploitations\/[^/]+\/[^/]+$/.test(route.path);
});
</script>

<style scoped>
.logo {
  max-width: 3.5rem;
}

.fr-footer-toggle-label-not-expanded {
  position: absolute;
  right: 10px;
  width: 32px;
  min-height: 32px;
  padding: 8px;
  transform: translate(-20px, 10px);
}

.fr-footer-toggle-label-expanded {
  position: absolute;
  right: 10px;
  min-height: 32px;
  padding: 8px;
}

.footer-not-expanded {
  padding-top: 0;
  margin-top: -2rem;

  > .fr-container .fr-footer__bottom {
    box-shadow: none;
  }
}

.footer-expanded {
  padding-top: 4rem;
}
</style>
