<route lang="yaml">
  meta:
    generalAudience: true
    seo:
      title: Découvrez les parcelles bio autour de chez vous
  </route>

<template>
  <div class="fr-container--fluid fr-py-9v hero">
    <div class="fr-container">
      <div class="fr-grid-row fr-grid-row--gutters">
        <div class="fr-col-md-6">
          <div class="fr-card">
            <div class="fr-card__body">
              <div class="fr-card__content">
                <h1>
                  Découvrez les parcelles bio autour de chez vous
                </h1>

                <p class="fr-card__desc fr-text--lead">
                  Explorez votre territoire grâce à nos données sur l'agriculture biologique.
                </p>
              </div>
              <div class="fr-card__footer">
                <ul class="fr-btns-group fr-btns-group--inline">
                  <li>
                    <a class="fr-btn" href="https://www.agencebio.org/cartobio/" rel="noopener" target="_blank">
                      Localiser le bio près de chez moi
                    </a>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <div class="fr-container--fluid fr-py-6w background-alt">
    <div class="fr-container">
      <div class="fr-grid-row fr-grid-row--gutters">
        <div class="fr-col-md-5">
          <h3>Comprendre son environnement</h3>

          <ul class="list-marks">
            <li>
              Visualisez votre territoire grâce à <strong>nos données cartographiques</strong>.
            </li>
            <li>
              Profitez de <strong>données fiables</strong>, complètes et mises à jour régulièrement par les acteurs de la filière biologique.
            </li>
          </ul>
        </div>

        <div class="fr-col-md-5 fr-col-offset-md-1">
          <h3>Évaluer la qualité de vie</h3>

          <ul class="list-marks">
            <li>
              Regardez la part de <strong>parcelles bio</strong> autour de vous.
            </li>
            <li>
              <strong>Observez l'évolution</strong> de l'agriculture biologique au fil des années.
            </li>
          </ul>
        </div>
      </div>
    </div>
  </div>

  <ProductFlowSection general-audience />

  <section class="fr-container--fluid fr-py-9v">
    <div class="fr-container">
      <div class="fr-grid-row fr-grid-row--gutters">
        <div class="fr-col-md-8">
          <h2>Des données en libre accès</h2>

          <p>
            Téléchargez nos données géographiques pour les manipuler
            ou les intégrer dans vos outils.
          </p>

          <p>
            <a class="fr-btn fr-btn--secondary" href="https://www.data.gouv.fr/fr/dataset/616d6531c2951bbe8bd97771/" target="_blank"  rel="noopener">
              Accéder aux données
            </a>
          </p>
        </div>
      </div>
    </div>
  </section>

  <PartnersSection sponsors>
    <template #headline>
      Des données contrôlées issues de la filière biologique
    </template>
  </PartnersSection>

  <div class="fr-container--fluid fr-py-4w">
    <div class="fr-container">
      <div class="fr-grid-row fr-grid-row--gutters">
        <div class="fr-col-md-6">
          <div class="fr-card background-alt">
            <div class="fr-card__body">
              <div class="fr-card__content">
                <h3>Pour les agriculteurs</h3>

                <ul class="list-marks fr-card__desc">
                  <li>
                    Partagez votre parcellaire avec votre organisme de certification.
                  </li>
                </ul>
              </div>
              <div class="fr-card__footer">
                <ul class="fr-btns-group fr-btns-group--inline">
                  <li>
                    <router-link to="/exploitations" class="fr-btn fr-btn--secondary">
                      Importer mon parcellaire
                    </router-link>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        <div class="fr-col-md-6">
          <div class="fr-card background-alt">
            <div class="fr-card__body">
              <div class="fr-card__content">
                <h3>Pour les organismes de certification</h3>

                <ul class="list-marks fr-card__desc">
                  <li>
                    Facilitez votre suivi du parcellaire avec des données cartographiques.
                  </li>
                </ul>
              </div>

              <div class="fr-card__footer">
                <ul class="fr-btns-group fr-btns-group--inline">
                  <li>
                    <router-link to="/certification/exploitations" class="fr-btn fr-btn--secondary">
                      Se connecter
                    </router-link>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import PartnersSection from '@/components/landing-page/Partners.vue'
import ProductFlowSection from '@/components/landing-page/ProductFlow.vue'
</script>

<style scoped>
.fr-container--fluid,
fr-container {
  --btn-background-color-default: var(--success-425-625);
  --btn-background-color-active: #0C5127;
  --btn-color-default: var(--background-color-default);

  /* overrides default color */
  --text-action-high-blue-france: var(--btn-background-color-default);
  --border-action-high-blue-france: var(--btn-background-color-default);
  --background-action-high-blue-france: var(--btn-background-color-default);
  --background-action-high-blue-france-hover: var(--btn-background-color-active);
}

a:not(.fr-btn),
:deep(a:not(.fr-btn)) {
  color: var(--btn-background-color-default);
}

h1, h2, :deep(h2) {
  --text-title-grey: var(--btn-background-color-default);
}


.hero {
  background-color: #e9eddf;
  background-image: url('@/assets/screenshots/map-background.png');
  background-position: center center;
  background-size: cover;
}

.list-marks {
  font-size: 1.25rem; /* as .fr-text--lead */
  padding-left: 0;


  li {
    background: url("@/assets/check-line.svg") no-repeat left center;
    list-style: none;
    padding-left: 1.9em;

    &:not(:last-of-type) {
      margin-bottom: 1rem;
    }
  }
}

h2 {
  color: var(--btn-background-color-default);
}
.background-alt {
  background-color: var(--green-bourgeon-975-75);
}
</style>
