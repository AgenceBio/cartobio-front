<template>
  <section class="fr-container--fluid fr-py-5w">
    <div class="fr-container">
      <div class="fr-grid-row fr-grid-row--gutters">
        <div class="fr-col-md-12">
          <h3 class="fr-h4">Comment ça fonctionne ?</h3>
        </div>

        <div class="fr-col-md-12">
          <ol class="fr-list steps">
            <li class="step-1">
              <img src="@/assets/illustrations/undraw_prioritise_ready.svg" class="fr-responsive-img fr-hidden fr-unhidden-lg fr-my-3w cta-img" alt="" />

              Import du parcellaire en amont du contrôle
            </li>

            <li class="step-1b">
              <img src="@/assets/illustrations/undraw_building_blocks.svg" class="fr-responsive-img fr-hidden fr-unhidden-lg fr-my-3w cta-img" alt="" />

              Créez votre parcellaire en ligne
            </li>

            <li class="step-2">
              <img src="@/assets/illustrations/undraw_job_hunt.svg" class="fr-responsive-img fr-hidden fr-unhidden-lg fr-my-3w cta-img" alt="" />

              Le parcellaire de l’année est validé pendant le controle Bio
            </li>

            <li class="step-2b">
              <img src="@/assets/illustrations/undraw_content.svg" class="fr-responsive-img fr-hidden fr-unhidden-lg fr-my-3w cta-img" alt="" />

              Mettez à jour le parcellaire si besoin
            </li>

            <li class="step-3">
              <img src="@/assets/illustrations/undraw_online_transactions.svg" class="fr-responsive-img fr-hidden fr-unhidden-lg fr-my-3w cta-img" alt="" />
              Transmission du parcellaire à la DDT pour une instruction simplifiée des aides PAC
            </li>

            <li class="step-4">
              <img src="@/assets/illustrations/undraw_open_source.svg" class="fr-responsive-img fr-hidden fr-unhidden-lg fr-my-3w cta-img" alt="" />

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
  }
})
</script>

<style scoped>
.cta-img {
  max-height: 6em;
}

@media (min-width: 62em) {
  .steps {
    height: 400px;
    position: relative;
  }

  .steps > li {
    max-width: 16em;
    position: absolute;
    text-align: center;
  }
  .steps > li::marker {
    content: "";
  }
  .steps > li.step-1 {
    left: 0%;
    top: 0%;
  }
    .steps > li::after {
      position: absolute;
      z-index: 10;
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
    left: 60%;
    top: 0%;
  }
    .steps > li.step-3::after {
      content: url(@/assets/illustrations/arrow-3.svg);
      top: 50%;
      left: 85%;
    }
  .steps > li.step-4 {
    left: 75%;
    top: 50%;
  }
}
</style>
