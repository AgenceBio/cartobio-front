<template>
  <footer class="fr-footer" role="contentinfo" id="footer">
    <div class="fr-container">
      <div class="fr-footer__body">
        <div class="fr-footer__brand fr-enlarge-link">
          <a href="/" title="Retour à l’accueil">
            <p class="fr-logo" title="république française">
              République<br>
              française
            </p>
          </a>

          <a class="fr-footer__brand-link fr-ml-3w" href="https://agencebio.org">
            <img src="../assets/logo-agence-bio.svg" class="fr-footer__logo fr-responsive-img logo" alt="L'Agence Bio" />
          </a>
        </div>

        <div class="fr-footer__content">
          <div class="fr-footer__content-desc">
            <p>
              <b class="fr-icon-leaf-fill fr-icon--sm fr-icon--left">Aidez-nous à améliorer ce service !</b><br />
              Si vous rencontrez un problème,
              vous n'arrivez pas à finaliser une action
              ou vous avez un commentaire sur cette page,
              envoyez-nous un message à l'adresse suivante :
            </p>
            <p>
              <a class="fr-btn fr-icon-mail-fill fr-btn--icon-left" :href="'mailto:support-cartobio@agencebio.org?subject=' + mailtoSubject">support-cartobio@agencebio.org</a>
            </p>
            <p class="fr-text--bold">Merci !</p>
          </div>
          <ul class="fr-footer__content-list">
            <li class="fr-footer__content-item">
              <a class="fr-footer__content-link" target="_blank" href="https://agencebio.org">agencebio.org</a>
            </li>
            <li class="fr-footer__content-item">
              <a class="fr-footer__content-link" target="_blank" href="https://www.data.gouv.fr/fr/dataset/616d6531c2951bbe8bd97771/">data.gouv.fr</a>
            </li>
          </ul>
        </div>
      </div>
      <div class="fr-footer__bottom">
        <ul class="fr-footer__bottom-list">
          <li class="fr-footer__bottom-item">
            <router-link class="fr-footer__bottom-link" to="/sitemap">Plan du site</router-link>
          </li>
          <li class="fr-footer__bottom-item">
            <a target="_blank" class="fr-footer__bottom-link" href="https://github.com/AgenceBio/cartobio-front">Code source : ouvert</a>
          </li>
          <li class="fr-footer__bottom-item">
            <router-link class="fr-footer__bottom-link" to="/accessibilite">Accessibilité: non conforme</router-link>
          </li>
          <li class="fr-footer__bottom-item">
            <router-link class="fr-footer__bottom-link" to="/mentions-legales">Mentions légales</router-link>
          </li>
          <li class="fr-footer__bottom-item">
            <router-link class="fr-footer__bottom-link" to="/protection-de-vos-donnees">Données personnelles</router-link>
          </li>
          <li class="fr-footer__bottom-item">
            <router-link class="fr-footer__bottom-link" to="/cookies">Gestion des cookies</router-link>
          </li>
        </ul>
        <div class="fr-footer__bottom-copy">
          <p>Sauf mention contraire, tous les contenus de ce site sont sous <a
              href="https://github.com/etalab/licence-ouverte/blob/master/LO.md" target="_blank">licence etalab-2.0</a>
          </p>
        </div>
      </div>
    </div>
  </footer>

</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const mailtoSubject = computed(() => encodeURIComponent(`À propos de la page ${route.path}`))
</script>

<style scoped>
.logo {
  max-width: 3.5rem;
}
</style>
