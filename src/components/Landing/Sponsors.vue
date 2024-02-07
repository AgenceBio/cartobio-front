<template>
  <div class="fr-container--fluid fr-py-9v">
    <div class="fr-container">
      <div class="fr-grid-row">
        <div class="fr-col-12">
          <h2 class="fr-h3">Des données contrôlées issues de la filière biologique</h2>

          <p>
            Le projet est soutenu par le <strong>Ministère de la Transition Écologique</strong>
            et le <strong>Ministère de l'Agriculture</strong> et ses partenaires :
          </p>
        </div>
      </div>

      <ul class="fr-grid-row fr-grid-row--gutters">
        <li class="fr-col-md-3"><img src="@/assets/logos-partenaires/agence-bio.svg" alt="" class="logo"></li>
        <li class="fr-col-md-3"><img src="@/assets/logos-partenaires/inao.svg" alt="" class="logo"></li>
        <li class="fr-col-md-3 fr-col--middle"><img src="@/assets/logos-partenaires/ofb.svg" alt="" class="logo"></li>
        <li class="fr-col-md-3 fr-col--bottom"><img src="@/assets/logos-partenaires/asp.svg" alt="" class="logo"></li>
      </ul>
    </div>
  </div>
</template>

<style scoped>
ul.fr-grid-row {
  list-style: none;
  text-align: center;

  li:first-child {
    text-align: left;
  }

  li:last-child {
    text-align: right;
  }
}
.fr-grid-row img.logo {
  max-height: 100px;
  max-width: 170px;
}
.fr-grid-row img.logo[src$=".svg"] {
  height: 100px;
}
</style>
