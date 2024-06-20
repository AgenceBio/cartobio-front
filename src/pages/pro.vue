<route lang="yaml">
  meta:
    seo:
      title: Votre parcellaire cultivé en agriculture biologique
  </route>

<template>
  <div class="fr-container--fluid fr-py-9v">
    <div class="fr-container">
      <div class="fr-grid-row fr-grid-row--gutters">
        <div class="fr-col-md-8">
          <div class="fr-card fr-card--no-border">
            <div class="fr-card__body">
              <div class="fr-card__content">
                <h1>
                  Agriculteurs·rices, gagnez du temps sur vos tâches administratives
                </h1>

                <p class="fr-card__desc fr-text--lead">
                  Partagez votre parcellaire avec votre organisme de certification sur CartoBio.
                </p>
              </div>
              <div class="fr-card__footer">
                <ul class="fr-btns-group fr-btns-group--inline">
                  <li>
                    <router-link class="fr-btn" to="/certification/exploitations">
                      Se connecter
                    </router-link>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        <div class="fr-col-md-3 fr-col-offset-md-1 fr-col--middle fr-hidden fr-unhidden-sm">
          <svg class="illustration" aria-hidden="true">
            <use href="@/assets/illustrations.svg#environment" />
          </svg>
        </div>
      </div>

      <div class="advantages fr-grid-row fr-grid-row--align-center fr-text--bold fr-py-9v">
        <div class="fr-col-4">
          <img src="@gouvfr/dsfr/artwork/pictograms/digital/calendar.svg" role="illustration" alt="" />
          Rapide
        </div>
        <div class="fr-col-4">
          <img src="@gouvfr/dsfr/artwork/pictograms/map/map.svg" role="illustration" alt="" />
          Efficace
        </div>
        <div class="fr-col-4">
          <img src="@gouvfr/dsfr/artwork/pictograms/system/success.svg" role="illustration" alt="" />
          Gratuit
        </div>
      </div>
    </div>
  </div>

  <div class="fr-container--fluid fr-py-6w background-alt">
    <div class="fr-container">
      <div class="fr-grid-row fr-grid-row--gutters">
        <div class="fr-col-md-12">
          <h2>Valorisez plus facilement votre production</h2>
        </div>
      </div>

      <div class="fr-grid-row fr-grid-row--gutters">
        <div class="fr-col-md-5">
          <h3>Moins de charges administratives</h3>

          <ul class="list-marks">
            <li>
              <strong>Passer plus de temps à valoriser vos pratiques</strong>
              plutôt qu'à parler d'administratif.
            </li>
            <li>
              <strong>Transmettez</strong> vos données automatiquement
              aux services numériques.
            </li>
          </ul>
        </div>

        <div class="fr-col-md-5 fr-col-offset-md-1">
          <h3>Moins de risque d'erreurs</h3>

          <ul class="list-marks">
            <li>
              Coordonnez-vous avec votre Organisme de Certification.
            </li>
            <li>
              <strong>Partagez</strong> les données géographiques
              entre différents services.
            </li>
          </ul>
        </div>
      </div>
    </div>
  </div>

  <PartnersSection certification-bodies sponsors>
    <template #headline>L'outil privilégié des organismes de certification</template>
  </PartnersSection>

  <ProductFlowSection />
</template>

<script setup>
import PartnersSection from '@/components/landing-page/Partners.vue'
import ProductFlowSection from '@/components/landing-page/ProductFlow.vue'
</script>

<style scoped>
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

h1, h2, :deep(h2) {
  --text-title-grey: var(--blue-france-sun-113-625);
}

.background-alt {
  background-color: var(--blue-france-975-75);
}

.illustration {
  max-height: 8rem;
}

.advantages {
  flex-direction: column;
  align-items: center;
}

@media (min-width: 36em) {
  .advantages {
    flex-direction: row;
  }
}

.advantages [role="illustration"] {
  display: block;
  margin-left: auto;
  margin-right: auto;
}
</style>
