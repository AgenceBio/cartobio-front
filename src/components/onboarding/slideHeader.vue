<template>
  <section class="fr-container">
    <div class="fr-grid-row fr-grid-row--gutters fr-grid-row--middle">
      <div class="fr-col-12 fr-col-md-6">
        <div class="fr-display--md">
          Les nouveautés<br />
          sur CartoBio
        </div>

        <p class="fr-text--lg fr-mt-4w fr-mb-6w">
          CartoBio évolue pour vous apporter plus de fonctionnalités et d'ergonomie afin de faciliter vos contrôles et
          de gagner en efficacité ! Découvrez les améliorations apportées au module cartographique ainsi que la nouvelle
          page exploitation.
        </p>

        <a href="#" class="fr-btn fr-btn--primary" @click.prevent="$emit('explore')"> Explorer </a>
      </div>

      <div class="fr-col-12 fr-col-md-6 fr-text--center">
        <img
          src="@/assets/onboarding/slide1.png"
          alt="Aperçu de l'interface CartoBio"
          class="fr-responsive-img fr-radius--lg fr-shadow"
        />
      </div>
    </div>
  </section>
</template>

<script setup>
defineEmits(["explore"]);
</script>
