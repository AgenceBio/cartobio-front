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
              to="/exploitation" target="_blank">
              Accéder aux données publiques
            </a>
          </p>
        </div>
      </div>
    </div>
  </div>

  <div class="fr-container fr-py-4w">
    <div class="fr-grid-row fr-grid-row--gutters">
      <div class="fr-col-lg-6 fr-col--center">
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

      <div class="fr-col-lg-6 fr-col--center">
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

  <PartnersSection class="fr-background-alt--grey" section-oc section-administrations />

  <div class="fr-container--fluid fr-py-5w">
    <div class="fr-container container--stats">
      <div class="fr-grid-row">
        <div class="fr-col-12">
          <h2 class="fr-h4">Comment ça fonctionne ?</h2>
        </div>
      </div>

      <ul class="fr-grid-row fr-grid-row--align-center steps fr-grid-row--gutters">
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

  <OpendataSection class=" fr-py-5w">
    <template #headline>
      <h2 class="fr-h4">Les réutilisations</h2>
    </template>
  </OpendataSection>
</template>

<script setup>
import StatsSection from '@/components/Stats/section.vue'
import PartnersSection from '@/components/Partners/section.vue'
import OpendataSection from '@/components/Partners/opendata-section.vue'
</script>

<style scoped>

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
</style>
