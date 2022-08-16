<template>
  <div class="fr-container--fluid fr-py-5w">
    <div class="fr-container">
      <div class="fr-grid-row">
        <div class="fr-col-12">
          <h2 class="fr-h3">Les Partenaires</h2>
        </div>
      </div>
      <div class="fr-grid-row fr-grid-row--gutters">
        <div class="fr-col-md-6 fr-col-offset-md-1--right" v-if="sectionAdministrations">
          <h3 class="fr-h4">Administrations et organismes publics</h3>

          <ul class="logo-grid">
            <li><img src="@/assets/logos-partenaires/masa.svg" alt="" class="logo"></li>
            <li><img src="@/assets/logos-partenaires/mtect.svg" alt="" class="logo"></li>
            <li><img src="@/assets/logos-partenaires/agence-bio.svg" alt="" class="logo"></li>
            <li><img src="@/assets/logos-partenaires/inao.svg" alt="" class="logo"></li>
            <li><img src="@/assets/logos-partenaires/ofb.svg" alt="" class="logo"></li>
            <li><img src="@/assets/logos-partenaires/asp.svg" alt="" class="logo"></li>
          </ul>
        </div>

        <div class="fr-col-md-5 fr-col-offset-md-1--right" v-if="sectionBusiness">
          <h3 class="fr-h4">Partenaires métier</h3>

          <ul class="logo-grid">
            <li><img src="@/assets/logos-business/mes-parcelles.svg" alt="" class="logo"></li>
            <li><img src="@/assets/logos-business/geofolia.png" alt="" class="logo"></li>
            <li><img src="@/assets/logos-business/douanes.svg" alt="" class="logo"></li>
          </ul>
        </div>

        <div class="fr-col-lg-5" v-if="sectionOc">
          <h3 class="fr-h4">Organismes Certificateurs</h3>

          <ul class="logo-grid">
            <li><img src="@/assets/logos-oc/ecocert.png" alt="" class="logo"></li>
            <li><img src="@/assets/logos-oc/certipaq.png" alt="" class="logo"></li>
            <li><img src="@/assets/logos-oc/alpes-controles.png" alt="" class="logo"></li>
            <li><img src="@/assets/logos-oc/certisud.png" alt="" class="logo"></li>
            <li><img src="@/assets/logos-oc/bureau-veritas.png" alt="" class="logo"></li>
            <li><img src="@/assets/logos-oc/ocacia.png" alt="" class="logo"></li>
          </ul>
        </div>
      </div>

      <div class="fr-grid-row">
        <p class="fr-col-12 fr-mt-3w">
          <router-link to="/projet" class="fr-btn fr-btn--secondary">
            En savoir plus sur le projet
          </router-link>
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
  align-items: center;
  display: flex;
  gap: 2rem;
  flex-wrap: wrap;
  list-style: none;
}

.logo-grid img.logo {
  max-height: 100px;
  max-width: 170px;
}
.logo-grid img.logo[src$=".svg"] {
  height: 100px;
}
</style>
