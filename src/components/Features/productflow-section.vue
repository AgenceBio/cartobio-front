<template>
  <section class="fr-container--fluid fr-py-9v">
    <div class="fr-container">
      <div class="fr-grid-row fr-grid-row--gutters">
        <div class="fr-col-lg-8">
          <h2>Comment ça marche ?</h2>

          <ol class="big-steps" role="list">
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
        </div>

        <div class="fr-col-lg-4 fr-hidden fr-unhidden-lg">
          <svg class="illustration" aria-hidden="true">
            <use href="@/assets/illustrations.svg#undraw_job_hunt" />
          </svg>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
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
      color: #27A658;
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
  color: var(--success-425-625);
  height: 100%;
  max-height: min(362px, 100vh);
  width: 100%;
}
</style>
