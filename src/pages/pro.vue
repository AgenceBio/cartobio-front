<route lang="yaml">
meta:
  seo:
    title: Page d'accueil (agriculteurs·rices)
</route>

<template>
  <div class="fr-container--fluid fr-pt-9v">
    <div class="fr-container">
      <div class="fr-grid-row fr-grid-row--center">
        <div class="fr-col-4">
          <fieldset class="fr-segmented fr-segmented--no-legend">
            <legend class="fr-segmented__legend">Selection du professionel</legend>
            <div class="fr-segmented__elements">
              <div class="fr-segmented__element">
                <input
                  value="1"
                  checked
                  type="radio"
                  id="segmented-1-1"
                  name="segmented-1"
                  @click="currentMode = 'agri'"
                />
                <label class="fr-label" for="segmented-1-1"> Agriculteur </label>
              </div>
              <div class="fr-segmented__element">
                <input value="2" type="radio" id="segmented-1-2" name="segmented-1" @click="currentMode = 'oc'" />
                <label class="fr-label" for="segmented-1-2"> Organisme de certification </label>
              </div>
            </div>
          </fieldset>
        </div>
      </div>
    </div>
  </div>

  <div class="fr-container--fluid fr-py-9v" v-if="currentMode === 'agri'">
    <div class="fr-container">
      <div class="fr-grid-row fr-grid-row--gutters">
        <div class="fr-col-md-8">
          <div class="fr-card fr-card--no-border">
            <div class="fr-card__body">
              <div class="fr-card__content">
                <h1 class="fr-h2 fr-h1-sm">Agriculteurs·rices, gagnez du temps sur vos tâches administratives</h1>

                <p class="fr-card__desc fr-text--lead">
                  Partagez votre parcellaire avec votre organisme de certification sur CartoBio.
                </p>
              </div>
              <div class="fr-card__footer">
                <ul class="fr-btns-group fr-btns-group--inline">
                  <li>
                    <router-link class="fr-btn" to="/certification/exploitations"> Mon espace </router-link>
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
    </div>
  </div>
  <div class="fr-container--fluid fr-py-9v" v-else>
    <div class="fr-container">
      <div class="fr-grid-row fr-grid-row--gutters">
        <div class="fr-col-md-8">
          <div class="fr-card fr-card--no-border">
            <div class="fr-card__body">
              <div class="fr-card__content">
                <h1 class="fr-h2 fr-h1-sm">Organisme de certification</h1>

                <p class="fr-card__desc fr-text--lead">
                  Accéder et contrôler les parcellaires des exploitations directement sur Cartobio.
                </p>
              </div>
              <div class="fr-card__footer">
                <ul class="fr-btns-group fr-btns-group--inline">
                  <li>
                    <router-link class="fr-btn" to="/certification/exploitations"> Mon espace </router-link>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        <div class="fr-col-md-3 fr-col-offset-md-1 fr-col--middle fr-hidden fr-unhidden-sm">
          <svg class="illustration" aria-hidden="true">
            <use href="@/assets/illustrations.svg#undraw_job_hunt" />
          </svg>
        </div>
      </div>
    </div>
  </div>

  <div class="fr-container--fluid fr-py-6w background-alt" v-if="currentMode === 'agri'">
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
            <li><strong>Transmettez</strong> vos données automatiquement aux services numériques.</li>
          </ul>
        </div>

        <div class="fr-col-md-5 fr-col-offset-md-1">
          <h3>Moins de risque d'erreurs</h3>

          <ul class="list-marks">
            <li>Coordonnez-vous avec votre Organisme de Certification.</li>
            <li><strong>Partagez</strong> les données géographiques entre différents services.</li>
          </ul>
        </div>
      </div>
    </div>
  </div>

  <div class="fr-container--fluid fr-py-6w background-alt" v-else>
    <div class="fr-container">
      <div class="fr-grid-row fr-grid-row--gutters">
        <div class="fr-col-md-12">
          <h2>Faites le suivi des parcelles sur un support cartographique</h2>
        </div>
      </div>

      <div class="fr-grid-row fr-grid-row--gutters">
        <div class="fr-col-md-5">
          <h3>Moins de charges administratives</h3>

          <ul class="list-marks">
            <li>
              <strong>Un parcellaire mis à jour</strong>
              facilement dans CartoBio.
            </li>
            <li>
              <strong>L'attestation de production</strong> directement disponible une fois le parcellaire certifié.
            </li>
          </ul>
        </div>

        <div class="fr-col-md-5 fr-col-offset-md-1">
          <h3>Moins de risque d'erreurs</h3>

          <ul class="list-marks">
            <li><strong>Visualiser</strong> les parcelles et accéder à leurs informations et à leurs évolutions</li>
            <li><strong>Partagez</strong> les données géographiques entre différents services.</li>
          </ul>
        </div>
      </div>
    </div>
  </div>

  <div class="fr-container--fluid fr-py-9v" v-if="currentMode === 'agri'">
    <div class="fr-container">
      <ul class="advantages fr-text--bold fr-py-9v">
        <li>
          <img src="@gouvfr/dsfr/artwork/pictograms/digital/calendar.svg" role="illustration" alt="" />
          Rapide
        </li>
        <li>
          <img src="@gouvfr/dsfr/artwork/pictograms/map/map.svg" role="illustration" alt="" />
          Efficace
        </li>
        <li>
          <img src="@gouvfr/dsfr/artwork/pictograms/system/success.svg" role="illustration" alt="" />
          Gratuit
        </li>
      </ul>
    </div>
  </div>

  <ProductFlowSection v-if="currentMode === 'agri'" />

  <PartnersSection certification-bodies sponsors>
    <template #headline>L'outil privilégié des organismes de certification</template>
  </PartnersSection>
</template>

<script setup lang="ts">
import { ref } from "vue";
import PartnersSection from "@/components/landing-page/Partners.vue";
import ProductFlowSection from "@/components/landing-page/ProductFlow.vue";

const currentMode = ref<"agri" | "oc">("agri");
</script>

<style scoped>
.list-marks {
  font-size: 1.25rem;
  /* as .fr-text--lead */
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

h1,
h2,
:deep(h2) {
  --text-title-grey: var(--blue-france-sun-113-625);
}

.background-alt {
  background-color: var(--blue-france-975-75);
}

.illustration {
  max-height: 8rem;
}

.advantages {
  display: flex;
  align-items: center;
  list-style: none;

  li {
    flex: 1;
    text-align: center;
  }
}

.advantages [role="illustration"] {
  display: block;
  margin-left: auto;
  margin-right: auto;
}
</style>
