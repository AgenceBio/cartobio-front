<template>
  <h2>
    Votre exploitation
    <small>Cet outil est actuellement en phase de test</small>
  </h2>

  <form v-if="formState == 'search'" @submit.prevent="formState = 'confirm'">
    <div class="row">
      <label>
        Rechercher
        <input type="search" name="search" />
        <button type="submit">OK</button>
      </label>

      <p class="help">
        Par nom, SIRET, email, nom d’exploitation, numéro PACAGE…
      </p>
    </div>
  </form>

  <form v-if="formState == 'confirm'" @submit.prevent="$router.push('/operateur/setup')">
    <h3>GAEC de la Tête d’Or ☑️</h3>

    <dl>
      <dt>Nom de l’exploitant·e</dt>
      <dd>Jean Dupont</dd>
      <dt>Numéro de SIRET</dt>
      <dd>XXXXXXXX</dd>
      <dt>Numéro PACAGE</dt>
      <dd>XXXXXXXX</dd>
    </dl>

    <p>
      <button type="submit">Valider mon identité</button>

      Un email vous sera envoyé à votre adresse professionnelle :
      {{ emailAddress }}
    </p>
  </form>

</template>

<script setup>
import { ref } from 'vue'

const formState = ref('search')
const emailAddress = ref('jean.dupont@email.com')
</script>
