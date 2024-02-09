<template>
  <div class="fr-container--fluid fr-py-9v">
    <div class="fr-container">
      <div class="fr-grid-row">
        <div class="fr-col-12">
          <h2>
            <slot name="headline" />
          </h2>
        </div>
      </div>

      <div class="fr-grid-row sections">
        <div :class="{ 'fr-col-12': !sponsors, 'fr-col-lg-5': sponsors }" v-if="certificationBodies">
          <p>
            Cartobio est un outil conçu <strong>avec et pour</strong>
            les organismes de certification.
          </p>

          <ul class="logos logos--certification-bodies">
            <li><img src="@/assets/logos-oc/ecocert.png" alt="" class="logo"></li>
            <li><img src="@/assets/logos-oc/certipaq.png" alt="" class="logo"></li>
            <li><img src="@/assets/logos-oc/certisud.png" alt="" class="logo"></li>
            <li><img src="@/assets/logos-oc/bureau-veritas.png" alt="" class="logo"></li>
            <li><img src="@/assets/logos-oc/certis.png" alt="" class="logo"></li>
            <li><img src="@/assets/logos-oc/alpes-controles.png" alt="" class="logo"></li>
            <li><img src="@/assets/logos-oc/qualisud.png" alt="" class="logo"></li>
            <li><img src="@/assets/logos-oc/ocacia.png" alt="" class="logo"></li>
            <li><img src="@/assets/logos-oc/control-union.png" alt="" class="logo"></li>
          </ul>
        </div>

        <div :class="{ 'fr-col-12': !certificationBodies, 'fr-col-lg-6 fr-col-offset-lg-1': certificationBodies }" v-if="sponsors">
          <p>
            Le projet est soutenu par le <strong>ministère de la Transition Écologique et de la Cohésion des Territoires</strong>
            et le <strong>ministère de l'Agriculture et de la Souveraineté alimentaire</strong> et ses partenaires :
          </p>

          <ul class="logos logos--sponsors">
            <li><img src="@/assets/logos-partenaires/agence-bio.svg" alt="" class="logo"></li>
            <li><img src="@/assets/logos-partenaires/inao.svg" alt="" class="logo"></li>
            <li><img src="@/assets/logos-partenaires/ofb.svg" alt="" class="logo"></li>
            <li><img src="@/assets/logos-partenaires/asp.svg" alt="" class="logo"></li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  certificationBodies: {
    type: Boolean,
    default: false
  },
  sponsors: {
    type: Boolean,
    default: false
  }
})
</script>

<style scoped>
.logos {
  display: flex;
  align-items: center;
  gap: 1rem;
  list-style: none;
  text-align: center;

  &.logos--certification-bodies {
    flex-wrap: wrap;

    li {
      width: 30%;
    }
  }

  &.logos--sponsors {
    gap: 2rem;

    li:first-child {
      text-align: left;
    }

    li:last-child {
      text-align: right;
    }
  }
}
img.logo {
  max-height: 100px;
  max-width: 140px;
}
img.logo[src$=".svg"] {
  height: 100px;
}
</style>
