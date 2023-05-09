<route lang="yaml">
  meta:
    seo:
      title: Votre parcellaire cultivé en agriculture biologique
  </route>

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

  <ProductFlowSection />

  <StatsSection class="fr-background-alt--grey">
    <template #footer-link>
      <router-link to="/stats" class="fr-btn fr-btn--secondary">
        Voir toutes les statistiques
      </router-link>
    </template>
  </StatsSection>

  <OpendataSection>
    <template #headline>
      <h2 class="fr-h4">Les réutilisations</h2>
    </template>
  </OpendataSection>

  <ContributeSection class="fr-background-alt--grey" />
</template>

<script setup>
import StatsSection from '@/components/Stats/section.vue'
import PartnersSection from '@/components/Partners/section.vue'
import OpendataSection from '@/components/Partners/opendata-section.vue'
import ContributeSection from '@/components/Partners/contribute-section.vue'
import ProductFlowSection from '@/components/Features/productflow-section.vue'
import Loading from '@/components/Loading.vue'
</script>

<style scoped>

.cta-img {
  max-height: 6em;
}
</style>
