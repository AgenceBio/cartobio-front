<template>
  <section class="fr-container--fluid fr-py-9v" :class="{ 'general-audience': generalAudience }">
    <div class="fr-container">
      <div class="fr-grid-row fr-grid-row--gutters">
        <div class="fr-col-lg-7">
          <div class="fr-card fr-card--no-border">
            <div class="fr-card__body">
              <div class="fr-card__content">
                <h2>Comment ça marche ?</h2>

                <ol class="big-steps" role="list" v-if="generalAudience">
                  <li>
                    <span>
                      <strong class="fr-text--lead">Localiser votre territoire</strong><br />
                      <a href="https://www.agencebio.org/cartobio/" class="fr-link  fr-icon-arrow-right-line fr-link--icon-right" target="_blank">Naviguer sur la carte</a>
                    </span>
                  </li>
                  <li>
                    <span>
                      <strong class="fr-text--lead">Sélectionner les données à afficher</strong><br />
                      Analysez et croisez les données qui vous intéressent.
                    </span>
                  </li>
                  <li>
                    <span>
                      <strong class="fr-text--lead">Partager vos informations</strong><br />
                      Exportez votre carte en image pour la réutiliser.
                    </span>
                  </li>
                </ol>
                <ol class="big-steps" role="list" v-else>
                  <li>
                    <span>
                      <strong class="fr-text--lead">Importer votre parcellaire</strong><br />
                      <router-link to="/certification/exploitations" class="fr-link fr-icon-arrow-right-line fr-link--icon-right">Se connecter</router-link>
                    </span>
                  </li>
                  <li>
                    <span>
                      <strong class="fr-text--lead">Faciliter votre audit</strong><br />
                      À partir du 1er janvier 2024, tous les organismes de
                      certification réaliseront leurs audits sur CartoBio.
                    </span>
                  </li>
                  <li>
                    <span>
                      <strong class="fr-text--lead">Fluidifier le processus de certification</strong><br />
                      La certification en Agriculture Biologique se base sur le parcellaire CartoBio.
                    </span>
                  </li>
                </ol>
              </div>
            </div>
          </div>
        </div>

        <div class="fr-col-lg-4 fr-col-offset-lg-1 fr-hidden fr-unhidden-lg">
          <svg class="illustration" aria-hidden="true">
            <use href="@/assets/illustrations.svg#undraw_job_hunt" />
          </svg>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
defineProps({
  generalAudience: {
    type: Boolean,
    default: false
  }
})
</script>

<style scoped>
.fr-container--fluid {
  --bg-color: #F5F5FE;
  --text-accent-color: #6A6AF4;
  --title-accent-color: #000091;
}
.fr-container--fluid.general-audience {
  --bg-color: transparent;
  --text-accent-color: #27A658;
  --title-accent-color: var(--success-425-625);
}

.fr-card {
  background-color: var(--bg-color);
}

.big-steps {
  list-style: none;
  padding: 0;

  li {
    display: flex;
    align-items: center;
    gap: 1rem;

    &:not(:last-of-type) {
      margin-bottom: 2.5rem;
    }

    &:before {
      content: counter(li-counter) ".";
      color: var(--text-accent-color);
      font-size: 4rem;
      font-weight: bold;
    }

    &::marker {
      display: none;
      content: "" !important;
    }
  }
}

.illustration {
  color: var(--title-accent-color);
  height: 100%;
  max-height: min(362px, 100vh);
  width: 100%;
}
</style>
