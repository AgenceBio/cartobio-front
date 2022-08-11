<template>
  <div class="fr-container--fluid fr-background-alt--grey fr-py-5w">
    <div class="fr-container">
      <div class="fr-grid-row fr-grid-row--gutters">
        <div class="fr-col-lg-12">
          <h1>Le parcellaire cultivé en agriculture biologique</h1>

          <p>
            <strong>Des données collectées sur le terrain</strong><br />
            Saisies par les agriculteurs·trices et validées par les Organismes de Certification.
          </p>

          <p>
            <strong>Faire avancer les initiatives locales et la recherche</strong><br />
            Utilisées par de nombreux acteurs, les données du parcellaire bio sont précieuses.
          </p>

          <p>
            <a class="fr-btn" href="https://www.data.gouv.fr/fr/dataset/616d6531c2951bbe8bd97771"
              to="/operateur/certification-ab" target="_blank">
              Accéder aux données
            </a>
          </p>
        </div>
      </div>
    </div>
  </div>

  <div class="fr-container fr-py-4w">
    <div class="fr-grid-row fr-grid-row--gutters">
      <div class="fr-col-lg-6 fr-text-align-center">
        <img src="../assets/illustrations/undraw_environment.svg" class="fr-responsive-img fr-my-3w cta-img"
          alt="" />

        <h3 class="fr-h4">Agriculteurs, agricultrices</h3>

        <p>
          Partagez simplement votre parcellaire avec votre OC<br />et simplifiez vos demandes d’aides !
        </p>

        <p>
          <router-link to="/exploitation" class="fr-btn fr-btn--secondary">
            Utiliser CartoBio pour mon exploitation
          </router-link>
        </p>
      </div>

      <div class="fr-col-lg-6 fr-text-align-center">
        <img src="../assets/illustrations/undraw_certification.svg" class="fr-responsive-img fr-my-3w cta-img"
          alt="" />

        <h3 class="fr-h4">Organismes de Certification</h3>

        <p>
          Faites le suivi du parcellaire de l’opérateur<br />sur un support graphique.
        </p>

        <p>
          <router-link to="/certification" class="fr-btn fr-btn--secondary">
            Utiliser CartoBio pour mes contrôles
          </router-link>
        </p>
      </div>
    </div>
  </div>

  <div class="fr-container--fluid fr-background-alt--grey fr-py-5w">
    <div class="fr-container">
      <div class="fr-grid-row">
        <div class="fr-col-12">
          <h2 class="fr-h3">Les Partenaires</h2>
        </div>
      </div>
      <div class="fr-grid-row fr-grid-row--gutters">
        <div class="fr-col-lg-7">
          <h3 class="fr-h4">Administrations et organismes publics</h3>

          <ul class="logo-grid">
            <li><img src="../assets/logos-partenaires/masa.png" alt="" class="logo"></li>
            <li><img src="../assets/logos-partenaires/mte.png" alt="" class="logo"></li>
            <li><img src="../assets/logos-partenaires/agence-bio.png" alt="" class="logo"></li>
            <li><img src="../assets/logos-partenaires/inao.png" alt="" class="logo"></li>
            <li><img src="../assets/logos-partenaires/ofb.png" alt="" class="logo"></li>
            <li><img src="../assets/logos-partenaires/asp.svg" alt="" class="logo"></li>
          </ul>
        </div>

        <div class="fr-col-lg-5">
          <h3 class="fr-h4">Organismes Certificateurs</h3>

          <ul class="logo-grid">
            <li><img src="../assets/logos-oc/ecocert.png" alt="" class="logo"></li>
            <li><img src="../assets/logos-oc/certipaq.png" alt="" class="logo"></li>
            <li><img src="../assets/logos-oc/alpes-controles.png" alt="" class="logo"></li>
            <li><img src="../assets/logos-oc/certisud.png" alt="" class="logo"></li>
            <li><img src="../assets/logos-oc/bureau-veritas.png" alt="" class="logo"></li>
            <li><img src="../assets/logos-oc/ocacia.png" alt="" class="logo"></li>
          </ul>
        </div>
      </div>
      <div class="fr-grid-row">
        <p class="fr-col-12 fr-mt-3w">
          <router-link to="/projet" class="fr-btn fr-btn--secondary">
            En savoir plus sur le projet
          </router-link>
        </p>
      </div>
    </div>
  </div>

  <div class="fr-container--fluid fr-py-5w">
    <div class="fr-container container--stats">
      <div class="fr-grid-row">
        <div class="fr-col-12">
          <h2 class="fr-h4">Comment ça fonctionne ?</h2>
        </div>
      </div>

      <ul class="fr-grid-row fr-text-align-center steps fr-grid-row--gutters">
        <li class="fr-col-3">
          <img src="../assets/illustrations/undraw_prioritise_ready.svg"
            class="fr-responsive-img fr-my-3w cta-img" alt="" />

          Import ou création du parcellaire par les agriculteurs.trices
        </li>
        <li class="fr-col-3">
          <img src="../assets/illustrations/undraw_job_hunt.svg" class="fr-responsive-img fr-my-3w cta-img"
            alt="" />

          Le parcellaire est validé par l’OC lors du controle Bio
        </li>
        <li class="fr-col-3">
          <img src="../assets/illustrations/undraw_online_transactions.svg"
            class="fr-responsive-img fr-my-3w cta-img" alt="" />

          Transmission du parcellaire à la DDT pour une instruction simplifiée des aides PAC
        </li>
        <li class="fr-col-3">
          <img src="../assets/illustrations/undraw_open_source.svg" class="fr-responsive-img fr-my-3w cta-img"
            alt="" />

          Le parcellaire anonymisé est publié et réutilisé par de nombreux acteurs
        </li>
      </ul>
    </div>
  </div>

  <StatsSection class="fr-background-alt--grey">
    <template #footer-link>
      <router-link to="/stats" class="fr-btn fr-btn--secondary">
        Voir toutes les statistiques
      </router-link>
    </template>
  </StatsSection>

  <div class="fr-container fr-py-5w">
    <div class="fr-grid-row">
      <div class="fr-col-12">
        <h2 class="fr-h4">Les réutilisations</h2>
      </div>
    </div>

    <div class="fr-grid-row fr-grid-row--gutters">
      <div class="fr-col-lg-4">
        <div class="fr-card">
          <div class="fr-card__body">
            <div class="fr-card__content">
              <h4 class="fr-card__title">
                BeeGIS
              </h4>
              <p class="fr-card__desc">Outil à destination des apiculteurs pour géolocaliser un emplacement de rucher et
                voir les cultures alentours.</p>
              <div class="fr-card__start">
                <ul class="fr-tags-group">
                  <li>
                    <p class="fr-tag">Apiculture</p>
                  </li>
                  <li>
                    <p class="fr-tag fr-tag--green-emeraude">Application web</p>
                  </li>
                </ul>
              </div>
            </div>
            <div class="fr-card__footer">
              <ul class="fr-links-group">
                  <li>
                      <a class="fr-link fr-icon-arrow-right-line fr-link--icon-right" href="https://appli.itsap.asso.fr/app/01-beegis" target="_blank">
                          voir le site
                      </a>
                  </li>
              </ul>
            </div>
          </div>
          <div class="fr-card__header">
            <div class="fr-card__img">
              <img class="fr-responsive-img" src="../assets/reuses/beegis.png"
                alt="[À MODIFIER - vide ou texte alternatif de l’image]">
            </div>
          </div>
        </div>
      </div>

      <div class="fr-col-lg-4">
        <div class="fr-card">
          <div class="fr-card__body">
            <div class="fr-card__content">
              <h4 class="fr-card__title">
                PestiRiv
              </h4>
              <p class="fr-card__desc">Étude épidémiologique de l’anses et Santé Publique France sur l’exposition aux pesticides chez les riverains de zones viticoles et non viticoles.</p>
              <div class="fr-card__start">
                <ul class="fr-tags-group">
                  <li>
                    <p class="fr-tag">Epidémiologie</p>
                  </li>
                  <li>
                    <p class="fr-tag fr-tag--green-emeraude">Recherche</p>
                  </li>
                </ul>
              </div>
            </div>
            <div class="fr-card__footer">
              <ul class="fr-links-group">
                  <li>
                      <a class="fr-link fr-icon-arrow-right-line fr-link--icon-right" href="https://www.santepubliquefrance.fr/etudes-et-enquetes/pestiriv-une-etude-pour-mieux-connaitre-l-exposition-aux-pesticides-des-personnes-vivant-en-zones-viticoles-et-non-viticoles" target="_blank">
                          voir le site
                      </a>
                  </li>
              </ul>
            </div>
          </div>
          <div class="fr-card__header">
            <div class="fr-card__img">
              <img class="fr-responsive-img" src="../assets/reuses/pestiriv.png" alt="">
            </div>
          </div>
        </div>
      </div>

      <div class="fr-col-lg-4">
        <div class="fr-card">
          <div class="fr-card__body">
            <div class="fr-card__content">
              <h4 class="fr-card__title">
                Territoire Bio Engagé
              </h4>
              <p class="fr-card__desc">Label à destination des collectivité territoriales (% SAU en bio) et établissements publiques (% des approvisonnements).</p>
              <div class="fr-card__start">
                <ul class="fr-tags-group">
                  <li>
                    <p class="fr-tag">Collectivités</p>
                  </li>
                  <li>
                    <p class="fr-tag fr-tag--green-emeraude">Label</p>
                  </li>
                </ul>
              </div>
            </div>
            <div class="fr-card__footer">
              <ul class="fr-links-group">
                  <li>
                      <a class="fr-link fr-icon-arrow-right-line fr-link--icon-right" href="https://www.territoirebioengage.fr/" target="_blank">
                          voir le site
                      </a>
                  </li>
              </ul>
            </div>
          </div>
          <div class="fr-card__header">
            <div class="fr-card__img">
              <img class="fr-responsive-img" src="../assets/reuses/territoire-bio-engage.png" alt="">
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import StatsSection from '@/components/Stats/section.vue'
</script>

<style scoped>
.fr-text-align-center {
  text-align: center;
}

.cta-img {
  max-height: 6em;
}

.steps > li {
  position: relative;
}

.steps > li:not(:last-child):after {
  content: "→";
  font-size: 3em;
  position: absolute;
  top: 1.5em;
  right: -0.25em;
}

.logo-grid {
  display: grid;
  list-style: none;
  grid-template-columns: repeat(3, 1fr);
}

img.logo {
  max-height: 100px;
}
</style>
