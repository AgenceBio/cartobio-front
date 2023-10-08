<template>
  <div class="fr-container--fluid fr-py-9v">

    <div class="fr-container">
      <div class="fr-grid-row">
        <div class="fr-col-12">
          <slot name="headline">
            <h2 class="fr-h4">Vos données parcellaires sont utiles </h2>
          </slot>
        </div>
      </div>

      <div class="fr-grid-row fr-grid-row--gutters fr-mb-3w">
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
                <img class="fr-responsive-img" src="@/assets/reuses/beegis.png"
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
                <img class="fr-responsive-img" src="@/assets/reuses/pestiriv.png" alt="">
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
                <img class="fr-responsive-img" src="@/assets/reuses/territoire-bio-engage.png" alt="">
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="fr-grid-row">
        <p>
          <a href="https://forms.gle/i7nzBQTifPhfVmt4A" class="fr-btn fr-btn--secondary" rel="noreferrer noopener" target="_blank">
            Ajouter ma réutilisation
          </a>
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  'section-administrations': Boolean,
  'section-oc': Boolean,
  'section-business': Boolean
})
</script>


<style scoped>
.logo-grid {
  display: flex;
  gap: 2rem;
  flex-wrap: wrap;
  list-style: none;
}

.logo-grid img.logo {
  max-height: 100px;
}
</style>
