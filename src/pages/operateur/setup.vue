<template>
  <p class="info">
    Nous avons bien pu valider votre identité.
    Vous pourrez utiliser CartoBio grâce à ce même email quand vous le souhaitez.
  </p>

  <h2>
    Votre parcellaire
    <small>Cet outil est actuellement en phase de test</small>
  </h2>

  <p>
    Sélectionner l’outil ou votre parcellaire est maintenu à jour.
  </p>

  <ul>
    <li v-for="(source, sourceId) in featureSources">
      <button :disabled="source.active === false" type="button" :aria-current="sourceId === featureSource" @click="featureSource = sourceId">{{ source.label }}</button>
    </li>
  </ul>

  <section v-if="featureSource === 'telepac'">
    <button type="button" @click.prevent="$router.push('/operateur/parcellaire')">
      ☁️ Importer mon parcellaire à jour
    </button>

    <button type="button" @click.prevent="$router.push('/operateur/parcellaire')">
      🔐 Connecter mon compte TelePAC
    </button>
  </section>

</template>

<script setup>
import { ref, readonly } from 'vue'

const featureSource = ref('')
const featureSources = readonly({
  telepac: {
    label: 'Déclaration PAC',
    active: true,
  },
  mesparcelles: {
    label: 'MesParcelles',
    active: false,
  },
  geofolia: {
    label: 'Géofolia',
    active: false,
  },
  smagfarmer: {
    label: 'SMAG Farmer',
    active: false,
  },
  ncvi: {
    label: 'ProDouanes (nCVI)',
    active: false,
  }
})
</script>

<style scoped>
[aria-current="true"] {
  font-weight: bold;
}
</style>
