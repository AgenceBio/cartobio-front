<template>
  <div class="fr-card fr-enlarge-link fr-card--horizontal fr-mb-3w">
    <div class="fr-card__body">
      <div class="fr-card__content">
        <h3 class="fr-card__title">
          <a href="#from-source" @click.prevent="emit('select')" role="button"> Import des données de parcellaire </a>
        </h3>

        <div class="fr-card__desc">
          <p>
            Importez en un clic les données géographiques via une déclaration <b>PAC</b>, le dossier <b>nCVI</b>,
            <b>MesParcelles</b> ou <b>Geofolia</b>.
          </p>
          <p>Vous pourrez mettre à jour les parcelles ayant changé depuis cette déclaration.</p>
        </div>
        <div class="fr-card__start">
          <ul class="fr-tags-group">
            <li>
              <p class="fr-badge fr-badge--success fr-badge--no-icon">en un clic</p>
            </li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
const emit = defineEmits(["select"]);
</script>
