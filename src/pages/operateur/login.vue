<template>
  <h2>
    Votre exploitation
    <small>Cet outil est actuellement en phase de test</small>
  </h2>

  <form v-if="!state.currentUser" @submit.prevent="loginUser(user)">
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

  <form v-else @submit.prevent="$router.push('/operateur/setup')">
    <h3>{{ state.currentUser.commercial_name }} ☑️</h3>

    <dl>
      <dt>Nom de l’exploitant·e</dt>
      <dd>{{ state.currentUser.name }}</dd>
      <dt>Numéro de SIRET</dt>
      <dd>{{ state.currentUser.siret }}</dd>
      <dt>Numéro PACAGE</dt>
      <dd>{{ state.currentUser.pacage }}</dd>
    </dl>

    <p>
      <button type="submit">Valider mon identité</button>

      Un email vous sera envoyé à votre adresse professionnelle :
      {{ state.currentUser.email }}
    </p>
  </form>

</template>

<script setup>
import { readonly, toRefs } from 'vue'
import store from '../../store.js'

const user = readonly({
  name: 'Jean Dupont',
  commercial_name: 'GAEC de la Tête d\'Or',
  email: 'jean.dupont@email.com',
  siret: 'XXXXXXXX',
  pacage: 'XXXXXXXX',
})

const { loginUser } = toRefs(store)
const { state } = store
</script>
