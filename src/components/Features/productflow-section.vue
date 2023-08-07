<template>
  <section class="fr-container--fluid fr-py-5w">
    <div class="fr-container">
      <div class="fr-grid-row fr-grid-row--gutters">
        <div class="fr-col-md-12">
          <h3 class="fr-h4">
            Comment ça fonctionne ?
          </h3>
        </div>

        <div class="fr-col-md-12">
          <ol :class="{'fr-list': true, 'steps': true, 'steps--expanded': expanded}">
            <li class="step-1">
              <img
                src="@/assets/illustrations/undraw_prioritise_ready.svg"
                class="fr-responsive-img fr-hidden fr-unhidden-lg fr-my-3w cta-img"
                alt=""
              >

              <slot name="step-1">
                Import du parcellaire en amont du contrôle
              </slot>
            </li>

            <li
              :class="{'step-1b': true, 'optional': optionalStep1b}"
              v-if="expanded"
            >
              <img
                src="@/assets/illustrations/undraw_building_blocks.svg"
                class="fr-responsive-img fr-hidden fr-unhidden-lg fr-my-3w cta-img"
                alt=""
              >

              <slot name="step-1b">
                Créez votre parcellaire en ligne
              </slot>
            </li>

            <li class="step-2">
              <img
                src="@/assets/illustrations/undraw_job_hunt.svg"
                class="fr-responsive-img fr-hidden fr-unhidden-lg fr-my-3w cta-img"
                alt=""
              >

              <slot name="step-2">
                Le parcellaire de l’année est validé pendant le controle Bio
              </slot>
            </li>

            <li
              class="step-2b"
              v-if="expanded"
            >
              <img
                src="@/assets/illustrations/undraw_content.svg"
                class="fr-responsive-img fr-hidden fr-unhidden-lg fr-my-3w cta-img"
                alt=""
              >

              <slot name="step-2b">
                Mettez à jour le parcellaire si besoin
              </slot>
            </li>

            <li class="step-3">
              <img
                src="@/assets/illustrations/undraw_online_transactions.svg"
                class="fr-responsive-img fr-hidden fr-unhidden-lg fr-my-3w cta-img"
                alt=""
              >
              Transmission du parcellaire à la DDT pour une instruction simplifiée des aides PAC
            </li>

            <li class="step-4">
              <img
                src="@/assets/illustrations/undraw_open_source.svg"
                class="fr-responsive-img fr-hidden fr-unhidden-lg fr-my-3w cta-img"
                alt=""
              >

              Le parcellaire anonymisé est publié
            </li>
          </ol>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
defineProps({
  expanded: {
    type: Boolean,
    default: false
  },
  optionalStep1b: {
    type: Boolean,
    default: false
  }
})
</script>

<style scoped>
.cta-img {
  max-height: 6em;
}

@media screen and (max-width: 62em) {
  .steps {
    padding-left: 1.5rem;
  }
}

@media screen and (min-width: 62em) {
  .steps {
    height: 400px;
    position: relative;
  }

  .steps > li {
    font-size: 0.9em;
    max-width: 16em;
    position: absolute;
    text-align: center;
  }
  .steps > li::after,
  .steps > li::before {
    position: absolute;
    z-index: 10;
  }
  .steps > li::marker {
    content: "";
  }
  .steps > li.step-1 {
    left: 0%;
    top: 0%;
  }
    .steps > li.step-1::after {
      content: url(@/assets/illustrations/arrow-1.svg);
      top: 0;
      left: 85%;
    }
  .steps > li.step-1b {
    left: 15%;
    top: 50%;
  }
    .steps > li.step-1b::after {
      content: url(@/assets/illustrations/arrow-1b.svg);
      top: 0%;
      left: 85%;
    }
    .steps > li.step-1b.optional::after {
      content: url(@/assets/illustrations/arrow-1b-optional.svg);
    }
  .steps > li.step-2 {
    left: 30%;
    top: 0%;
  }
  .steps > li.step-2b {
    left: 45%;
    top: 50%;
  }
    .steps > li.step-2::after {
      content: url(@/assets/illustrations/arrow-2.svg);
      top: 50%;
      left: 85%;
    }
  .steps > li.step-3 {
    left: 55%;
    top: 60%;
  }
  .steps:not(.steps--expanded) > li.step-3 .cta-img {
    max-height: 4em;
  }
  .steps.steps--expanded > li.step-3 {
    left: 60%;
    top: 0%;
  }
    .steps:not(.steps--expanded) > li.step-3::before {
      content: url(@/assets/illustrations/arrow-3-optional.svg);
      top: 0%;
      left: -60%;
    }
    .steps.steps--expanded > li.step-3::after {
      content: url(@/assets/illustrations/arrow-3.svg);
      top: 50%;
      left: 85%;
    }
  .steps > li.step-4 {
    left: 60%;
    top: 0%;
  }
  .steps.steps--expanded > li.step-4 {
    left: 75%;
    top: 50%;
  }
}
</style>
